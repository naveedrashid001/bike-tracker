require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const adminRoutes = require('./routes/adminRoutes');


const authRoutes = require('./routes/authRoutes');
const bikeRoutes = require('./routes/bikeRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const locationRoutes = require('./routes/locationRoutes');
const theftRoutes = require('./routes/theftRoutes');

// Zaroori secrets set nahi hain to server ko turant rokna behtar hai
// (chupke se undefined JWT_SECRET ke sath chalne se security hole ban sakta hai)
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'INGEST_SECRET'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`Missing zaroori .env variables: ${missingVars.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 20) {
  console.error('JWT_SECRET bohat chota hai, kam se kam 20+ random characters ka rakho');
  process.exit(1);
}

const app = express();

// Agar VPS par Nginx/reverse-proxy ke peeche deploy ho, to ye line rakhna zaroori hai
// warna rate-limit aur IP-based checks proxy ka IP dekhenge, user ka nahi
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Security headers (XSS, clickjacking wagera se bachata hai)
app.use(helmet());

// Sirf apni frontend URL ko allow karo, har website ko nahi
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  })
);

app.use(express.json({ limit: '10kb' })); // bara payload bhej kar server load na kar sake

// MongoDB query injection se bachao ($ , . jaisi cheezein body se nikal deta hai)
app.use(mongoSanitize());

// Har IP se limited requests — automated attack/brute force rokne ke liye
// NOTE: /api/locations/ingest is skipped here (see below) — ye route tracker
// hardware/Traccar service se baar baar (har chand second mein) hit hota hai,
// aur isay already INGEST_SECRET se protect kiya hua hai, isliye ye login-jaisa
// user-facing route nahi hai ke isay 200/15min wali general limit mein daala jaye.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 200, // 15 minute mein max 200 requests per IP
  message: { message: 'Bohat zyada requests, thori dair baad try karein' },
  skip: (req) => req.path === '/api/locations/ingest',
});
app.use(generalLimiter);

// Login/register par aur bhi sakht limit — password guessing rokne ke liye
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 15 minute mein max 10 login/register attempts per IP
  message: { message: 'Bohat zyada login attempts, 15 minute baad try karein' },
});
app.use('/api/auth', authLimiter);

app.use('/api/admin', adminRoutes);    // admin
// Ingest route ka apna alag, khula limiter — kai trackers ek hi IP (tracking
// server) se location bhejtay hain, isliye limit generalLimiter se bohat zyada
// rakhi hai. Real protection INGEST_SECRET (timingSafeEqual) se ho rahi hai,
// ye limiter sirf abuse/typo-loop jaisi cheezon se bachao ke liye hai.
const ingestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // per IP, per minute — tune this to (number of trackers * expected ping rate)
  message: { message: 'Ingest rate limit exceed ho gayi' },
});
app.use('/api/locations/ingest', ingestLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/theft', theftRoutes);

app.get('/', (req, res) => {
  res.send('Bike tracker backend chal raha hai');
});

// Koi bhi route na milay to 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route nahi mila' });
});

// Sab errors yahan catch honge — user ko internal error details kabhi na dikhayein
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Kuch ghalat ho gaya, dobara try karein' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connect ho gaya');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server chal raha hai port ${PORT} par`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));