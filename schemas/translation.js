const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'ro', 'ru']
  },
  category: {
    type: String,
    enum: ['ui', 'seo', 'content', 'errors', 'validation']
  },
  page: {
    type: String
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create compound unique index for key + language
translationSchema.index({ key: 1, language: 1 }, { unique: true });

// Create indexes for better query performance
translationSchema.index({ language: 1 });
translationSchema.index({ key: 1 });
translationSchema.index({ category: 1, language: 1 });

const Translation = mongoose.model('Translation', translationSchema);

module.exports = Translation;
