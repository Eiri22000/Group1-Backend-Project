const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const userId = req.user.userId; // Access user ID from the request object
    // Use userId to fetch user data or perform other operations
    res.send('Welcome, gardener!');
});

module.exports = router;
