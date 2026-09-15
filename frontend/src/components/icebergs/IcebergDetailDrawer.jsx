import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Navigation2, Compass, Maximize2, ShieldAlert } from 'lucide-react';
import { formatLatitude, formatLongitude } from '../../utils/coordinates';
import RiskBadge from '../common/RiskBadge';

export default function IcebergDetailDrawer({ iceberg, onClose }) {
  const navigate = useNavigate();

  if (!iceberg) return null;

  const handlePredictTrajectory = () => {
    navigate(`/icebergs/${iceberg.id}`);
  };

  return (
    <div
      className="tech-card"
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        width: '300px',
        zIndex: 1050,
        backgroundColor: 'var(--surface-overlay)',
        border: '1px solid var(--border-medium)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        boxShadow: 'var(--shadow-panel)'
      }}
    >
      <div className="flex-between" style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <div>
          <div className="technical-label" style={{ fontSize: '9px' }}>RADAR TARGET IDENTIFIER</div>
          <div className="mono-readout" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {iceberg.name || iceberg.id}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
        {/* Position */}
        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ fontSize: '9px', marginBottom: '3px' }}>OBSERVED POSITION</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {formatLatitude(iceberg.latitude)} &nbsp; {formatLongitude(iceberg.longitude)}
          </div>
        </div>

        {/* Speed & Heading */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div className="technical-label" style={{ fontSize: '9px', marginBottom: '3px' }}>DRIFT VELOCITY</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {iceberg.speed} kn
            </div>
          </div>
          <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div className="technical-label" style={{ fontSize: '9px', marginBottom: '3px' }}>HEADING</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {iceberg.direction || `${iceberg.heading}°`}
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ fontSize: '9px', marginBottom: '3px' }}>GEOMETRY & SAIL ELEVATION</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {iceberg.length > 1000 ? `${(iceberg.length / 1000).toFixed(1)} km` : `${iceberg.length} m`} ×{' '}
            {iceberg.width > 1000 ? `${(iceberg.width / 1000).toFixed(1)} km` : `${iceberg.width} m`}
            &nbsp;·&nbsp;
            <span style={{ color: 'var(--accent-ice)' }}>Freeboard {iceberg.height} m</span>
          </div>
        </div>

        {/* Risk Badge */}
        <div className="flex-between" style={{ padding: '4px 0' }}>
          <span className="technical-label">THREAT CLASSIFICATION</span>
          <RiskBadge category={iceberg.riskLevel} score={iceberg.riskScore} size="sm" />
        </div>

        {iceberg.notes && (
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4', fontFamily: 'var(--font-sans)' }}>
            {iceberg.notes}
          </div>
        )}

        {/* Predict Trajectory Button */}
        <button
          onClick={handlePredictTrajectory}
          className="btn-polar btn-primary-action"
          style={{ width: '100%', padding: '9px', marginTop: '6px' }}
        >
          <Navigation2 size={13} />
          <span>PREDICT DRIFT TRAJECTORY</span>
        </button>
      </div>
    </div>
  );
}
