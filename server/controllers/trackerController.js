const Tracker = require('../models/Tracker');
const Bike = require('../models/Bike');
const { isValidObjectId } = require('../utils/validateObjectId');

// @route  POST /api/trackers/link
// @desc   Admin/technician tracker ko bike se link kare (sirf admin)
exports.linkTracker = async (req, res) => {
  try {
    const { imei, bikeId } = req.body;

    if (!imei || !bikeId) {
      return res.status(400).json({ message: 'IMEI aur bike ID zaroori hain' });
    }

    if (!isValidObjectId(bikeId)) {
      return res.status(400).json({ message: 'Bike ID sahi format mein nahi hai' });
    }

    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: 'Bike nahi mili' });
    }

    const existingTracker = await Tracker.findOne({ $or: [{ imei }, { bike: bikeId }] });
    if (existingTracker) {
      return res.status(400).json({ message: 'Ye IMEI ya bike pehle se kisi tracker se linked hai' });
    }

    const tracker = await Tracker.create({ imei, bike: bikeId });
    res.status(201).json({ message: 'Tracker link ho gaya', tracker });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ye IMEI pehle se registered hai' });
    }
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/trackers/:bikeId/status
// @desc   Bike ke tracker ka status dekhna (owner ya admin)
exports.getTrackerStatus = async (req, res) => {
  try {
    const tracker = await Tracker.findOne({ bike: req.bike._id });
    if (!tracker) {
      return res.status(404).json({ message: 'Is bike par abhi tracker install nahi hai' });
    }
    res.json(tracker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};
