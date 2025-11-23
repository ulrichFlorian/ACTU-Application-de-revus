const mongoose = require('mongoose');

const recommendationModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  version: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['collaborative', 'content-based', 'hybrid', 'deep-learning'],
    required: true
  },
  status: {
    type: String,
    enum: ['training', 'active', 'inactive', 'deprecated'],
    default: 'training'
  },
  configuration: {
    parameters: mongoose.Schema.Types.Mixed,
    thresholds: {
      minScore: { type: Number, default: 0.1 },
      maxRecommendations: { type: Number, default: 50 },
      diversityWeight: { type: Number, default: 0.3 },
      recencyWeight: { type: Number, default: 0.2 }
    },
    features: [String],
    modelPath: String
  },
  performance: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    coverage: Number,
    diversity: Number,
    lastEvaluated: Date
  },
  training: {
    datasetSize: Number,
    trainingDate: Date,
    trainingDuration: Number, // en minutes
    hyperparameters: mongoose.Schema.Types.Mixed
  },
  usage: {
    totalRecommendations: { type: Number, default: 0 },
    successfulRecommendations: { type: Number, default: 0 },
    averageScore: Number,
    lastUsed: Date
  },
  metadata: {
    description: String,
    author: String,
    tags: [String],
    documentation: String
  }
}, {
  timestamps: true
});

// Index pour la recherche rapide
recommendationModelSchema.index({ name: 1, version: 1 });
recommendationModelSchema.index({ status: 1 });
recommendationModelSchema.index({ type: 1 });

module.exports = mongoose.model('RecommendationModel', recommendationModelSchema);

