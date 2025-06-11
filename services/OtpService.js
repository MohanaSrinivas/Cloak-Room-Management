const nodemailer = require('nodemailer');
require('dotenv').config();

// Generate a 6-digit OTP
module.exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simulate sending OTP via email (for demonstration)
module.exports.sendOTPByEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP sent via email');
  } catch (error) {
    console.error('Error sending OTP via email:', error);
    throw new Error('Failed to send OTP');
  }
};

// Simulate sending OTP via console (for testing)
module.exports.sendOTPByConsole = (phoneNumber, otp) => {
  console.log(`OTP for ${phoneNumber} is: ${otp}`);
};