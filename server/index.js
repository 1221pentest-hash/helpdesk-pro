require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes   = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const db = require('./db/database');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method}  ${req.path}`);
  next();
});

app.use('/api/auth',    authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HelpDesk Pro API is running!' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   HelpDesk Pro API is running! 🚀     ║
║   http://localhost:5000               ║
║   Press Ctrl+C to stop                ║
╚═══════════════════════════════════════╝
  `);
});