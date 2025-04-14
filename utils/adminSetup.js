const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { protect: auth, restrictTo } = require('../middleware/auth');
const admin = require('../middleware/admin');
const Category = require('../models/Category');

const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';
    
    // Delete existing admin user if exists
    await User.deleteOne({ email: adminEmail });
    
    // Create new admin user
    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    
    // Verify the user was created
    const createdUser = await User.findOne({ email: adminEmail });
    console.log('Created admin user:', {
      id: createdUser._id,
      email: createdUser.email,
      role: createdUser.role
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = { createAdminUser }; 