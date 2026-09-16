import React from 'react';
import { Factory, Truck, CheckCircle2, PackageCheck, MapPin } from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import TransportMap from './TransportMap';
import TransportOptionsModal from './TransportOptionsModal';

export default function BuyerShipmentView({ booking, matchData, onSelectProvider, onSearchRadiusChange }) {
  if (!booking) {
    if (matchData) {
      return (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>🏭 Factory View — Available Transport for Deal #{matchData.deal_id.slice(-6)}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review available transport carriers for incoming potato consignment</p>
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
        <Factory size={48} color="#0369a1" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Incoming Shipments</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          When you accept a deal with a farmer, live shipment transport options will appear here automatically.
        </p>
      </div>
    );
  }

  const p = booking.provider;
  const f = booking.farmer;
  const b = booking.buyer;
  const isDelivered = booking.booking_status === 'DELIVERED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>🏭 My Incoming Shipment</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Factory Procurement View • Deal #{booking.deal_id.slice(-6)}</p>
        </div>

        {isDelivered && (
          <div style={{
            background: '#dcfce7',
            color: '#15803d',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <PackageCheck size={20} /> Shipment Delivered
          </div>
        )}
      </div>

      <ProgressTracker currentStatus={booking.booking_status} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Shipment Overview Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#0369a1' }}>
            📦 Consignment Overview
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div><span style={{ color: '#64748b' }}>Farmer / Supplier:</span><br /><strong>{f?.name || 'Krishna District Farmer'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Crop Type:</span><br /><strong>🥔 {booking.crop}</strong></div>
            <div><span style={{ color: '#64748b' }}>Total Weight:</span><br /><strong>{booking.quantity_kg.toLocaleString()} kg</strong></div>
            <div><span style={{ color: '#64748b' }}>Total Distance:</span><br /><strong>{booking.distance_km} km</strong></div>
            <div><span style={{ color: '#64748b' }}>Expected Arrival:</span><br /><strong>{booking.estimated_duration}</strong></div>
            <div><span style={{ color: '#64748b' }}>Transport Cost:</span><br /><strong>₹{booking.estimated_cost.toLocaleString()}</strong></div>
          </div>
        </div>

        {/* Transporter Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#059669' }}>
            🚚 Logistics Carrier
          </h3>

          {p ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{p.name}</h4>
                {p.verified && (
                  <span className="badge-verified"><CheckCircle2 size={13} /> Verified</span>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Vehicle: <strong>{p.vehicle_type} ({p.vehicle_number})</strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Phone: <strong>{p.phone}</strong>
              </p>
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>Transporter details pending.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>🗺 Delivery Route Map</h3>
        <TransportMap
          farmerLat={booking.pickup_lat}
          farmerLng={booking.pickup_lng}
          farmerName={f?.name || "Farmer Farm"}
          factoryLat={booking.delivery_lat}
          factoryLng={booking.delivery_lng}
          factoryName={b?.name || "Our Factory"}
          allTransporters={p ? [p] : []}
          selectedTransporterId={p?.id}
        />
      </div>
    </div>
  );
}
