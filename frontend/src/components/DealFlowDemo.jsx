import React, { useState } from 'react';
import { Sprout, Store, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { acceptDeal, matchTransporters } from '../services/api';

export default function DealFlowDemo({ onTransportTriggered }) {
  const [dealState, setDealState] = useState({
    deal_id: "deal_potato_88",
    farmer_name: "Rambabu (Farmer)",
    farmer_lat: 16.506,
    farmer_lng: 80.648,
    farmer_address: "Gudivada Road, Krishna District",
    factory_name: "Vijayawada Agro Processing Factory",
    factory_lat: 16.518,
    factory_lng: 80.619,
    factory_address: "Auto Nagar Industrial Park, Vijayawada",
    crop: "Potato",
    quantity_kg: 2000,
    price_total: 50000,
    farmer_accepted: true,
    buyer_accepted: true,
    deal_status: "ACCEPTED"
  });

  const [loading, setLoading] = useState(false);

  const handleSimulateAccept = async () => {
    setLoading(true);
    try {
      // Trigger match endpoint directly
      const matchRes = await matchTransporters({
        deal_id: dealState.deal_id,
        farmer_lat: dealState.farmer_lat,
        farmer_lng: dealState.farmer_lng,
        factory_lat: dealState.factory_lat,
        factory_lng: dealState.factory_lng,
        quantity_kg: dealState.quantity_kg,
        crop: dealState.crop
      });

      onTransportTriggered(matchRes);
    } catch (err) {
      alert("Matching error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #10b981', background: '#f0fdf4' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: '#059669', color: 'white', padding: '0.4rem', borderRadius: '0.5rem' }}>
            <Zap size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b' }}>
              Step 1: Deal Acceptance & Automatic Transport Trigger
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#047857' }}>
              Simulates farmer and buyer deal agreement. Clicking trigger automatically fetches match details without re-entering data.
            </p>
          </div>
        </div>

        <span className="badge-verified" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
          <CheckCircle2 size={14} /> DEAL STATUS: {dealState.deal_status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', border: '1px solid #dcfce7' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>FARMER SUPPLIER</span>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>{dealState.farmer_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {dealState.farmer_address}</div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>BUYER / FACTORY</span>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>{dealState.factory_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>🏭 {dealState.factory_address}</div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>COMMODITY & QUANTITY</span>
          <div style={{ fontWeight: 800, color: '#059669' }}>🥔 {dealState.crop} • {dealState.quantity_kg.toLocaleString()} kg</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Deal Price: ₹{dealState.price_total.toLocaleString()}</div>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleSimulateAccept}
        disabled={loading}
        style={{ width: 'auto', padding: '0.75rem 1.75rem', fontSize: '1rem' }}
      >
        {loading ? 'Finding Transporters...' : 'TRIGGER AUTOMATIC TRANSPORT MATCHING'} <ArrowRight size={18} />
      </button>
    </div>
  );
}
