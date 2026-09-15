import React from 'react';
import { TriangleAlert, Eye } from 'lucide-react';
import { useMapState } from '../../context/MapContext';

export default function ProximityAlert({ alert }) {
  const { flyTo } = useMapState();

  if (!alert) return null;

  const handleViewOnMap = () => {
    if (alert.coordinates) {
      flyTo(alert.coordinates[0], alert.coordinates[1], 7);
    }
  };

  return (
    <div
      className="tech-card"
      style={{
        padding: '12px 14px',
        backgroundColor: 'rgba(224, 159, 62, 0.1)',
        border: '1px solid var(--risk-moderate)',
        borderLeft: '4px solid var(--risk-moderate)'
      }}
    >
      <div className="flex-between" style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TriangleAlert size={15} color="var(--risk-moderate)" />
          <span className="mono-readout" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--risk-moderate)', letterSpacing: '0.04em' }}>
            ICEBERG PROXIMITY ALERT
          </span>
        </div>
        <button
          onClick={handleViewOnMap}
          className="btn-polar"
          style={{ fontSize: '10px', padding: '3px 8px', background: 'var(--surface-elevated)', borderColor: 'var(--risk-moderate)' }}
        >
          <Eye size={12} color="var(--risk-moderate)" />
          <span>View on Map</span>
        </button>
      </div>

      <div style={{ fontSize: '11.5px', color: 'var(--text-primary)', marginBottom: '8px' }}>
        <strong>{alert.icebergName || alert.icebergId}</strong> is projected to approach the selected route within{' '}
        <span className="mono-readout" style={{ color: 'var(--risk-moderate)', fontWeight: 600 }}>
          {alert.closestApproachKm} km
        </span>{' '}
        in approximately{' '}
        <span className="mono-readout" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {Math.floor(alert.estimatedTimeToCpaHours)}h {Math.round((alert.estimatedTimeToCpaHours % 1) * 60)}m
        </span>.
      </div>

      <div className="flex-between" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>PROXIMITY THREAT: {alert.riskCategory || 'MODERATE'}</span>
        <span>CPA HORIZON: 24-HOUR LAGRANGIAN RUN</span>
      </div>
    </div>
  );
}
