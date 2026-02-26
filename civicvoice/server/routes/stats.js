const express = require('express');
const router  = express.Router();
const { getCityStats, getDeptStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.get('/city',              protect, getCityStats);
router.get('/department/:dept',  protect, getDeptStats);

module.exports = router;
