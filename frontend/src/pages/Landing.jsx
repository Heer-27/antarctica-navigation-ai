import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Layers, TriangleAlert, ArrowRight, Radio, ExternalLink } from 'lucide-react';
import { formatUtcDateTime } from '../utils/formatting';

export default function Landing() {
  const currentUtc = formatUtcDateTime();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column' }}>
      {/* Top Polar System Status Header */}
      <header
        style={{
          borderBottom: '1px solid var(--glass-border)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(13, 27, 52, 0.55)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--shadow-panel)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              border: '1.5px solid var(--accent-ice)',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(123, 208, 255, 0.15)',
              boxShadow: '0 0 10px rgba(123, 208, 255, 0.3)'
            }}
          >
            <Radio size={15} color="var(--accent-ice)" />
          </div>
          <div>
            <div className="mono-readout" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
              ANTARCTIC RESEARCH EXPEDITIONS
            </div>
            <div className="technical-label" style={{ fontSize: '9px', color: 'var(--accent-ice)' }}>
              SOUTHERN OCEAN MARITIME DECISION SUPPORT PLATFORM
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-indicator status-online" />
            <span style={{ color: 'var(--text-primary)' }}>OPERATIONAL STATUS: READY</span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>{currentUtc}</div>
        </div>
      </header>

      {/* Hero Section */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          padding: '48px 36px',
          alignItems: 'center',
          maxWidth: '1480px',
          margin: '0 auto',
          width: '100%'
        }}
        className="hero-grid"
      >
        {/* Left: Purpose and Mission */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-pill)',
              backdropFilter: 'blur(8px)',
              marginBottom: '18px'
            }}
          >
            <span className="status-indicator status-online" style={{ width: '6px', height: '6px' }} />
            <span className="technical-label" style={{ color: 'var(--accent-ice)' }}>
              POLAR RESEARCH & MARITIME SAFETY INITIATIVE
            </span>
          </div>

          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '14px'
            }}
          >
            Antarctic Decision Support System
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '520px'
            }}
          >
            AI-assisted sea-ice forecasting, iceberg trajectory prediction, and safer expedition routing in the Southern Ocean.
          </p>

          {/* Operational Capability Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px', maxWidth: '520px' }}>
            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span className="technical-label">SEA-ICE FORECAST</span>
                <Layers size={14} color="var(--accent-ice)" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Random Forest 25km resolution pack ice predictions up to +5 days.
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span className="technical-label">ICEBERG DYNAMICS</span>
                <TriangleAlert size={14} color="var(--risk-moderate)" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Coupled atmospheric-oceanic Lagrangian drift cone modeling.
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span className="technical-label">PARETO ROUTING</span>
                <Compass size={14} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Multi-objective route optimization balancing ice risk, fuel burn, and time.
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span className="technical-label">METOCEAN FUSION</span>
                <ShieldCheck size={14} color="var(--risk-low)" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Synoptic winds, Ekman ocean currents, and ice class limit checks.
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              to="/dashboard"
              className="btn-polar btn-primary-action"
              style={{ padding: '11px 22px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
            >
              <span>Open Operations Dashboard</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/navigation"
              className="btn-polar"
              style={{ padding: '11px 20px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
            >
              <span>Route Optimization</span>
            </Link>
          </div>
        </div>

        {/* Right: Technical Polar Cartography Hero Visual */}
        <div
          className="glass-panel-deep tech-corner-accent grid-subtle"
          style={{
            height: '480px',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'rgba(1, 13, 38, 0.65)',
            border: '1px solid var(--glass-border-hover)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-overlay), inset 0 1px 2px rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Antarctic Continent Vector Outline & Coordinate Rings */}
          <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%', padding: '20px' }}>
            {/* Graticule Concentric Latitude Circles */}
            <circle cx="250" cy="250" r="210" fill="none" stroke="#16253E" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="250" cy="250" r="160" fill="none" stroke="#1C2E4A" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="250" cy="250" r="110" fill="none" stroke="#223A5E" strokeWidth="1" strokeDasharray="3 4" />
            <circle cx="250" cy="250" r="60" fill="none" stroke="#2B4977" strokeWidth="1" strokeDasharray="2 3" />

            {/* Meridian Lines */}
            <line x1="250" y1="40" x2="250" y2="460" stroke="#16253E" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="40" y1="250" x2="460" y2="250" stroke="#16253E" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="100" y1="100" x2="400" y2="400" stroke="#16253E" strokeWidth="0.8" strokeDasharray="2 4" />
            <line x1="400" y1="100" x2="100" y2="400" stroke="#16253E" strokeWidth="0.8" strokeDasharray="2 4" />

            {/* Continental Ice Shelf & Coastline Representation */}
            <path
              d="M 250 140 
                 C 270 140, 310 160, 330 190 
                 C 350 220, 380 240, 370 280 
                 C 360 320, 330 350, 290 365 
                 C 250 380, 210 375, 180 350 
                 C 150 320, 130 290, 140 250 
                 C 150 210, 170 170, 200 150 
                 C 220 135, 235 140, 250 140 Z"
              fill="rgba(116, 179, 206, 0.08)"
              stroke="#3A5A84"
              strokeWidth="1.5"
            />

            {/* Antarctic Peninsula Spur */}
            <path
              d="M 200 150 
                 C 185 125, 170 100, 155 75 
                 C 145 60, 135 65, 140 85 
                 C 145 105, 160 130, 175 160 Z"
              fill="rgba(116, 179, 206, 0.12)"
              stroke="#5BC0BE"
              strokeWidth="1.5"
            />

            {/* South Pole Marker */}
            <circle cx="250" cy="250" r="3" fill="#74B3CE" />
            <text x="256" y="254" fill="#647B95" fontSize="8" fontFamily="var(--font-mono)">90°S SOUTH POLE</text>

            {/* Sea Ice Outer Limit Boundary Line */}
            <path
              d="M 250 70 
                 C 330 70, 420 150, 430 250 
                 C 440 350, 360 420, 250 430 
                 C 140 440, 70 360, 65 250 
                 C 60 140, 150 70, 250 70 Z"
              fill="none"
              stroke="#457B9D"
              strokeWidth="1"
              strokeDasharray="6 4"
              opacity="0.7"
            />
            <text x="75" y="140" fill="#457B9D" fontSize="8" fontFamily="var(--font-mono)">SEA-ICE MARGIN (MIZ)</text>

            {/* Moving Research Vessel Vector */}
            <g transform="translate(142, 92)">
              <polygon points="0,-7 5,6 0,3 -5,6" fill="#5BC0BE" />
              <text x="10" y="3" fill="#E9F1F7" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600">
                R/V POLARSTERN
              </text>
              <text x="10" y="13" fill="#5BC0BE" fontSize="7.5" fontFamily="var(--font-mono)">
                HDG 134° · 11.2 kn
              </text>
            </g>

            {/* Navigation Corridor Line */}
            <path
              d="M 142 92 Q 170 140 185 190 T 170 230"
              fill="none"
              stroke="#E09F3E"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Iceberg A-017 Threat Marker */}
            <g transform="translate(172, 136)">
              <rect x="-6" y="-6" width="12" height="12" fill="rgba(217, 83, 79, 0.3)" stroke="#D9534F" strokeWidth="1.2" transform="rotate(45)" />
              <line x1="0" y1="0" x2="16" y2="8" stroke="#D9534F" strokeWidth="1" strokeDasharray="2 2" />
              <text x="18" y="10" fill="#D9534F" fontSize="8" fontFamily="var(--font-mono)">
                ICEBERG A-017 (DRIFT)
              </text>
            </g>

            {/* Iceberg A-23a Major Tabular Marker */}
            <g transform="translate(230, 95)">
              <rect x="-10" y="-7" width="20" height="14" fill="rgba(200, 75, 49, 0.3)" stroke="#C84B31" strokeWidth="1.5" />
              <text x="14" y="2" fill="#C84B31" fontSize="8" fontFamily="var(--font-mono)">
                A-23a [TABULAR]
              </text>
            </g>

            {/* Technical Cartographic Coordinate Labels */}
            <text x="25" y="254" fill="#647B95" fontSize="8" fontFamily="var(--font-mono)">LON 090°W</text>
            <text x="430" y="254" fill="#647B95" fontSize="8" fontFamily="var(--font-mono)">LON 090°E</text>
            <text x="240" y="32" fill="#647B95" fontSize="8" fontFamily="var(--font-mono)">LON 000°</text>
            <text x="236" y="475" fill="#647B95" fontSize="8" fontFamily="var(--font-mono)">LON 180°</text>
          </svg>

          {/* Bottom Card Overlay Strip */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 16px',
              backgroundColor: 'rgba(4, 19, 44, 0.75)',
              backdropFilter: 'blur(8px)',
              borderTop: '1px solid var(--glass-border-subtle)',
              borderBottomLeftRadius: 'var(--radius-xl)',
              borderBottomRightRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-secondary)'
            }}
          >
            <span>ANTARCTIC OPERATIONS · DECISION SUPPORT</span>
            <span style={{ color: 'var(--accent-ice)' }}>SYSTEM RUNNING · PC3 CORRIDOR</span>
          </div>
        </div>
      </div>

      {/* Footer Scientific Disclaimer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 28px',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}
      >
        <div>
          College AI/ML Decision Support System · Synthetic Polar Demonstration Platform
        </div>
        <div>
          Not certified for primary navigation. Comply with IMO Polar Code & Master authority.
        </div>
      </footer>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
