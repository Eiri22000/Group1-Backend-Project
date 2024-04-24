// blacklistToken.js
const jwt = require('jsonwebtoken');
const BlacklistToken = require('.models/blacklistToken');

// Method to add token to the blacklist
exports.addToBlacklist = async (token) => {
  await BlacklistToken.create({ token });
  console.log('Token added to blacklist:', token);
};

//Method to check if token is in the blacklist
const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await BlacklistToken.findOne({ token });
  console.log('Token added to blacklist:', token);
  return !!blacklistedToken;
};

module.exports = { addToBlacklist, isTokenBlacklisted };