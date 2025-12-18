const express = require('express');
const axios = require('axios');
const UserPreference = require('../models/UserPreference');
const UserProfile = require('../models/UserProfile');

const router = express.Router();

// URL du service content-feed
// En développement Docker, utiliser le nom du service
// En production, utiliser l'URL complète
const feedServiceUrl = (process.env.FEED_SERVICE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://content-feed.onrender.com' 
    : 'http://content-feed:3002')).replace(/\/$/, '');

// Obtenir les préférences d'un utilisateur
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let preferences = await UserPreference.findOne({ userId });
    
    // Créer des préférences par défaut si elles n'existent pas
    if (!preferences) {
      preferences = new UserPreference({
        userId,
        categories: {
          preferred: ['technologie', 'sport'],
          blocked: []
        },
        sources: {
          preferred: ['Le Monde', 'BBC'],
          blocked: []
        },
        languages: ['fr'],
        readingPreferences: {
          articleLength: 'moyen',
          readingTime: 'matin',
          maxArticlesPerDay: 20
        },
        notifications: {
          email: {
            enabled: true,
            frequency: 'quotidien',
            time: '08:00'
          },
          push: {
            enabled: false,
            breakingNews: true
          }
        }
      });
      
      await preferences.save();
    }

    res.json({
      preferences
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des préférences' 
    });
  }
});

// Mettre à jour les préférences
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const preferences = await UserPreference.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Préférences mises à jour avec succès',
      preferences
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour des préférences' 
    });
  }
});

// Ajouter une catégorie préférée
router.post('/:userId/categories/preferred', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.body;

    const preferences = await UserPreference.findOneAndUpdate(
      { userId },
      { 
        $addToSet: { 'categories.preferred': category },
        $pull: { 'categories.blocked': category }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Catégorie ajoutée aux préférences',
      preferences
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de catégorie:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'ajout de catégorie' 
    });
  }
});

// Bloquer une catégorie
router.post('/:userId/categories/blocked', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.body;

    const preferences = await UserPreference.findOneAndUpdate(
      { userId },
      { 
        $addToSet: { 'categories.blocked': category },
        $pull: { 'categories.preferred': category }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Catégorie bloquée',
      preferences
    });

  } catch (error) {
    console.error('Erreur lors du blocage de catégorie:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors du blocage de catégorie' 
    });
  }
});

// Obtenir le profil utilisateur
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let profile = await UserProfile.findOne({ userId });
    
    // Créer un profil par défaut si il n'existe pas
    if (!profile) {
      profile = new UserProfile({
        userId,
        demographics: {
          age: '25-34',
          gender: 'non-précisé',
          location: {
            country: 'France',
            city: 'Paris',
            timezone: 'Europe/Paris'
          }
        },
        behavior: {
          readingPatterns: {
            averageSessionTime: 15,
            averageArticlesPerSession: 5,
            preferredReadingTimes: ['08:00-10:00'],
            deviceTypes: ['mobile']
          },
          engagement: {
            clickRate: 0.3,
            shareRate: 0.05,
            commentRate: 0.01,
            readCompletionRate: 0.7
          }
        },
        activity: {
          totalReadArticles: 0,
          totalReadingTime: 0,
          lastActivity: new Date(),
          streak: 0,
          achievements: []
        }
      });
      
      await profile.save();
    }

    res.json({
      profile
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération du profil' 
    });
  }
});

// Mettre à jour le profil utilisateur
router.put('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profil mis à jour avec succès',
      profile
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour du profil' 
    });
  }
});

// Route pour récupérer les articles basés sur les préférences utilisateur avec sections internationale et locale
router.get('/:userId/articles', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, category } = req.query;
    
    // Récupérer les préférences utilisateur
    let preferences = await UserPreference.findOne({ userId });
    if (!preferences) {
      return res.json({
        feed: [],
        sections: { international: 0, local: 0 },
        message: 'Aucune préférence trouvée pour cet utilisateur'
      });
    }
    
    // Utiliser la catégorie fournie en paramètre, sinon prendre la première préférée
    const categoryToUse = category || (preferences.categories?.preferred?.[0] || 'technologie');
    
    try {
      // Appeler le service content-feed pour récupérer les articles avec sections
      const feedUrl = `${feedServiceUrl}/api/feed/category/${categoryToUse}?limit=${parseInt(limit) || 20}`;
      console.log(`[User Preferences] Appel du service feed: ${feedUrl}`);
      
      const feedResponse = await axios.get(feedUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'UserPreferences-Service/1.0'
        }
      });
      
      const feedData = feedResponse.data || {};
      const articles = feedData.feed || [];
      
      // Séparer les articles par section
      const internationalArticles = articles.filter(a => a.section === 'international' || a.origin === 'gnews' || a.origin === 'africa-news');
      const localArticles = articles.filter(a => a.section === 'local' || a.origin === 'local');
      
      return res.json({
        feed: articles,
        sections: feedData.sections || {
          international: internationalArticles.length,
          local: localArticles.length
        },
        category: categoryToUse,
        timestamp: new Date().toISOString()
      });
      
    } catch (feedError) {
      console.error('Erreur lors de la récupération des articles:', feedError.message);
      return res.status(500).json({
        error: 'Erreur lors de la récupération des articles depuis le service feed',
        details: feedError.message
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des articles' 
    });
  }
});

module.exports = router;

