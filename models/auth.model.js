// models/auth.model.js

const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  authToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Auth', authSchema);
