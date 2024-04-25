const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose').Types.ObjectId;

// Define schema for token collection
const tokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User', // Reference to the User collection
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  }
});

// Create model for token collection
const Token = mongoose.model('Token', tokenSchema);

// Function to save a token to the database
const saveToken = async (userId, token, expirationDate) => {
  // Check if userId is a valid ObjectId
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid userId');
  }

  await Token.create({ userId, token, expirationDate });
};

// Function to check if a token exists in the database
const isTokenSaved = async (token) => {
  const savedToken = await Token.findOne({ token });
  return !!savedToken;
};

module.exports = Token;
