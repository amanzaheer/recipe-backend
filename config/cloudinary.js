const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get the absolute path to the uploads directory
const uploadsDir = path.join(__dirname, '../../uploads');

// Configure local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename while preserving the original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

// Create multer upload instance with file filter
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype.toLowerCase();
    
    if (!allowedTypes.test(ext) || !allowedTypes.test(mimetype)) {
      return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

module.exports = { upload, uploadsDir }; 