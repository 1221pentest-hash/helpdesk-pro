import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmitTicket from './pages/SubmitTicket';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"        element={<SubmitTicket />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
      </Routes>
    </Router>
  );
}

export default App;