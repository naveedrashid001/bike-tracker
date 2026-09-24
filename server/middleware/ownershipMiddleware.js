const Bike = require('../models/Bike');
const { isValidObjectId } = require('../utils/validateObjectId');

// Ye middleware /api/bikes/:bikeId... jaisi routes par lagega
// Check karta hai ke bike wahi hai jo login user ki apni hai (admin sab dekh sakta hai)
exports.checkBikeOwnership = async (req, res, next) => {
  try {
    const bikeId = req.params.bikeId || req.params.id;

    if (!isValidObjectId(bikeId)) {
      return res.status(400).json({ message: 'Bike ID sahi format mein nahi hai' });
    }

    const bike = await Bike.findById(bikeId);

    if (!bike) {
      return res.status(404).json({ message: 'Bike nahi mili' });
    }

    const isOwner = bike.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Ye aapki bike nahi hai, access nahi mil sakta' });
    }

    req.bike = bike; // aage controller mein dobara query na karni pare
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
