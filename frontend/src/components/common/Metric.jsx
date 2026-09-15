import React from 'react';

export default function Metric({ label, value, unit, secondary, trend, status, className = '' }) {
  return (
    <div className={`tech-card ${className}`} style={{ padding: '10px 12px' }}>
      <div className="technical-label flex-between" style={{ marginBottom: '4px' }}>
        <span>{label}</span>
        {status && (
          <span style={{ fontSize: '9px', color: 'var(--accent-ice)' }}>{status}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span className="mono-readout" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {unit}
          </span>
        )}
      </div>
      {(secondary || trend) && (
        <div className="flex-between" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          {secondary && <span>{secondary}</span>}
          {trend && (
            <span style={{ color: trend.startsWith('+') ? 'var(--risk-moderate)' : 'var(--risk-low)' }}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
