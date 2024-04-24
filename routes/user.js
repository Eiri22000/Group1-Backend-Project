// users.js

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});

module.exports = router;