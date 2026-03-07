// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Optional: Enable CORS if needed for production
// const cors = require('cors');
// app.use(cors({
//   origin: ['https://your-vercel-app.vercel.app'], // Replace with your actual Vercel URL
//   credentials: true
// }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Serve frontend pages (for client-side routing)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/tasks', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tasks.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// For local development: start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app for Vercel serverless deployment
module.exports = app;