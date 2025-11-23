const express = require('express');
const RecommendationModel = require('../models/RecommendationModel');

const router = express.Router();

// Obtenir tous les modèles
router.get('/', async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    const models = await RecommendationModel.find({ status })
      .sort({ createdAt: -1 });

    res.json({
      models
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des modèles:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des modèles' 
    });
  }
});

// Obtenir un modèle par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const model = await RecommendationModel.findById(id);

    if (!model) {
      return res.status(404).json({ 
        error: 'Modèle non trouvé' 
      });
    }

    res.json({
      model
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du modèle:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération du modèle' 
    });
  }
});

// Créer un nouveau modèle
router.post('/', async (req, res) => {
  try {
    const modelData = req.body;
    
    const model = new RecommendationModel(modelData);
    await model.save();

    res.status(201).json({
      message: 'Modèle créé avec succès',
      model
    });

  } catch (error) {
    console.error('Erreur lors de la création du modèle:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Un modèle avec ce nom existe déjà' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création du modèle' 
    });
  }
});

// Mettre à jour un modèle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const model = await RecommendationModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!model) {
      return res.status(404).json({ 
        error: 'Modèle non trouvé' 
      });
    }

    res.json({
      message: 'Modèle mis à jour avec succès',
      model
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du modèle:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour du modèle' 
    });
  }
});

// Initialiser les modèles par défaut
router.post('/initialize/defaults', async (req, res) => {
  try {
    const defaultModels = [
      {
        name: 'HybridRecommendation',
        version: '1.0',
        type: 'hybrid',
        status: 'active',
        configuration: {
          parameters: {
            collaborativeWeight: 0.4,
            contentWeight: 0.3,
            trendingWeight: 0.3
          },
          thresholds: {
            minScore: 0.1,
            maxRecommendations: 50,
            diversityWeight: 0.3,
            recencyWeight: 0.2
          },
          features: ['user_preferences', 'content_similarity', 'trending_score', 'engagement_metrics']
        },
        metadata: {
          description: 'Modèle hybride combinant filtrage collaboratif et basé sur le contenu',
          author: 'Système',
          tags: ['hybrid', 'default', 'production']
        }
      },
      {
        name: 'CollaborativeFiltering',
        version: '1.0',
        type: 'collaborative',
        status: 'training',
        configuration: {
          parameters: {
            minSimilarUsers: 5,
            similarityThreshold: 0.3
          },
          thresholds: {
            minScore: 0.15,
            maxRecommendations: 30,
            diversityWeight: 0.2
          },
          features: ['user_behavior', 'item_ratings', 'user_similarity']
        },
        metadata: {
          description: 'Filtrage collaboratif basé sur les utilisateurs similaires',
          author: 'Système',
          tags: ['collaborative', 'user-based']
        }
      },
      {
        name: 'ContentBasedFiltering',
        version: '1.0',
        type: 'content-based',
        status: 'training',
        configuration: {
          parameters: {
            tfidfWeight: 0.5,
            categoryWeight: 0.3,
            sourceWeight: 0.2
          },
          thresholds: {
            minScore: 0.2,
            maxRecommendations: 40,
            diversityWeight: 0.4
          },
          features: ['content_features', 'category_similarity', 'source_preference']
        },
        metadata: {
          description: 'Filtrage basé sur le contenu et les préférences utilisateur',
          author: 'Système',
          tags: ['content-based', 'preferences']
        }
      }
    ];

    const createdModels = [];
    
    for (const modelData of defaultModels) {
      const existingModel = await RecommendationModel.findOne({ 
        name: modelData.name,
        version: modelData.version 
      });
      
      if (!existingModel) {
        const model = new RecommendationModel(modelData);
        await model.save();
        createdModels.push(model);
      }
    }

    res.status(201).json({
      message: 'Modèles par défaut initialisés',
      models: createdModels
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation des modèles:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'initialisation des modèles' 
    });
  }
});

module.exports = router;

