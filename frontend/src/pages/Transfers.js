import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './FormPage.css';

export default function Transfers() {
  const { can, user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_name: '', asset_type: 'vehicle', from_base: user.base || '', to_base: '', quantity: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransfers();
    api.get('/assets').then(r => setAssets(r.data));
  }, []);

  const fetchTransfers = async () => {
    const { data } = await api.get('/transfers');
    setTransfers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/transfers', { ...form, quantity: Number(form.quantity) });
      setShowForm(false);
      fetchTransfers();
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed');
    }
  };

  return (
    <div className="form-page">
      <div className="page-header-row">
        <div>
          <h2>Transfers</h2>
          <p>Move assets between bases</p>
        </div>
        {can('admin', 'base_commander') && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Transfer'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Transfer Asset</h3>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="grid-form">
            <div>
              <label>Asset Name</label>
              <input
                list="asset-list"
                value={form.asset_name}
                onChange={e => {
                  const a = assets.find(x => x.name === e.target.value);
                  setForm({...form, asset_name: e.target.value, asset_type: a?.type || form.asset_type});
                }}
                required
              />
              <datalist id="asset-list">
                {[...new Set(assets.map(a => a.name))].map(n => <option key={n} value={n} />)}
              </datalist>
            </div>
            <div>
              <label>From Base</label>
              <input value={form.from_base} onChange={e => setForm({...form, from_base: e.target.value})} required disabled={user.role !== 'admin'} />
            </div>
            <div>
              <label>To Base</label>
              <input value={form.to_base} onChange={e => setForm({...form, to_base: e.target.value})} required />
            </div>
            <div>
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
            </div>
            <div className="full-width">
              <label>Notes</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="full-width">
              <button type="submit" className="primary-btn">Execute Transfer</button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr><th>Asset</th><th>From</th><th>To</th><th>Qty</th><th>By</th><th>Date</th></tr>
          </thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id}>
                <td>{t.asset_name}</td>
                <td>{t.from_base}</td>
                <td>{t.to_base}</td>
                <td>{t.quantity}</td>
                <td>{t.transferred_by_name || '—'}</td>
                <td>{new Date(t.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {transfers.length === 0 && <tr><td colSpan="6" className="empty">No transfers recorded</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}