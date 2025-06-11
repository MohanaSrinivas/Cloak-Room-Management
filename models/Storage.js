const mongoose = require('mongoose');

const luggageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    validate: {
      validator: function (value) {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: 'Invalid user ID format',
    },
  },
  luggageNumber: {
    type: String,
    required: [true, 'Luggage number is required'],
    unique: [true, 'Luggage number must be unique'],
    minlength: [6, 'Luggage number must be at least 6 characters long'],
    maxlength: [12, 'Luggage number must not exceed 12 characters'],
  },
  checkInTime: {
    type: Date,
    default: Date.now,
    required: [true, 'Check-in time is required'],
    validate: {
      validator: function (value) {
        return value instanceof Date && !isNaN(value);
      },
      message: 'Invalid check-in time',
    },
  },
  checkOutTime: {
    type: Date,
    validate: {
      validator: function (value) {
        return value instanceof Date && value >= this.checkInTime;
      },
      message: 'Check-out time must be after check-in time',
    },
  },
  status: {
    type: String,
    enum: {
      values: ['checked-in', 'assigned', 'picked up', 'in transit', 'delivered'],
      message: 'Status must be either checked-in, assigned, picked up, in transit, or delivered',
    },
    default: 'checked-in',
    required: [true, 'Status is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number'],
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: 'Price must be greater than zero',
    },
  },
  pickupOption: {
    type: Boolean,
    default: false,
  },
  pickupLocation: {
    type: String,
    required: false,
  },
  deliveryOption: {
    type: Boolean,
    default: false,
  },
  deliveryAddress: {
    type: String,
    required: false,
  },
  currentLocation: {
    type: String,
    required: false,
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming delivery persons are also stored in the User model
    required: false,
  },
});

// Add indexes for quicker queries
luggageSchema.index({ userId: 1 });
luggageSchema.index({ status: 1 });

// Export the model
module.exports = mongoose.model('luggage', luggageSchema);