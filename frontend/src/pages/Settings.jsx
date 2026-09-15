import React from 'react';
import { useApp } from '../context/AppContext';
import { useMapState } from '../context/MapContext';
import { Sliders, Save, RefreshCw, Eye, Compass, Shield, Check } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, systemStatus } = useApp();
  const { activeLayers, toggleLayer } = useMapState();

  return (
    <div style={{ flex: 1, padding: '20px 28px', backgroundColor: 'var(--bg-primary)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div className="technical-label">SYSTEM CONFIGURATION & OPERATIONAL PREFERENCES</div>
        <h2 className="mono-readout" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
          POLAR WORKSTATION SETTINGS
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* GENERAL UNITS & FORMATS */}
        <div className="tech-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="technical-label" style={{ color: 'var(--accent-ice)' }}>UNITS OF MEASUREMENT & CARTOGRAPHY</div>

          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Distance Unit</label>
            <select
              value={settings.unitDistance}
              onChange={e => updateSettings({ unitDistance: e.target.value })}
              className="input-polar"
            >
              <option value="km">Kilometers (km) - Metric</option>
              <option value="nm">Nautical Miles (NM) - Maritime Standard</option>
            </select>
          </div>

          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Fuel Measurement</label>
            <select
              value={settings.unitFuel}
              onChange={e => updateSettings({ unitFuel: e.target.value })}
              className="input-polar"
            >
              <option value="L">Liters (L) - Volume</option>
              <option value="t">Metric Tonnes (t) - Marine Bunker Weight</option>
            </select>
          </div>

          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Geographic Coordinate Display Format</label>
            <select
              value={settings.coordinateFormat}
              onChange={e => updateSettings({ coordinateFormat: e.target.value })}
              className="input-polar"
            >
              <option value="dms">Degrees, Minutes & Cardinal (e.g. 64°32.4'S, 042°18.7'E)</option>
              <option value="decimal">Signed Decimal Degrees (e.g. -64.5400, -42.3117)</option>
            </select>
          </div>

          <div>
            <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Default Sea-Ice Forecast Horizon</label>
            <select
              value={settings.defaultForecast}
              onChange={e => updateSettings({ defaultForecast: e.target.value })}
              className="input-polar"
            >
              <option value="12h">+12 Hours</option>
              <option value="24h">+24 Hours (Standard Watch)</option>
              <option value="48h">+48 Hours</option>
              <option value="72h">+72 Hours</option>
              <option value="5d">+5 Days</option>
            </select>
          </div>
        </div>

        {/* CARTOGRAPHY & MAP LAYERS PRESETS */}
        <div className="tech-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="technical-label" style={{ color: 'var(--accent-ice)' }}>CARTOGRAPHIC LAYER PRESETS</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span>Show Polar Coordinate Graticule Grid</span>
              <input
                type="checkbox"
                checked={activeLayers.graticule}
                onChange={() => toggleLayer('graticule')}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span>Show Sea-Ice Current Concentration</span>
              <input
                type="checkbox"
                checked={activeLayers.seaIceCurrent}
                onChange={() => toggleLayer('seaIceCurrent')}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span>Show Tracked Iceberg Positions</span>
              <input
                type="checkbox"
                checked={activeLayers.icebergPositions}
                onChange={() => toggleLayer('icebergPositions')}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span>Show Iceberg Predicted Drift Trajectories</span>
              <input
                type="checkbox"
                checked={activeLayers.icebergTrajectories}
                onChange={() => toggleLayer('icebergTrajectories')}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <span>Show Proximity Hazard Envelopes</span>
              <input
                type="checkbox"
                checked={activeLayers.hazardZones}
                onChange={() => toggleLayer('hazardZones')}
              />
            </label>
          </div>
        </div>

        {/* ACCESSIBILITY & DISPLAY */}
        <div className="tech-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="technical-label" style={{ color: 'var(--accent-ice)' }}>ACCESSIBILITY & WORKSTATION DISPLAY</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <div>
                <div>High Contrast Polar Mode</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Maximizes border delineation for low-light night watch</div>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={e => updateSettings({ highContrast: e.target.checked })}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '12px' }}>
              <div>
                <div>Reduced Motion Mode</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Disables trajectory line dash animations & radar sweeps</div>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={e => updateSettings({ reducedMotion: e.target.checked })}
              />
            </label>
          </div>

          <div style={{ marginTop: '14px', padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>DATA MODE:</div>
            <div style={{ color: systemStatus.dataMode === 'LIVE' ? 'var(--risk-low)' : 'var(--risk-moderate)', fontWeight: 600 }}>
              {systemStatus.dataMode}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Persistent storage active in browser localStorage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
