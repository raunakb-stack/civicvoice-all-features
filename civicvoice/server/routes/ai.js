const express = require('express');
const router  = express.Router();
const { categorize } = require('../controllers/aiController');
const { protect }    = require('../middleware/auth');

// POST /api/ai/categorize
router.post('/categorize', protect, categorize);

module.exports = router;
