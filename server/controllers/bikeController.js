const Bike = require('../models/Bike');

// Frontend (utils/validators.js) ke NUMBER_PLATE_REGEX se hu-bahu match karta
// hai — taake server bhi wahi format enforce kare jo UI dikhata hai, chahe
// koi seedha API hit kare (Postman, curl, wagera)
const NUMBER_PLATE_REGEX = /^[A-Z]{2,3}[- ]?\d{1,4}$/;

// @route  POST /api/bikes
// @desc   Naya bike register karo (login user ke naam se)
exports.addBike = async (req, res) => {
  try {
    const { numberPlate, color, make, model, chassisNumber, engineNumber } = req.body;

    if (!numberPlate || !color) {
      return res.status(400).json({ message: 'Number plate aur color zaroori hain' });
    }

    const normalizedPlate = numberPlate.trim().toUpperCase();

    if (!NUMBER_PLATE_REGEX.test(normalizedPlate)) {
      return res.status(400).json({ message: 'Number plate sahi format mein nahi hai. Sahi format: ABC-123' });
    }

    const existingBike = await Bike.findOne({ numberPlate: normalizedPlate });
    if (existingBike) {
      return res.status(400).json({ message: 'Ye number plate pehle se registered hai' });
    }

    const bike = await Bike.create({
      owner: req.user._id,
      numberPlate: normalizedPlate,
      color,
      make,
      model,
      chassisNumber: chassisNumber ? chassisNumber.trim() : undefined, // undefined = field hi nahi banega (sparse index)
      engineNumber: engineNumber ? engineNumber.trim() : undefined,
    });

    res.status(201).json({ message: 'Bike register ho gayi', bike });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages[0] });
    }
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const fieldMessages = {
        numberPlate: 'Ye number plate pehle se registered hai',
        chassisNumber: 'Ye chassis number pehle se kisi aur bike par registered hai',
        engineNumber: 'Ye engine number pehle se kisi aur bike par registered hai',
      };
      return res.status(400).json({
        message: fieldMessages[duplicateField] || 'Ye tafseel pehle se registered hai',
      });
    }
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/bikes
// @desc   Login user ki apni sab bikes dekhna (admin ho to sab dikhengi)
exports.getMyBikes = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const bikes = await Bike.find(filter).sort({ createdAt: -1 });
    res.json(bikes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/bikes/:id
// @desc   Ek bike ki detail (ownershipMiddleware pehle check kar chuka hai)
exports.getBikeById = async (req, res) => {
  res.json(req.bike);
};