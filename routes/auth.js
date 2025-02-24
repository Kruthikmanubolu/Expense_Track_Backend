const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'Email already exists' });
  
      user = await User.findOne({ username });
      if (user) return res.status(400).json({ message: 'Username already exists' });
  
      user = new User({ username, email, password });
      await user.save();
  
      const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, username: user.username });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, username: user.username });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;