const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp'); 

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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
  
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email must be a valid @gmail.com address' });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      
      const otp = generateOtp();
      await Otp.create({ email: user.email, otp }); 
  
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'SpendSmart OTP Verification for Login',
        text: `Your OTP for SpendSmart login is: ${otp}. It expires in 5 minutes.`,
      };
  
      try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
      }
  
      
      const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, username: user.username, redirect: '/otp-verification' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body; 
  
    try {
      const otpRecord = await Otp.findOne({ email, otp });
      if (!otpRecord || new Date() > otpRecord.createdAt.getTime() + 300000) { 
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      await Otp.deleteOne({ _id: otpRecord._id });
      res.json({ message: 'OTP verified successfully' });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;