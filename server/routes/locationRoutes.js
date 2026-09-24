const express = require('express');
const router = express.Router();
const {
  ingestLocation,
  getLiveLocation,
  getLocationHistory,
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');
const { checkBikeOwnership } = require('../middleware/ownershipMiddleware');

// Ye route Traccar/tracking service ke liye hai, JWT nahi, ingest secret key se protect hai
router.post('/ingest', ingestLocation);

// Ye routes user ke liye hain, login zaroori hai
router.get('/:bikeId/live', protect, checkBikeOwnership, getLiveLocation);
router.get('/:bikeId/history', protect, checkBikeOwnership, getLocationHistory);

module.exports = router;
