const express = require('express');
const axios = require('axios');
const UserRecommendation = require('../models/UserRecommendation');
const RecommendationModel = require('../models/RecommendationModel');

const router = express.Router();

// Obtenir les recommandations pour un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, algorithm = 'hybrid' } = req.query;

    // Supprimer les anciennes recommandations expirées
    await UserRecommendation.deleteMany({ 
      userId, 
      expiresAt: { $lt: new Date() } 
    });

    // Récupérer les recommandations existantes
    let recommendations = await UserRecommendation.find({
      userId,
      status: { $in: ['generated', 'shown'] }
    })
      .sort({ score: -1, generatedAt: -1 })
      .limit(parseInt(limit));

    // Si pas assez de recommandations, en générer de nouvelles
    if (recommendations.length < parseInt(limit)) {
      const newRecommendations = await generateRecommendations(userId, algorithm);
      recommendations = [...recommendations, ...newRecommendations]
        .sort((a, b) => b.score - a.score)
        .slice(0, parseInt(limit));
    }

    res.json({
      recommendations: recommendations.map(rec => ({
        contentId: rec.contentId,
        score: rec.score,
        algorithm: rec.algorithm,
        reason: rec.reason,
        explanation: rec.metadata.explanation,
        generatedAt: rec.generatedAt
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des recommandations' 
    });
  }
});

// Générer de nouvelles recommandations pour un utilisateur
router.post('/user/:userId/generate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { algorithm = 'hybrid', count = 20 } = req.body;

    // Supprimer les anciennes recommandations
    await UserRecommendation.deleteMany({ userId });

    // Générer de nouvelles recommandations
    const recommendations = await generateRecommendations(userId, algorithm, count);

    res.json({
      message: 'Recommandations générées avec succès',
      count: recommendations.length,
      recommendations: recommendations.map(rec => ({
        contentId: rec.contentId,
        score: rec.score,
        algorithm: rec.algorithm,
        reason: rec.reason
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la génération des recommandations' 
    });
  }
});

// Marquer une recommandation comme vue
router.post('/user/:userId/seen', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentId } = req.body;

    await UserRecommendation.updateOne(
      { userId, contentId, status: 'generated' },
      { status: 'shown' }
    );

    res.json({
      message: 'Recommandation marquée comme vue'
    });

  } catch (error) {
    console.error('Erreur lors du marquage de la recommandation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors du marquage de la recommandation' 
    });
  }
});

// Enregistrer le feedback utilisateur
router.post('/user/:userId/feedback', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentId, rating, feedback } = req.body;

    const recommendation = await UserRecommendation.findOneAndUpdate(
      { userId, contentId },
      {
        status: rating >= 3 ? 'clicked' : 'ignored',
        userFeedback: {
          rating,
          feedback,
          timestamp: new Date()
        }
      },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({ 
        error: 'Recommandation non trouvée' 
      });
    }

    res.json({
      message: 'Feedback enregistré avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du feedback:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'enregistrement du feedback' 
    });
  }
});

// Fonction pour générer des recommandations
async function generateRecommendations(userId, algorithm = 'hybrid', count = 20) {
  try {
    // Récupérer les préférences utilisateur
    const preferences = await getUserPreferences(userId);
    
    // Récupérer le contenu disponible
    const availableContent = await getAvailableContent(preferences);
    
    // Générer les scores de recommandation
    const recommendations = [];
    
    for (const content of availableContent) {
      const score = calculateRecommendationScore(content, preferences, algorithm);
      
      if (score > 0.1) { // Seuil minimum
        const recommendation = new UserRecommendation({
          userId,
          contentId: content.contentId,
          score,
          algorithm,
          reason: getRecommendationReason(content, preferences),
          metadata: {
            confidence: score,
            modelVersion: '1.0',
            features: ['category_match', 'user_preferences', 'trending'],
            explanation: generateExplanation(content, preferences, score)
          }
        });
        
        recommendations.push(recommendation);
      }
    }
    
    // Trier par score et sauvegarder
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, count);
    
    await UserRecommendation.insertMany(topRecommendations);
    
    return topRecommendations;
    
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    return [];
  }
}

// Fonction pour récupérer les préférences utilisateur
async function getUserPreferences(userId) {
  try {
    const response = await axios.get(`http://user-preferences:3001/api/preferences/${userId}`);
    return response.data.preferences || {};
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return {};
  }
}

// Fonction pour récupérer le contenu disponible
async function getAvailableContent(preferences) {
  try {
    const category = preferences.categories?.preferred?.[0] || 'technologie';
    const response = await axios.get(`http://content-categories:3005/api/content?category=${category}&limit=100`);
    return response.data.contents || [];
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error);
    return [];
  }
}

// Fonction pour calculer le score de recommandation
function calculateRecommendationScore(content, preferences, algorithm) {
  let score = 0;
  
  // Score basé sur les catégories préférées
  if (preferences.categories?.preferred) {
    const categoryMatch = content.categories?.some(cat => 
      preferences.categories.preferred.includes(cat.name.toLowerCase())
    );
    if (categoryMatch) score += 0.4;
  }
  
  // Score basé sur les sources préférées
  if (preferences.sources?.preferred) {
    const sourceMatch = preferences.sources.preferred.includes(content.source?.name);
    if (sourceMatch) score += 0.3;
  }
  
  // Score basé sur la popularité
  if (content.engagement?.views > 1000) score += 0.2;
  
  // Score basé sur la récence
  const hoursSincePublication = (Date.now() - new Date(content.publishedAt)) / (1000 * 60 * 60);
  if (hoursSincePublication < 24) score += 0.1;
  
  return Math.min(score, 1.0);
}

// Fonction pour déterminer la raison de la recommandation
function getRecommendationReason(content, preferences) {
  if (preferences.categories?.preferred?.includes(content.categories?.[0]?.name?.toLowerCase())) {
    return 'category_match';
  }
  if (content.engagement?.views > 1000) {
    return 'popular_content';
  }
  if (content.trending?.isTrending) {
    return 'trending_topic';
  }
  return 'preferences_match';
}

// Fonction pour générer une explication
function generateExplanation(content, preferences, score) {
  const reasons = [];
  
  if (preferences.categories?.preferred?.includes(content.categories?.[0]?.name?.toLowerCase())) {
    reasons.push(`Correspond à vos intérêts en ${content.categories[0].name}`);
  }
  
  if (content.engagement?.views > 1000) {
    reasons.push('Article très populaire');
  }
  
  if (content.trending?.isTrending) {
    reasons.push('Sujet d\'actualité');
  }
  
  return reasons.join(', ') || 'Recommandé par notre algorithme';
}

module.exports = router;

