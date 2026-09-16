import React from 'react';
import { Bot, Check, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export default function GeminiRecommendationCard({ recommendation, options = [], onSelectProvider }) {
  if (!recommendation) return null;

  const recId = recommendation.recommended_transporter_id;
  const recommendedProvider = options.find((o) => o.id === recId) || options[0];

  if (!recommendedProvider) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      color: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: '#6366f1', padding: '0.45rem', borderRadius: '0.6rem', color: 'white', display: 'flex' }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                Gemini AI Recommendation
              </span>
              <span style={{ background: '#818cf8', color: '#1e1b4b', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase' }}>
                Decision Support
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              Analyzing real fleet capacity, road distance, cost, and ETA for this shipment
            </p>
          </div>
        </div>

        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontWeight: 600 }}>
          ⭐ Best Match Choice
        </span>
      </div>

      {/* Main Reason Banner */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(8px)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        borderLeft: '4px solid #818cf8',
        fontSize: '0.925rem',
        lineHeight: 1.55
      }}>
        "{recommendation.reason}"
      </div>

      {/* Why This Transporter? Bullet Points */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} /> Why this transporter?
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
          {recommendation.why_points?.map((pt, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.95 }}>
              <Check size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            Recommended Freight Option
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            🚚 {recommendedProvider.name} (₹{recommendedProvider.estimated_cost.toLocaleString()})
          </span>
        </div>

        <button
          className="btn-primary"
          onClick={() => onSelectProvider(recommendedProvider)}
          style={{ width: 'auto', background: '#6366f1', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
        >
          Select AI Choice <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
