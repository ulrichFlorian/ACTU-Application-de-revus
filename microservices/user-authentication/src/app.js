const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3004;

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
// Essayer plusieurs URLs possibles
const MONGO_URLS = [
  process.env.DATABASE_URL,
  'mongodb://admin:password@localhost:27018/auth?authSource=admin',
  'mongodb://localhost:27018/auth',
  'mongodb://localhost:27017/auth'
].filter(Boolean);

const MONGO_URL = MONGO_URLS[0] || 'mongodb://localhost:27017/auth';

let currentMongoIndex = 0;

async function connectWithRetry(retryDelayMs = 5000) {
  try {
    const urlToTry = MONGO_URLS[currentMongoIndex] || MONGO_URL;
    console.log(`🔌 Tentative de connexion MongoDB (${currentMongoIndex + 1}/${MONGO_URLS.length}): ${urlToTry}`);
    
    await mongoose.connect(urlToTry, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connexion MongoDB établie pour user-authentication');
    currentMongoIndex = 0; // Réinitialiser l'index en cas de succès
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err?.message || err);
    
    // Essayer l'URL suivante
    currentMongoIndex = (currentMongoIndex + 1) % MONGO_URLS.length;
    
    console.log(`⏳ Nouvelle tentative dans ${Math.floor(retryDelayMs / 1000)}s...`);
    setTimeout(connectWithRetry, retryDelayMs);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB (événement):', err?.message || err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB déconnecté. Tentative de reconnexion...');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connecté avec succès');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'user-authentication',
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

// Démarrage du serveur après initialisation de la connexion (non bloquant grâce au retry)
app.listen(PORT, () => {
  console.log(`🚀 Service user-authentication démarré sur le port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Interface web: http://localhost:${PORT}`);
  // Lancer la connexion (avec retry si échec)
  connectWithRetry();
});

