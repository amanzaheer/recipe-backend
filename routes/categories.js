const express = require('express');
const router = express.Router();
const { protect: auth, restrictTo } = require('../middleware/auth');
const admin = require('../middleware/admin');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get a single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
});

// Create a new category (admin only)
router.post('/', auth, restrictTo('admin'), async (req, res) => {
  try {
    const { name, description, icon, color, bgColor } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      description,
      icon,
      color,
      bgColor
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update a category (admin only)
router.put('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    const { name, description, icon, color, bgColor } = req.body;

    // Check if new name already exists (if name is being updated)
    if (name) {
      const existingCategory = await Category.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, color, bgColor },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete a category (admin only)
router.delete('/:id', auth, restrictTo('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Get recipes by category
router.get('/:slug/recipes', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const recipes = await Recipe.find({ category: category._id })
      .populate('author', 'name')
      .sort('-createdAt');

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    res.status(500).json({ message: 'Error fetching recipes by category' });
  }
});

module.exports = router; 