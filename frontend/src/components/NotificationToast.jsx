import React from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';

export default function NotificationToast({ notifications = [], onClose }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map((n, i) => (
        <div key={i} className="toast">
          <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <h5 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{n.title}</h5>
            <p style={{ fontSize: '0.8rem', opacity: 0.85 }}>{n.message}</p>
          </div>
          <button
            onClick={() => onClose(i)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7 }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
