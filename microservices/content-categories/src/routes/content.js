const express = require('express');
const ContentMetadata = require('../models/ContentMetadata');

const router = express.Router();

// Obtenir tous les contenus
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      category, 
      source, 
      language = 'fr',
      sortBy = 'publishedAt',
      order = 'desc'
    } = req.query;
    
    const filter = { isActive: true, language };
    
    if (category) {
      filter.categories = category;
    }
    
    if (source) {
      filter['source.name'] = new RegExp(source, 'i');
    }

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const contents = await ContentMetadata.find(filter)
      .populate('categories', 'name slug')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await ContentMetadata.countDocuments(filter);

    res.json({
      contents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des contenus:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des contenus' 
    });
  }
});

// Obtenir un contenu par ID
router.get('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await ContentMetadata.findOne({ contentId })
      .populate('categories', 'name slug');

    if (!content) {
      return res.status(404).json({ 
        error: 'Contenu non trouvé' 
      });
    }

    res.json({
      content
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération du contenu' 
    });
  }
});

// Créer un nouveau contenu
router.post('/', async (req, res) => {
  try {
    const contentData = req.body;
    
    const content = new ContentMetadata(contentData);
    await content.save();

    res.status(201).json({
      message: 'Contenu créé avec succès',
      content
    });

  } catch (error) {
    console.error('Erreur lors de la création du contenu:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Un contenu avec cet ID existe déjà' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création du contenu' 
    });
  }
});

// Mettre à jour un contenu
router.put('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const updates = req.body;

    const content = await ContentMetadata.findOneAndUpdate(
      { contentId },
      updates,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({ 
        error: 'Contenu non trouvé' 
      });
    }

    res.json({
      message: 'Contenu mis à jour avec succès',
      content
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour du contenu' 
    });
  }
});

// Obtenir les contenus tendance
router.get('/trending/now', async (req, res) => {
  try {
    const { limit = 10, language = 'fr' } = req.query;
    
    const contents = await ContentMetadata.find({
      isActive: true,
      language,
      'trending.isTrending': true
    })
      .populate('categories', 'name slug')
      .sort({ 'trending.trendingScore': -1, publishedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      contents
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des contenus tendance:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des contenus tendance' 
    });
  }
});

// Obtenir les contenus populaires
router.get('/popular/views', async (req, res) => {
  try {
    const { limit = 10, language = 'fr' } = req.query;
    
    const contents = await ContentMetadata.find({
      isActive: true,
      language
    })
      .populate('categories', 'name slug')
      .sort({ 'engagement.views': -1, publishedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      contents
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des contenus populaires:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des contenus populaires' 
    });
  }
});

// Mettre à jour l'engagement d'un contenu
router.post('/:contentId/engagement', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { type, value = 1 } = req.body; // type: 'view', 'like', 'share', 'comment'
    
    const updateField = `engagement.${type}`;
    
    const content = await ContentMetadata.findOneAndUpdate(
      { contentId },
      { $inc: { [updateField]: value } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ 
        error: 'Contenu non trouvé' 
      });
    }

    res.json({
      message: 'Engagement mis à jour avec succès',
      content
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'engagement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de l\'engagement' 
    });
  }
});

module.exports = router;

