import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MapProvider } from './context/MapContext';
import AppShell from './components/layout/AppShell';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SeaIce from './pages/SeaIce';
import Icebergs from './pages/Icebergs';
import IcebergDetail from './pages/IcebergDetail';
import Navigation from './pages/Navigation';
import Environment from './pages/Environment';
import Vessels from './pages/Vessels';
import VesselDetail from './pages/VesselDetail';
import Scenario from './pages/Scenario';
import History from './pages/History';
import Models from './pages/Models';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AppProvider>
      <MapProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page with full-bleed hero */}
            <Route path="/" element={<Landing />} />

            {/* Application shell with sidebar, header, telemetry strip */}
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sea-ice" element={<SeaIce />} />
              <Route path="/icebergs" element={<Icebergs />} />
              <Route path="/icebergs/:id" element={<IcebergDetail />} />
              <Route path="/navigation" element={<Navigation />} />
              <Route path="/environment" element={<Environment />} />
              <Route path="/vessels" element={<Vessels />} />
              <Route path="/vessels/:id" element={<VesselDetail />} />
              <Route path="/scenario" element={<Scenario />} />
              <Route path="/history" element={<History />} />
              <Route path="/models" element={<Models />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MapProvider>
    </AppProvider>
  );
}
