import React from 'react';
import { Sprout, Truck, Store, UserCheck, Bell } from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, notificationCount = 0 }) {
  return (
    <header className="app-header">
      <div className="nav-container">
        <div className="brand">
          <div className="brand-icon">
            <Sprout size={24} />
          </div>
          <div>
            <span>Vyapti Kshetra</span>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, letterSpacing: '0.04em' }}>
              AGRI-COMMERCE LOGISTICS ENGINE
            </div>
          </div>
        </div>

        <div className="role-switcher">
          <button
            className={`role-btn ${activeRole === 'DEMO_FLOW' ? 'active' : ''}`}
            onClick={() => setActiveRole('DEMO_FLOW')}
          >
            <UserCheck size={16} />
            <span>Deal & Auto Transport Flow</span>
          </button>

          <button
            className={`role-btn ${activeRole === 'POTATO_AI' ? 'active' : ''}`}
            onClick={() => setActiveRole('POTATO_AI')}
            style={activeRole === 'POTATO_AI' ? { color: '#047857', fontWeight: 700 } : {}}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>🥔</span>
            <span>AI Quality Grading</span>
          </button>

          <button
            className={`role-btn ${activeRole === 'FARMER' ? 'active' : ''}`}
            onClick={() => setActiveRole('FARMER')}
          >
            <Sprout size={16} />
            <span>Farmer View</span>
          </button>

          <button
            className={`role-btn ${activeRole === 'BUYER' ? 'active' : ''}`}
            onClick={() => setActiveRole('BUYER')}
          >
            <Store size={16} />
            <span>Factory / Buyer View</span>
          </button>

          <button
            className={`role-btn ${activeRole === 'TRANSPORTER' ? 'active' : ''}`}
            onClick={() => setActiveRole('TRANSPORTER')}
          >
            <Truck size={16} />
            <span>Transporter Dashboard</span>
          </button>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.4rem 0.8rem', borderRadius: '0.6rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bell size={16} />
            <span>Notifications ({notificationCount})</span>
          </div>
        </div>
      </div>
    </header>
  );
}
