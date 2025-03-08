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

router.put('/:id', auth, async (req, res) => {
  const { description, amount, category } = req.body;
  try {
    const income = await Income.findById(req.params.id);
    if (!income || income.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Income not found' });
    }
    income.description = description || income.description;
    income.amount = amount || income.amount;
    income.category = category || income.category;
    await income.save();
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
    try {
      console.log('Delete request received for ID:', req.params.id);
      console.log('User ID from token:', req.user.id);
  
      const income = await Income.findById(req.params.id);
      if (!income) {
        console.log('Income not found for ID:', req.params.id);
        return res.status(404).json({ message: 'Income not found' });
      }
  
      console.log('Income found:', income);
      if (income.userId.toString() !== req.user.id) {
        console.log('User ID mismatch:', income.userId, req.user.id);
        return res.status(404).json({ message: 'Income not found' });
      }
  
      await Income.deleteOne({ _id: req.params.id });
      console.log('Income deleted successfully');
      res.json({ message: 'Income deleted' });
    } catch (error) {
      console.error('Error in delete route:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });


module.exports = router;