const express    = require('express');
const router     = express.Router();
const upload     = require('../middleware/upload');
const { uploadImages, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// POST /api/upload/images  — upload up to 4 images
router.post('/images', protect, upload.array('images', 4), uploadImages);

// DELETE /api/upload/images/:publicId
router.delete('/images/:publicId', protect, deleteImage);

// Multer error handler (file type / size violations)
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ message: 'File too large — max 10 MB per image' });
  if (err.code === 'LIMIT_FILE_COUNT')
    return res.status(400).json({ message: 'Too many files — max 4 images' });
  res.status(400).json({ message: err.message || 'Upload error' });
});

module.exports = router;
