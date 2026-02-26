const express = require('express');
const router  = express.Router();
const { weeklyReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/reports/weekly/:dept
router.get('/weekly/:dept', protect, authorize('department', 'admin'), weeklyReport);

module.exports = router;
