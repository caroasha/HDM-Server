const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');

// Load environment variables
dotenv.config();

const app = express();

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check your MONGODB_URI in .env file');
    process.exit(1);
  });

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// ==================== VIEW ENGINE ====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==================== SESSION CONFIGURATION ====================
app.use(session({
  secret: process.env.SESSION_SECRET || 'wirmax-solutions-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600,
    ttl: 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  },
  name: 'wirmax.sid'
}));

// ==================== GLOBAL VARIABLES ====================
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ==================== ROUTES ====================
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).render('404', { 
    user: req.session.user || null 
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).send('Validation Error: ' + err.message);
  }
  
  if (err.name === 'CastError') {
    return res.status(400).send('Invalid ID format');
  }
  
  if (err.code === 11000) {
    return res.status(409).send('Duplicate entry error');
  }
  
  res.status(500).render('500', { 
    user: req.session.user || null,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
  🚀 WirMax Solutions Server Started!
  =================================
  📍 Local:    http://localhost:${PORT}
  🔐 Admin:    http://localhost:${PORT}/admin/login
  🌐 Website:  http://localhost:${PORT}
  📊 Database: ${mongoose.connection.name}
  🎨 Favicon:  /favicon.jpg
  =================================
  `);
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await mongoose.disconnect();
  console.log('✅ MongoDB disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await mongoose.disconnect();
  console.log('✅ MongoDB disconnected');
  process.exit(0);
});