const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  categories: {
    preferred: [{
      type: String,
      enum: ['politique', 'sport', 'technologie', 'santé', 'économie', 'culture', 'international', 'sciences']
    }],
    blocked: [{
      type: String,
      enum: ['politique', 'sport', 'technologie', 'santé', 'économie', 'culture', 'international', 'sciences']
    }]
  },
  sources: {
    preferred: [String],
    blocked: [String]
  },
  languages: {
    type: [String],
    default: ['fr']
  },
  readingPreferences: {
    articleLength: {
      type: String,
      enum: ['court', 'moyen', 'long'],
      default: 'moyen'
    },
    readingTime: {
      type: String,
      enum: ['matin', 'midi', 'soir', 'nuit'],
      default: 'matin'
    },
    maxArticlesPerDay: {
      type: Number,
      default: 20,
      min: 1,
      max: 100
    }
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['quotidien', 'hebdomadaire', 'mensuel'], default: 'quotidien' },
      time: { type: String, default: '08:00' }
    },
    push: {
      enabled: { type: Boolean, default: false },
      breakingNews: { type: Boolean, default: true }
    },
    sms: {
      enabled: { type: Boolean, default: false }
    }
  },
  privacy: {
    shareReadArticles: { type: Boolean, default: false },
    allowPersonalizedAds: { type: Boolean, default: false },
    shareReadingHistory: { type: Boolean, default: false }
  },
  advanced: {
    algorithm: {
      type: String,
      enum: ['collaborative', 'content-based', 'hybrid'],
      default: 'hybrid'
    },
    diversity: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    },
    recency: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    }
  }
}, {
  timestamps: true
});

// Index pour la recherche rapide
userPreferenceSchema.index({ userId: 1 });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);

