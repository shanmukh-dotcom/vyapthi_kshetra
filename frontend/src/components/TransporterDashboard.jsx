import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle2, ArrowRight, Play, Package, CheckCheck } from 'lucide-react';
import ProgressTracker from './ProgressTracker';

export default function TransporterDashboard({ booking, onUpdateStatus }) {
  const [activeTab, setActiveTab] = useState('ASSIGNED');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (!booking) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(booking.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const p = booking?.provider;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>🚚 Transporter Carrier Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {p ? `${p.name} (${p.vehicle_type} - ${p.vehicle_number})` : 'Sri Panduranga Lorry Transport'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '0.25rem', borderRadius: '0.75rem' }}>
          <button
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'ASSIGNED' ? 'white' : 'transparent',
              color: activeTab === 'ASSIGNED' ? '#0f172a' : '#64748b'
            }}
            onClick={() => setActiveTab('ASSIGNED')}
          >
            Assigned Jobs ({booking ? 1 : 0})
          </button>
          <button
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'COMPLETED' ? 'white' : 'transparent',
              color: activeTab === 'COMPLETED' ? '#0f172a' : '#64748b'
            }}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Completed Jobs ({booking?.booking_status === 'DELIVERED' ? 1 : 0})
          </button>
        </div>
      </div>

      {!booking ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Truck size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Active Job Assignments</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>When a farmer books your vehicle for crop transport, job cards will populate here instantly.</p>
        </div>
      ) : (
        <>
          <ProgressTracker currentStatus={booking.booking_status} />

          <div className="card" style={{ borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge-capacity" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  JOB ID #{booking.id.slice(-6)}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  🥔 {booking.crop} Transport — {booking.quantity_kg.toLocaleString()} kg
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Estimated Freight Payment</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                  ₹{booking.estimated_cost.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: '#059669' }}>📍 Pickup:</strong><br />
                {booking.farmer?.name || 'Farmer'} ({booking.pickup_address || 'Krishna District Farm'})
              </div>

              <div>
                <strong style={{ color: '#ef4444' }}>🏭 Delivery:</strong><br />
                {booking.buyer?.name || 'Factory'} ({booking.delivery_address || 'Vijayawada Processing Plant'})
              </div>

              <div>
                <strong>🚚 Assigned Vehicle:</strong><br />
                {booking.provider?.vehicle_type} ({booking.provider?.vehicle_number})
              </div>

              <div>
                <strong>🛣 Route Distance:</strong><br />
                {booking.distance_km} km ({booking.estimated_duration})
              </div>
            </div>

            {/* ACTION SIMULATION BUTTONS FOR DEMO */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.85rem' }}>
                ⚡ Hackathon Demo — Driver Lifecycle Status Control
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleStatusChange('PICKUP_ASSIGNED')}
                  disabled={isUpdating || booking.booking_status === 'PICKUP_ASSIGNED'}
                  style={{ background: booking.booking_status === 'PICKUP_ASSIGNED' ? '#dcfce7' : '' }}
                >
                  <Play size={16} /> 1. ACCEPT JOB & ASSIGN PICKUP
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleStatusChange('PICKED_UP')}
                  disabled={isUpdating || booking.booking_status === 'PICKED_UP'}
                  style={{ background: booking.booking_status === 'PICKED_UP' ? '#dcfce7' : '' }}
                >
                  <Package size={16} /> 2. MARK CROP PICKED UP
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleStatusChange('IN_TRANSIT')}
                  disabled={isUpdating || booking.booking_status === 'IN_TRANSIT'}
                  style={{ background: booking.booking_status === 'IN_TRANSIT' ? '#dcfce7' : '' }}
                >
                  <Truck size={16} /> 3. START DELIVERY (IN TRANSIT)
                </button>

                <button
                  className="btn-primary"
                  onClick={() => handleStatusChange('DELIVERED')}
                  disabled={isUpdating || booking.booking_status === 'DELIVERED'}
                  style={{ background: booking.booking_status === 'DELIVERED' ? '#15803d' : '#059669', flex: '1 1 auto', minWidth: '180px' }}
                >
                  <CheckCheck size={18} /> 4. MARK SHIPMENT DELIVERED
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
