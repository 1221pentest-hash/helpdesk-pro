<img width="1902" height="1078" alt="helpdesk3000" src="https://github.com/user-attachments/assets/d820f6bb-9df0-47a1-9b94-30a84863cc39" />





Employee
    |
    v
React Frontend
    |
    v
Express API
    |
    +--> SQLite Database
    |
    +--> Email Notifications
    |
    +--> Escalation Engine


# HelpDesk Pro 🖥️

A full-stack IT helpdesk ticketing system built with React, Node.js, Express and SQLite.


## Business Value

This project demonstrates:

- IT service management workflows
- Ticket lifecycle management
- Incident escalation processes
- Authentication and authorization
- Email automation
- Audit logging
- Full-stack application development

The system simulates many workflows commonly found in enterprise IT help desk platforms.
## Features
- 📝 Simulates a real-world IT help desk environment where employees submit incidents and service requests, which are automatically routed, tracked, escalated, and audited.
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

<img width="1902" height="1078" alt="helpdesk3000" src="https://github.com/user-attachments/assets/fb3eb5e2-ee53-4e7d-917b-42f2baefeef7" />
<img width="922" height="1017" alt="Screeshot1" src="https://github.com/user-attachments/assets/9e9bb8ad-3e74-4bb6-91b5-44e8797eb1c6" />
<img width="882" height="981" alt="Screenshoot2" src="https://github.com/user-attachments/assets/8bbac54b-8760-48aa-9f17-05196fd2a6b1" />
<img width="912" height="938" alt="Screenshot3" src="https://github.com/user-attachments/assets/8dffdc60-549f-4187-bc08-752f41c6081e" />
<img width="916" height="1028" alt="Screenshot4" src="https://github.com/user-attachments/assets/0b15aedb-2354-498f-b867-2d9631694c15" />
<img width="908" height="971" alt="Screenshot5" src="https://github.com/user-attachments/assets/f5b2f2d4-2d03-4b98-b2e4-0901e05b5374" />
<img width="682" height="623" alt="Screenshot6" src="https://github.com/user-attachments/assets/9554862d-c88d-45b6-ac9a-bd8ae22fdefc" />
<img width="682" height="623" alt="Screenshot8" src="https://github.com/user-attachments/assets/fb397d07-2cd6-419b-b790-2004c73e9d94" />
<img width="948" height="1025" alt="Screenshot7" src="https://github.com/user-attachments/assets/b28cd7cc-314a-4aca-9e73-6711f9011056" />
