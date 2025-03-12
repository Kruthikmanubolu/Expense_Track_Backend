const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { description, amount, category } = req.body;
  try {
    const expense = new Expense({ userId: req.user.id, description, amount, category });
    await expense.save();
    return res.status(201).json({ message: "Expense added successfully!" });
    res.json(expense);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { description, amount, category } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
    try {
      console.log('Delete request received for ID:', req.params.id);
      console.log('User ID from token:', req.user.id);
  
      const expense = await Expense.findById(req.params.id);
      if (!expense) {
        console.log('Expense not found for ID:', req.params.id);
        return res.status(404).json({ message: 'Expense not found' });
      }
  
      console.log('Expense found:', expense);
      if (expense.userId.toString() !== req.user.id) {
        console.log('User ID mismatch:', expense.userId, req.user.id);
        return res.status(404).json({ message: 'Expense not found' });
      }
  
      await Expense.deleteOne({ _id: req.params.id });
      console.log('Expense deleted successfully');
      res.json({ message: 'Expense deleted' });
    } catch (error) {
      console.error('Error in delete route:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;