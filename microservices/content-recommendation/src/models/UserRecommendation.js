const mongoose = require('mongoose');

const userRecommendationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  contentId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  algorithm: {
    type: String,
    enum: ['collaborative', 'content-based', 'hybrid', 'trending', 'popularity'],
    required: true
  },
  reason: {
    type: String,
    enum: [
      'category_match',
      'similar_users',
      'trending_topic',
      'reading_history',
      'preferences_match',
      'popular_content',
      'recency_bias',
      'diversity_boost'
    ],
    required: true
  },
  metadata: {
    confidence: { type: Number, min: 0, max: 1 },
    modelVersion: String,
    features: [String],
    explanation: String
  },
  status: {
    type: String,
    enum: ['generated', 'shown', 'clicked', 'ignored', 'dismissed'],
    default: 'generated'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
  },
  userFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Index composé pour les requêtes fréquentes
userRecommendationSchema.index({ userId: 1, generatedAt: -1 });
userRecommendationSchema.index({ userId: 1, status: 1 });
userRecommendationSchema.index({ contentId: 1 });
userRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('UserRecommendation', userRecommendationSchema);

