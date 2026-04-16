import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">⚔ KristalBall</span>
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-role">{user.role.replace('_', ' ')}</p>
            {user.base && <p className="user-base">{user.base}</p>}
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/"            end>Dashboard</NavLink>
          <NavLink to="/purchases">Purchases</NavLink>
          <NavLink to="/transfers">Transfers</NavLink>
          <NavLink to="/assignments">Assignments</NavLink>
          <NavLink to="/expenditures">Expenditures</NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}