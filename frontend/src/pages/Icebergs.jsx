import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../components/map/MapContainer';
import IcebergDetailDrawer from '../components/icebergs/IcebergDetailDrawer';
import RiskBadge from '../components/common/RiskBadge';
import { useIcebergs } from '../hooks/useIcebergs';
import { useMapState } from '../context/MapContext';
import { formatLatitude, formatLongitude } from '../utils/coordinates';
import { TriangleAlert, Search, Filter, Compass, Navigation2 } from 'lucide-react';

export default function Icebergs() {
  const navigate = useNavigate();
  const { icebergs, loading } = useIcebergs();
  const { flyTo } = useMapState();

  const [selectedBerg, setSelectedBerg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const filteredIcebergs = icebergs.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || b.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const handleSelectBerg = (berg) => {
    setSelectedBerg(berg);
    flyTo(berg.latitude, berg.longitude, 6);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top Filter & Target Counter Bar */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: 'rgba(13, 27, 52, 0.65)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-panel)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TriangleAlert size={15} color="var(--risk-moderate)" />
          <span className="technical-label" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
            SOUTHERN OCEAN RADAR & SATELLITE ICEBERG TRACKING CATALOG
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '180px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Target ID..."
              className="input-polar"
              style={{ paddingLeft: '28px', fontSize: '11px', borderRadius: 'var(--radius-pill)' }}
            />
            <Search size={12} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          {/* Risk Level Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterRisk(lvl)}
                className="btn-polar"
                style={{
                  fontSize: '10px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: filterRisk === lvl ? 'rgba(56, 189, 248, 0.22)' : 'transparent',
                  borderColor: filterRisk === lvl ? 'var(--accent-ice)' : 'var(--glass-border)',
                  color: filterRisk === lvl ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Map on Left, Tracked Target List on Right */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 0 }} className="iceberg-layout-grid">
        {/* Interactive Map */}
        <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
          <MapContainer
            onSelectIceberg={handleSelectBerg}
            highlightedIcebergId={selectedBerg?.id}
          />

          {selectedBerg && (
            <IcebergDetailDrawer
              iceberg={selectedBerg}
              onClose={() => setSelectedBerg(null)}
            />
          )}
        </div>

        {/* Iceberg Registry List Panel */}
        <div
          style={{
            backgroundColor: 'rgba(13, 27, 52, 0.55)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderLeft: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-panel)',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div className="flex-between">
            <span className="technical-label">ACTIVE RADAR TARGETS ({filteredIcebergs.length})</span>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NIC CLASSIFIED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredIcebergs.map(berg => {
              const isSelected = selectedBerg?.id === berg.id;

              return (
                <div
                  key={berg.id}
                  onClick={() => handleSelectBerg(berg)}
                  className="tech-card"
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--surface-elevated)' : 'var(--surface-base)',
                    borderLeft: `3px solid ${
                      berg.riskLevel === 'CRITICAL' ? 'var(--risk-critical)' :
                      berg.riskLevel === 'HIGH' ? 'var(--risk-high)' :
                      berg.riskLevel === 'MODERATE' ? 'var(--risk-moderate)' : 'var(--risk-low)'
                    }`
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <div className="mono-readout" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {berg.id}
                    </div>
                    <RiskBadge category={berg.riskLevel} score={berg.riskScore} size="sm" />
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {berg.name}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    <div>
                      POS: {formatLatitude(berg.latitude).slice(0, 5)}S
                    </div>
                    <div>
                      DRIFT: {berg.speed} kn ({berg.direction})
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/icebergs/${berg.id}`);
                      }}
                      className="btn-polar"
                      style={{ fontSize: '10px', padding: '3px 7px' }}
                    >
                      <Navigation2 size={11} /> Trajectory
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .iceberg-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
