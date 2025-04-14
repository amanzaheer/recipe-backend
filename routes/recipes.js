const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');

// Create a new recipe
router.post('/', protect, async (req, res) => {
  try {
    // Create a slug from the title
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Create the recipe
    const recipe = new Recipe({
      ...req.body,
      slug,
      author: req.user._id
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all recipes with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      search, 
      sort = '-createdAt',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const recipes = await Recipe.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('category', 'name slug')
      .populate('author', 'name');

    const total = await Recipe.countDocuments(query);

    res.json({
      recipes,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single recipe by slug
router.get('/:slug', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' }
      });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single recipe by ID
router.get('/id/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a recipe
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.path;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a recipe
router.delete('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await recipe.remove();
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a review to a recipe
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const review = new Review({
      ...req.body,
      recipe: recipe._id,
      user: req.user._id
    });

    await review.save();

    // Update recipe rating
    const reviews = await Review.find({ recipe: recipe._id });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    recipe.rating = totalRating / reviews.length;
    recipe.reviewCount = reviews.length;
    await recipe.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 