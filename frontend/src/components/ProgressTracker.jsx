import React from 'react';
import { CheckCircle2, Circle, Clock, Truck, Package, Factory, CheckCheck } from 'lucide-react';

const STAGES = [
  { key: 'ACCEPTED', label: 'Deal Accepted', icon: CheckCircle2 },
  { key: 'BOOKED', label: 'Transport Booked', icon: Truck },
  { key: 'PICKUP_ASSIGNED', label: 'Pickup Assigned', icon: Clock },
  { key: 'PICKED_UP', label: 'Crop Picked Up', icon: Package },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Factory },
];

export default function ProgressTracker({ currentStatus }) {
  const getStageIndex = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return 0;
      case 'SEARCHING':
      case 'AVAILABLE':
      case 'BOOKED': return 1;
      case 'PICKUP_ASSIGNED': return 2;
      case 'PICKED_UP': return 3;
      case 'IN_TRANSIT': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  const activeIndex = getStageIndex(currentStatus);
  const progressPercent = (activeIndex / (STAGES.length - 1)) * 100;

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Shipment Progress Tracker</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Live status updates from farm pickup to factory delivery</p>
        </div>
        <span style={{
          background: activeIndex === 5 ? '#dcfce7' : '#e0f2fe',
          color: activeIndex === 5 ? '#15803d' : '#0369a1',
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: 13,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          {activeIndex === 5 ? <CheckCheck size={14} /> : <Truck size={14} />}
          STATUS: {currentStatus || 'BOOKED'}
        </span>
      </div>

      <div className="timeline-container">
        <div className="timeline-track"></div>
        <div className="timeline-progress" style={{ width: `${progressPercent}%` }}></div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const IconComponent = stage.icon;

          return (
            <div
              key={stage.key}
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="step-node">
                {isCompleted ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <IconComponent size={18} />
                )}
              </div>
              <span className="step-label">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
