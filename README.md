# HelpDesk Pro 🖥️

A full-stack IT helpdesk ticketing system built with React, Node.js, Express and SQLite.

## Features
- 📝 Employees submit support tickets
- 🤖 Auto-assigns tickets to agents based on category and priority
- 📧 Automated email notifications (new ticket, status update, resolved)
- ⏰ Escalation cron job — overdue tickets auto-escalate every hour
- 🔐 JWT authentication for agents and admins
- 📋 Full activity log / audit trail on every ticket
- 📊 Admin dashboard with filtering by status and priority

## Tech Stack
- **Frontend:** React, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer + Gmail
- **Automation:** node-cron

## Setup
1. Clone the repo
2. cd server && npm install
3. Add .env file with Gmail credentials
4. node index.js
5. cd client && npm install && npm start

## Screenshots
Dashboard showing ticket list with priority and status badges.
Ticket detail page with activity log and update form.
