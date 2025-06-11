const express = require('express');
const router = express.Router();
const Details = require('./models/Details'); // Adjust the path as necessary

// User route to update their details
router.put('/update-details', async (req, res) => {
  try {
    const { userId, name, age, dateOfBirth, phoneNumber } = req.body;

    // Validate required fields
    if (!userId || !name || !age || !dateOfBirth || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Update user details
    const updatedUser = await Details.findOneAndUpdate(
      { userId }, // Find by user ID
      { name, age, dateOfBirth, phoneNumber }, // Update fields
      { new: true } // Return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Details updated successfully.', updatedUser });
  } catch (error) {
    console.error('Error updating details:', error);
    res.status(500).json({ message: 'Error updating details.' });
  }
});

// Admin route to delete a user
router.delete('/delete-user/:userId', async (req, res) => {
  const { email, password } = req.body; // Get admin credentials from request body
  const adminEmail = 'mohanasrinivas08@gmail.com';
  const adminPassword = 'Mohana@123';

  // Check if the request is from an admin
  if (email !== adminEmail || password !== adminPassword) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  try {
    const { userId } = req.params;

    // Delete user details
  const deletedUser = await Details.findOneAndDelete({ userId });


    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.' });
  }
});

module.exports = router;
