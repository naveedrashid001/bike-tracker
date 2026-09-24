const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema(
  {
    tracker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    speed: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Tracker ki history fast query karne ke liye index
locationLogSchema.index({ tracker: 1, timestamp: -1 });

module.exports = mongoose.model('LocationLog', locationLogSchema);
