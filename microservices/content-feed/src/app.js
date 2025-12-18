const express = require('express');
const cors = require('cors');
const redis = require('redis');
require('dotenv').config();

const feedRoutes = require('./routes/feed');

const app = express();
const PORT = process.env.PORT || 3002;

// Configuration Redis
// Dans Docker, utiliser le nom du service Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
});

redisClient.on('connect', () => {
  console.log('✅ Connexion Redis établie pour content-feed');
});

redisClient.on('error', (err) => {
  console.error('❌ Erreur Redis:', err);
  // Continuer même si Redis n'est pas disponible (mode dégradé)
  console.log('⚠️ Service fonctionne sans cache Redis');
});

// Configuration CORS pour autoriser Vercel et localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  // Autoriser tous les sous-domaines Vercel
  /^https:\/\/.*\.vercel\.app$/
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // En développement, autoriser toutes les origines
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware pour injecter Redis
app.use((req, res, next) => {
  req.redis = redisClient;
  next();
});

// Routes
app.use('/api/feed', feedRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'content-feed',
    timestamp: new Date().toISOString(),
    redis: redisClient.isOpen ? 'Connected' : 'Disconnected'
  });
});

// Démarrage du serveur
// Écouter sur 0.0.0.0 pour être accessible depuis l'extérieur du conteneur Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Service content-feed démarré sur le port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  
  // Connexion Redis (optionnelle, le service fonctionne sans)
  // Utiliser une fonction async séparée pour éviter les problèmes
  (async () => {
    try {
      await redisClient.connect();
      console.log('✅ Connexion Redis établie');
    } catch (err) {
      console.warn('⚠️ Redis non disponible, service fonctionne sans cache:', err.message);
    }
  })();
});

