const express = require('express');
const router = express.Router();
const Details = require('../models/Details');
const luggage = require('../models/Storage'); // Ensure the luggage model is imported

router.post('/add-pickup-option', async (req, res) => {
  try {
    const { pickupOption, pickupLocation } = req.body;

    // Validate required fields
    if (pickupOption && !pickupLocation) {
      return res.status(400).json({ message: 'Pickup location is required if pickup option is selected.' });
    }

    // Update the luggage entry with pickup option
    const luggageEntry = await luggage.findOneAndUpdate(
      { userId: req.session.user._id, status: 'checked-in' }, // Find by user ID and checked-in status
      { pickupOption, pickupLocation }, // Update fields
      { new: true } // Return updated document
    );

    if (!luggageEntry) {
      return res.status(404).json({ message: 'No luggage entry found for this user.' });
    }

    // Save pickup details in the luggage entry
    luggageEntry.pickupOption = pickupOption;
    luggageEntry.pickupLocation = pickupLocation;
    await luggageEntry.save();

    res.status(200).json({ message: 'Pickup option updated successfully.', luggageEntry });
  } catch (error) {
    console.error('Error updating pickup option:', error);
    res.status(500).json({ message: 'Error updating pickup option.' });
  }
});

router.post('/add-details', async (req, res) => {
  try {
    const { name, age, dateOfBirth, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !age || !dateOfBirth || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create or update user details
    const userDetails = await Details.findOneAndUpdate(
      { userId: req.session.user._id }, // Find by user ID
      { name, age, dateOfBirth, phoneNumber }, // Update fields
      { upsert: true, new: true } // Create if not found, return updated document
    );

    res.status(200).json({ message: 'Details saved successfully.', userDetails });
  } catch (error) {
    console.error('Error saving details:', error);
    res.status(500).json({ message: 'Error saving details.' });
  }
});

// POST route to update user profile
router.post('/update-profile', async (req, res) => {
  try {
    const { age, dateOfBirth, aadhar } = req.body;

    // Validate required fields
    if (!age || !dateOfBirth || !aadhar) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Update user profile
    const updatedUser = await Details.findOneAndUpdate(
      { userId: req.session.user._id }, // Find by user ID
      { age, dateOfBirth, aadhar }, // Update fields
      { upsert: true, new: true } // Create if not found, return updated document
    );

    res.status(200).json({ message: 'Profile updated successfully.', updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile.' });
  }
});

router.post('/add-delivery-option', async (req, res) => {
  try {
    const { deliveryOption, deliveryAddress } = req.body;

    // Validate required fields
    if (deliveryOption && !deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required if delivery option is selected.' });
    }

    // Update the luggage entry with delivery option
    const luggageEntry = await luggage.findOneAndUpdate(
      { userId: req.session.user._id, status: 'checked-in' }, // Find by user ID and checked-in status
      { deliveryOption, deliveryAddress }, // Update fields
      { new: true } // Return updated document
    );

    if (!luggageEntry) {
      return res.status(404).json({ message: 'No luggage entry found for this user.' });
    }

    res.status(200).json({ message: 'Delivery option updated successfully.', luggageEntry });
  } catch (error) {
    console.error('Error updating delivery option:', error);
    res.status(500).json({ message: 'Error updating delivery option.' });
  }
});

module.exports = router;
