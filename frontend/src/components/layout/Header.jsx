import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, HelpCircle, Sliders, Menu, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatUtcDateTime } from '../../utils/formatting';

export default function Header({ onMenuClick }) {
  const { systemStatus, notifications, dismissNotification } = useApp();
  const location = useLocation();
  const [utcTime, setUtcTime] = useState(formatUtcDateTime());
  const [showNotifications, setShowNotifications] = useState(false);

  // Real-time UTC clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(formatUtcDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return 'ANTARCTIC OPERATIONS COMMAND';
    if (pathname.startsWith('/sea-ice')) return 'SEA-ICE CONCENTRATION & FORECAST';
    if (pathname.startsWith('/icebergs/')) return 'ICEBERG TRAJECTORY DYNAMICS';
    if (pathname.startsWith('/icebergs')) return 'ICEBERG TRACKING & PROXIMITY';
    if (pathname.startsWith('/navigation')) return 'EXPEDITION ROUTE OPTIMIZATION';
    if (pathname.startsWith('/environment')) return 'SYNOPTIC POLAR METEOROLOGY & OCEAN';
    if (pathname.startsWith('/vessels/')) return 'RESEARCH VESSEL TELEMETRY';
    if (pathname.startsWith('/vessels')) return 'POLAR RESEARCH FLEET MANAGEMENT';
    if (pathname.startsWith('/scenario')) return 'ENVIRONMENTAL "WHAT IF?" SIMULATOR';
    if (pathname.startsWith('/history')) return 'HISTORICAL POLAR OBSERVATIONS';
    if (pathname.startsWith('/models')) return 'PREDICTION MODEL METRICS & TRANSPARENCY';
    if (pathname.startsWith('/settings')) return 'SYSTEM SETTINGS & CARTOGRAPHY PRESETS';
    if (pathname.startsWith('/help')) return 'POLAR NAVIGATION REFERENCE & MANUAL';
    return 'POLAR DECISION SUPPORT';
  };

  const isDemo = systemStatus.dataMode !== 'LIVE';

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'rgba(13, 27, 52, 0.65)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-panel), var(--glass-specular)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
          className="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <div>
          <h1
            className="mono-readout"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase'
            }}
          >
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      {/* Center/Right: Data Status & UTC Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Telemetry Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-primary)',
            padding: '4px 10px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>DATA:</span>
          <span style={{ color: isDemo ? 'var(--risk-moderate)' : 'var(--risk-low)', fontWeight: 600 }}>
            {isDemo ? 'DEMO' : 'LIVE'}
          </span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>{utcTime}</span>
        </div>

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            style={{
              background: 'rgba(28, 42, 67, 0.45)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: notifications.length > 0 ? 'var(--accent-ice)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '7px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <Bell size={15} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--risk-critical)',
                  boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)'
                }}
              />
            )}
          </button>

          {/* Settings Link */}
          <Link
            to="/settings"
            aria-label="Settings"
            style={{
              background: 'rgba(28, 42, 67, 0.45)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              padding: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={15} />
          </Link>

          {/* Help Link */}
          <Link
            to="/help"
            aria-label="Help and Documentation"
            style={{
              background: 'rgba(28, 42, 67, 0.45)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              padding: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <HelpCircle size={15} />
          </Link>

          {/* Notifications Flyout Drawer */}
          {showNotifications && (
            <div
              className="glass-panel-deep"
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '340px',
                zIndex: 2000,
                padding: '14px',
                border: '1px solid var(--glass-border-hover)'
              }}
            >
              <div className="flex-between" style={{ marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span className="technical-label">Operational Hazard Notices ({notifications.length})</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={13} />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', padding: '12px 0', textAlign: 'center' }}>
                  No active operational notices.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '8px',
                        background: 'var(--bg-primary)',
                        borderLeft: `3px solid ${n.severity === 'WARNING' ? 'var(--risk-moderate)' : 'var(--accent-ice)'}`,
                        borderRadius: 'var(--radius-xs)'
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '2px' }}>
                        <span className="mono-readout" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        {n.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
