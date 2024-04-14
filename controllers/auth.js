const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Login with an existing user
const login = async (req, res, next) => {
  const {username,password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare plain text password with stored password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Check user type
    if (user.type === 'admin') {
    
    // If user is admin, generate admin token
    const adminToken = jwt.sign({ userId: user._id, userType: 'admin' }, process.env.SECRET_KEY, {
      expiresIn: '1 hour'
    });
    return res.redirect('/admin');
  
    } else { // If user is worker, generate worker token
    const workerToken = jwt.sign({ userId: user._id, userType: 'worker' }, process.env.SECRET_KEY, {
      expiresIn: '1 hour'
    });
    //Redirect to gardener page
    return res.redirect('/gardener');
  }
} catch (error) {
  next(error);
}
};

module.exports = {login};