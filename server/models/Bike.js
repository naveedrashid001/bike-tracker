const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    numberPlate: {
      type: String,
      required: [true, 'Number plate zaroori hai'],
      unique: true,
      trim: true,
      uppercase: true,
      // 2-3 letters, optional dash/space, 1-4 numbers. Misaal: ABC-123
      match: [/^[A-Z]{2,3}[- ]?\d{1,4}$/, 'Number plate format sahi nahi hai. Misaal: ABC-123'],
    },
    color: {
      type: String,
      required: [true, 'Bike ka color zaroori hai'],
      trim: true,
      maxlength: [30, 'Color bohat lamba hai'],
    },
    make: {
      type: String,
      trim: true, // e.g. Honda, Yamaha, Suzuki
      maxlength: [50, 'Make bohat lamba hai'],
    },
    model: {
      type: String,
      trim: true, // e.g. CD70, CG125
      maxlength: [50, 'Model bohat lamba hai'],
    },
    // Optional hai — user chahe to daale, majboor nahi. Agar daale to unique
    // hona chahiye (do bikes ka chassis number same nahi ho sakta). sparse:true
    // taake jin bikes mein ye field hi na ho unke darmiyan clash na ho.
    chassisNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    engineNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    // Registration book ki photo ka path, optional
    ownershipProofUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bike', bikeSchema);