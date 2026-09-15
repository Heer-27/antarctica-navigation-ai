import React from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, TriangleAlert, Ship, Activity, Clock } from 'lucide-react';

export default function OperationsStrip() {
  const { systemStatus } = useApp();
  const telemetry = systemStatus.telemetry || {
    seaIceAverage: 72.4,
    icebergsTracked: 184,
    vesselsActive: 3,
    activeAlerts: 2,
    dataAgeMinutes: 18
  };

  return (
    <div
      style={{
        height: 'var(--strip-height)',
        backgroundColor: 'rgba(4, 19, 44, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        gap: '24px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)'
      }}
      className="operations-strip"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Layers size={13} color="var(--accent-ice)" />
        <span style={{ color: 'var(--text-muted)' }}>AVG SEA ICE:</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {telemetry.seaIceAverage}%
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <TriangleAlert size={13} color="var(--risk-moderate)" />
        <span style={{ color: 'var(--text-muted)' }}>TRACKED BERGS:</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {telemetry.icebergsTracked}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Ship size={13} color="var(--accent-cyan)" />
        <span style={{ color: 'var(--text-muted)' }}>ACTIVE FLEET:</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {telemetry.vesselsActive} VESSELS
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Activity size={13} color={telemetry.activeAlerts > 0 ? 'var(--risk-high)' : 'var(--risk-low)'} />
        <span style={{ color: 'var(--text-muted)' }}>ACTIVE HAZARDS:</span>
        <span style={{ color: telemetry.activeAlerts > 0 ? 'var(--risk-high)' : 'var(--risk-low)', fontWeight: 600 }}>
          {telemetry.activeAlerts} NOTICES
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
        <Clock size={13} color="var(--text-muted)" />
        <span style={{ color: 'var(--text-muted)' }}>TELEMETRY LATENCY:</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          {telemetry.dataAgeMinutes} MIN AGO
        </span>
      </div>
    </div>
  );
}
