import React, { createContext, useContext, useState, useEffect } from 'react';
import healthApi from '../api/healthApi';
import { MOCK_SHIPS } from '../api/mockData';

const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  unitDistance: 'km',
  unitFuel: 'L',
  unitSpeed: 'kn',
  coordinateFormat: 'dms',
  defaultForecast: '24h',
  defaultWeights: { safety: 70, fuel: 20, time: 10 },
  highContrast: false,
  reducedMotion: false,
  showGraticule: true
};

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('antarctic_user_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [systemStatus, setSystemStatus] = useState({
    status: 'ONLINE',
    isBackendConnected: false,
    dataMode: 'FRONTEND_SIMULATION',
    components: {},
    telemetry: {
      seaIceAverage: 72.4,
      icebergsTracked: 184,
      vesselsActive: 3,
      activeAlerts: 2,
      dataAgeMinutes: 18
    }
  });

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      severity: 'WARNING',
      timestamp: '12:15 UTC',
      title: 'Proximate Iceberg Drift Notice',
      message: 'Iceberg A-017 is within 18.4 km of proposed transit corridor SEG-03.'
    },
    {
      id: 'notif-2',
      severity: 'INFO',
      timestamp: '11:45 UTC',
      title: 'Copernicus Sentinel-1 Feed Refreshed',
      message: 'New synthetic SAR radar pass processed for Weddell Sea pack sector.'
    }
  ]);

  const [selectedShip, setSelectedShip] = useState(MOCK_SHIPS[0]);
  const [navPreloadVessel, setNavPreloadVessel] = useState(null);

  // Poll system health
  useEffect(() => {
    const fetchHealth = async () => {
      const res = await healthApi.getStatus();
      setSystemStatus(res);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 45000);
    return () => clearInterval(interval);
  }, []);

  // Save settings on change
  useEffect(() => {
    try {
      localStorage.setItem('antarctic_user_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }

    // Apply accessibility flags to html root
    if (settings.highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }

    if (settings.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
  }, [settings]);

  const updateSettings = (partial) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const selectShipForNavigation = (ship) => {
    setNavPreloadVessel(ship);
    setSelectedShip(ship);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        systemStatus,
        notifications,
        dismissNotification,
        selectedShip,
        setSelectedShip,
        navPreloadVessel,
        setNavPreloadVessel,
        selectShipForNavigation
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
