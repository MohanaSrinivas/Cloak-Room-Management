router.post('/profile/update-profile', checkAuth, async (req, res) => {

    const { age, dateOfBirth, aadhar, email } = req.body; // Ensure email is included in the update

    // Validate inputs
    // Validate inputs
    if (!age || !dateOfBirth || !aadhar || (email !== undefined && email.trim() === '')) {

        return res.status(400).send({ message: 'All fields are required and email must be valid if provided' }); // Update message for clarity

    }

    // Check if email is provided and it's not null
    if (email === null || email.trim() === '') {
        return res.status(400).send({ message: 'Email cannot be null or empty' });
    }

    try {
        const updatedProfile = await Details.findOneAndUpdate( 

            { userId: req.session.user._id }, // Ensure userId is correctly referenced

            { age, dateOfBirth: new Date(dateOfBirth), aadhar, email }, // Include email in the update

            { new: true, upsert: true } // Creates a new document if none exists
        );
        res.send({ message: 'Profile updated successfully', updatedProfile });
        
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ message: 'Failed to update profile' });
    }
});
