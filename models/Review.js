const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure one review per user per recipe
reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema); 