const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Define multiple allowed origins
const allowedOrigins = [
  'https://expense-mern-stack-frontend.vercel.app',  // First allowed origin
  'http://localhost:3000',         // Second allowed origin (example)
];

app.use(cors({
  origin: (origin, callback) => {
    // Check if the origin is in the allowedOrigins array
    if (allowedOrigins.includes(origin) || !origin) { // !origin is to allow non-browser requests (e.g., Postman)
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you are using cookies for authentication
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    mongoose.connection.db.collection('otps').createIndex({ createdAt: 1 }, { expireAfterSeconds: 300 });
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/incomes', require('./routes/incomes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
