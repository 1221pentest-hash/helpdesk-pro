// MAILER — All emails live here
// ==============================
// Nodemailer is the package that sends emails through Gmail.
// We set up the connection ONCE at the top, then call simple
// functions from anywhere in the app.
//
// 4 emails this system sends automatically:
// 1. New ticket confirmation  → to the employee who submitted
// 2. Assignment notification  → to the agent who was assigned
// 3. Status update            → to the employee when status changes
// 4. Escalation alert         → to the manager when ticket is overdue

const nodemailer = require('nodemailer');
require('dotenv').config();

// ── TRANSPORTER ───────────────────────────────────────────
// This is the "mail server connection" — created once,
// used by all 4 email functions below.
// Gmail requires an App Password (not your real password).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── HELPERS ───────────────────────────────────────────────

// Turns 'critical' into a colored HTML badge for emails
function priorityBadge(priority) {
  const colors = {
    low:      '#639922',
    medium:   '#BA7517',
    high:     '#D85A30',
    critical: '#E24B4A',
  };
  const color = colors[priority] || '#888';
  return `<span style="background:${color};color:#fff;padding:3px 10px;
          border-radius:4px;font-size:12px;font-weight:600;
          text-transform:uppercase">${priority}</span>`;
}

// HTML shell that wraps every email — gives them all the same look
function emailShell(title, bodyHtml) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
      <div style="background:#1a56db;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px">
          🖥️ HelpDesk Pro
        </h2>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;
                  border-top:none;border-radius:0 0 8px 8px">
        <h3 style="margin-top:0;color:#111">${title}</h3>
        ${bodyHtml}
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;
                  border-top:1px solid #e5e7eb;padding-top:12px">
          This is an automated message from HelpDesk Pro. Do not reply.
        </p>
      </div>
    </div>
  `;
}

// Reusable table row for ticket details in emails
function row(label, value, shaded = false) {
  const bg = shaded ? 'background:#f3f4f6;' : '';
  return `
    <tr>
      <td style="padding:8px 12px;${bg}color:#6b7280;width:130px">${label}</td>
      <td style="padding:8px 12px;${bg}">${value}</td>
    </tr>
  `;
}

// ── EMAIL 1: New ticket confirmation ──────────────────────
// Sent to: the employee who submitted the ticket
// Trigger: immediately after ticket is created
async function sendNewTicketEmail(ticket, agentName) {
  const html = emailShell(
    'Your ticket has been received ✅',
    `
    <p>Hi <strong>${ticket.submitter_name}</strong>,</p>
    <p>We received your request and assigned it to our team.
       You will be notified when the status changes.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;
                  margin:16px 0;border:1px solid #e5e7eb;border-radius:6px">
      ${row('Ticket #',    `<strong>#${ticket.id}</strong>`)}
      ${row('Subject',     ticket.title, true)}
      ${row('Category',    ticket.category)}
      ${row('Priority',    priorityBadge(ticket.priority), true)}
      ${row('Assigned to', agentName || 'Being assigned...')}
    </table>
    <p style="font-size:13px;color:#6b7280">
      Expected response times:
      <strong>Critical</strong> 2h ·
      <strong>High</strong> 8h ·
      <strong>Medium</strong> 24h ·
      <strong>Low</strong> 48h
    </p>
    `
  );

  await transporter.sendMail({
    from: `"HelpDesk Pro" <${process.env.EMAIL_USER}>`,
    to: ticket.submitter_email,
    subject: `[Ticket #${ticket.id}] ${ticket.title}`,
    html,
  });

  console.log(`✅ Confirmation email sent to ${ticket.submitter_email}`);
}

// ── EMAIL 2: Assignment notification ──────────────────────
// Sent to: the agent who was assigned the ticket
// Trigger: immediately after auto-assign runs
async function sendAssignmentEmail(ticket, agent) {
  const html = emailShell(
    'New ticket assigned to you 📋',
    `
    <p>Hi <strong>${agent.name}</strong>,</p>
    <p>A new ticket has been assigned to you. Please review and respond.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;
                  margin:16px 0;border:1px solid #e5e7eb;border-radius:6px">
      ${row('Ticket #',     `<strong>#${ticket.id}</strong>`)}
      ${row('Subject',      ticket.title, true)}
      ${row('Description',  ticket.description)}
      ${row('Category',     ticket.category, true)}
      ${row('Priority',     priorityBadge(ticket.priority))}
      ${row('Submitted by', `${ticket.submitter_name} (${ticket.submitter_email})`, true)}
    </table>
    `
  );

  await transporter.sendMail({
    from: `"HelpDesk Pro" <${process.env.EMAIL_USER}>`,
    to: agent.email,
    subject: `[ACTION REQUIRED] New ticket: ${ticket.title}`,
    html,
  });

  console.log(`✅ Assignment email sent to agent ${agent.name}`);
}

// ── EMAIL 3: Status update ─────────────────────────────────
// Sent to: the employee who submitted the ticket
// Trigger: whenever an agent updates the ticket status
async function sendStatusUpdateEmail(ticket, newStatus) {
  const messages = {
    in_progress: 'Your ticket is now being worked on.',
    resolved:    'Great news — your ticket has been resolved! 🎉',
    closed:      'Your ticket has been closed.',
  };

  const html = emailShell(
    `Ticket status updated: ${newStatus.replace('_', ' ').toUpperCase()}`,
    `
    <p>Hi <strong>${ticket.submitter_name}</strong>,</p>
    <p>${messages[newStatus] || 'Your ticket status has been updated.'}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;
                  margin:16px 0;border:1px solid #e5e7eb;border-radius:6px">
      ${row('Ticket #',   `<strong>#${ticket.id}</strong>`)}
      ${row('Subject',    ticket.title, true)}
      ${row('New status', `<strong>${newStatus.replace('_', ' ')}</strong>`)}
    </table>
    ${newStatus === 'resolved'
      ? '<p style="font-size:13px;color:#6b7280">If your issue returns, please submit a new ticket.</p>'
      : ''}
    `
  );

  await transporter.sendMail({
    from: `"HelpDesk Pro" <${process.env.EMAIL_USER}>`,
    to: ticket.submitter_email,
    subject: `[Ticket #${ticket.id}] Status: ${newStatus}`,
    html,
  });

  console.log(`✅ Status update email sent to ${ticket.submitter_email}`);
}

// ── EMAIL 4: Escalation alert ──────────────────────────────
// Sent to: the escalation contact (manager) from .env
// Trigger: cron job detects ticket is past its SLA deadline
async function sendEscalationEmail(ticket, agentName) {
  const ageHours = Math.floor(
    (Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60)
  );

  const html = emailShell(
    '⚠️ ESCALATION: Overdue ticket requires attention',
    `
    <p style="color:#E24B4A;font-weight:bold">
      This ticket has been open for ${ageHours} hours without resolution.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;
                  margin:16px 0;border:1px solid #e5e7eb;border-radius:6px">
      ${row('Ticket #',    `<strong>#${ticket.id}</strong>`)}
      ${row('Subject',     ticket.title, true)}
      ${row('Priority',    priorityBadge(ticket.priority))}
      ${row('Assigned to', agentName || 'Unassigned', true)}
      ${row('Open for',    `${ageHours} hours`)}
    </table>
    <p>Please follow up with the assigned agent immediately.</p>
    `
  );

  await transporter.sendMail({
    from: `"HelpDesk Pro" <${process.env.EMAIL_USER}>`,
    to: process.env.ESCALATION_EMAIL,
    subject: `[ESCALATION] Ticket #${ticket.id} — ${ageHours}h overdue`,
    html,
  });

  console.log(`✅ Escalation email sent for ticket #${ticket.id}`);
}

module.exports = {
  sendNewTicketEmail,
  sendAssignmentEmail,
  sendStatusUpdateEmail,
  sendEscalationEmail,
};