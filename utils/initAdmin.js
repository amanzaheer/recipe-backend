const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initializeAdmin = async () => {
  try {
    console.log('Checking for admin user...');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user if doesn't exist
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    
    const adminUser = new User({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error initializing admin user:', error);
    throw error; // Propagate the error to be handled by the server
  }
};

module.exports = { initializeAdmin }; 