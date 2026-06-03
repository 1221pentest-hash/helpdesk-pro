// DATABASE SETUP
// ==============
// We use better-sqlite3 — a fast, simple database that saves
// everything to ONE file (helpdesk.db) on your computer.
// No separate database server needed. Perfect for a portfolio project.
//
// Think of this file as building your filing cabinets BEFORE
// you start filing anything. We define the structure here.

const Database = require('better-sqlite3');
const path = require('path');

// path.join builds the full file path to where the database file lives.
// __dirname = the folder this file is in (server/db/)
// '../helpdesk.db' = go up one folder, save it in server/
const db = new Database(path.join(__dirname, '../helpdesk.db'));

// This line makes SQLite faster and safer — always include it
db.pragma('journal_mode = WAL');

// ── CREATE TABLES ──────────────────────────────────────────
// Tables are like spreadsheet tabs — each one holds one type of data.
// "IF NOT EXISTS" means: only create it if it's not already there.
// So every time the server starts, this runs safely without wiping data.

// TABLE 1: users
// Stores every agent and admin who can log in to the system
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    role       TEXT DEFAULT 'agent',
    team       TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// id          — unique number, auto-increments (1, 2, 3...)
// name        — full name of the agent
// email       — login email, must be unique
// password    — stored as a hash (never plain text)
// role        — 'agent' or 'admin'
// team        — 'network', 'hardware', or 'software'
// created_at  — automatically saves when the record was created

// TABLE 2: tickets
// Every help request submitted by an employee
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    category         TEXT NOT NULL,
    priority         TEXT NOT NULL,
    status           TEXT DEFAULT 'open',
    submitter_name   TEXT NOT NULL,
    submitter_email  TEXT NOT NULL,
    assigned_to      INTEGER,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at      DATETIME
  )
`);
// category    — 'network', 'hardware', 'software', 'other'
// priority    — 'low', 'medium', 'high', 'critical'
// status      — 'open', 'in_progress', 'resolved', 'closed'
// assigned_to — links to users.id (which agent handles this ticket)
// resolved_at — filled in when the ticket gets resolved

// TABLE 3: activity_log
// Every action taken on every ticket — this is your audit trail.
// Shows WHO did WHAT and WHEN on each ticket.
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id    INTEGER NOT NULL,
    action       TEXT NOT NULL,
    details      TEXT,
    performed_by TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
// ticket_id    — which ticket this log entry belongs to
// action       — 'created', 'assigned', 'status_changed', 'escalated'
// details      — human readable description of what changed
// performed_by — agent name, or 'system' for automated actions

console.log('Database ready — all tables created');

// Export db so every other file can use it
// Usage in other files: const db = require('./db/database')
module.exports = db;