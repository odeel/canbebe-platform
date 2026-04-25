require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

connectDB();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/baby', require('./routes/babyRoutes'));
app.use('/api/vaccination', require('./routes/vaccinationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/faq', require('./routes/faqRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/community', require('./routes/postRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/faq', require('./routes/faqRoutes'));  // ← add this
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ success: true, message: 'CanBebe API running', timestamp: new Date() }));

// ── Static frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'frontend', 'index.html')));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api'))
    return res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  res.status(404).sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CanBebe running on port ${PORT}`));