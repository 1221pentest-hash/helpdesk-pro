import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return; }
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const res = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter);

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',padding:'24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',
        alignItems:'center',marginBottom:'24px',background:'#fff',
        padding:'20px 24px',borderRadius:'12px'}}>
        <div>
          <h1 style={{margin:0,color:'#1a56db'}}>HelpDesk Pro</h1>
          <p style={{margin:'4px 0 0',color:'#6b7280',fontSize:'14px'}}>
            Welcome, <strong>{user.name}</strong>
          </p>
        </div>
        <button onClick={logout}
          style={{padding:'8px 16px',background:'#fee2e2',
            color:'#991b1b',border:'none',borderRadius:'8px',cursor:'pointer'}}>
          Logout
        </button>
      </div>

      <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
        {['all','open','in_progress','resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{padding:'8px 16px',border:'1px solid #d1d5db',
              borderRadius:'8px',cursor:'pointer',fontSize:'13px',
              background:filter===s?'#1a56db':'#fff',
              color:filter===s?'#fff':'#374151'}}>
            {s==='all'?'All':s.replace('_',' ')} ({s==='all'
              ?tickets.length
              :tickets.filter(t=>t.status===s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{textAlign:'center',color:'#6b7280'}}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{textAlign:'center',color:'#6b7280'}}>No tickets found.</p>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {filtered.map(ticket => (
            <div key={ticket.id}
              onClick={() => window.location.href='/tickets/'+ticket.id}
              style={{background:'#fff',borderRadius:'10px',
                padding:'16px 20px',cursor:'pointer',
                border:'1px solid #e5e7eb'}}>
              <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                <span style={{color:'#9ca3af',fontSize:'13px'}}>
                  #{ticket.id}
                </span>
                <span style={{padding:'2px 10px',borderRadius:'99px',
                  fontSize:'12px',fontWeight:600,
                  background:'#fee2e2',color:'#991b1b'}}>
                  {ticket.priority}
                </span>
                <span style={{padding:'2px 10px',borderRadius:'99px',
                  fontSize:'12px',fontWeight:600,
                  background:'#e0f2fe',color:'#0369a1'}}>
                  {ticket.status}
                </span>
              </div>
              <h3 style={{margin:'0 0 8px',fontSize:'15px'}}>
                {ticket.title}
              </h3>
              <p style={{margin:0,fontSize:'13px',color:'#6b7280'}}>
                {ticket.category} · {ticket.submitter_name} · {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;