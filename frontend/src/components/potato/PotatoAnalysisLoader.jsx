import React, { useState, useEffect } from 'react';
import { Loader2, Eye, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';

export default function PotatoAnalysisLoader() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "Vision Model scanning tuber surface features...", icon: Eye },
    { label: "Checking defects (scab, rot, bruising, blackleg)...", icon: ShieldCheck },
    { label: "Computing deterministic A/B/C/D quality grade...", icon: Sparkles },
    { label: "Retrieving agricultural RAG knowledge & advice...", icon: BookOpen },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #d1fae5',
        borderRadius: '1.25rem',
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: '0 15px 35px -5px rgba(5, 150, 105, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        margin: '1.5rem 0'
      }}
    >
      {/* Animated Spinner Icon */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            boxShadow: '0 0 0 10px rgba(16, 185, 129, 0.12)'
          }}
        >
          <Loader2 size={42} className="spin-animation" style={{ animation: 'spin 1.2s linear infinite' }} />
        </div>
      </div>

      {/* Main Status Text */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.4rem' }}>
          Analyzing your potatoes...
        </h3>
        <p style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 600 }}>
          AI is checking quality and defects.
        </p>
      </div>

      {/* Step Indicators */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '480px',
          width: '100%',
          marginTop: '0.5rem',
          textAlign: 'left'
        }}
      >
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: '0.75rem',
                backgroundColor: isCurrent ? '#f0fdf4' : isDone ? '#f8fafc' : '#ffffff',
                border: `1px solid ${isCurrent ? '#86efac' : isDone ? '#cbd5e1' : '#f1f5f9'}`,
                color: isCurrent ? '#047857' : isDone ? '#334155' : '#94a3b8',
                fontWeight: isCurrent ? 700 : 500,
                fontSize: '0.88rem',
                transition: 'all 0.3s ease'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCurrent ? '#059669' : isDone ? '#10b981' : '#e2e8f0',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span style={{ flexGrow: 1 }}>{step.label}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
