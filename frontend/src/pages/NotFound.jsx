import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, RotateCcw } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: '1.5px dashed var(--risk-moderate)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          backgroundColor: 'rgba(224, 159, 62, 0.08)'
        }}
      >
        <Compass size={36} color="var(--risk-moderate)" />
      </div>

      <div className="technical-label" style={{ color: 'var(--risk-moderate)', marginBottom: '6px' }}>
        ERROR 404 · OFF-CHART COORDINATES
      </div>

      <h1 className="mono-readout" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
        POSITION NOT FOUND
      </h1>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: '1.5', marginBottom: '24px' }}>
        The requested operational corridor or navigation sector does not exist within the Southern Ocean cartographic database.
      </p>

      <Link to="/dashboard" className="btn-polar btn-primary-action" style={{ padding: '10px 18px', fontSize: '12.5px' }}>
        <RotateCcw size={14} />
        <span>Return to Operations Command</span>
      </Link>
    </div>
  );
}
