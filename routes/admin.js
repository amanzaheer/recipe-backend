const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');

// Get all users (admin only)
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', protect, restrictTo('admin'), async (req, res) => {
  try {
    // Get user counts
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Get recipe counts
    const recipeCount = await Recipe.countDocuments();
    const recentRecipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('category', 'name');
    
    // Get review counts
    const reviewCount = await Review.countDocuments();
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('recipe', 'title')
      .populate('user', 'name');
    
    res.json({
      users: {
        total: userCount,
        admins: adminCount
      },
      recipes: {
        total: recipeCount,
        recent: recentRecipes
      },
      reviews: {
        total: reviewCount,
        recent: recentReviews
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    // Use deleteOne instead of remove (which is deprecated)
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 