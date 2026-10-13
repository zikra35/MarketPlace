// Allowed frontend origins. In production set FRONTEND_URL on Railway to your Vercel
// address (comma-separate several, e.g. "https://myshop.vercel.app,https://myshop.com").
const localOrigins = ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'];
const configured = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowed = [...localOrigins, ...configured];

const corsOptions = {
  origin: (origin, callback) => {
    // no Origin header = same-origin, server-to-server or the Vercel /api proxy
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
