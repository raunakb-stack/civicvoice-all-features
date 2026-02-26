require('dotenv').config();
const express     = require('express');
const http        = require('http');
const cors        = require('cors');
const mongoose    = require('mongoose');
const rateLimit   = require('express-rate-limit');
const { Server }  = require('socket.io');

const authRoutes       = require('./routes/auth');
const complaintRoutes  = require('./routes/complaints');
const departmentRoutes = require('./routes/departments');
const statsRoutes      = require('./routes/stats');
const uploadRoutes     = require('./routes/upload');
const notifyRoutes     = require('./routes/notifications');
const aiRoutes         = require('./routes/ai');
const reportRoutes     = require('./routes/reports');

const app    = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
});
app.use((req, _res, next) => { req.io = io; next(); });
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  socket.on('join:user',       (userId) => socket.join(`user:${userId}`));
  socket.on('join:department', (dept)   => socket.join(`dept:${dept}`));
  socket.on('disconnect', () => console.log(`🔌 Disconnected: ${socket.id}`));
});

// Rate limiters
const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter   = rateLimit({ windowMs: 15*60*1000, max: 20,  message: { message: 'Too many auth attempts, wait 15 min.' } });

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Routes
app.use('/api/auth',          authLimiter,  authRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/departments',   departmentRoutes);
app.use('/api/stats',         statsRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/notifications', notifyRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/reports',       reportRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date(), uptime: process.uptime() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server + Socket.io → http://localhost:${PORT}`));
  })
  .catch((err) => { console.error('❌ MongoDB error:', err); process.exit(1); });

module.exports = { app, io };
