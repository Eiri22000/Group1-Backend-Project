// routes.js

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

// Protected route requiring authentication
router.get('/protected-route', authenticateToken, (req, res) => {
  // This route will only be accessible if the token is valid
  res.json({ message: 'Protected route accessed' });
});

module.exports = router;