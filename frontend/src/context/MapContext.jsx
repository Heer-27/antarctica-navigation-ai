import React, { createContext, useContext, useState } from 'react';

const MapContext = createContext(null);

const DEFAULT_LAYERS = {
  seaIceCurrent: true,
  seaIceForecast: false,
  icebergPositions: true,
  icebergTrajectories: true,
  vessels: true,
  recommendedRoute: true,
  alternativeRoutes: false,
  hazardZones: true,
  weatherOverlay: false,
  oceanOverlay: false,
  graticule: true
};

export function MapProvider({ children }) {
  const [center, setCenter] = useState([-65.5, -60.0]); // Antarctic Peninsula / Weddell Margin
  const [zoom, setZoom] = useState(4);
  const [activeLayers, setActiveLayers] = useState(DEFAULT_LAYERS);
  const [selectedIcebergId, setSelectedIcebergId] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [cursorCoordinates, setCursorCoordinates] = useState({ lat: -65.5, lon: -60.0 });
  const [mapInstance, setMapInstance] = useState(null);

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const flyTo = (lat, lon, targetZoom = 6) => {
    setCenter([lat, lon]);
    setZoom(targetZoom);
    if (mapInstance && typeof mapInstance.flyTo === 'function') {
      mapInstance.flyTo([lat, lon], targetZoom, { duration: 1.2 });
    }
  };

  const resetView = () => {
    flyTo(-65.5, -60.0, 4);
  };

  return (
    <MapContext.Provider
      value={{
        center,
        zoom,
        setCenter,
        setZoom,
        activeLayers,
        toggleLayer,
        selectedIcebergId,
        setSelectedIcebergId,
        selectedSegmentId,
        setSelectedSegmentId,
        cursorCoordinates,
        setCursorCoordinates,
        flyTo,
        resetView,
        mapInstance,
        setMapInstance
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapState() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapState must be used within a MapProvider');
  }
  return context;
}
