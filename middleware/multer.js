const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Define the absolute path to the 'uploads' directory
const uploadPath = path.join(__dirname, 'uploads');

// Ensure the 'uploads' directory exists, create if not
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

console.log('Upload path:', uploadPath);  // Log the absolute path


// Set storage engine for multer
const storage = multer.memoryStorage();

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Initialize multer with storage and file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // 10MB file size limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image')) {
        cb(null, true);  // Accept image files
      } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);  // Reject non-image files
      }
    },
  });

module.exports = upload;
