const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route  POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, fatherName, cnic, age, phone, password, consentAccepted } = req.body;

    if (!name || !fatherName || !cnic || !age || !phone || !password) {
      return res.status(400).json({ message: 'Sab fields bharna zaroori hai' });
    }

    // Consent zaroori hai, taake user jaanta ho ke uski bike track hogi
    if (!consentAccepted) {
      return res.status(400).json({
        message: 'Tracking consent qabool karna zaroori hai registration ke liye',
      });
    }

    const existingUser = await User.findOne({ $or: [{ cnic }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Ye CNIC ya phone pehle se registered hai' });
    }

    const user = await User.create({
      name,
      fatherName,
      cnic,
      age,
      phone,
      password,
      consentAccepted: true,
    });

    res.status(201).json({
      message: 'Registration kamyab',
      user: { id: user._id, name: user.name, role: user.role },
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages[0] });
    }
    // Do requests ek sath aayein to unique index yahan pakarta hai (findOne check ke bawajood)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ye CNIC ya phone pehle se registered hai' });
    }
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone aur password zaroori hain' });
    }

    const user = await User.findOne({ phone }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Phone ya password ghalat hai' });
    }

    res.json({
      message: 'Login kamyab',
      user: { id: user._id, name: user.name, role: user.role },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
  }
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json(req.user);
};