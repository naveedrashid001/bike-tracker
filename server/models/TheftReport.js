const mongoose = require('mongoose');

const theftReportSchema = new mongoose.Schema(
  {
    bike: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
    // Report banate waqt ka snapshot, taake baad mein bike move ho to bhi
    // yahi original location report mein rahe
    lastKnownLocation: {
      lat: { type: Number },
      lng: { type: Number },
      timestamp: { type: Date },
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TheftReport', theftReportSchema);
