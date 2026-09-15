import React from 'react';
import { Compass } from 'lucide-react';

export default function EmptyState({
  title = 'NO TARGETS IN SELECTED SECTOR',
  message = 'No active marine observations match the current spatial boundary and temporal filter.',
  suggestions = [
    'Pan or zoom outward to encompass adjacent Antarctic sea basins',
    'Broaden temporal horizon filter (+24h or +48h)',
    'Reset active geographic bounding box or layer filters'
  ],
  actionLabel,
  onAction
}) {
  return (
    <div
      className="tech-card"
      style={{
        padding: '28px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '12px 0'
      }}
    >
      <Compass size={28} color="var(--accent-ice)" style={{ opacity: 0.6, marginBottom: '12px' }} />
      <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '16px' }}>
        {message}
      </div>

      {suggestions && suggestions.length > 0 && (
        <div style={{ textAlign: 'left', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <div className="technical-label" style={{ marginBottom: '6px' }}>Recommended Operational Adjustments:</div>
          <ul style={{ paddingLeft: '16px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-polar btn-primary-action">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
