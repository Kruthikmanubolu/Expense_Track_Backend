const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for local development (restrict to frontend origin)
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://expense-mern-stack-frontend.vercel.app',
      'https://expense-mern-stack-frontend.vercel.app/'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you are using cookies for authentication
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    // Create TTL index for Otp model (expires after 5 minutes)
    mongoose.connection.db.collection('otps').createIndex({ createdAt: 1 }, { expireAfterSeconds: 300 });
  })
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/incomes', require('./routes/incomes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});