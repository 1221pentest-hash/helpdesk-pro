import React, { useState } from 'react';
import axios from 'axios';

function SubmitTicket() {
  // useState stores the form data
  // Every time a field changes, we update the state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'software',
    priority: 'medium',
    submitter_name: '',
    submitter_email: '',
  });

  const [status, setStatus] = useState('');  // success or error message
  const [loading, setLoading] = useState(false);  // shows "Submitting..." on button

  // Called every time user types in any field
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Called when user clicks Submit
  async function handleSubmit(e) {
    e.preventDefault();  // prevents page reload
    setLoading(true);
    setStatus('');

    try {
      const res = await axios.post('http://localhost:5000/api/tickets', form);
      setStatus(`✅ Ticket #${res.data.ticket.id} submitted! Assigned to: ${res.data.assignedTo}`);
      // Clear the form
      setForm({
        title: '', description: '', category: 'software',
        priority: 'medium', submitter_name: '', submitter_email: '',
      });
    } catch (err) {
      setStatus('❌ Failed to submit ticket. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🖥️ HelpDesk Pro</h1>
        <h2 style={styles.subtitle}>Submit a Support Ticket</h2>

        {status && (
          <div style={status.startsWith('✅') ? styles.success : styles.error}>
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Your Name</label>
            <input
              style={styles.input}
              name="submitter_name"
              value={form.submitter_name}
              onChange={handleChange}
              placeholder="John Smith"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Your Email</label>
            <input
              style={styles.input}
              name="submitter_email"
              type="email"
              value={form.submitter_email}
              onChange={handleChange}
              placeholder="john@company.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Issue Title</label>
            <input
              style={styles.input}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Cannot connect to VPN"
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Category</label>
              <select style={styles.input} name="category" value={form.category} onChange={handleChange}>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="network">Network</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Priority</label>
              <select style={styles.input} name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{...styles.input, height: '120px', resize: 'vertical'}}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your issue in detail..."
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Are you an agent? <a href="/login" style={{color: '#1a56db'}}>Login here</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    margin: '0 0 4px',
    color: '#1a56db',
    fontSize: '24px',
  },
  subtitle: {
    margin: '0 0 24px',
    color: '#374151',
    fontSize: '18px',
    fontWeight: 500,
  },
  field: {
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1a56db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
  success: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#6b7280',
  },
};

export default SubmitTicket;