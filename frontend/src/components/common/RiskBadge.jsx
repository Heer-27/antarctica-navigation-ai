import React from 'react';
import { getRiskAssessment } from '../../utils/risk';

export default function RiskBadge({ score, category, showScore = true, size = 'md' }) {
  const assessment = getRiskAssessment(score ?? (category === 'HIGH' ? 75 : category === 'MODERATE' ? 50 : 25));
  
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 6px' : '4px 8px',
        backgroundColor: assessment.bg,
        border: `1px solid ${assessment.border}`,
        borderRadius: 'var(--radius-xs)',
        color: assessment.color,
        fontFamily: 'var(--font-mono)',
        fontSize: isSmall ? '10px' : '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap'
      }}
      title={assessment.description}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: assessment.color
        }}
      />
      <span>{assessment.label}</span>
      {showScore && typeof score === 'number' && (
        <span style={{ opacity: 0.85, fontWeight: 400, marginLeft: '2px' }}>
          {assessment.score}/100
        </span>
      )}
    </span>
  );
}
