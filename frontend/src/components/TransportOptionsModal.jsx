import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, MapPin, ArrowRight, Check, X, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import TransportMap from './TransportMap';
import GeminiRecommendationCard from './GeminiRecommendationCard';
import { getAIRecommendation, matchTransporters } from '../services/api';

export default function TransportOptionsModal({ matchData, onSelectProvider, onSearchRadiusChange, onClose }) {
  const [selectedProvider, setSelectedProvider] = useState(matchData?.options?.[0] || null);
  const [confirmingProvider, setConfirmingProvider] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (matchData?.options?.length > 0) {
      setSelectedProvider(matchData.options[0]);
      fetchAiRecommendation(matchData);
    }
  }, [matchData]);

  const fetchAiRecommendation = async (data) => {
    setLoadingAi(true);
    try {
      const res = await getAIRecommendation({
        deal_id: data.deal_id,
        crop: data.crop,
        quantity_kg: data.quantity_kg,
        farmer_address: data.farmer_address,
        factory_address: data.factory_address,
        options: data.options
      });
      setAiRecommendation(res);
    } catch (err) {
      console.error("AI recommendation error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  if (!matchData) return null;

  const handleBookClick = (provider) => {
    setConfirmingProvider(provider);
  };

  const handleConfirmBooking = async () => {
    if (!confirmingProvider) return;
    setIsBooking(true);
    try {
      await onSelectProvider(confirmingProvider, matchData);
    } finally {
      setIsBooking(false);
      setConfirmingProvider(null);
    }
  };

  const handleRadiusClick = (radiusKm) => {
    if (onSearchRadiusChange) {
      onSearchRadiusChange(radiusKm);
    }
  };

  return (
    <div style={{ background: '#f8fafc', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>

      {/* Top Banner: Transport Required */}
      <div className="transport-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="banner-tag">
            <Truck size={14} />
            AUTOMATIC TRANSPORT MATCHING
          </div>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backdropFilter: 'blur(4px)'
          }}>
            DEMO DATA (MOCK TRANSPORTER SERVICE)
          </span>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.25rem 0' }}>
          Transport Required for Deal #{matchData.deal_id.slice(-6)}
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
          Showing all suitable transport providers near farmer pickup location for {matchData.quantity_kg.toLocaleString()} kg {matchData.crop}.
        </p>

        <div className="banner-grid">
          <div className="banner-item">
            <span className="label">Crop & Quantity</span>
            <span className="value">🥔 {matchData.crop} • {matchData.quantity_kg.toLocaleString()} kg</span>
          </div>

          <div className="banner-item">
            <span className="label">From (Farmer Pickup)</span>
            <span className="value">{matchData.farmer_name} ({matchData.farmer_address})</span>
          </div>

          <div className="banner-item">
            <span className="label">To (Factory Delivery)</span>
            <span className="value">{matchData.factory_name} ({matchData.factory_address})</span>
          </div>

          <div className="banner-item">
            <span className="label">Route Distance & Duration</span>
            <span className="value">
              {matchData.route_distance_km} km • {matchData.estimated_duration}
              {matchData.is_fallback_distance && (
                <span style={{ fontSize: '0.7rem', opacity: 0.8, display: 'block' }}>(Estimated road fallback)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Radius Expansion Controls */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem',
        borderRadius: '0.85rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
          <Compass size={18} color="#059669" />
          <span>Search Radius: {matchData.search_radius_km || 50} km</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Expand Radius:</span>
          {[10, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusClick(r)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                background: (matchData.search_radius_km === r) ? '#059669' : '#f8fafc',
                color: (matchData.search_radius_km === r) ? 'white' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* GEMINI AI RECOMMENDATION CARD */}
      <GeminiRecommendationCard
        recommendation={aiRecommendation}
        options={matchData.options}
        onSelectProvider={(p) => {
          setSelectedProvider(p);
          handleBookClick(p);
        }}
      />

      {/* Interactive Multi-Marker Leaflet Map */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="#059669" />
            Live Route & Nearby Fleet Map (All {matchData.options.length} Transporters)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Click blue map markers to inspect truck details
          </span>
        </div>

        <TransportMap
          farmerLat={matchData.farmer_lat}
          farmerLng={matchData.farmer_lng}
          farmerName={matchData.farmer_name}
          factoryLat={matchData.factory_lat}
          factoryLng={matchData.factory_lng}
          factoryName={matchData.factory_name}
          allTransporters={matchData.options}
          selectedTransporterId={selectedProvider?.id}
          onMarkerSelectTransporter={(p) => {
            setSelectedProvider(p);
            handleBookClick(p);
          }}
        />
      </div>

      {/* Available Transport Providers Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Available Suitable Transporters ({matchData.options.length})</span>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
          Sorted by proximity & payload capacity
        </span>
      </h3>

      {matchData.options.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Suitable Transporters Found Nearby</h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>
            No available vehicles found matching {matchData.quantity_kg.toLocaleString()} kg capacity within {matchData.search_radius_km || 50} km.
          </p>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => handleRadiusClick(50)}>
            Expand Search Radius to 50 km
          </button>
        </div>
      ) : (
        <div className="providers-grid">
          {matchData.options.map((provider) => {
            const isSelected = selectedProvider?.id === provider.id;

            return (
              <div
                key={provider.id}
                className={`provider-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      🚚 {provider.name}
                    </h4>
                    {provider.verified && (
                      <span className="badge-verified">
                        <ShieldCheck size={13} /> Verified
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                    <span className="badge-capacity">
                      Vehicle: {provider.vehicle_type} ({provider.vehicle_number})
                    </span>
                    <span className="badge-capacity">
                      Capacity: {provider.capacity_kg.toLocaleString()} kg
                    </span>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                      MOCK SERVICE
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', margin: '0.75rem 0' }}>
                    <div>📍 <strong>Distance:</strong> {provider.distance_from_farmer_km} km</div>
                    <div>⏱️ <strong>ETA:</strong> {provider.eta_minutes || 15} min</div>
                    <div>🛣️ <strong>Route:</strong> {provider.route_distance_km} km</div>
                    <div>📅 <strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>Available</span></div>
                  </div>

                  <div className="cost-highlight">
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#047857', fontWeight: 700, display: 'block' }}>
                        Estimated Freight Cost
                      </span>
                      <span className="cost-amount">
                        ₹{provider.estimated_cost.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="cost-sub">
                        ₹{provider.cost_per_kg.toFixed(2)}/kg
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>
                        ({provider.rate_per_km}/km)
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProvider(provider);
                    }}
                  >
                    View on Map
                  </button>

                  <button
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '0.6rem', fontSize: '0.85rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProvider(provider);
                      handleBookClick(provider);
                    }}
                  >
                    Select Transporter <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOKING CONFIRMATION MODAL */}
      {confirmingProvider && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Confirm Transport Booking
              </h3>
              <button
                onClick={() => setConfirmingProvider(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div><strong>Crop:</strong> {matchData.crop}</div>
                <div><strong>Quantity:</strong> {matchData.quantity_kg.toLocaleString()} kg</div>
                <div><strong>Farmer Pickup:</strong> {matchData.farmer_name}</div>
                <div><strong>Factory Delivery:</strong> {matchData.factory_name}</div>
                <div><strong>Transporter:</strong> {confirmingProvider.name}</div>
                <div><strong>Vehicle:</strong> {confirmingProvider.vehicle_type} ({confirmingProvider.vehicle_number})</div>
                <div><strong>Total Distance:</strong> {matchData.route_distance_km} km</div>
                <div><strong>Estimated Cost:</strong> ₹{confirmingProvider.estimated_cost.toLocaleString()}</div>
                <div><strong>Cost per kg:</strong> ₹{confirmingProvider.cost_per_kg.toFixed(2)}/kg</div>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
              * Estimated cost is computed using ₹{confirmingProvider.rate_per_km}/km rate for {matchData.route_distance_km} km. Confirmation sends instant pickup notifications to farmer & factory.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setConfirmingProvider(null)}
                disabled={isBooking}
              >
                CANCEL
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2 }}
                onClick={handleConfirmBooking}
                disabled={isBooking}
              >
                {isBooking ? 'BOOKING...' : 'CONFIRM BOOKING'} <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
