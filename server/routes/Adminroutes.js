const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllBikesWithStatus,
  deleteBike,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Is file ke sab routes sirf admin ke liye hain
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/bikes', getAllBikesWithStatus);
router.delete('/bikes/:id', deleteBike);

module.exports = router;