const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, uploadsDir } = require('../config/cloudinary');
const path = require('path');
const multer = require('multer');

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  next(err);
};

// Upload single image
router.post('/single', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err.message.includes('Only image files')) {
        return res.status(400).json({ error: err.message });
      }
      return next(err);
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return the relative path from the uploads directory
      const relativePath = path.relative(uploadsDir, req.file.path);
      
      // Log successful upload
      console.log('File uploaded successfully:', {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: `/uploads/${relativePath}`
      });
      
      res.json({
        success: true,
        file: {
          path: `/uploads/${relativePath}`,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({ error: 'Error processing uploaded file' });
    }
  });
});

// Upload multiple images
router.post('/multiple', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Return the relative paths from the uploads directory
    const files = req.files.map(file => ({
      path: `/uploads/${path.relative(uploadsDir, file.path)}`,
      filename: file.filename
    }));

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading files' });
  }
});

// Apply error handling middleware
router.use(handleMulterError);

module.exports = router; 