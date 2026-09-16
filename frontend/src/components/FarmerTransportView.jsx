import React from 'react';
import { Sprout, MapPin, Truck, CheckCircle2, Clock, Phone, ArrowRight } from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import TransportMap from './TransportMap';
import TransportOptionsModal from './TransportOptionsModal';

export default function FarmerTransportView({ booking, matchData, onSelectProvider, onSearchRadiusChange, onNavigateToPotatoAI }) {
  if (!booking) {
    if (matchData) {
      return (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>🚜 Farmer View — Nearby Transporters</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Select a suitable transporter for your 2,000 kg Potato deal shipment</p>
            </div>
            {onNavigateToPotatoAI && (
              <button
                type="button"
                onClick={onNavigateToPotatoAI}
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1.5px solid #10b981',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <span>🥔 Check Potato Quality with AI</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
          <TransportOptionsModal
            matchData={matchData}
            onSelectProvider={onSelectProvider}
            onSearchRadiusChange={onSearchRadiusChange}
            onClose={() => {}}
          />
        </div>
      );
    }

    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <Sprout size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Active Transport Bookings</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          When a deal is accepted by both you and the factory, your automated transport options will populate here instantly.
        </p>
        {onNavigateToPotatoAI && (
          <button
            type="button"
            onClick={onNavigateToPotatoAI}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              marginTop: '1.5rem'
            }}
          >
            <span>🥔 Check Potato Quality with AI</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  }

  const p = booking.provider;
  const f = booking.farmer;
  const b = booking.buyer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>🚜 My Transport Tracking</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Farmer View • Booking ID #{booking.id.slice(-6)}</p>
        </div>
        {onNavigateToPotatoAI && (
          <button
            type="button"
            onClick={onNavigateToPotatoAI}
            style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1.5px solid #10b981',
              padding: '0.6rem 1.1rem',
              borderRadius: '0.75rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <span>🥔 Check Potato Quality with AI</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      <ProgressTracker currentStatus={booking.booking_status} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Shipment Details Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#064e3b' }}>
            📦 Crop & Route Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div><span style={{ color: '#64748b' }}>Crop:</span><br /><strong>🥔 {booking.crop}</strong></div>
            <div><span style={{ color: '#64748b' }}>Quantity:</span><br /><strong>{booking.quantity_kg.toLocaleString()} kg</strong></div>
            <div><span style={{ color: '#64748b' }}>Buyer / Factory:</span><br /><strong>{b?.name || 'Vijayawada Factory'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Distance:</span><br /><strong>{booking.distance_km} km</strong></div>
            <div><span style={{ color: '#64748b' }}>Est. Travel Time:</span><br /><strong>{booking.estimated_duration}</strong></div>
            <div><span style={{ color: '#64748b' }}>Est. Cost:</span><br /><strong>₹{booking.estimated_cost.toLocaleString()} (₹{booking.cost_per_kg.toFixed(2)}/kg)</strong></div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '0.4rem' }}>
              📍 <strong>Pickup Location:</strong> {booking.pickup_address || f?.address || 'Krishna District Farm'}
            </div>
            <div>
              🏭 <strong>Delivery Destination:</strong> {booking.delivery_address || b?.address || 'Vijayawada Industrial Plant'}
            </div>
          </div>
        </div>

        {/* Transporter Info Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#0369a1' }}>
            🚚 Assigned Transporter
          </h3>

          {p ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{p.name}</h4>
                {p.verified && (
                  <span className="badge-verified">
                    <CheckCircle2 size={13} /> Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge-capacity">Vehicle: {p.vehicle_type}</span>
                <span className="badge-capacity">Reg: {p.vehicle_number}</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0369a1' }}>
                  <Phone size={16} /> Contact: {p.phone}
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                The transporter will call you prior to arriving at your farm for pickup.
              </p>
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>No transporter details assigned yet.</p>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>🗺 Live Delivery Route Map</h3>
        <TransportMap
          farmerLat={booking.pickup_lat}
          farmerLng={booking.pickup_lng}
          farmerName={f?.name || "My Farm"}
          factoryLat={booking.delivery_lat}
          factoryLng={booking.delivery_lng}
          factoryName={b?.name || "Factory Delivery"}
          allTransporters={p ? [p] : []}
          selectedTransporterId={p?.id}
        />
      </div>
    </div>
  );
}
