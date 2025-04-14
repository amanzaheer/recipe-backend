const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Add recipe to favorites
router.post('/:recipeId', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.favorites.includes(recipe._id)) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }

    user.favorites.push(recipe._id);
    await user.save();

    recipe.favoritesCount += 1;
    await recipe.save();

    res.json({ message: 'Recipe added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove recipe from favorites
router.delete('/:recipeId', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user.favorites.includes(recipe._id)) {
      return res.status(400).json({ message: 'Recipe not in favorites' });
    }

    user.favorites = user.favorites.filter(
      id => id.toString() !== recipe._id.toString()
    );
    await user.save();

    recipe.favoritesCount -= 1;
    await recipe.save();

    res.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's favorite recipes
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'author', select: 'name' }
        ]
      });

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if recipe is in favorites
router.get('/:recipeId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(req.params.recipeId);
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 