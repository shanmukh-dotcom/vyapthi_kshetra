import React from 'react';
import { Award, CheckCircle2, TrendingUp, Sparkles, Scale, Info } from 'lucide-react';

export default function PotatoGradeResult({ result }) {
  if (!result) return null;

  const {
    grade = 'B',
    quality_score = 75,
    crop = 'Potato',
    images_analyzed = 1,
    score_breakdown = {}
  } = result;

  const gradeColors = {
    A: {
      badgeBg: '#ecfdf5',
      badgeBorder: '#10b981',
      badgeText: '#047857',
      label: 'GRADE A',
      title: 'Premium Quality / Industrial Processing Grade',
      desc: 'High dry-matter content with minimal superficial blemish. Eligible for premium pricing and factory contracts.'
    },
    B: {
      badgeBg: '#f0f9ff',
      badgeBorder: '#0ea5e9',
      badgeText: '#0369a1',
      label: 'GRADE B',
      title: 'Standard Commercial Grade',
      desc: 'Good commercial quality with minor non-pathogenic scuffing or scab. Well-suited for wholesale markets.'
    },
    C: {
      badgeBg: '#fffbeb',
      badgeBorder: '#f59e0b',
      badgeText: '#b45309',
      label: 'GRADE C',
      title: 'Moderate Quality / Table Grade',
      desc: 'Noticeable surface defects or blemishes. Suitable for immediate local consumption; avoid prolonged storage.'
    },
    D: {
      badgeBg: '#fef2f2',
      badgeBorder: '#ef4444',
      badgeText: '#b91c1c',
      label: 'GRADE D',
      title: 'Sub-Standard Quality / High Defect Incidence',
      desc: 'High incidence of rot, decay, or severe bruising. Segregate immediately to prevent contagion.'
    }
  };

  const currentGrade = gradeColors[grade] || gradeColors.B;
  const score = Math.round(quality_score);

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: `2px solid ${currentGrade.badgeBorder}`,
        borderRadius: '1.25rem',
        padding: '2rem',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Banner Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: currentGrade.badgeBorder
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} />
            <span>Analyzed using Vision AI + Agricultural Knowledge Base</span>
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span>Potato Quality Result</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontWeight: 600 }}>
            🥔 {crop}
          </span>
          <span style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontWeight: 600 }}>
            📸 {images_analyzed} Photo{images_analyzed > 1 ? 's' : ''} Analyzed
          </span>
        </div>
      </div>

      {/* Main Grade and Score Hero Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
          backgroundColor: currentGrade.badgeBg,
          padding: '1.75rem',
          borderRadius: '1rem',
          border: `1.5px solid ${currentGrade.badgeBorder}`
        }}
      >
        {/* Big Grade Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '1rem',
              backgroundColor: 'white',
              border: `3px solid ${currentGrade.badgeBorder}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>GRADE</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: currentGrade.badgeText, lineHeight: 1 }}>{grade}</span>
          </div>

          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: currentGrade.badgeText }}>
              {currentGrade.label}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginTop: '0.15rem' }}>
              {currentGrade.title}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem', lineHeight: 1.4 }}>
              {currentGrade.desc}
            </p>
          </div>
        </div>

        {/* Quality Score Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Overall Quality Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: currentGrade.badgeText }}>{score}</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>/ 100</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(Math.max(score, 5), 100)}%`,
                height: '100%',
                backgroundColor: currentGrade.badgeBorder,
                borderRadius: '9999px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
            <span>Grade D (&lt;50)</span>
            <span>Grade C (50-69)</span>
            <span>Grade B (70-84)</span>
            <span>Grade A (85-100)</span>
          </div>
        </div>
      </div>

      {/* Sub-score Breakdown Cards */}
      {score_breakdown && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Scale size={16} color="#059669" />
            <span>Deterministic Quality Sub-Score Breakdown</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Freshness</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {score_breakdown.freshness ?? '--'} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/35</span>
              </div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Defect-Free</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {score_breakdown.defect_free ?? '--'} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/25</span>
              </div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Ripeness</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {score_breakdown.ripeness ?? '--'} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/20</span>
              </div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Uniformity</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {score_breakdown.uniformity ?? '--'} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/20</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
