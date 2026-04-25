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
app.use('/api/family', require('./routes/familyRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Image proxy — serves canbebealgerie.com images through our backend ────────
app.get('/api/image-proxy', async (req, res) => {
  let url = req.query.url;
  if (!url) return res.status(400).send('Missing url param');

  try {
    const allowed = ['canbebealgerie.com', 'www.canbebealgerie.com'];
    const parsed = new URL(url);
    if (!allowed.includes(parsed.hostname)) return res.status(403).send('Forbidden');

    // Unwrap Next.js _next/image optimizer URLs to get the real file URL
    if (parsed.pathname === '/_next/image') {
      const inner = parsed.searchParams.get('url');
      if (inner) {
        url = inner.startsWith('http') ? inner : `https://www.canbebealgerie.com${inner}`;
      }
    }

    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.canbebealgerie.com/',
        'Origin': 'https://www.canbebealgerie.com',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!upstream.ok) return res.status(upstream.status).send('Upstream error ' + upstream.status);

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    upstream.body.pipe(res);
  } catch (err) {
    res.status(500).send('Proxy error: ' + err.message);
  }
});

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