const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const { assignTicket } = require('../automation/assignEngine');
const {
  sendNewTicketEmail,
  sendAssignmentEmail,
  sendStatusUpdateEmail,
} = require('../emails/mailer');

router.post('/', async (req, res) => {
  try {
    const {
      title, description, category, priority,
      submitter_name, submitter_email
    } = req.body;

    if (!title || !description || !category || !priority
        || !submitter_name || !submitter_email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const result = db.prepare(`
      INSERT INTO tickets
        (title, description, category, priority, submitter_name, submitter_email)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description, category, priority, submitter_name, submitter_email);

    const ticket = db.prepare(
      'SELECT * FROM tickets WHERE id = ?'
    ).get(result.lastInsertRowid);

    const agent = assignTicket(category, priority);

    if (agent) {
      db.prepare(`
        UPDATE tickets
        SET assigned_to = ?, status = 'open', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(agent.id, ticket.id);

      db.prepare(`
        INSERT INTO activity_log (ticket_id, action, details, performed_by)
        VALUES (?, 'assigned', ?, 'system')
      `).run(ticket.id, `Auto-assigned to ${agent.name}`);
    }

    db.prepare(`
      INSERT INTO activity_log (ticket_id, action, details, performed_by)
      VALUES (?, 'created', ?, ?)
    `).run(ticket.id, `Ticket submitted by ${submitter_name}`, submitter_name);

    const updatedTicket = db.prepare(
      'SELECT * FROM tickets WHERE id = ?'
    ).get(ticket.id);

    try {
      await sendNewTicketEmail(updatedTicket, agent?.name);
      if (agent) await sendAssignmentEmail(updatedTicket, agent);
    } catch (emailErr) {
      console.error('Email failed (ticket still created):', emailErr.message);
    }

    res.status(201).json({
      message: 'Ticket submitted successfully.',
      ticket: updatedTicket,
      assignedTo: agent?.name || 'Pending assignment',
    });

  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket.' });
  }
});

router.get('/', authenticate, (req, res) => {
  try {
    let tickets;
    if (req.user.role === 'admin') {
      tickets = db.prepare(`
        SELECT t.*, u.name as agent_name
        FROM tickets t
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.created_at DESC
      `).all();
    } else {
      tickets = db.prepare(`
        SELECT t.*, u.name as agent_name
        FROM tickets t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.assigned_to = ?
        ORDER BY t.created_at DESC
      `).all(req.user.id);
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets.' });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const ticket = db.prepare(`
      SELECT t.*, u.name as agent_name, u.email as agent_email
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const log = db.prepare(`
      SELECT * FROM activity_log
      WHERE ticket_id = ?
      ORDER BY created_at ASC
    `).all(req.params.id);

    res.json({ ticket, log });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ticket.' });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, priority, notes } = req.body;

    const ticket = db.prepare(
      'SELECT * FROM tickets WHERE id = ?'
    ).get(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const fields = [];
    const values = [];

    if (status) {
      fields.push('status = ?');
      values.push(status);
      if (status === 'resolved') {
        fields.push('resolved_at = CURRENT_TIMESTAMP');
      }
    }

    if (priority) {
      fields.push('priority = ?');
      values.push(priority);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    db.prepare(
      `UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`
    ).run(values);

    const changes = [
      status   ? `Status → '${status}'`    : null,
      priority ? `Priority → '${priority}'` : null,
      notes    ? `Notes: ${notes}`           : null,
    ].filter(Boolean).join('. ');

    db.prepare(`
      INSERT INTO activity_log (ticket_id, action, details, performed_by)
      VALUES (?, 'status_changed', ?, ?)
    `).run(ticket.id, changes, req.user.name);

    if (status) {
      const updated = db.prepare(
        'SELECT * FROM tickets WHERE id = ?'
      ).get(ticket.id);
      try {
        await sendStatusUpdateEmail(updated, status);
      } catch (emailErr) {
        console.error('Status email failed:', emailErr.message);
      }
    }

    const finalTicket = db.prepare(
      'SELECT * FROM tickets WHERE id = ?'
    ).get(ticket.id);

    res.json({ message: 'Ticket updated.', ticket: finalTicket });

  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ error: 'Failed to update ticket.' });
  }
});

module.exports = router;