const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const categoriesRoutes = require('./routes/categories');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = process.env.PORT || 3005;

// Configuration CORS pour autoriser Vercel et localhost
const allowedOrigins = [
  'http://localhost:3000',
  'https://content-categories.onrender.com',
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

// Connexion MongoDB
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/categories', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connexion MongoDB établie pour content-categories');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
});

// Routes
app.use('/api/categories', categoriesRoutes);
app.use('/api/content', contentRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'content-categories',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Service content-categories démarré sur le port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
