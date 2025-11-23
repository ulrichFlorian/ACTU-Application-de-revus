const mongoose = require('mongoose');

const contentMetadataSchema = new mongoose.Schema({
  contentId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  source: {
    name: { type: String, required: true },
    url: String,
    logo: String,
    reliability: { type: Number, min: 0, max: 1, default: 0.8 }
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [String],
  language: {
    type: String,
    default: 'fr'
  },
  publishedAt: {
    type: Date,
    required: true
  },
  author: {
    name: String,
    email: String,
    bio: String
  },
  content: {
    type: {
      type: String,
      enum: ['article', 'video', 'podcast', 'image', 'infographic'],
      default: 'article'
    },
    length: Number, // mots ou minutes
    readingTime: Number, // en minutes
    wordCount: Number
  },
  engagement: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  sentiment: {
    score: { type: Number, min: -1, max: 1 }, // -1 négatif, 0 neutre, 1 positif
    confidence: { type: Number, min: 0, max: 1 }
  },
  trending: {
    isTrending: { type: Boolean, default: false },
    trendingScore: { type: Number, default: 0 },
    trendingPeriod: { type: String, enum: ['hour', 'day', 'week', 'month'] }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour la recherche et le tri
contentMetadataSchema.index({ contentId: 1 });
contentMetadataSchema.index({ publishedAt: -1 });
contentMetadataSchema.index({ 'engagement.views': -1 });
contentMetadataSchema.index({ 'trending.trendingScore': -1 });
contentMetadataSchema.index({ categories: 1 });
contentMetadataSchema.index({ tags: 1 });
contentMetadataSchema.index({ language: 1 });

module.exports = mongoose.model('ContentMetadata', contentMetadataSchema);

