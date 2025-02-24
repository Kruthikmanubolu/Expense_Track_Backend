const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Income = require('../models/Income');

router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { description, amount, category } = req.body;
  try {
    const income = new Income({ userId: req.user.id, description, amount, category });
    await income.save();
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;