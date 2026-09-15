import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Layers,
  TriangleAlert,
  Navigation as NavigationIcon,
  CloudSun,
  Ship,
  Clock,
  Cpu,
  Sliders,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Radio,
  Shuffle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { systemStatus } = useApp();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'OVERVIEW', icon: Compass, exact: true },
    { to: '/sea-ice', label: 'SEA ICE', icon: Layers },
    { to: '/icebergs', label: 'ICEBERGS', icon: TriangleAlert },
    { to: '/navigation', label: 'NAVIGATION', icon: NavigationIcon },
    { to: '/environment', label: 'ENVIRONMENT', icon: CloudSun },
    { to: '/vessels', label: 'VESSELS', icon: Ship },
    { to: '/scenario', label: 'WHAT IF?', icon: Shuffle },
    { to: '/history', label: 'HISTORY', icon: Clock },
    { to: '/models', label: 'MODELS', icon: Cpu },
    { to: '/settings', label: 'SETTINGS', icon: Sliders },
    { to: '/help', label: 'HELP & DOCS', icon: HelpCircle }
  ];

  const dataModeLabel =
    systemStatus.dataMode === 'LIVE'
      ? 'LIVE DATA'
      : systemStatus.dataMode === 'BACKEND_DEMO'
      ? 'BACKEND DEMO'
      : 'SIMULATION';

  const dataModeColor =
    systemStatus.dataMode === 'LIVE'
      ? 'var(--risk-low)'
      : 'var(--risk-moderate)';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 18, 0.75)',
            backdropFilter: 'blur(3px)',
            zIndex: 1100
          }}
        />
      )}

      <aside
        style={{
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(13, 27, 52, 0.65)',
          backdropFilter: 'var(--glass-blur-lg)',
          WebkitBackdropFilter: 'var(--glass-blur-lg)',
          borderRight: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-panel), var(--glass-specular)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1200,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease',
          transform: mobileOpen ? 'translateX(0)' : undefined
        }}
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand / Polar Identity */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 16px',
            borderBottom: '1px solid var(--glass-border-subtle)',
            backgroundColor: 'rgba(4, 19, 44, 0.4)'
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  border: '1.5px solid var(--accent-ice)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(123, 208, 255, 0.15)',
                  boxShadow: '0 0 10px rgba(123, 208, 255, 0.3)'
                }}
              >
                <Radio size={14} color="var(--accent-ice)" />
              </div>
              <div>
                <div className="mono-readout" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  POLAR OPS CENTER
                </div>
                <div className="technical-label" style={{ fontSize: '8.5px', color: 'var(--accent-ice)' }}>
                  DECISION SUPPORT · 65°S
                </div>
              </div>
            </div>
          )}

          {collapsed && (
            <div
              style={{
                width: '28px',
                height: '28px',
                border: '1.5px solid var(--accent-ice)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '2px'
              }}
              title="Polar Decision Support System"
            >
              <Radio size={15} color="var(--accent-ice)" />
            </div>
          )}

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: collapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Collapsed Expand Quick Button */}
        {collapsed && (
          <div style={{ padding: '8px', textAlign: 'center' }}>
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              style={{
                background: 'var(--surface-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-xs)',
                padding: '4px',
                display: 'inline-flex'
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '10px 0' : '9px 14px',
                  margin: '0 4px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                  border: isActive ? '1px solid var(--glass-border-hover)' : '1px solid transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(1, 13, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)' : 'none',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--accent-ice)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom System Status & Data Mode */}
        <div
          style={{
            padding: collapsed ? '10px 4px' : '12px 14px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          {collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span
                className="status-indicator status-online"
                title={`System Online - ${dataModeLabel}`}
              />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <span className="status-indicator status-online" />
                <span className="mono-readout" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--risk-low)' }}>
                  SYSTEM ONLINE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-muted)' }}>DATA MODE:</span>
                <span style={{ color: dataModeColor, fontWeight: 600 }}>
                  {dataModeLabel}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
