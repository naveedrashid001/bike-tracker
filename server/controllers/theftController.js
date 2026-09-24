const fs = require('fs');
const TheftReport = require('../models/TheftReport');
const Tracker = require('../models/Tracker');
const LocationLog = require('../models/LocationLog');
const generateTheftPdf = require('../utils/generateTheftPdf');
const { isValidObjectId } = require('../utils/validateObjectId');

// @route  POST /api/theft/:bikeId/report
// @desc   Bike chori ki report karo — panic button ka backend
exports.reportTheft = async (req, res) => {
  try {
    const bike = req.bike; // ownershipMiddleware se aaya

    const alreadyActive = await TheftReport.findOne({ bike: bike._id, status: 'active' });
    if (alreadyActive) {
      return res.status(400).json({ message: 'Is bike ki theft report pehle se active hai' });
    }

    // Bike ki last known location nikalo
    const tracker = await Tracker.findOne({ bike: bike._id });
    let lastKnownLocation = null;

    if (tracker) {
      const latest = await LocationLog.findOne({ tracker: tracker._id }).sort({ timestamp: -1 });
      if (latest) {
        lastKnownLocation = { lat: latest.lat, lng: latest.lng, timestamp: latest.timestamp };
      }
    }

    const theftReport = await TheftReport.create({
      bike: bike._id,
      reportedBy: req.user._id,
      lastKnownLocation,
    });

    res.status(201).json({
      message: 'Theft report ban gayi hai, ab PDF generate kar sakte hain',
      theftReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/theft/:bikeId/active
// @desc   Kya is bike ki koi active theft report hai (BikeDetail page ke liye)
exports.getActiveReport = async (req, res) => {
  try {
    const report = await TheftReport.findOne({ bike: req.bike._id, status: 'active' });
    if (!report) return res.status(404).json({ message: 'Koi active report nahi hai' });
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/theft/:reportId/pdf
// @desc   Police-ready PDF download karna
exports.downloadReportPdf = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.reportId)) {
      return res.status(400).json({ message: 'Report ID sahi format mein nahi hai' });
    }

    const theftReport = await TheftReport.findById(req.params.reportId).populate({
      path: 'bike',
      populate: { path: 'owner' }, // bike ke sath uska asal registered owner bhi le aao
    });

    if (!theftReport) {
      return res.status(404).json({ message: 'Report nahi mili' });
    }

    const isOwner = theftReport.reportedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ye report aapki nahi hai' });
    }

    // PDF mein hamesha bike ke asal registered owner ka data jana chahiye —
    // download karne wale (req.user, jo owner khud ya admin ho sakta hai) ka nahi
    const filePath = await generateTheftPdf({
      owner: theftReport.bike.owner,
      bike: theftReport.bike,
      theftReport,
    });

    // File user ko bhej do, phir chahe kamyabi se gaya ho ya beech mein error
    // aaya ho, disk se PDF hata do — warna har download ke sath ek file
    // permanently server par reh jayegi aur storage bhar jayega
    res.download(filePath, (downloadError) => {
      fs.unlink(filePath, (unlinkError) => {
        if (unlinkError) {
          console.error('Temp PDF delete nahi ho saki:', unlinkError);
        }
      });
      if (downloadError) {
        console.error('PDF download mein error:', downloadError);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  PATCH /api/theft/:reportId/resolve
// @desc   Bike mil jaye to report resolve karo
exports.resolveTheft = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.reportId)) {
      return res.status(400).json({ message: 'Report ID sahi format mein nahi hai' });
    }

    const theftReport = await TheftReport.findById(req.params.reportId);
    if (!theftReport) {
      return res.status(404).json({ message: 'Report nahi mili' });
    }

    const isOwner = theftReport.reportedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ye report aapki nahi hai' });
    }

    theftReport.status = 'resolved';
    theftReport.resolvedAt = new Date();
    await theftReport.save();

    res.json({ message: 'Report resolve ho gayi', theftReport });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};