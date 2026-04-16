import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// Net Movement Modal Component
function NetMovementModal({ item, onClose }) {
  if (!item) return null;

  const fields = {
    'Asset Name': item.name,
    'Type': item.type,
    'Base': item.base,
    'Current Stock': `${item.quantity} ${item.unit}`,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Net Movement — {item.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {Object.entries(fields).map(([k, v]) => (
            <div className="modal-row" key={k}>
              <span className="modal-key">{k}</span>
              <span className="modal-val">{v}</span>
            </div>
          ))}

          {item.movements && (
            <>
              <p className="modal-section-title">Movement Breakdown</p>
              <div className="modal-row">
                <span className="modal-key">Purchased</span>
                <span className="modal-val green">+{item.movements.purchased}</span>
              </div>
              <div className="modal-row">
                <span className="modal-key">Transferred In</span>
                <span className="modal-val green">+{item.movements.transferredIn}</span>
              </div>
              <div className="modal-row">
                <span className="modal-key">Transferred Out</span>
                <span className="modal-val red">-{item.movements.transferredOut}</span>
              </div>
              <div className="modal-row">
                <span className="modal-key">Assigned</span>
                <span className="modal-val red">-{item.movements.assigned}</span>
              </div>
              <div className="modal-row">
                <span className="modal-key">Expended</span>
                <span className="modal-val red">-{item.movements.expended}</span>
              </div>
              <div className="modal-row net-row">
                <span className="modal-key">Net Balance</span>
                <span className="modal-val">{item.quantity} {item.unit}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary]   = useState(null);
  const [assets, setAssets]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [filter, setFilter]     = useState({ base: '', type: '', search: '' });
 // Fetch summary
  useEffect(() => {
    api.get('/assets/summary').then(r => setSummary(r.data));
  }, []);

  // Fetch assets
  const fetchAssets = async () => {
    setLoading(true);
    const params = {};
    if (filter.base) params.base = filter.base;
    if (filter.type) params.type = filter.type;

    const { data } = await api.get('/assets', { params });
    setAssets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.base, filter.type]);






  const handleRowClick = async (asset) => {
    // Fetch movement details for this asset
    const [purchases, transfersRes, assignments, expenditures] = await Promise.all([
      api.get('/purchases'),
      api.get('/transfers'),
      api.get('/assignments'),
      api.get('/expenditures'),
    ]);

    const purchased = purchases.data
      .filter(p => p.asset_name === asset.name && p.base === asset.base)
      .reduce((sum, p) => sum + p.quantity, 0);

    const transferredIn = transfersRes.data
      .filter(t => t.asset_name === asset.name && t.to_base === asset.base)
      .reduce((sum, t) => sum + t.quantity, 0);

    const transferredOut = transfersRes.data
      .filter(t => t.asset_name === asset.name && t.from_base === asset.base)
      .reduce((sum, t) => sum + t.quantity, 0);

    const assigned = assignments.data
      .filter(a => a.asset_name === asset.name && a.base === asset.base && !a.returned)
      .reduce((sum, a) => sum + a.quantity, 0);

    const expended = expenditures.data
      .filter(e => e.asset_name === asset.name && e.base === asset.base)
      .reduce((sum, e) => sum + e.quantity, 0);

    setModal({
      ...asset,
      movements: { purchased, transferredIn, transferredOut, assigned, expended },
    });
  };

  // Client-side search filter
  const filteredAssets = assets.filter(a => {
    if (!filter.search) return true;
    return (
      a.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      a.base.toLowerCase().includes(filter.search.toLowerCase())
    );
  });

  const statCards = summary ? [
    { label: 'Vehicles',   value: summary.totalByType.find(t => t.type === 'vehicle')?.total    ?? 0, color: '#4299e1' },
    { label: 'Weapons',    value: summary.totalByType.find(t => t.type === 'weapon')?.total     ?? 0, color: '#e53e3e' },
    { label: 'Ammunition', value: summary.totalByType.find(t => t.type === 'ammunition')?.total ?? 0, color: '#f6ad55' },
    { label: 'Equipment',  value: summary.totalByType.find(t => t.type === 'equipment')?.total  ?? 0, color: '#68d391' },
  ] : [];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back, {user.name}</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label} style={{ borderTop: `4px solid ${s.color}` }}>
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Asset Inventory with Filters */}
      <div className="section-card">
        <div className="section-header">
          <h3>Asset Inventory</h3>
          <div className="filters">
            {/* Search */}
            <input
              className="search-input"
              type="text"
              placeholder="Search assets..."
              value={filter.search}
              onChange={e => setFilter({ ...filter, search: e.target.value })}
            />

            {/* Base filter — admins only */}
            {user.role === 'admin' && (
              <select
                value={filter.base}
                onChange={e => setFilter({ ...filter, base: e.target.value })}
              >
                <option value="">All Bases</option>
                <option value="Alpha Base">Alpha Base</option>
                <option value="Bravo Base">Bravo Base</option>
              </select>
            )}

            {/* Type filter */}
            <select
              value={filter.type}
              onChange={e => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="vehicle">Vehicle</option>
              <option value="weapon">Weapon</option>
              <option value="ammunition">Ammunition</option>
              <option value="equipment">Equipment</option>
            </select>

            {/* Clear filters */}
            {(filter.base || filter.type || filter.search) && (
              <button
                className="clear-btn"
                onClick={() => setFilter({ base: '', type: '', search: '' })}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <p className="hint-text">Click any row to see net movement detail</p>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Base</th>
                <th>Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(a => (
                <tr
                  key={a.id}
                  onClick={() => handleRowClick(a)}
                  className="clickable-row"
                >
                  <td>{a.name}</td>
                  <td><span className={`badge badge-${a.type}`}>{a.type}</span></td>
                  <td>{a.base}</td>
                  <td>{a.quantity.toLocaleString()}</td>
                  <td>{a.unit}</td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty">No assets found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Activity */}
      {summary && (
        <div className="section-card">
          <h3>Recent Activity</h3>
          <div className="two-col">
            <div>
              <h4>Recent Purchases</h4>
              {summary.recentPurchases.length === 0 && <p className="empty-small">None yet</p>}
              {summary.recentPurchases.map(p => (
                <div key={p.id} className="activity-item">
                  <span>{p.asset_name}</span>
                  <span className="activity-meta">+{p.quantity} · {p.base}</span>
                </div>
              ))}
            </div>
            <div>
              <h4>Recent Transfers</h4>
              {summary.recentTransfers.length === 0 && <p className="empty-small">None yet</p>}
              {summary.recentTransfers.map(t => (
                <div key={t.id} className="activity-item">
                  <span>{t.asset_name}</span>
                  <span className="activity-meta">{t.from_base} → {t.to_base}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Net Movement Modal */}
      <NetMovementModal item={modal} onClose={() => setModal(null)} />
    </div>
  );
}