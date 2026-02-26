const streamifier = require('streamifier');
const cloudinary  = require('../utils/cloudinary');

/**
 * Wrap Cloudinary's upload_stream in a Promise so we can await it.
 */
const streamToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

// POST /api/upload/images
// Body: multipart/form-data  field name: "images"  (up to 4 files)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' });

    const uploads = await Promise.all(
      req.files.map((file) =>
        streamToCloudinary(file.buffer, {
          folder:         'civicvoice/complaints',
          resource_type:  'image',
          transformation: [
            { width: 1200, height: 900, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        })
      )
    );

    const images = uploads.map((r) => ({
      url:       r.secure_url,
      publicId:  r.public_id,
      width:     r.width,
      height:    r.height,
      format:    r.format,
      bytes:     r.bytes,
    }));

    res.json({ images });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
};

// DELETE /api/upload/images/:publicId
exports.deleteImage = async (req, res) => {
  try {
    // publicId comes URL-encoded, e.g. civicvoice%2Fcomplaints%2Fabc123
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
