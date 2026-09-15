import React, { useState } from 'react';
import { Clock, Navigation, Droplets, Wind, Layers } from 'lucide-react';
import { useMapState } from '../../context/MapContext';
import { formatLatitude, formatLongitude } from '../../utils/coordinates';
import RiskBadge from '../common/RiskBadge';

export default function ExpeditionTimeline({ timeline = [] }) {
  const { flyTo } = useMapState();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const handlePointClick = (idx, point) => {
    setActiveStepIndex(idx);
    if (point.lat && point.lon) {
      flyTo(point.lat, point.lon, 6);
    }
  };

  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="tech-card" style={{ padding: '14px' }}>
      <div className="flex-between" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="var(--accent-ice)" />
          <span className="technical-label">EXPEDITION PROGRESSION TIMELINE</span>
        </div>
        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
          CLICK MILESTONE TO RE-CENTER MAP
        </span>
      </div>

      {/* Horizontal Scrubber Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${timeline.length}, minmax(140px, 1fr))`,
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '6px'
        }}
      >
        {timeline.map((item, idx) => {
          const isActive = idx === activeStepIndex;

          return (
            <div
              key={item.step}
              onClick={() => handlePointClick(idx, item)}
              style={{
                background: isActive ? 'var(--surface-elevated)' : 'var(--bg-primary)',
                border: `1px solid ${isActive ? 'var(--accent-ice)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-xs)',
                padding: '10px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}
            >
              {/* Header Step & Time */}
              <div className="flex-between">
                <span className="mono-readout" style={{ fontSize: '11px', fontWeight: 700, color: isActive ? 'var(--accent-ice)' : 'var(--text-primary)' }}>
                  {item.step}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  T+{item.timeHours}h
                </span>
              </div>

              {/* Waypoint Label */}
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                {item.label}
              </div>

              {/* Telemetry at milestone */}
              <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>ICE:</span>
                  <span style={{ color: 'var(--accent-ice)' }}>{item.seaIce}%</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>FUEL:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{item.fuelConsumedLiters} L</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>POS:</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>
                    {formatLatitude(item.lat).slice(0, 5)}S
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '4px' }}>
                <RiskBadge category={item.icebergRisk} showScore={false} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
