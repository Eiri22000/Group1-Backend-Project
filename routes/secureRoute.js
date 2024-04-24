const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

// Example of a secure route
router.get('/secure', authenticateToken, (req, res) => {
  res.json({ message: 'You have accessed the secure route', user: req.user });
});

module.exports = router;

