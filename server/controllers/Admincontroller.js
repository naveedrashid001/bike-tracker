const User = require('../models/User');
const Bike = require('../models/Bike');
const Tracker = require('../models/Tracker');
const TheftReport = require('../models/TheftReport');
const LocationLog = require('../models/LocationLog');
const { isValidObjectId } = require('../utils/validateObjectId');

// @route  GET /api/admin/stats
// @desc   Overview numbers admin dashboard ke top cards ke liye
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBikes = await Bike.countDocuments();
    const bikesWithTracker = await Tracker.countDocuments();
    const bikesWithoutTracker = totalBikes - bikesWithTracker;
    const activeTheftReports = await TheftReport.countDocuments({ status: 'active' });

    res.json({
      totalUsers,
      totalBikes,
      bikesWithTracker,
      bikesWithoutTracker,
      activeTheftReports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/admin/users
// @desc   Sab registered users ki list (password kabhi nahi bhejtay — select:false hai)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  DELETE /api/admin/users/:id
// @desc   User aur uski sab bikes (+ unke tracker/location/theft data) delete karo
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'User ID sahi format mein nahi hai' });
    }
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Aap khud ko delete nahi kar sakte' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User nahi mila' });
    }

    const bikes = await Bike.find({ owner: id });
    const bikeIds = bikes.map((b) => b._id);
    const trackers = await Tracker.find({ bike: { $in: bikeIds } });
    const trackerIds = trackers.map((t) => t._id);

    await LocationLog.deleteMany({ tracker: { $in: trackerIds } });
    await Tracker.deleteMany({ bike: { $in: bikeIds } });
    await TheftReport.deleteMany({ bike: { $in: bikeIds } });
    await Bike.deleteMany({ owner: id });
    await user.deleteOne();

    res.json({ message: 'User aur uski sab bikes delete ho gayi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/admin/bikes
// @desc   Sab bikes, owner ki info aur tracker status ke sath
exports.getAllBikesWithStatus = async (req, res) => {
  try {
    const bikes = await Bike.find().populate('owner', 'name phone cnic').sort({ createdAt: -1 });
    const trackers = await Tracker.find();

    const trackerByBike = {};
    trackers.forEach((t) => {
      trackerByBike[t.bike.toString()] = t;
    });

    const result = bikes.map((bike) => {
      const tracker = trackerByBike[bike._id.toString()];
      return {
        _id: bike._id,
        numberPlate: bike.numberPlate,
        color: bike.color,
        make: bike.make,
        model: bike.model,
        owner: bike.owner,
        createdAt: bike.createdAt,
        tracker: tracker ? { status: tracker.status, imei: tracker.imei } : null,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  DELETE /api/admin/bikes/:id
// @desc   Bike (+ uska tracker/location/theft data) delete karo
exports.deleteBike = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Bike ID sahi format mein nahi hai' });
    }

    const bike = await Bike.findById(id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike nahi mili' });
    }

    const tracker = await Tracker.findOne({ bike: id });
    if (tracker) {
      await LocationLog.deleteMany({ tracker: tracker._id });
      await tracker.deleteOne();
    }
    await TheftReport.deleteMany({ bike: id });
    await bike.deleteOne();

    res.json({ message: 'Bike delete ho gayi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};