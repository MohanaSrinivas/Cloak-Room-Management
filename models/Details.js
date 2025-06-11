const mongoose = require('mongoose');

const detailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phoneNumber: { type: String },
  phoneVerified: { type: Boolean, default: false },
  age: { type: Number },
  dateOfBirth: { type: Date },
  aadhar: { type: String }, 
  email: { type: String, required: true } 

});

module.exports = mongoose.model('Details', detailsSchema);
