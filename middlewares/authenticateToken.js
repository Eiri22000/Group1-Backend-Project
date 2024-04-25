const jwt = require('jsonwebtoken');
const Token = require('../models/tokenModel');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    // Verify token
    console.log('Received token:', token);
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log('Decoded token:', decoded);

    // Check if token is in the database
    const savedToken = await Token.findOne({ token });
    console.log('Saved token:', savedToken);
    if (!savedToken) {
      console.log('Token not found in database');
      return res.sendStatus(403);
    }

    // Add user information to the request object for further processing
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token validation failed:', error);
    res.sendStatus(401);
  }
};

module.exports = authenticateToken;
