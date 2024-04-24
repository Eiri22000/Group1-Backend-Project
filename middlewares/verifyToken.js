// verifyToken.js
const jwt = require('jsonwebtoken');
const BlacklistToken = require('../models/blacklistToken');

// Middleware to check if token is valid
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await BlacklistToken.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Unauthorized: Token revoked' });
    }

    // Verify token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = verifyToken;
