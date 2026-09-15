import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OperationsStrip from './OperationsStrip';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'transparent' }}>
      {/* Persistent Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="main-viewport"
      >
        {/* Global Operations Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Live Operations Telemetry Strip */}
        <OperationsStrip />

        {/* Main Routed Page Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .main-viewport {
            margin-left: 0 !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}
