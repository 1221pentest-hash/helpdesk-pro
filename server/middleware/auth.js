// AUTH MIDDLEWARE — The security guard
// =====================================
// Middleware is code that runs BETWEEN a request arriving
// and the server responding. Like a checkpoint at a gate.
//
// HOW IT WORKS:
// 1. User logs in → server gives them a TOKEN (like a wristband)
// 2. User sends that token with every future request
// 3. This middleware checks the token is real and not expired
// 4. If valid → let them through. If not → block them.

const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
  // Token arrives in the request header like this:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // No token = not logged in
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  try {
    // Verify the token using our secret key from .env
    // If it's been tampered with or expired, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request so route handlers can use it
    // e.g. req.user.id, req.user.role, req.user.name
    req.user = decoded;

    next(); // token is valid — continue to the route handler
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Admin-only guard — use this AFTER authenticate
// Example: router.delete('/user', authenticate, requireAdmin, handler)
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
