// adminRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const luggage = require('../models/Storage');

// Enhanced admin middleware
const checkAdmin = (req, res, next) => {
  if (req.session.isAdmin && req.session.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
};

// Admin dashboard route
router.get('/dashboard', checkAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    const luggageEntries = await luggage.find({}).sort({ createdAt: -1 });
    res.render('admin/dashboard', { 
      users, 
      luggageEntries,
      currentAdmin: req.session.user,
      csrfToken: req.csrfToken()
    });
  } catch (error) { 
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Add new user
router.post('/add-user', checkAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      name,
      email,
      password: hashPassword,
      role: role.toLowerCase()
    });

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Check-in luggage
router.post('/check-in', checkAdmin, async (req, res) => {
  try {
    const { userId, luggageNumber } = req.body;
    
    const newEntry = new luggage({
      userId,
      luggageNumber,
      status: 'pending'
    });

    await newEntry.save();
    res.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Promote user to admin
router.post('/promote/:userId', checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Demote admin to user
router.post('/demote/:userId', checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'user' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
