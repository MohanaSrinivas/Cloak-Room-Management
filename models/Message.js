const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() {
      return !this.isChat; // Only required for non-chat messages
    },
    default: 'Anonymous'
  },
  email: {
    type: String,
    required: function() {
      return !this.isChat; // Only required for non-chat messages
    },
    default: 'chat@system'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isChat: {
    type: Boolean,
    default: false
  },
  sender: {
    type: String,
    enum: ['user', 'assistant'],
    required: function() {
      return this.isChat; // Only required for chat messages
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);
