import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './FormPage.css';

export default function Expenditures() {
  const { can, user } = useAuth();
  const [expenditures, setExpenditures] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({
    asset_name: '',
    base: user.base || '',
    quantity: '',
    reason: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => { fetchExpenditures(); }, []);

  const fetchExpenditures = async () => {
    const { data } = await api.get('/expenditures');
    setExpenditures(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/expenditures', {
        ...form,
        quantity: Number(form.quantity),
      });
      setShowForm(false);
      setForm({ asset_name: '', base: user.base || '', quantity: '', reason: '', notes: '' });
      fetchExpenditures();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record expenditure');
    }
  };

  return (
    <div className="form-page">
      <div className="page-header-row">
        <div>
          <h2>Expenditures</h2>
          <p>Log consumed or expended assets</p>
        </div>
        {can('admin', 'base_commander', 'logistics_officer') && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Log Expenditure'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Record Expenditure</h3>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="grid-form">
            <div>
              <label>Asset Name</label>
              <input
                value={form.asset_name}
                onChange={e => setForm({ ...form, asset_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Base</label>
              <input
                value={form.base}
                onChange={e => setForm({ ...form, base: e.target.value })}
                required
                disabled={user.role !== 'admin'}
              />
            </div>
            <div>
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Reason</label>
              <select
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                required
              >
                <option value="">Select reason</option>
                <option value="Training exercise">Training exercise</option>
                <option value="Combat operation">Combat operation</option>
                <option value="Damaged / destroyed">Damaged / destroyed</option>
                <option value="Routine consumption">Routine consumption</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="full-width">
              <label>Notes (optional)</label>
              <input
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="full-width">
              <button type="submit" className="primary-btn">Log Expenditure</button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Base</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Logged By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenditures.map(e => (
              <tr key={e.id}>
                <td>{e.asset_name}</td>
                <td>{e.base}</td>
                <td>{e.quantity}</td>
                <td>{e.reason}</td>
                <td>{e.expended_by_name || '—'}</td>
                <td>{new Date(e.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {expenditures.length === 0 && (
              <tr><td colSpan="6" className="empty">No expenditures recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}