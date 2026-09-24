const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Naam zaroori hai'],
      trim: true,
      maxlength: [100, 'Naam bohat lamba hai'],
    },
    fatherName: {
      type: String,
      required: [true, 'Father name zaroori hai'],
      trim: true,
      maxlength: [100, 'Father name bohat lamba hai'],
    },
    cnic: {
      type: String,
      required: [true, 'CNIC zaroori hai'],
      unique: true,
      trim: true,
      match: [/^\d{5}-\d{7}-\d{1}$/, 'CNIC format sahi nahi hai. Sahi format: 42101-1234567-1'],
    },
    age: {
      type: Number,
      required: [true, 'Age zaroori hai'],
      min: [18, 'Age kam se kam 18 honi chahiye'],
      max: [100, 'Age sahi nahi hai'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number zaroori hai'],
      unique: true,
      trim: true,
      // +923001234567 ya 03001234567 dono chalenge
      match: [/^\+?\d{10,15}$/, 'Phone number sahi format mein nahi hai'],
    },
    password: {
      type: String,
      required: [true, 'Password zaroori hai'],
      minlength: [8, 'Password kam se kam 8 characters ka ho'],
      maxlength: [100, 'Password bohat lamba hai'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    consentAccepted: {
      type: Boolean,
      required: [true, 'Tracking consent qabool karna zaroori hai'],
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
