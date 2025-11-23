const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérifier que tous les champs sont présents
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis' 
      });
    }

    // Vérifier la connexion MongoDB
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Service temporairement indisponible. Connexion à la base de données en cours...' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    // Sauvegarder l'utilisateur dans MongoDB (collection 'users')
    await user.save();
    
    // Vérifier que l'utilisateur a bien été sauvegardé
    const savedUser = await User.findById(user._id);
    if (!savedUser) {
      throw new Error('Erreur lors de la sauvegarde de l\'utilisateur');
    }
    
    console.log(`✅ Utilisateur créé avec succès dans MongoDB (collection 'users'):`);
    console.log(`   - Email: ${savedUser.email}`);
    console.log(`   - Nom: ${savedUser.firstName} ${savedUser.lastName}`);
    console.log(`   - ID: ${savedUser._id}`);
    console.log(`   - Date de création: ${savedUser.createdAt}`);

    // Ne pas créer de session ni de token lors de l'inscription
    // L'utilisateur doit se connecter pour obtenir un token
    res.status(201).json({
      message: 'Compte créé avec succès ! Veuillez vous connecter avec vos identifiants.',
      success: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    console.error('   Stack:', error.stack);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      console.error('   Erreurs de validation:', errors);
      return res.status(400).json({ 
        error: 'Erreur de validation',
        details: errors
      });
    }
    
    if (error.code === 11000) {
      console.error('   Email déjà utilisé');
      return res.status(400).json({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      });
    }
    
    if (error.name === 'MongoServerError' || error.message?.includes('Mongo') || error.message?.includes('connection')) {
      console.error('   Erreur MongoDB');
      return res.status(503).json({ 
        error: 'Erreur de connexion à la base de données. Veuillez réessayer plus tard.' 
      });
    }
    
    // Erreur générique avec message détaillé en développement
    const errorResponse = { 
      error: 'Erreur serveur lors de l\'inscription'
    };
    
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      errorResponse.message = error.message;
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    let isPasswordValid = false;
    
    try {
      // Essayer d'abord la comparaison bcrypt standard (pour les nouveaux utilisateurs)
      isPasswordValid = await user.comparePassword(password);
      
      // Si la comparaison échoue, vérifier si c'est un ancien utilisateur avec mot de passe non hashé
      if (!isPasswordValid) {
        // Vérifier si le mot de passe stocké est hashé (commence par $2a$, $2b$ ou $2y$)
        const isPasswordHashed = user.password && (
          user.password.startsWith('$2a$') || 
          user.password.startsWith('$2b$') || 
          user.password.startsWith('$2y$')
        );
        
        if (!isPasswordHashed) {
          // Ancien utilisateur avec mot de passe en clair (migration)
          // Comparer directement
          if (user.password === password) {
            isPasswordValid = true;
            // Re-hasher le mot de passe pour la sécurité (le pre-save hook va le hasher)
            user.password = password;
            await user.save();
            console.log(`✅ Mot de passe re-hashé pour l'utilisateur ${user.email}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe:', error);
      // En cas d'erreur, essayer la comparaison directe pour les anciens utilisateurs
      if (user.password === password) {
        isPasswordValid = true;
        // Re-hasher le mot de passe
        user.password = password;
        await user.save();
        console.log(`✅ Mot de passe re-hashé pour l'utilisateur ${user.email} (après erreur)`);
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Compte désactivé' 
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Créer une session
    const session = new Session({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await session.save();

    res.json({
      message: 'Connexion réussie',
      user: user.toPublicJSON(),
      token,
      redirectUrl: process.env.PREFERENCES_SERVICE_URL || 'http://localhost:3001'
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la connexion' 
    });
  }
});

// Déconnexion
router.post('/logout', auth, async (req, res) => {
  try {
    // Désactiver la session
    await Session.findOneAndUpdate(
      { token: req.token },
      { isActive: false }
    );

    res.json({ message: 'Déconnexion réussie' });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la déconnexion' 
    });
  }
});

// Vérifier le token
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Token invalide ou utilisateur inactif' 
      });
    }

    res.json({
      valid: true,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la vérification' 
    });
  }
});

module.exports = router;

