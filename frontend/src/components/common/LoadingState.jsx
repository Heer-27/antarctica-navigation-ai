import React from 'react';

export default function LoadingState({ message = 'Acquiring polar telemetry...', submessage }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}
    >
      {/* Restrained technical radar sweep indicator */}
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '1px solid var(--border-medium)',
          borderRadius: '50%',
          position: 'relative',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            border: '1px dashed var(--accent-ice)',
            borderRadius: '50%'
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '2px',
            height: '16px',
            backgroundColor: 'var(--accent-ice)',
            top: '3px',
            transformOrigin: 'bottom center',
            animation: 'radarSpin 1.8s linear infinite'
          }}
        />
      </div>

      <div className="mono-readout" style={{ fontSize: '12.5px', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
        {message}
      </div>
      {submessage && (
        <div className="technical-label" style={{ marginTop: '6px', fontSize: '10px' }}>
          {submessage}
        </div>
      )}

      <style>{`
        @keyframes radarSpin {
          0% { transform: rotate(0deg); opacity: 0.9; }
          100% { transform: rotate(360deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
