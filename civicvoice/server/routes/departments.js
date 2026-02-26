const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/departments — list all department users
router.get('/', protect, async (req, res) => {
  try {
    const depts = await User.find({ role: 'department' }).select('name department averageRating totalRatings');
    res.json({ departments: depts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
