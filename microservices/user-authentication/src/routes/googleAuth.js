const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Configuration Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4002';
// Pour le callback, utiliser l'URL complète en production, relative en développement
const getCallbackURL = () => {
  if (process.env.NODE_ENV === 'production' && process.env.AUTH_SERVICE_URL) {
    return `${process.env.AUTH_SERVICE_URL}/api/auth/google/callback`;
  }
  return '/api/auth/google/callback';
};

// Configuration Passport Google Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: getCallbackURL()
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Chercher ou créer l'utilisateur
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Utilisateur existant avec Google
        return done(null, user);
      }
      
      // Vérifier si l'email existe déjà (compte créé manuellement)
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Lier le compte Google à l'utilisateur existant
        user.googleId = profile.id;
        if (!user.nom) {
          user.nom = profile.displayName || profile.name?.givenName || 'Utilisateur';
        }
        await user.save();
        return done(null, user);
      }
      
      // Créer un nouvel utilisateur avec Google
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        nom: profile.displayName || profile.name?.givenName || 'Utilisateur Google',
        isActive: true
      });
      
      await user.save();
      console.log(`✅ Utilisateur Google créé: ${user.email}`);
      return done(null, user);
    } catch (error) {
      console.error('❌ Erreur Google OAuth:', error);
      return done(error, null);
    }
  }
  ));
  
  // Sérialisation pour Passport
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Route pour initier l'authentification Google
// Forcer la sélection du compte à chaque fois
router.get('/google', (req, res) => {
  // Obtenir l'URL complète du callback
  const callbackUrl = process.env.NODE_ENV === 'production' && process.env.AUTH_SERVICE_URL
    ? `${process.env.AUTH_SERVICE_URL}/api/auth/google/callback`
    : `http://localhost:4005/api/auth/google/callback`;
  
  // Construire l'URL d'autorisation Google avec le paramètre prompt=select_account
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `scope=${encodeURIComponent('profile email')}&` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `prompt=select_account`; // Force la sélection du compte
  
  console.log('🔐 Redirection vers Google avec prompt=select_account');
  res.redirect(authUrl);
});

// Callback Google OAuth
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/?error=google_auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user;
      
      // Créer un token JWT
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Rediriger vers user-authentication avec le token (pour afficher les infos utilisateur)
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4005';
      res.redirect(`${authServiceUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(user.toPublicJSON()))}`);
    } catch (error) {
      console.error('❌ Erreur callback Google:', error);
      res.redirect('/?error=google_auth_error');
    }
  }
);

module.exports = router;
