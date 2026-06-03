// AUTH ROUTES
// ===========
// POST /api/auth/register — create a new agent account
// POST /api/auth/login    — log in and receive a token
//
// Think of this like the front desk of your helpdesk:
// Register = creating a new employee badge
// Login = swiping your badge to get in

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
require('dotenv').config();

// ── REGISTER ──────────────────────────────────────────────
// Creates a new agent or admin account
// Body: { name, email, password, role, team }
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'agent', team } = req.body;

    // Make sure all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    // Check if this email is already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password — NEVER store plain text passwords
    // bcrypt turns 'mypassword' into '$2a$10$xK9...' — impossible to reverse
    // The 10 = how many times it scrambles (higher = safer but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database
    db.prepare(
      'INSERT INTO users (name, email, password, role, team) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, hashedPassword, role, team || null);

    res.status(201).json({ message: 'Account created successfully.' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ── LOGIN ──────────────────────────────────────────────────
// Verifies credentials and returns a JWT token
// Body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Look up the user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare the entered password against the stored hash
    // bcrypt.compare hashes the input and checks if it matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create a JWT token — valid for 8 hours
    // This token contains the user's id, name, email and role
    // It's SIGNED with our secret key so nobody can fake one
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Send back the token and basic user info
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;