import React from 'react';
import { getRiskAssessment } from '../../utils/risk';

export default function RiskGauge({ score = 31, breakdown = { seaIce: 14, icebergs: 7, weather: 6, ocean: 4 } }) {
  const assessment = getRiskAssessment(score);

  const factors = [
    { label: 'Sea Ice Pack', val: breakdown.seaIce ?? 14, color: 'var(--accent-ice)' },
    { label: 'Icebergs Proximity', val: breakdown.icebergs ?? 7, color: 'var(--risk-moderate)' },
    { label: 'Wind / Weather', val: breakdown.weather ?? 6, color: '#9DB2C6' },
    { label: 'Ocean Current & Waves', val: breakdown.ocean ?? 4, color: 'var(--accent-ocean)' }
  ];

  return (
    <div className="tech-card" style={{ padding: '14px' }}>
      <div className="flex-between" style={{ marginBottom: '10px' }}>
        <span className="technical-label">Composite Navigation Risk Score</span>
        <span
          className="mono-readout"
          style={{
            fontSize: '11px',
            color: assessment.color,
            fontWeight: 600,
            padding: '2px 6px',
            background: assessment.bg,
            border: `1px solid ${assessment.border}`,
            borderRadius: 'var(--radius-xs)'
          }}
        >
          {assessment.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span className="mono-readout" style={{ fontSize: '26px', fontWeight: 700, color: assessment.color }}>
          {assessment.score}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          / 100
        </span>
      </div>

      {/* Progress Bar with multi-hazard gradient */}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
        <div
          style={{
            width: `${Math.min(100, assessment.score)}%`,
            height: '100%',
            backgroundColor: assessment.color,
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      {/* Factor Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span className="technical-label" style={{ fontSize: '9.5px' }}>Risk Decomposition</span>
        {factors.map(f => (
          <div key={f.label} className="flex-between" style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
            <span style={{ color: f.color, fontWeight: 600 }}>+{f.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
