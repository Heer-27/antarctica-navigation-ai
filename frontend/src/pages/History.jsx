import React, { useState } from 'react';
import SeaIceChart from '../components/charts/SeaIceChart';
import Metric from '../components/common/Metric';
import { Clock, Calendar, Filter, Layers, TriangleAlert, CloudSun, Waves, Navigation } from 'lucide-react';

export default function History() {
  const [activeTab, setActiveTab] = useState('SEA ICE');
  const [dateRange, setDateRange] = useState('30D');

  const tabs = [
    { name: 'SEA ICE', icon: Layers },
    { name: 'ICEBERGS', icon: TriangleAlert },
    { name: 'WEATHER', icon: CloudSun },
    { name: 'OCEAN', icon: Waves },
    { name: 'ROUTES', icon: Navigation }
  ];

  return (
    <div style={{ flex: 1, padding: '20px 28px', backgroundColor: 'var(--bg-primary)', overflowY: 'auto' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div className="technical-label">ANTARCTIC HISTORICAL ARCHIVE</div>
          <h2 className="mono-readout" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            POLAR REANALYSIS & OBSERVATION TIME SERIES
          </h2>
        </div>

        {/* Date Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['7D', '14D', '30D', '90D', 'SEASON'].map(d => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className="btn-polar"
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                backgroundColor: dateRange === d ? 'var(--surface-elevated)' : 'transparent',
                borderColor: dateRange === d ? 'var(--accent-ice)' : 'var(--border-subtle)',
                color: dateRange === d ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '18px' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isSelected = activeTab === t.name;
          return (
            <button
              key={t.name}
              onClick={() => setActiveTab(t.name)}
              className="btn-polar"
              style={{
                padding: '6px 14px',
                backgroundColor: isSelected ? 'var(--surface-elevated)' : 'transparent',
                borderColor: isSelected ? 'var(--accent-ice)' : 'transparent',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <Icon size={14} color={isSelected ? 'var(--accent-ice)' : 'var(--text-muted)'} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content depending on Tab */}
      {activeTab === 'SEA ICE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <Metric label="30-DAY MIN CONCENTRATION" value="58.2%" secondary="Weddell MIZ Edge" />
            <Metric label="30-DAY MAX CONCENTRATION" value="94.6%" secondary="Consolidated Pack" />
            <Metric label="AVERAGE CONCENTRATION" value="73.1%" secondary="Seasonal Freeze Trend" />
            <Metric label="NET THICKNESS RATE" value="+1.8 cm/wk" secondary="Thermodynamic Growth" />
          </div>

          <SeaIceChart />
        </div>
      )}

      {activeTab === 'ICEBERGS' && (
        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="technical-label" style={{ marginBottom: '10px' }}>HISTORICAL CALVING & GROUNDING EVENTS</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Over the past 90 days, 4 major tabular detachment events were registered along the Filchner-Ronne and Larsen C ice shelves. Average northward drift speed through the Weddell Gyre was 1.28 knots, influenced by persistent southwesterly katabatic wind surges.
          </div>
        </div>
      )}

      {activeTab === 'WEATHER' && (
        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="technical-label" style={{ marginBottom: '10px' }}>SYNOPTIC POLAR BAROMETRIC REANALYSIS</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            A total of 6 severe polar low depressions passed through Drake Passage and the northern Bellingshausen Sea. Maximum sustained 10m wind speed was recorded at 52.4 knots (Gale Force 10) off South Shetland Islands.
          </div>
        </div>
      )}

      {activeTab === 'OCEAN' && (
        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="technical-label" style={{ marginBottom: '10px' }}>HYCOM SOUTHERN OCEAN GEOSTROPHIC FLUX</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Antarctic Circumpolar Current (ACC) eastward core velocity peaked at 1.85 knots along the 60°S latitude corridor. Sea surface temperatures remained between -1.8°C and -0.4°C across all registered research sectors.
          </div>
        </div>
      )}

      {activeTab === 'ROUTES' && (
        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="technical-label" style={{ marginBottom: '10px' }}>HISTORICAL TRANSIT CORRIDOR LOGS</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            3 completed polar research voyages verified decision-support route recommendations, resulting in a documented 16.4% reduction in fuel consumption and zero hazardous proximity incidents with tabular icebergs.
          </div>
        </div>
      )}
    </div>
  );
}
