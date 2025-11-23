const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});
app.use('/api/', limiter);

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration des services
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://user-authentication:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api'
    }
  },
  preferences: {
    target: process.env.PREFERENCES_SERVICE_URL || 'http://user-preferences:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/preferences': '/api'
    }
  },
  feed: {
    target: process.env.FEED_SERVICE_URL || 'http://content-feed:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/feed': '/api/feed'
    }
  },
  recommendations: {
    target: process.env.RECOMMENDATION_SERVICE_URL || 'http://content-recommendation:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/recommendations': '/api'
    }
  },
  categories: {
    target: process.env.CATEGORIES_SERVICE_URL || 'http://content-categories:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/categories': '/api'
    }
  }
};

// Routes de proxy pour chaque service
app.use('/api/auth', createProxyMiddleware(services.auth));
app.use('/api/preferences', createProxyMiddleware(services.preferences));
app.use('/api/feed', createProxyMiddleware(services.feed));
app.use('/api/recommendations', createProxyMiddleware(services.recommendations));
app.use('/api/categories', createProxyMiddleware(services.categories));

// Route de santé globale
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Vérifier la santé de chaque service
  const serviceChecks = await Promise.allSettled([
    checkServiceHealth('auth', services.auth.target),
    checkServiceHealth('preferences', services.preferences.target),
    checkServiceHealth('feed', services.feed.target),
    checkServiceHealth('recommendations', services.recommendations.target),
    checkServiceHealth('categories', services.categories.target)
  ]);

  serviceChecks.forEach((result, index) => {
    const serviceNames = ['auth', 'preferences', 'feed', 'recommendations', 'categories'];
    if (result.status === 'fulfilled') {
      healthCheck.services[serviceNames[index]] = result.value;
    } else {
      healthCheck.services[serviceNames[index]] = {
        status: 'ERROR',
        error: result.reason.message
      };
    }
  });

  const allServicesHealthy = Object.values(healthCheck.services).every(
    service => service.status === 'OK'
  );

  res.status(allServicesHealthy ? 200 : 503).json(healthCheck);
});

// Route d'information sur l'API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Actu API Gateway',
    version: '1.0.0',
    description: 'Point d\'entrée unique pour l\'application de personnalisation de contenus',
    endpoints: {
      auth: '/api/auth/*',
      preferences: '/api/preferences/*',
      feed: '/api/feed/*',
      recommendations: '/api/recommendations/*',
      categories: '/api/categories/*'
    },
    documentation: '/api/docs',
    health: '/health'
  });
});

// Route de documentation
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Actu API Documentation',
    version: '1.0.0',
    description: 'Documentation des endpoints de l\'API',
    endpoints: {
      authentication: {
        base: '/api/auth',
        routes: {
          'POST /register': 'Inscription utilisateur',
          'POST /login': 'Connexion utilisateur',
          'POST /logout': 'Déconnexion utilisateur',
          'GET /verify': 'Vérifier le token JWT'
        }
      },
      preferences: {
        base: '/api/preferences',
        routes: {
          'GET /:userId': 'Obtenir les préférences utilisateur',
          'PUT /:userId': 'Mettre à jour les préférences',
          'GET /:userId/profile': 'Obtenir le profil utilisateur'
        }
      },
      feed: {
        base: '/api/feed',
        routes: {
          'GET /user/:userId': 'Flux personnalisé utilisateur',
          'GET /general': 'Flux général',
          'GET /category/:slug': 'Flux par catégorie',
          'GET /search': 'Recherche dans le flux'
        }
      },
      recommendations: {
        base: '/api/recommendations',
        routes: {
          'GET /user/:userId': 'Recommandations utilisateur',
          'POST /user/:userId/generate': 'Générer nouvelles recommandations',
          'POST /user/:userId/feedback': 'Enregistrer feedback utilisateur'
        }
      },
      categories: {
        base: '/api/categories',
        routes: {
          'GET /': 'Liste des catégories',
          'GET /:slug': 'Catégorie par slug',
          'POST /': 'Créer une catégorie'
        }
      }
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur API Gateway:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    availableEndpoints: [
      '/api/auth/*',
      '/api/preferences/*',
      '/api/feed/*',
      '/api/recommendations/*',
      '/api/categories/*',
      '/health',
      '/api/info',
      '/api/docs'
    ]
  });
});

// Fonction pour vérifier la santé d'un service
async function checkServiceHealth(serviceName, serviceUrl) {
  try {
    const axios = require('axios');
    const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
    return {
      status: 'OK',
      url: serviceUrl,
      responseTime: response.headers['x-response-time'] || 'N/A'
    };
  } catch (error) {
    return {
      status: 'ERROR',
      url: serviceUrl,
      error: error.message
    };
  }
}

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 API Gateway démarré sur le port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔍 API Info: http://localhost:${PORT}/api/info`);
});

module.exports = app;

