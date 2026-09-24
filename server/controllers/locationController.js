const crypto = require('crypto');
const Tracker = require('../models/Tracker');
const LocationLog = require('../models/LocationLog');

// Normal '!==' string compare mein chhoti si time difference se andaza lagaya ja
// sakta hai ke kitne characters match hue (timing attack). Isay rokne ke liye
// hamesha same time lagne wala comparison use karte hain.
function isValidIngestKey(providedKey) {
  const actualKey = process.env.INGEST_SECRET;
  if (!providedKey || !actualKey) return false;

  const a = Buffer.from(providedKey);
  const b = Buffer.from(actualKey);
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

// @route  POST /api/locations/ingest
// @desc   Traccar (ya jo bhi service tracker ka data poll kare) yahan location bheje.
//         Ye route user ke liye nahi hai, isliye JWT ki jagah ek internal secret key se protect hai.
exports.ingestLocation = async (req, res) => {
  try {
    const ingestKey = req.headers['x-ingest-key'];
    if (!isValidIngestKey(ingestKey)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { imei, lat, lng, speed, timestamp } = req.body;

    if (!imei || typeof imei !== 'string') {
      return res.status(400).json({ message: 'imei zaroori hai' });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({ message: 'lat/lng sahi range mein nahi hain' });
    }

    const tracker = await Tracker.findOne({ imei });
    if (!tracker) {
      return res.status(404).json({ message: 'Ye IMEI kisi bike se linked nahi hai' });
    }

    await LocationLog.create({
      tracker: tracker._id,
      lat: latNum,
      lng: lngNum,
      speed: Number(speed) || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    tracker.status = 'online';
    tracker.lastSeen = new Date();
    await tracker.save();

    res.status(201).json({ message: 'Location save ho gayi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/locations/:bikeId/live
// @desc   Bike ki sabse latest location (owner ya admin)
exports.getLiveLocation = async (req, res) => {
  try {
    const tracker = await Tracker.findOne({ bike: req.bike._id });
    if (!tracker) {
      return res.status(404).json({ message: 'Is bike par tracker nahi hai' });
    }

    const latest = await LocationLog.findOne({ tracker: tracker._id }).sort({ timestamp: -1 });
    if (!latest) {
      return res.status(404).json({ message: 'Abhi tak koi location nahi mili' });
    }

    res.json({
      lat: latest.lat,
      lng: latest.lng,
      speed: latest.speed,
      timestamp: latest.timestamp,
      trackerStatus: tracker.status,
      lastSeen: tracker.lastSeen,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/locations/:bikeId/history
// @desc   Pichli locations ki list (owner ya admin), default last 100
exports.getLocationHistory = async (req, res) => {
  try {
    const tracker = await Tracker.findOne({ bike: req.bike._id });
    if (!tracker) {
      return res.status(404).json({ message: 'Is bike par tracker nahi hai' });
    }

    const limit = parseInt(req.query.limit) || 100;
    const logs = await LocationLog.find({ tracker: tracker._id })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};
