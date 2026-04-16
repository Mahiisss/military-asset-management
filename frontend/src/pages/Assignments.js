import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './FormPage.css';

export default function Assignments() {
  const { can, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_name: '', base: user.base || '', assigned_to: '', quantity: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    const { data } = await api.get('/assignments');
    setAssignments(data);
  };

  const handleReturn = async (id) => {
    try {
      await api.patch(`/assignments/${id}/return`);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.error || 'Return failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/assignments', { ...form, quantity: Number(form.quantity) });
      setShowForm(false);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.error || 'Assignment failed');
    }
  };

  return (
    <div className="form-page">
      <div className="page-header-row">
        <div>
          <h2>Assignments</h2>
          <p>Assign assets to personnel</p>
        </div>
        {can('admin', 'base_commander') && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Assignment'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Assign Asset</h3>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="grid-form">
            <div>
              <label>Asset Name</label>
              <input value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} required />
            </div>
            <div>
              <label>Base</label>
              <input value={form.base} onChange={e => setForm({...form, base: e.target.value})} required disabled={user.role !== 'admin'} />
            </div>
            <div>
              <label>Assigned To</label>
              <input value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} placeholder="Sgt. John Doe" required />
            </div>
            <div>
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
            </div>
            <div className="full-width">
              <button type="submit" className="primary-btn">Assign</button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr><th>Asset</th><th>Base</th><th>Assigned To</th><th>Qty</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id}>
                <td>{a.asset_name}</td>
                <td>{a.base}</td>
                <td>{a.assigned_to}</td>
                <td>{a.quantity}</td>
                <td><span className={`badge ${a.returned ? 'badge-returned' : 'badge-active'}`}>{a.returned ? 'Returned' : 'Active'}</span></td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>
                  {!a.returned && can('admin', 'base_commander') && (
                    <button className="small-btn" onClick={() => handleReturn(a.id)}>Return</button>
                  )}
                </td>
              </tr>
            ))}
            {assignments.length === 0 && <tr><td colSpan="7" className="empty">No assignments</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}