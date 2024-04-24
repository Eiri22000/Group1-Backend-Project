// blacklistToken.js
const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: false,
  },
});

blacklistTokenSchema.statics.addToBlacklist = async function(token) {
  try {
    const newBlacklistedToken = new this({ token });
    await newBlacklistedToken.save();
  } catch (error) {
    console.error('Failed to add token to blacklist:', error);
    // Rethrow the error to propagate it up the call stack
    throw new Error('Failed to add token to blacklist');
  }
};

const BlacklistToken = mongoose.model('BlacklistToken', blacklistTokenSchema);

module.exports = BlacklistToken;