const logoutController = require('../controllers/logoutController');

// logoutController.js
const BlacklistToken = require('../models/blacklistToken');

const logout = async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({ message: 'Token not provided' });
    }

    try {
        // Add token to blacklist or perform other logout logic
        await BlacklistToken.addToBlacklist(token);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error Logout' });
    }
};

module.exports = { logout };