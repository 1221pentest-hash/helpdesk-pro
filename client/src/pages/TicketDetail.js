import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [update, setUpdate] = useState({ status:'', priority:'', notes:'' });
  const token = localStorage.getItem('token');

  if (!token) window.location.href = '/login';

  useEffect(() => { fetchTicket(); }, []);

  async function fetchTicket() {
    try {
      const res = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicket(res.data.ticket);
      setLog(res.data.log);
    } catch (err) {
      console.error('Failed to load ticket');
    }
    setLoading(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.patch(`http://localhost:5000/api/tickets/${id}`, update, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Ticket updated!');
      fetchTicket();
      setUpdate({ status:'', priority:'', notes:'' });
    } catch (err) {
      setMessage('Failed to update.');
    }
    setUpdating(false);
  }

  const priorityColor = {
    low:'#639922', medium:'#BA7517', high:'#D85A30', critical:'#E24B4A'
  };
  const statusColor = {
    open:'#1a56db', in_progress:'#BA7517', resolved:'#639922', closed:'#6b7280'
  };

  if (loading) return (
    <div style={{textAlign:'center',marginTop:'80px',color:'#6b7280'}}>
      Loading...
    </div>
  );

  if (!ticket) return (
    <div style={{textAlign:'center',marginTop:'80px',color:'#6b7280'}}>
      Ticket not found.
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',padding:'24px'}}>

      <button
        onClick={() => window.location.href='/dashboard'}
        style={{marginBottom:'20px',padding:'8px 16px',background:'#fff',
          border:'1px solid #d1d5db',borderRadius:'8px',cursor:'pointer',
          fontSize:'14px'}}>
        Back to Dashboard
      </button>

      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:'20px'}}>

        <div>
          <div style={{background:'#fff',borderRadius:'12px',padding:'24px',
            marginBottom:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>

            <h2 style={{margin:'0 0 8px',fontSize:'18px',color:'#111827'}}>
              #{ticket.id} — {ticket.title}
            </h2>

            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'12px',
                fontWeight:600,background:priorityColor[ticket.priority]+'20',
                color:priorityColor[ticket.priority]}}>
                {ticket.priority}
              </span>
              <span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'12px',
                fontWeight:600,background:statusColor[ticket.status]+'20',
                color:statusColor[ticket.status]}}>
                {ticket.status.replace('_',' ')}
              </span>
            </div>

            <table style={{width:'100%',borderCollapse:'collapse',
              fontSize:'14px',marginBottom:'16px'}}>
              <tbody>
                <tr>
                  <td style={{padding:'8px',color:'#6b7280',width:'140px'}}>Category</td>
                  <td style={{padding:'8px'}}>{ticket.category}</td>
                </tr>
                <tr style={{background:'#f9fafb'}}>
                  <td style={{padding:'8px',color:'#6b7280'}}>Submitted by</td>
                  <td style={{padding:'8px'}}>{ticket.submitter_name} ({ticket.submitter_email})</td>
                </tr>
                <tr>
                  <td style={{padding:'8px',color:'#6b7280'}}>Assigned to</td>
                  <td style={{padding:'8px'}}>{ticket.agent_name || 'Unassigned'}</td>
                </tr>
                <tr style={{background:'#f9fafb'}}>
                  <td style={{padding:'8px',color:'#6b7280'}}>Created</td>
                  <td style={{padding:'8px'}}>{new Date(ticket.created_at).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style={{background:'#f9fafb',borderRadius:'8px',padding:'12px 16px'}}>
              <p style={{margin:'0 0 6px',fontSize:'13px',fontWeight:600,color:'#6b7280'}}>
                Description
              </p>
              <p style={{margin:0,fontSize:'14px',color:'#374151',lineHeight:1.6}}>
                {ticket.description}
              </p>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:'12px',padding:'24px',
            boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <h3 style={{margin:'0 0 16px',fontSize:'16px'}}>Update Ticket</h3>

            {message && (
              <div style={{padding:'10px',background:'#f0fdf4',
                border:'1px solid #86efac',borderRadius:'8px',
                marginBottom:'12px',fontSize:'14px',color:'#166534'}}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div style={{display:'flex',gap:'16px',marginBottom:'16px'}}>
                <div style={{flex:1}}>
                  <label style={{display:'block',marginBottom:'6px',
                    fontSize:'14px',fontWeight:500}}>Status</label>
                  <select
                    style={{width:'100%',padding:'10px',borderRadius:'8px',
                      border:'1px solid #d1d5db',fontSize:'14px'}}
                    value={update.status}
                    onChange={e => setUpdate({...update, status:e.target.value})}>
                    <option value="">No change</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={{display:'block',marginBottom:'6px',
                    fontSize:'14px',fontWeight:500}}>Priority</label>
                  <select
                    style={{width:'100%',padding:'10px',borderRadius:'8px',
                      border:'1px solid #d1d5db',fontSize:'14px'}}
                    value={update.priority}
                    onChange={e => setUpdate({...update, priority:e.target.value})}>
                    <option value="">No change</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',marginBottom:'6px',
                  fontSize:'14px',fontWeight:500}}>Notes</label>
                <textarea
                  style={{width:'100%',padding:'10px',borderRadius:'8px',
                    border:'1px solid #d1d5db',fontSize:'14px',
                    height:'80px',boxSizing:'border-box'}}
                  value={update.notes}
                  onChange={e => setUpdate({...update, notes:e.target.value})}
                  placeholder="Add a note..."/>
              </div>

              <button type="submit" disabled={updating}
                style={{width:'100%',padding:'10px',background:'#1a56db',
                  color:'#fff',border:'none',borderRadius:'8px',
                  fontSize:'14px',fontWeight:600,cursor:'pointer'}}>
                {updating ? 'Updating...' : 'Update Ticket'}
              </button>
            </form>
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:'12px',padding:'24px',
          boxShadow:'0 1px 4px rgba(0,0,0,0.06)',height:'fit-content'}}>
          <h3 style={{margin:'0 0 16px',fontSize:'16px'}}>Activity Log</h3>
          {log.length === 0 ? (
            <p style={{color:'#9ca3af'}}>No activity yet.</p>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              {log.map(entry => (
                <div key={entry.id} style={{display:'flex',gap:'12px'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',
                    background:'#1a56db',marginTop:'5px',flexShrink:0}}/>
                  <div>
                    <p style={{margin:'0 0 2px',fontSize:'14px',fontWeight:600,
                      color:'#111827',textTransform:'capitalize'}}>
                      {entry.action.replace('_',' ')}
                    </p>
                    <p style={{margin:'0 0 2px',fontSize:'13px',color:'#374151'}}>
                      {entry.details}
                    </p>
                    <p style={{margin:0,fontSize:'12px',color:'#9ca3af'}}>
                      {entry.performed_by} · {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TicketDetail;