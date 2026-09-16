import React from 'react';
import { Bot, Lightbulb, BookOpen, CheckCircle, ExternalLink } from 'lucide-react';

export default function PotatoRecommendation({ explanation = "", recommendations = [], knowledgeSources = [] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}
    >
      {/* AI Explanation Card */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '1.25rem',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '0.6rem',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Quality Reason & AI Explanation</h3>
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Analyzed using Vision AI + Agricultural Knowledge Base</span>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.98rem',
            lineHeight: 1.6,
            color: '#334155',
            backgroundColor: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '0.85rem',
            borderLeft: '4px solid #059669',
            margin: 0
          }}
        >
          {explanation || "Your potato batch has been evaluated based on standard agricultural quality specifications and visual surface defect incidence."}
        </p>

        {/* Knowledge Source Citations */}
        {knowledgeSources && knowledgeSources.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RAG Knowledge Base Citations
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {knowledgeSources.map((src, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#f1f5f9',
                    color: '#047857',
                    border: '1px solid #e2e8f0',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '0.4rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <BookOpen size={12} />
                  <span>{src}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Actions Card */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '1.25rem',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '0.6rem',
              backgroundColor: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706'
            }}
          >
            <Lightbulb size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>AI Recommendation</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Post-Harvest Storage & Market Action</span>
          </div>
        </div>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: 0, margin: 0, listStyle: 'none' }}>
          {(recommendations && recommendations.length > 0 ? recommendations : [
            "Store potatoes in cool, dry conditions between 7°C and 10°C with adequate ventilation.",
            "Avoid exposure to direct sunlight to prevent greening and solanine accumulation.",
            "Handle bags gently during transport loading to minimize blackspot impact bruising."
          ]).map((rec, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontSize: '0.92rem',
                color: '#334155',
                lineHeight: 1.45
              }}
            >
              <CheckCircle size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
