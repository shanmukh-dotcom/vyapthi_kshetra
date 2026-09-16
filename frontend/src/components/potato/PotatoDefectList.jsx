import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function PotatoDefectList({ defects = [], predictions = [] }) {
  const hasDefects = defects && defects.length > 0;

  const severityBadge = (severity = 'moderate') => {
    const s = severity.toLowerCase();
    if (s === 'critical') {
      return { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', label: 'CRITICAL SEVERITY' };
    }
    if (s === 'severe') {
      return { bg: '#fff7ed', border: '#f97316', text: '#c2410c', label: 'SEVERE DEFECT' };
    }
    if (s === 'moderate') {
      return { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', label: 'MODERATE DEFECT' };
    }
    return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', label: 'MINOR BLEMISH' };
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '1.25rem',
        padding: '1.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasDefects ? (
            <ShieldAlert size={22} color="#f59e0b" />
          ) : (
            <ShieldCheck size={22} color="#059669" />
          )}
          <span>Detected Defect Analysis</span>
        </h3>

        <span
          style={{
            fontSize: '0.8rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontWeight: 700,
            backgroundColor: hasDefects ? '#fffbeb' : '#ecfdf5',
            color: hasDefects ? '#b45309' : '#047857',
            border: `1px solid ${hasDefects ? '#fcd34d' : '#a7f3d0'}`
          }}
        >
          {hasDefects ? `${defects.length} Defect Type${defects.length > 1 ? 's' : ''} Identified` : 'Clean / Defect-Free Batch'}
        </span>
      </div>

      {/* No Defects Banner */}
      {!hasDefects && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: '#065f46'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)'
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Healthy / No Major Defect Detected</h4>
            <p style={{ fontSize: '0.9rem', color: '#047857', marginTop: '0.25rem' }}>
              Tubers display smooth skin, normal pigmentation, and zero fungal decay or deep impact blackspots.
            </p>
          </div>
        </div>
      )}

      {/* Defect Cards List */}
      {hasDefects && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {defects.map((defect, idx) => {
            const sev = severityBadge(defect.severity);
            const confPct = Math.round((defect.confidence || 0) * 100);
            const title = defect.display_name || defect.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: `1.5px solid ${sev.border}`,
                  borderRadius: '0.9rem',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.4rem',
                        backgroundColor: sev.bg,
                        color: sev.text,
                        border: `1px solid ${sev.border}`
                      }}
                    >
                      {sev.label}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
                      {title}
                    </h4>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Confidence</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: sev.text }}>{confPct}%</div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${confPct}%`,
                      height: '100%',
                      backgroundColor: sev.border,
                      borderRadius: '9999px'
                    }}
                  />
                </div>

                {defect.evidence && (
                  <p style={{ fontSize: '0.85rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', margin: 0, borderLeft: `3px solid ${sev.border}` }}>
                    <strong>Visible Evidence:</strong> {defect.evidence}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Per-Image Prediction Breakdown if Available */}
      {predictions && predictions.length > 0 && (
        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ImageIcon size={16} color="#64748b" />
            <span>Multi-Image Vision Model Predictions</span>
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {predictions.map((p, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: p.is_healthy ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${p.is_healthy ? '#86efac' : '#fcd34d'}`,
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.6rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontWeight: 700, color: '#1e293b' }}>Image {idx + 1}:</span>
                <span style={{ fontWeight: 600, color: p.is_healthy ? '#047857' : '#b45309' }}>
                  {p.display_name || p.class}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({Math.round((p.confidence || 0) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
