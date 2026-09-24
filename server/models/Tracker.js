const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema(
  {
    imei: {
      type: String,
      required: [true, 'Tracker ka IMEI zaroori hai'],
      unique: true,
      trim: true,
    },
    bike: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: true,
      unique: true, // ek bike par sirf ek tracker
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    batteryLevel: {
      type: Number, // percentage, agar tracker bhejta ho
      default: null,
    },
    // Traccar side par is device ka connection kaam karne ke liye
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tracker', trackerSchema);
