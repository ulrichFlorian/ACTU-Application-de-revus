const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📰'
  },
  color: {
    type: String,
    default: '#007bff'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  keywords: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  metadata: {
    articleCount: { type: Number, default: 0 },
    lastArticleDate: Date,
    averageReadTime: Number, // en minutes
    popularity: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index pour la recherche rapide
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ priority: -1 });

module.exports = mongoose.model('Category', categorySchema);

