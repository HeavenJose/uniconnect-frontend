// middleware/auth.js

const jwt = require('jsonwebtoken');

// This function is our middleware
module.exports = function (req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if no token is provided
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. If a token is found, verify it
  try {
    // Decode the token using your secret
    const decoded = jwt.verify(token, 'YOUR_JWT_SECRET'); // Must be the same secret as in users.js

    // Add the user's ID from the token to the request object
    req.user = decoded.user;
    
    // Pass control to the next function (our route handler)
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
