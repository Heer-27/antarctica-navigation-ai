import React, { useState } from 'react';
import MapContainer from '../components/map/MapContainer';
import Metric from '../components/common/Metric';
import CoordinateDisplay from '../components/common/CoordinateDisplay';
import { MOCK_WEATHER, MOCK_OCEAN, MOCK_SEA_ICE_CURRENT } from '../api/mockData';
import { Wind, Waves, Thermometer, Compass, CloudSun, Gauge, Droplets, Eye } from 'lucide-react';

export default function Environment() {
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Antarctic Peninsula / Weddell Margin',
    lat: -64.82,
    lon: -58.25
  });

  const weather = MOCK_WEATHER;
  const ocean = MOCK_OCEAN;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top Header Bar */}
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
          <CloudSun size={15} color="var(--accent-ice)" />
          <span className="technical-label" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
            SYNOPTIC POLAR METEOROLOGY & OCEANOGRAPHIC INSTRUMENTATION
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-muted)' }}>TELEMETRY STATIONS:</span>
          <span style={{ color: 'var(--accent-cyan)' }}>ECMWF IFS & HYCOM GLOBAL 0.08°</span>
        </div>
      </div>

      {/* Main Grid: Left Map, Right Synoptic Instruments */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 0 }} className="env-layout-grid">
        {/* Spatial Ocean Map */}
        <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
          <MapContainer />
        </div>

        {/* Scientific Instrumentation Readouts */}
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
            gap: '14px'
          }}
        >
          {/* Station Location Header */}
          <div className="tech-card" style={{ padding: '12px' }}>
            <div className="technical-label" style={{ marginBottom: '4px' }}>SELECTED METOCEAN COORDINATES</div>
            <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {selectedLocation.name}
            </div>
            <CoordinateDisplay lat={selectedLocation.lat} lon={selectedLocation.lon} />
          </div>

          {/* ATMOSPHERIC WEATHER PANEL */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wind size={14} color="var(--accent-ice)" />
                <span className="technical-label" style={{ color: 'var(--text-primary)' }}>
                  ATMOSPHERIC BOUNDARY LAYER
                </span>
              </div>
              <span className="mono-readout" style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>WMO 89062</span>
            </div>

            {/* Wind Rose Vector */}
            <div
              style={{
                background: 'var(--bg-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              {/* Compass Needle Indicator */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-medium)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-space)'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: '2px',
                    height: '24px',
                    backgroundColor: 'var(--risk-moderate)',
                    transform: `rotate(${weather.windDirectionDegrees}deg)`,
                    transformOrigin: 'center center'
                  }}
                />
                <div style={{ width: '4px', height: '4px', backgroundColor: '#FFFFFF', borderRadius: '50%', zIndex: 2 }} />
                <span style={{ position: 'absolute', top: '1px', fontSize: '7px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>N</span>
              </div>

              <div>
                <div className="technical-label" style={{ fontSize: '9px' }}>10M WIND VECTOR</div>
                <div className="mono-readout" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {weather.windSpeed} kn
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  HEADING: {weather.windDirectionText} {weather.windDirectionDegrees}° · Gusts {weather.gustSpeed} kn
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Metric
                label="AIR TEMPERATURE"
                value={`${weather.airTemperature}`}
                unit="°C"
                secondary="Wind Chill: -16.8°C"
              />
              <Metric
                label="BAROMETER"
                value={`${weather.barometricPressure}`}
                unit="hPa"
                secondary={weather.pressureTrend}
              />
              <Metric
                label="OPTICAL VISIBILITY"
                value={`${weather.visibilityKm}`}
                unit="km"
                secondary="Clear polar horizon"
              />
              <Metric
                label="FREEZING SPRAY"
                value={weather.freezingSprayRisk}
                secondary="Icing threshold active"
                status="WATCH"
              />
            </div>
          </div>

          {/* OCEANOGRAPHIC CONDITIONS PANEL */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Waves size={14} color="var(--accent-ocean)" />
                <span className="technical-label" style={{ color: 'var(--text-primary)' }}>
                  OCEANOGRAPHIC & HYDRODYNAMIC DYNAMICS
                </span>
              </div>
              <span className="mono-readout" style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>ARGO 5903</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Metric
                label="SEA SURFACE TEMP"
                value={`${ocean.seaSurfaceTemperature}`}
                unit="°C"
                secondary={`Salinity: ${ocean.salinityPsu} PSU`}
              />
              <Metric
                label="SIGNIFICANT SWELL"
                value={`${ocean.significantWaveHeight}`}
                unit="m"
                secondary={`Peak Period: ${ocean.peakWavePeriod}s`}
              />
              <Metric
                label="CURRENT VELOCITY"
                value={`${ocean.currentSpeed}`}
                unit="kn"
                secondary={`Ekman: ${ocean.currentDirectionText} ${ocean.currentDirectionDegrees}°`}
              />
              <Metric
                label="TIDAL ENVELOPE"
                value={ocean.tideState}
                secondary="Antarctic Coastal Wave"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .env-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
