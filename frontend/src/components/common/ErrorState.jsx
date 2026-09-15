import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'TELEMETRY ACQUISITION FAULT',
  message = 'Unable to synchronize with remote sensing service.',
  onRetry,
  details
}) {
  return (
    <div
      className="tech-card"
      style={{
        padding: '20px',
        border: '1px solid var(--risk-high-bg)',
        backgroundColor: 'rgba(217, 83, 79, 0.06)',
        margin: '12px 0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <AlertTriangle size={18} color="var(--risk-high)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--risk-high)', marginBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {message}
          </div>
          {details && (
            <div
              className="mono-readout"
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-primary)',
                padding: '6px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '12px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {details}
            </div>
          )}
          {onRetry && (
            <button onClick={onRetry} className="btn-polar" style={{ fontSize: '11.5px', padding: '5px 10px' }}>
              <RefreshCw size={13} />
              <span>Retry Telemetry Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
