const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const preferencesRoutes = require('./routes/preferences');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS pour autoriser Vercel et localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3004',
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
app.use(express.static('public'));

// Connexion MongoDB avec retry
const DEFAULT_MONGO_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/user-preferences';
const MONGO_URL = DEFAULT_MONGO_URL;

async function connectWithRetry(retryDelayMs = 5000) {
  try {
    console.log(`🔌 Tentative de connexion MongoDB: ${MONGO_URL}`);
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion MongoDB établie pour user-preferences');
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err?.message || err);
    console.log(`⏳ Nouvelle tentative dans ${Math.floor(retryDelayMs / 1000)}s...`);
    setTimeout(connectWithRetry, retryDelayMs);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB (événement):', err?.message || err);
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connexion MongoDB établie pour user-preferences');
});

// Routes
app.use('/api/preferences', preferencesRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'user-preferences',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err);
  process.exit(1);
});

// Démarrage du serveur
// Écouter sur 0.0.0.0 pour être accessible depuis l'extérieur du conteneur Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Service user-preferences démarré sur le port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Interface web: http://localhost:${PORT}`);
  // Lancer la connexion (avec retry si échec)
  connectWithRetry();
});
