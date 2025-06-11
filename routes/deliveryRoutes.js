const express = require('express');
const router = express.Router();
const luggage = require('../models/Storage'); // Assuming the luggage model is in models/Storage.js

// Assign a delivery person to the luggage
router.post('/assign-delivery-person', async (req, res) => {
  try {
    const { luggageId, deliveryPersonId } = req.body;

    // Validate required fields
    if (!luggageId || !deliveryPersonId) {
      return res.status(400).json({ message: 'Luggage ID and delivery person ID are required.' });
    }

    // Update the luggage entry with the assigned delivery person
    const luggageEntry = await luggage.findOneAndUpdate(
      { _id: luggageId, status: 'checked-in' }, // Find by luggage ID and checked-in status
      { deliveryPersonId, status: 'assigned' }, // Assign delivery person and update status
      { new: true } // Return updated document
    );

    if (!luggageEntry) {
      return res.status(404).json({ message: 'No luggage entry found or luggage is not checked-in.' });
    }

    res.status(200).json({ message: 'Delivery person assigned successfully.', luggageEntry });
  } catch (error) {
    console.error('Error assigning delivery person:', error);
    res.status(500).json({ message: 'Error assigning delivery person.' });
  }
});

// Update luggage status to "picked up"
router.post('/pickup-luggage', async (req, res) => {
  try {
    const { luggageId } = req.body;

    // Validate required fields
    if (!luggageId) {
      return res.status(400).json({ message: 'Luggage ID is required.' });
    }

    // Update the luggage status to "picked up"
    const luggageEntry = await luggage.findOneAndUpdate(
      { _id: luggageId, status: 'assigned' }, // Find by luggage ID and assigned status
      { status: 'picked up' }, // Update status to "picked up"
      { new: true } // Return updated document
    );

    if (!luggageEntry) {
      return res.status(404).json({ message: 'No luggage entry found or luggage is not assigned.' });
    }

    res.status(200).json({ message: 'Luggage picked up successfully.', luggageEntry });
  } catch (error) {
    console.error('Error picking up luggage:', error);
    res.status(500).json({ message: 'Error picking up luggage.' });
  }
});

// Update luggage status to "in transit"
router.post('/in-transit', async (req, res) => {
  try {
    const { luggageId, currentLocation } = req.body;

    // Validate required fields
    if (!luggageId || !currentLocation) {
      return res.status(400).json({ message: 'Luggage ID and current location are required.' });
    }

    // Update the luggage status to "in transit" and update current location
    const luggageEntry = await luggage.findOneAndUpdate(
      { _id: luggageId, status: 'picked up' }, // Find by luggage ID and picked up status
      { status: 'in transit', currentLocation }, // Update status to "in transit" and set current location
      { new: true } // Return updated document
    );

    if (!luggageEntry) {
      return res.status(404).json({ message: 'No luggage entry found or luggage is not picked up.' });
    }

    res.status(200).json({ message: 'Luggage is now in transit.', luggageEntry });
  } catch (error) {
    console.error('Error updating luggage status to in transit:', error);
    res.status(500).json({ message: 'Error updating luggage status to in transit.' });
  }
});

// Update luggage status to "delivered"
router.post('/deliver-luggage', async (req, res) => {
  try {
    const { luggageId } = req.body;

    // Validate required fields
    if (!luggageId) {
      return res.status(400).json({ message: 'Luggage ID is required.' });
    }

    // Update the luggage status to "delivered"
    const luggageEntry = await luggage.findOneAndUpdate(
      { _id: luggageId, status: 'in transit' }, // Find by luggage ID and in transit status
      { status: 'delivered' }, // Update status to "delivered"
      { new: true } // Return updated document
    );

    if (!luggageEntry) {
      return res.status(404).json({ message: 'No luggage entry found or luggage is not in transit.' });
    }

    res.status(200).json({ message: 'Luggage delivered successfully.', luggageEntry });
  } catch (error) {
    console.error('Error delivering luggage:', error);
    res.status(500).json({ message: 'Error delivering luggage.' });
  }
});


// Track delivery status
router.get('/track-delivery', async (req, res) => {
  try {
    const luggageEntry = await luggage.findOne({
      userId: req.session.user._id,
      status: { $in: ['assigned', 'picked up', 'in transit'] },
    });

    if (luggageEntry) {
      res.status(200).json({ status: luggageEntry.status });
    } else {
      res.status(404).json({ message: 'No delivery in progress.' });
    }
  } catch (error) {
    console.error('Error tracking delivery:', error);
    res.status(500).json({ message: 'Error tracking delivery.' });
  }
});



module.exports = router;