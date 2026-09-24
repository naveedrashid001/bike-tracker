const express = require('express');
const router = express.Router();
const { linkTracker, getTrackerStatus } = require('../controllers/trackerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { checkBikeOwnership } = require('../middleware/ownershipMiddleware');

router.use(protect);

// Sirf admin tracker link kare
router.post('/link', adminOnly, linkTracker);

// Owner ya admin status dekh sakta hai
router.get('/:bikeId/status', checkBikeOwnership, getTrackerStatus);

module.exports = router;
