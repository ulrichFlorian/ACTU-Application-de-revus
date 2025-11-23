const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  demographics: {
    age: {
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    },
    gender: {
      type: String,
      enum: ['homme', 'femme', 'autre', 'non-précisé']
    },
    location: {
      country: String,
      city: String,
      timezone: String
    },
    profession: String,
    education: {
      type: String,
      enum: ['primaire', 'secondaire', 'bac', 'bachelor', 'master', 'doctorat']
    }
  },
  behavior: {
    readingPatterns: {
      averageSessionTime: Number, // en minutes
      averageArticlesPerSession: Number,
      preferredReadingTimes: [String], // ['08:00-10:00', '12:00-14:00']
      deviceTypes: [String] // ['mobile', 'desktop', 'tablet']
    },
    engagement: {
      clickRate: Number,
      shareRate: Number,
      commentRate: Number,
      readCompletionRate: Number
    },
    interests: {
      trending: [String], // sujets d'actualité suivis
      longTerm: [String] // intérêts durables
    }
  },
  activity: {
    totalReadArticles: { type: Number, default: 0 },
    totalReadingTime: { type: Number, default: 0 }, // en minutes
    lastActivity: Date,
    streak: { type: Number, default: 0 }, // jours consécutifs
    achievements: [String]
  }
}, {
  timestamps: true
});

// Index pour la recherche rapide
userProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);

