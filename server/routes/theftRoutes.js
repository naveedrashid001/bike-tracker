const express = require('express');
const router = express.Router();
const {
  reportTheft,
  downloadReportPdf,
  resolveTheft,
  getActiveReport,
} = require('../controllers/theftController');
const { protect } = require('../middleware/authMiddleware');
const { checkBikeOwnership } = require('../middleware/ownershipMiddleware');

router.use(protect);

router.post('/:bikeId/report', checkBikeOwnership, reportTheft);
router.get('/:bikeId/active', checkBikeOwnership, getActiveReport);
router.get('/:reportId/pdf', downloadReportPdf);
router.patch('/:reportId/resolve', resolveTheft);

module.exports = router;