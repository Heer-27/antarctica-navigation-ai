import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMapState } from '../../context/MapContext';
import { formatLatitude, formatLongitude } from '../../utils/coordinates';
import { MOCK_ICEBERGS, MOCK_SHIPS, MOCK_SEA_ICE_CURRENT, MOCK_ROUTES } from '../../api/mockData';
import LayerControl from './LayerControl';
import MapLegend from './MapLegend';
import { Maximize2, RotateCcw, Target } from 'lucide-react';

export default function MapContainer({
  onSelectIceberg,
  onSelectSegment,
  highlightedIcebergId,
  highlightedRouteId = 'balanced',
  customRoutes,
  showControls = true,
  height = '100%'
}) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routesGroupRef = useRef(null);
  const seaIceGroupRef = useRef(null);
  const graticuleGroupRef = useRef(null);

  const {
    center,
    zoom,
    activeLayers,
    cursorCoordinates,
    setCursorCoordinates,
    setMapInstance,
    resetView
  } = useMapState();

  const [mouseCoords, setMouseCoords] = useState({ lat: -64.82, lon: -58.25 });

  // Initialize Leaflet map safely once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Create map centered on Antarctic Peninsula / Weddell Gateway
    const map = L.map(mapRef.current, {
      center: center || [-65.5, -60.0],
      zoom: zoom || 4,
      minZoom: 3,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: true
    });

    // Dark cartographic ocean basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | GEBCO Bathymetry & Polar GIS',
      subdomains: 'abcd',
      maxZoom: 12
    }).addTo(map);

    // Layer groups for dynamic toggling
    seaIceGroupRef.current = L.layerGroup().addTo(map);
    graticuleGroupRef.current = L.layerGroup().addTo(map);
    routesGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Mouse coordinate tracker
    map.on('mousemove', (e) => {
      const { lat, lng } = e.latlng;
      setMouseCoords({ lat, lon: lng });
      setCursorCoordinates({ lat, lon: lng });
    });

    leafletMapRef.current = map;
    setMapInstance(map);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update center/zoom if context triggers flyTo
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const currentCenter = leafletMapRef.current.getCenter();
    if (Math.abs(currentCenter.lat - center[0]) > 0.05 || Math.abs(currentCenter.lng - center[1]) > 0.05) {
      leafletMapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Render Polar Graticule Lines
  useEffect(() => {
    if (!graticuleGroupRef.current) return;
    graticuleGroupRef.current.clearLayers();

    if (!activeLayers.graticule) return;

    // Latitudes: 60S, 65S, 70S, 75S, 80S
    const parallels = [-60, -65, -70, -75, -80];
    parallels.forEach(lat => {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 5) {
        points.push([lat, lon]);
      }
      const line = L.polyline(points, {
        color: '#273E5D',
        weight: 1,
        dashArray: '3, 6',
        opacity: 0.6,
        interactive: false
      });
      graticuleGroupRef.current.addLayer(line);
    });

    // Meridians every 30 degrees
    for (let lon = -180; lon < 180; lon += 30) {
      const points = [];
      for (let lat = -50; lat >= -88; lat -= 2) {
        points.push([lat, lon]);
      }
      const line = L.polyline(points, {
        color: '#273E5D',
        weight: 1,
        dashArray: '3, 6',
        opacity: 0.6,
        interactive: false
      });
      graticuleGroupRef.current.addLayer(line);
    }
  }, [activeLayers.graticule]);

  // Render Sea Ice Concentrations
  useEffect(() => {
    if (!seaIceGroupRef.current) return;
    seaIceGroupRef.current.clearLayers();

    if (!activeLayers.seaIceCurrent && !activeLayers.seaIceForecast) return;

    MOCK_SEA_ICE_CURRENT.regionalZones.forEach(zone => {
      const conc = zone.concentration;
      let color = '#1D3557';
      if (conc >= 80) color = '#E9F1F7';
      else if (conc >= 60) color = '#A8DADC';
      else if (conc >= 40) color = '#74B3CE';
      else if (conc >= 20) color = '#457B9D';

      const circle = L.circle(zone.center, {
        radius: zone.radiusKm * 1000,
        color: color,
        weight: 1,
        fillColor: color,
        fillOpacity: conc / 170, // proportional transparency
        dashArray: activeLayers.seaIceForecast ? '4, 4' : undefined
      });

      circle.bindPopup(`
        <div style="font-family: var(--font-mono); min-width: 180px;">
          <div style="font-weight: 700; color: var(--text-primary); font-size: 11px; margin-bottom: 4px;">
            ${zone.name}
          </div>
          <div style="color: var(--accent-ice); font-size: 12px; margin-bottom: 4px;">
            CONCENTRATION: <strong>${conc}%</strong>
          </div>
          <div style="color: var(--text-muted); font-size: 10px;">
            CLASSIFICATION: ${zone.status}
          </div>
        </div>
      `);

      seaIceGroupRef.current.addLayer(circle);
    });
  }, [activeLayers.seaIceCurrent, activeLayers.seaIceForecast]);

  // Render Icebergs, Trajectories & Research Vessels
  useEffect(() => {
    if (!markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    // 1. Icebergs
    if (activeLayers.icebergPositions) {
      MOCK_ICEBERGS.forEach(berg => {
        const isHighlighted = highlightedIcebergId === berg.id;
        const riskColor =
          berg.riskLevel === 'CRITICAL' ? '#C84B31' :
          berg.riskLevel === 'HIGH' ? '#D9534F' :
          berg.riskLevel === 'MODERATE' ? '#E09F3E' : '#4EBA6F';

        // Size marker according to iceberg length (minimum 16px, maximum 28px)
        const size = Math.min(28, Math.max(16, Math.round(Math.log10(berg.length) * 5)));

        const iconHtml = `
          <div class="iceberg-marker-icon" style="
            width: ${size}px;
            height: ${size}px;
            border: 1.5px solid ${isHighlighted ? '#FFFFFF' : riskColor};
            background-color: ${riskColor}33;
            transform: rotate(${berg.heading}deg);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: ${isHighlighted ? '0 0 10px #FFFFFF' : 'none'};
          ">
            <div style="
              width: 0;
              height: 0;
              border-left: 3px solid transparent;
              border-right: 3px solid transparent;
              border-bottom: 6px solid ${riskColor};
              position: absolute;
              top: -5px;
            "></div>
            <span style="
              font-family: var(--font-mono);
              font-size: 8px;
              font-weight: 700;
              color: #FFFFFF;
              transform: rotate(-${berg.heading}deg);
            ">${berg.id}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-iceberg-div-icon',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });

        const marker = L.marker([berg.latitude, berg.longitude], { icon: customIcon });

        marker.on('click', () => {
          if (onSelectIceberg) onSelectIceberg(berg);
        });

        marker.bindPopup(`
          <div style="font-family: var(--font-mono); min-width: 190px;">
            <div style="font-weight: 700; font-size: 12px; color: ${riskColor}; margin-bottom: 4px;">
              ${berg.name}
            </div>
            <div style="color: var(--text-secondary); font-size: 10.5px; margin-bottom: 2px;">
              POS: ${formatLatitude(berg.latitude)} ${formatLongitude(berg.longitude)}
            </div>
            <div style="color: var(--text-secondary); font-size: 10.5px; margin-bottom: 2px;">
              DRIFT: ${berg.speed} kn · ${berg.direction}
            </div>
            <div style="color: var(--text-secondary); font-size: 10.5px; margin-bottom: 6px;">
              DIMENSIONS: ${berg.length > 1000 ? (berg.length / 1000).toFixed(1) + 'km' : berg.length + 'm'} × ${berg.width > 1000 ? (berg.width / 1000).toFixed(1) + 'km' : berg.width + 'm'}
            </div>
            <div style="color: ${riskColor}; font-weight: 600; font-size: 10px;">
              RISK: ${berg.riskLevel} (${berg.riskScore}/100)
            </div>
          </div>
        `);

        markersGroupRef.current.addLayer(marker);

        // 2. Trajectories
        if (activeLayers.icebergTrajectories && berg.trajectory) {
          const latlngs = berg.trajectory.map(p => [p.latitude, p.longitude]);
          const trajectoryLine = L.polyline(latlngs, {
            color: riskColor,
            weight: 2,
            dashArray: '5, 5',
            opacity: 0.8
          });

          // Trajectory waypoint circles
          berg.trajectory.forEach((tp, idx) => {
            if (idx === 0) return; // skip current
            const circleMarker = L.circleMarker([tp.latitude, tp.longitude], {
              radius: 4,
              color: riskColor,
              fillColor: '#0B131F',
              fillOpacity: 1,
              weight: 1.5
            });

            circleMarker.bindTooltip(`${tp.time} (${tp.probability}%)`, {
              permanent: false,
              direction: 'top',
              className: 'polar-map-tooltip'
            });

            markersGroupRef.current.addLayer(circleMarker);
          });

          markersGroupRef.current.addLayer(trajectoryLine);
        }
      });
    }

    // 3. Research Vessels
    if (activeLayers.vessels) {
      MOCK_SHIPS.forEach(ship => {
        const vesselHtml = `
          <div class="vessel-marker-icon" style="
            padding: 3px 6px;
            background: rgba(11, 19, 31, 0.9);
            border: 1px solid var(--accent-cyan);
            border-radius: 2px;
            display: flex;
            align-items: center;
            gap: 4px;
            font-family: var(--font-mono);
            font-size: 9.5px;
            color: #FFFFFF;
            white-space: nowrap;
          ">
            <span style="color: var(--accent-cyan); font-weight: 700;">▲</span>
            <span>${ship.name}</span>
          </div>
        `;

        const icon = L.divIcon({
          html: vesselHtml,
          className: 'custom-vessel-div-icon',
          iconSize: [110, 24],
          iconAnchor: [55, 12]
        });

        const vMarker = L.marker([ship.latitude, ship.longitude], { icon });
        vMarker.bindPopup(`
          <div style="font-family: var(--font-mono); min-width: 200px;">
            <div style="font-weight: 700; color: var(--accent-cyan); font-size: 12px; margin-bottom: 4px;">
              ${ship.name}
            </div>
            <div style="color: var(--text-secondary); font-size: 10.5px; margin-bottom: 2px;">
              ICE RATING: ${ship.iceClass}
            </div>
            <div style="color: var(--text-secondary); font-size: 10.5px; margin-bottom: 2px;">
              SPEED: ${ship.normalSpeed} kn (Max: ${ship.maxSpeed} kn)
            </div>
            <div style="color: var(--text-secondary); font-size: 10.5px; margin-bottom: 4px;">
              DESTINATION: ${ship.destination}
            </div>
            <div style="color: var(--risk-low); font-size: 10px; font-weight: 600;">
              STATUS: ${ship.status}
            </div>
          </div>
        `);

        markersGroupRef.current.addLayer(vMarker);
      });
    }
  }, [activeLayers.icebergPositions, activeLayers.icebergTrajectories, activeLayers.vessels, highlightedIcebergId]);

  // Render Navigation Routes and Segments
  useEffect(() => {
    if (!routesGroupRef.current) return;
    routesGroupRef.current.clearLayers();

    const routesToRender = customRoutes || MOCK_ROUTES.options;

    routesToRender.forEach(route => {
      const isSelected = route.id === highlightedRouteId;
      const isRecommended = route.isRecommended || route.id === 'balanced';

      // Skip alternatives if layer is disabled
      if (!isRecommended && !activeLayers.alternativeRoutes && !isSelected) {
        return;
      }
      if (isRecommended && !activeLayers.recommendedRoute && !isSelected) {
        return;
      }

      const points = route.waypoints.map(w => [w.lat, w.lon]);

      const polyline = L.polyline(points, {
        color: route.color || '#E09F3E',
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 0.95 : 0.65,
        dashArray: isRecommended ? undefined : '5, 6'
      });

      polyline.bindPopup(`
        <div style="font-family: var(--font-mono); min-width: 190px;">
          <div style="font-weight: 700; color: ${route.color}; font-size: 12px; margin-bottom: 4px;">
            ${route.name}
          </div>
          <div style="color: var(--text-secondary); font-size: 11px;">
            DISTANCE: ${route.distanceKm} km · FUEL: ${route.estimatedFuelLiters} L
          </div>
          <div style="color: var(--text-secondary); font-size: 11px; margin-bottom: 4px;">
            EST. TIME: ${route.travelTimeHours} hrs · RISK: ${route.riskScore}/100
          </div>
        </div>
      `);

      routesGroupRef.current.addLayer(polyline);

      // Route waypoints
      route.waypoints.forEach((wp, idx) => {
        const isTerminal = idx === 0 || idx === route.waypoints.length - 1;
        const marker = L.circleMarker([wp.lat, wp.lon], {
          radius: isTerminal ? 5 : 3.5,
          color: isTerminal ? '#FFFFFF' : route.color,
          fillColor: route.color,
          fillOpacity: 1,
          weight: 1.5
        });

        marker.bindTooltip(`${wp.step} (${formatLatitude(wp.lat)}, ${formatLongitude(wp.lon)})`, {
          direction: 'top'
        });

        routesGroupRef.current.addLayer(marker);
      });
    });

    // Segment Inspector interactive click targets
    if (MOCK_ROUTES.segments && onSelectSegment) {
      MOCK_ROUTES.segments.forEach(seg => {
        // Map segment waypoints
        const waypoints = MOCK_ROUTES.options.find(r => r.id === 'balanced')?.waypoints || [];
        if (waypoints.length >= 4) {
          // Bind event on route click
        }
      });
    }
  }, [highlightedRouteId, customRoutes, activeLayers.recommendedRoute, activeLayers.alternativeRoutes]);

  return (
    <div className="polar-map-container" style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Layer Selector */}
      {showControls && <LayerControl />}

      {/* Custom Map Legend */}
      {showControls && <MapLegend />}

      {/* Map Control Buttons: Zoom, Reset, Fullscreen */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <button
          onClick={() => leafletMapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="btn-polar"
          style={{ padding: '6px', minWidth: '32px', height: '32px', fontSize: '15px', fontWeight: 700 }}
        >
          +
        </button>
        <button
          onClick={() => leafletMapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="btn-polar"
          style={{ padding: '6px', minWidth: '32px', height: '32px', fontSize: '15px', fontWeight: 700 }}
        >
          -
        </button>
        <button
          onClick={resetView}
          title="Reset View to Antarctic Gateway"
          className="btn-polar"
          style={{ padding: '6px', minWidth: '32px', height: '32px' }}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Live Map Coordinate Crosshair Readout */}
      <div className="map-coordinate-overlay">
        <Target size={12} color="var(--accent-ice)" />
        <span>
          {formatLatitude(mouseCoords.lat)}&nbsp;&nbsp;{formatLongitude(mouseCoords.lon)}
        </span>
      </div>
    </div>
  );
}
