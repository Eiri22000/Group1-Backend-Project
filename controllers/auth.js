const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Token = require('../models/tokenModel');

// Login with an existing user
const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Käyttäjätunnusta ei löydy' });
    }


    // Compare plain text password with stored password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Check user type
    if (user.role === 'admin') {

      // If user is admin, generate admin token
      const adminToken = jwt.sign({ userId: user._id, userType: 'admin' }, process.env.SECRET_KEY, {
        expiresIn: '1 hour'
      });

      // Store the token in the database
      await saveToken(user._id, adminToken, Date.now() + 3600000);

      // Redirect to admin page with token in request headers
      return res.redirect('/admin', 302, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
    } else {
      // If user is worker, generate worker token
      const workerToken = jwt.sign({ userId: user._id, userType: 'worker' }, process.env.SECRET_KEY, {
        expiresIn: '1 hour'
      });
      // Store the token in the database
      await saveToken(user._id, workerToken, Date.now() + 3600000);

      // Redirect to gardener page


      return res.redirect('/gardener', 302, {
        headers: {
          Authorization: `Bearer ${workerToken}`
        }
      });
    }
  } catch (error) {

    next(error);
  }
};
// Function to store token in the database
const saveToken = async (userId, token, expirationDate) => {
  try {
    const newToken = new Token({
      userId: userId,
      token: token,
      expirationDate: expirationDate
    });
    await newToken.save();
  } catch (error) {
    console.error('Failed to add token to allowed list:', error);
    // Rethrow the error to propagate it up the call stack
    throw new Error('Failed to add token to allowed list');
  }
};

module.exports = { login };