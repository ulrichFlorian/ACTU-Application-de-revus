const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Obtenir toutes les catégories
router.get('/', async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug')
      .sort({ priority: -1, name: 1 });

    res.json({
      categories
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des catégories' 
    });
  }
});

// Obtenir une catégorie par slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug })
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug');

    if (!category) {
      return res.status(404).json({ 
        error: 'Catégorie non trouvée' 
      });
    }

    res.json({
      category
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de la catégorie' 
    });
  }
});

// Créer une nouvelle catégorie
router.post('/', async (req, res) => {
  try {
    const categoryData = req.body;
    
    // Générer le slug automatiquement si non fourni
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      message: 'Catégorie créée avec succès',
      category
    });

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Une catégorie avec ce nom ou slug existe déjà' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de la catégorie' 
    });
  }
});

// Mettre à jour une catégorie
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        error: 'Catégorie non trouvée' 
      });
    }

    res.json({
      message: 'Catégorie mise à jour avec succès',
      category
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de la catégorie' 
    });
  }
});

// Supprimer une catégorie (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ 
        error: 'Catégorie non trouvée' 
      });
    }

    res.json({
      message: 'Catégorie désactivée avec succès',
      category
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de la catégorie' 
    });
  }
});

// Obtenir les catégories populaires
router.get('/popular/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const categories = await Category.find({ isActive: true })
      .sort({ 'metadata.popularity': -1, 'metadata.articleCount': -1 })
      .limit(parseInt(limit));

    res.json({
      categories
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories populaires:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des catégories populaires' 
    });
  }
});

// Initialiser les catégories par défaut
router.post('/initialize/defaults', async (req, res) => {
  try {
    const defaultCategories = [
      {
        name: 'Politique',
        slug: 'politique',
        description: 'Actualités politiques nationales et internationales',
        icon: '🏛️',
        color: '#dc3545',
        keywords: ['politique', 'gouvernement', 'élection', 'parlement']
      },
      {
        name: 'Sport',
        slug: 'sport',
        description: 'Actualités sportives et résultats',
        icon: '⚽',
        color: '#28a745',
        keywords: ['sport', 'football', 'basketball', 'tennis', 'olympique']
      },
      {
        name: 'Technologie',
        slug: 'technologie',
        description: 'Innovations technologiques et numérique',
        icon: '💻',
        color: '#007bff',
        keywords: ['technologie', 'IA', 'smartphone', 'informatique', 'innovation']
      },
      {
        name: 'Santé',
        slug: 'sante',
        description: 'Actualités médicales et bien-être',
        icon: '🏥',
        color: '#17a2b8',
        keywords: ['santé', 'médecine', 'bien-être', 'recherche', 'traitement']
      },
      {
        name: 'Économie',
        slug: 'economie',
        description: 'Actualités économiques et financières',
        icon: '📈',
        color: '#ffc107',
        keywords: ['économie', 'finance', 'bourse', 'entreprise', 'emploi']
      },
      {
        name: 'Culture',
        slug: 'culture',
        description: 'Actualités culturelles et artistiques',
        icon: '🎭',
        color: '#6f42c1',
        keywords: ['culture', 'art', 'cinéma', 'musique', 'littérature']
      },
      {
        name: 'International',
        slug: 'international',
        description: 'Actualités internationales',
        icon: '🌍',
        color: '#20c997',
        keywords: ['international', 'monde', 'diplomatie', 'conflit', 'coopération']
      },
      {
        name: 'Sciences',
        slug: 'sciences',
        description: 'Actualités scientifiques et recherche',
        icon: '🔬',
        color: '#fd7e14',
        keywords: ['sciences', 'recherche', 'découverte', 'étude', 'laboratoire']
      }
    ];

    const createdCategories = [];
    
    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        createdCategories.push(category);
      }
    }

    res.status(201).json({
      message: 'Catégories par défaut initialisées',
      categories: createdCategories
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation des catégories:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'initialisation des catégories' 
    });
  }
});

module.exports = router;

