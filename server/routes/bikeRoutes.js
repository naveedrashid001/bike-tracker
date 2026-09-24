const express = require('express');
const router = express.Router();
const { addBike, getMyBikes, getBikeById } = require('../controllers/bikeController');
const { protect } = require('../middleware/authMiddleware');
const { checkBikeOwnership } = require('../middleware/ownershipMiddleware');

router.use(protect); // is file ke sab routes login mangte hain

router.post('/', addBike);
router.get('/', getMyBikes);
router.get('/:id', checkBikeOwnership, getBikeById);

module.exports = router;
