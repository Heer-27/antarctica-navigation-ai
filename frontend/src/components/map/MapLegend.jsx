import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="tech-card"
      style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 1000,
        backgroundColor: 'var(--surface-overlay)',
        border: '1px solid var(--border-medium)',
        backdropFilter: 'blur(6px)',
        width: collapsed ? 'auto' : '230px',
        boxShadow: 'var(--shadow-panel)'
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex-between"
        style={{
          padding: '7px 10px',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={13} color="var(--accent-ice)" />
          <span className="technical-label" style={{ color: 'var(--text-primary)' }}>
            POLAR CARTOGRAPHY LEGEND
          </span>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
          {/* Sea-Ice Concentration Scale */}
          <div>
            <div className="technical-label" style={{ marginBottom: '5px' }}>Sea-Ice Concentration %</div>
            <div style={{ display: 'flex', height: '8px', borderRadius: '1px', overflow: 'hidden', marginBottom: '3px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--ice-0-20)' }} title="0-20% Very Low" />
              <div style={{ flex: 1, backgroundColor: 'var(--ice-20-40)' }} title="20-40% Low" />
              <div style={{ flex: 1, backgroundColor: 'var(--ice-40-60)' }} title="40-60% Moderate" />
              <div style={{ flex: 1, backgroundColor: 'var(--ice-60-80)' }} title="60-80% Close Pack" />
              <div style={{ flex: 1, backgroundColor: 'var(--ice-80-100)' }} title="80-100% Dense Fast Ice" />
            </div>
            <div className="flex-between mono-readout" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
              <span>0% OPEN</span>
              <span>50%</span>
              <span>100% DENSE</span>
            </div>
          </div>

          {/* Iceberg Threat Level */}
          <div>
            <div className="technical-label" style={{ marginBottom: '5px' }}>Iceberg Risk Rating</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--risk-low)', borderRadius: '1px' }} />
                <span>LOW</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--risk-moderate)', borderRadius: '1px' }} />
                <span>MODERATE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--risk-high)', borderRadius: '1px' }} />
                <span>HIGH</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--risk-critical)', borderRadius: '1px' }} />
                <span>CRITICAL</span>
              </div>
            </div>
          </div>

          {/* Routes */}
          <div>
            <div className="technical-label" style={{ marginBottom: '5px' }}>Navigation Corridors</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2.5px', backgroundColor: '#E09F3E', display: 'inline-block' }} />
                <span>RECOMMENDED ROUTE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #4EBA6F', display: 'inline-block' }} />
                <span>SAFEST PASSAGE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #74B3CE', display: 'inline-block' }} />
                <span>FUEL OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
