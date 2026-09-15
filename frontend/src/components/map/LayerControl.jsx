import React, { useState } from 'react';
import { SlidersHorizontal, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useMapState } from '../../context/MapContext';

export default function LayerControl() {
  const { activeLayers, toggleLayer } = useMapState();
  const [open, setOpen] = useState(false);

  const layerGroups = [
    {
      title: 'SEA ICE OBSERVATION',
      items: [
        { key: 'seaIceCurrent', label: 'Current Concentration' },
        { key: 'seaIceForecast', label: 'Predicted Ice Advancing (+24h)' }
      ]
    },
    {
      title: 'ICEBERG MONITORING',
      items: [
        { key: 'icebergPositions', label: 'Tracked Iceberg Positions' },
        { key: 'icebergTrajectories', label: 'Projected Drift Cones (+48h)' }
      ]
    },
    {
      title: 'MARITIME NAVIGATION',
      items: [
        { key: 'vessels', label: 'Research Vessels' },
        { key: 'recommendedRoute', label: 'Recommended Route' },
        { key: 'alternativeRoutes', label: 'Alternative Routes' }
      ]
    },
    {
      title: 'METOCEAN & RISKS',
      items: [
        { key: 'weatherOverlay', label: 'Wind & Pressure Vectors' },
        { key: 'oceanOverlay', label: 'Ocean Currents & Swell' },
        { key: 'hazardZones', label: 'Proximity Hazard Envelopes' },
        { key: 'graticule', label: 'Polar Graticule Grid' }
      ]
    }
  ];

  return (
    <div
      className="tech-card"
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 1000,
        backgroundColor: 'var(--surface-overlay)',
        border: '1px solid var(--border-medium)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'var(--shadow-panel)',
        width: open ? '260px' : 'auto'
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex-between"
        style={{
          width: '100%',
          padding: '7px 12px',
          background: 'var(--bg-primary)',
          border: 'none',
          borderBottom: open ? '1px solid var(--border-subtle)' : 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={13} color="var(--accent-ice)" />
          <span>LAYER SELECTOR</span>
        </div>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div
          style={{
            padding: '12px',
            maxHeight: '380px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {layerGroups.map(group => (
            <div key={group.title}>
              <div className="technical-label" style={{ marginBottom: '6px', fontSize: '9.5px' }}>
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {group.items.map(item => {
                  const active = activeLayers[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleLayer(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        backgroundColor: active ? 'rgba(116, 179, 206, 0.08)' : 'transparent',
                        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-sans)',
                        userSelect: 'none'
                      }}
                    >
                      <span>{item.label}</span>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '2px',
                          border: `1px solid ${active ? 'var(--accent-ice)' : 'var(--border-medium)'}`,
                          backgroundColor: active ? 'var(--accent-ice)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {active && <Check size={11} color="var(--bg-space)" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
