import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './FormPage.css';

export default function Purchases() {
  const { can, user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_name: '', asset_type: 'vehicle', base: user.base || '', quantity: '', unit: 'units', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchPurchases(); }, []);

  const fetchPurchases = async () => {
    const { data } = await api.get('/purchases');
    setPurchases(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/purchases', { ...form, quantity: Number(form.quantity) });
      setShowForm(false);
      setForm({ asset_name: '', asset_type: 'vehicle', base: user.base || '', quantity: '', unit: 'units', notes: '' });
      fetchPurchases();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record purchase');
    }
  };

  return (
    <div className="form-page">
      <div className="page-header-row">
        <div>
          <h2>Purchases</h2>
          <p>Record new asset acquisitions</p>
        </div>
        {can('admin', 'base_commander') && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Purchase'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Record Purchase</h3>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="grid-form">
            <div>
              <label>Asset Name</label>
              <input value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} required />
            </div>
            <div>
              <label>Type</label>
              <select value={form.asset_type} onChange={e => setForm({...form, asset_type: e.target.value})}>
                <option value="vehicle">Vehicle</option>
                <option value="weapon">Weapon</option>
                <option value="ammunition">Ammunition</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label>Base</label>
              <input value={form.base} onChange={e => setForm({...form, base: e.target.value})} required disabled={user.role !== 'admin'} />
            </div>
            <div>
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
            </div>
            <div>
              <label>Unit</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                <option value="units">Units</option>
                <option value="rounds">Rounds</option>
                <option value="kg">Kg</option>
              </select>
            </div>
            <div className="full-width">
              <label>Notes (optional)</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="full-width">
              <button type="submit" className="primary-btn">Submit Purchase</button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset</th><th>Type</th><th>Base</th><th>Qty</th><th>Purchased By</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p.id}>
                <td>{p.asset_name}</td>
                <td><span className={`badge badge-${p.asset_type}`}>{p.asset_type}</span></td>
                <td>{p.base}</td>
                <td>{p.quantity} {p.unit}</td>
                <td>{p.buyer_name || '—'}</td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {purchases.length === 0 && <tr><td colSpan="6" className="empty">No purchases recorded</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}