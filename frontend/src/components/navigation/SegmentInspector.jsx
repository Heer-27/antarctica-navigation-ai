import React, { useState } from 'react';
import { Layers, Wind, Waves, Compass, Fuel, ShieldAlert } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

export default function SegmentInspector({ segments = [], activeSegmentId, onSelectSegment }) {
  const [currentId, setCurrentId] = useState(activeSegmentId || segments[0]?.id || 'SEG-01');

  const selectedSegment = segments.find(s => s.id === currentId) || segments[0];

  const handleSelect = (id) => {
    setCurrentId(id);
    if (onSelectSegment) onSelectSegment(id);
  };

  if (!selectedSegment) return null;

  return (
    <div className="tech-card" style={{ padding: '14px' }}>
      <div className="flex-between" style={{ marginBottom: '10px' }}>
        <span className="technical-label">ROUTE WAYPOINT SEGMENT INSPECTOR</span>
        <span className="mono-readout" style={{ fontSize: '10.5px', color: 'var(--accent-ice)' }}>
          {selectedSegment.id}
        </span>
      </div>

      {/* Segment Selector Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        {segments.map(seg => {
          const isSelected = seg.id === selectedSegment.id;
          return (
            <button
              key={seg.id}
              onClick={() => handleSelect(seg.id)}
              className="btn-polar"
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                backgroundColor: isSelected ? 'var(--surface-elevated)' : 'transparent',
                borderColor: isSelected ? 'var(--accent-ice)' : 'var(--border-subtle)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              {seg.id}
            </button>
          );
        })}
      </div>

      {/* Segment Header */}
      <div style={{ marginBottom: '10px' }}>
        <div className="mono-readout" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {selectedSegment.title}
        </div>
        <div className="technical-label" style={{ fontSize: '9px', marginTop: '2px' }}>
          BETWEEN {selectedSegment.startPoint} ➔ {selectedSegment.endPoint} · DISTANCE: {selectedSegment.distanceKm} KM
        </div>
      </div>

      {/* Environmental & Fuel Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Layers size={11} color="var(--accent-ice)" />
            <span>SEA ICE CONCENTRATION</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-ice)' }}>
            {selectedSegment.seaIceConcentration}%
          </span>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Wind size={11} color="#9DB2C6" />
            <span>WIND VELOCITY</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {selectedSegment.windSpeedKnots} kn
          </span>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Waves size={11} color="var(--accent-ocean)" />
            <span>SIGNIFICANT WAVES</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {selectedSegment.waveHeightMeters} m
          </span>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Compass size={11} color="var(--accent-ice)" />
            <span>OCEAN CURRENT</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {selectedSegment.currentKnots} kn → {selectedSegment.currentDirection}
          </span>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Fuel size={11} color="var(--risk-moderate)" />
            <span>SEGMENT FUEL ESTIMATE</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {selectedSegment.fuelEstimateLiters} L
          </span>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <ShieldAlert size={11} color="var(--risk-moderate)" />
            <span>ICEBERG RISK</span>
          </div>
          <div style={{ marginTop: '2px' }}>
            <RiskBadge category={selectedSegment.icebergRisk} showScore={false} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
