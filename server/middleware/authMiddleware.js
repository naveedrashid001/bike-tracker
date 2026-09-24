const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check karta hai ke request ke sath valid token hai ya nahi
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ki info request ke sath attach kar do (password ke bagair)
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'User nahi mila' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalid ya expire ho gaya hai' });
    }
  } else {
    return res.status(401).json({ message: 'Login zaroori hai, token nahi mila' });
  }
};

// Sirf admin ko access dene ke liye (protect ke baad use karo)
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Ye access sirf admin ke liye hai' });
  }
};
