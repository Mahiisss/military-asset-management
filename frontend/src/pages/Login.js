
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/'); // redirect to dashboard
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>⚔ KristalBall</h1>
        <p className="subtitle">Military Asset Management System</p>

        {error && <div className="error-banner">{error}</div>}

        <div>
          <label>Email</label>
          <input
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="admin@mil.gov"
          />

          <label>Password</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </div>

        <div className="demo-creds">
          <p>Demo credentials:</p>
          <code>admin@mil.gov / admin123</code><br />
          <code>commander@mil.gov / commander123</code><br />
          <code>officer@mil.gov / officer123</code>
        </div>
      </div>
    </div>
  );
}

