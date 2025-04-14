const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const Review = require('../models/Review');
const Recipe = require('../models/Recipe');

// Get all reviews (admin only)
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name avatar')
      .populate('recipe', 'title slug')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const reviews = await Review.find({ recipe: req.params.recipeId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews by the current user
router.get('/user', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('recipe', 'title slug image')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('recipe', 'title slug');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a review
router.post('/', protect, async (req, res) => {
  try {
    const { recipeId, rating, comment } = req.body;
    
    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user already reviewed this recipe
    const existingReview = await Review.findOne({
      recipe: recipeId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this recipe' });
    }
    
    // Create review
    const review = new Review({
      recipe: recipeId,
      user: req.user._id,
      rating,
      comment
    });
    
    await review.save();
    
    // Update recipe rating
    const reviews = await Review.find({ recipe: recipeId });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    recipe.rating = totalRating / reviews.length;
    recipe.reviewCount = reviews.length;
    await recipe.save();
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a review
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the author of the review
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    review.rating = rating;
    review.comment = comment;
    await review.save();
    
    // Update recipe rating
    const recipe = await Recipe.findById(review.recipe);
    const reviews = await Review.find({ recipe: review.recipe });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    recipe.rating = totalRating / reviews.length;
    await recipe.save();
    
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a review
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the author of the review
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    const recipeId = review.recipe;
    await review.remove();
    
    // Update recipe rating
    const recipe = await Recipe.findById(recipeId);
    const reviews = await Review.find({ recipe: recipeId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      recipe.rating = totalRating / reviews.length;
    } else {
      recipe.rating = 0;
    }
    
    recipe.reviewCount = reviews.length;
    await recipe.save();
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 