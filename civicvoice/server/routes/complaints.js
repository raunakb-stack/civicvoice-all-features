const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { complaintRules, statusRules, ratingRules, validate } = require('../middleware/validate');

router.get('/map',          protect, ctrl.getMapComplaints);
router.get('/',             protect, ctrl.getComplaints);
router.get('/:id',          protect, ctrl.getComplaint);
router.post('/',            protect, authorize('citizen', 'admin'), complaintRules, validate, ctrl.createComplaint);
router.put('/:id/status',   protect, authorize('department', 'admin'), statusRules, validate, ctrl.updateStatus);
router.post('/:id/vote',    protect, ctrl.voteComplaint);
router.post('/:id/rate',    protect, authorize('citizen'), ratingRules, validate, ctrl.rateComplaint);
router.delete('/:id',       protect, authorize('admin'), ctrl.deleteComplaint);

module.exports = router;
