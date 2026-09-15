import React, { useState, useEffect } from 'react';
import { Ship, Navigation, RotateCcw, Crosshair } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { balanceWeights, validateLatitude, validateLongitude } from '../../utils/validation';
import CoordinateDisplay from '../common/CoordinateDisplay';

export default function RouteForm({ onOptimize, isOptimizing, currentStep, vessels = [] }) {
  const { selectedShip, setSelectedShip, navPreloadVessel, setNavPreloadVessel } = useApp();

  const [form, setForm] = useState({
    shipId: selectedShip?.id || 'rv-polarstern',
    startLat: selectedShip?.latitude || -64.82,
    startLon: selectedShip?.longitude || -58.25,
    destLat: selectedShip?.destLatitude || -67.57,
    destLon: selectedShip?.destLongitude || -68.13,
    weights: { safety: 70, fuel: 20, time: 10 }
  });

  const [errors, setErrors] = useState({});

  // Sync when user selects vessel from Fleet page or preloaded vessel
  useEffect(() => {
    if (navPreloadVessel) {
      setForm(prev => ({
        ...prev,
        shipId: navPreloadVessel.id,
        startLat: navPreloadVessel.latitude,
        startLon: navPreloadVessel.longitude,
        destLat: navPreloadVessel.destLatitude || -67.57,
        destLon: navPreloadVessel.destLongitude || -68.13
      }));
      setNavPreloadVessel(null);
    }
  }, [navPreloadVessel]);

  const handleShipChange = (e) => {
    const sId = e.target.value;
    const vessel = vessels.find(v => v.id === sId);
    if (vessel) {
      setSelectedShip(vessel);
      setForm(prev => ({
        ...prev,
        shipId: sId,
        startLat: vessel.latitude,
        startLon: vessel.longitude,
        destLat: vessel.destLatitude || prev.destLat,
        destLon: vessel.destLongitude || prev.destLon
      }));
    }
  };

  const handleWeightChange = (key, val) => {
    const balanced = balanceWeights(key, val, form.weights);
    setForm(prev => ({ ...prev, weights: balanced }));
  };

  const handleUseCurrentShipPos = () => {
    const vessel = vessels.find(v => v.id === form.shipId) || selectedShip;
    if (vessel) {
      setForm(prev => ({
        ...prev,
        startLat: vessel.latitude,
        startLon: vessel.longitude
      }));
    }
  };

  const handleReset = () => {
    setForm({
      shipId: selectedShip?.id || 'rv-polarstern',
      startLat: -64.82,
      startLon: -58.25,
      destLat: -67.57,
      destLon: -68.13,
      weights: { safety: 70, fuel: 20, time: 10 }
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const lat1Err = validateLatitude(form.startLat);
    const lon1Err = validateLongitude(form.startLon);
    const lat2Err = validateLatitude(form.destLat);
    const lon2Err = validateLongitude(form.destLon);

    if (lat1Err) newErrors.startLat = lat1Err;
    if (lon1Err) newErrors.startLon = lon1Err;
    if (lat2Err) newErrors.destLat = lat2Err;
    if (lon2Err) newErrors.destLon = lon2Err;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (onOptimize) {
      onOptimize({
        shipId: form.shipId,
        startLat: Number(form.startLat),
        startLon: Number(form.startLon),
        destLat: Number(form.destLat),
        destLon: Number(form.destLon),
        weights: form.weights
      });
    }
  };

  return (
    <div className="tech-card" style={{ padding: '16px' }}>
      <div className="technical-label flex-between" style={{ marginBottom: '12px' }}>
        <span>EXPEDITION ROUTE PARAMETERS</span>
        <button
          type="button"
          onClick={handleReset}
          className="btn-polar"
          style={{ padding: '3px 7px', fontSize: '10px' }}
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Vessel Selection */}
        <div>
          <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>
            Registered Vessel (Polar Class)
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={form.shipId}
              onChange={handleShipChange}
              className="input-polar"
              style={{ paddingLeft: '28px' }}
            >
              {vessels.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.iceClass})
                </option>
              ))}
            </select>
            <Ship size={14} color="var(--accent-ice)" style={{ position: 'absolute', left: '8px', top: '9px', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Start Position */}
        <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span className="technical-label" style={{ color: 'var(--accent-ice)' }}>Departure Waypoint (Start)</span>
            <button
              type="button"
              onClick={handleUseCurrentShipPos}
              className="btn-polar"
              style={{ fontSize: '10px', padding: '2px 6px' }}
            >
              <Crosshair size={11} /> Vessel Pos
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span className="technical-label" style={{ fontSize: '9px' }}>Latitude (°S)</span>
              <input
                type="number"
                step="0.0001"
                value={form.startLat}
                onChange={e => setForm({ ...form, startLat: e.target.value })}
                className="input-polar"
                placeholder="-64.82"
              />
              {errors.startLat && <div style={{ color: 'var(--risk-high)', fontSize: '9.5px', marginTop: '2px' }}>{errors.startLat}</div>}
            </div>
            <div>
              <span className="technical-label" style={{ fontSize: '9px' }}>Longitude (°E/W)</span>
              <input
                type="number"
                step="0.0001"
                value={form.startLon}
                onChange={e => setForm({ ...form, startLon: e.target.value })}
                className="input-polar"
                placeholder="-58.25"
              />
              {errors.startLon && <div style={{ color: 'var(--risk-high)', fontSize: '9.5px', marginTop: '2px' }}>{errors.startLon}</div>}
            </div>
          </div>
        </div>

        {/* Destination Position */}
        <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="technical-label" style={{ marginBottom: '6px', color: 'var(--text-primary)' }}>
            Destination Waypoint (Target)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span className="technical-label" style={{ fontSize: '9px' }}>Latitude (°S)</span>
              <input
                type="number"
                step="0.0001"
                value={form.destLat}
                onChange={e => setForm({ ...form, destLat: e.target.value })}
                className="input-polar"
                placeholder="-67.57"
              />
              {errors.destLat && <div style={{ color: 'var(--risk-high)', fontSize: '9.5px', marginTop: '2px' }}>{errors.destLat}</div>}
            </div>
            <div>
              <span className="technical-label" style={{ fontSize: '9px' }}>Longitude (°E/W)</span>
              <input
                type="number"
                step="0.0001"
                value={form.destLon}
                onChange={e => setForm({ ...form, destLon: e.target.value })}
                className="input-polar"
                placeholder="-68.13"
              />
              {errors.destLon && <div style={{ color: 'var(--risk-high)', fontSize: '9.5px', marginTop: '2px' }}>{errors.destLon}</div>}
            </div>
          </div>
        </div>

        {/* Multi-Objective Sliders (Safety, Fuel, Time summing to 100%) */}
        <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span className="technical-label">Optimization Priorities</span>
            <span className="mono-readout" style={{ fontSize: '10.5px', color: 'var(--accent-ice)' }}>
              Sum: {form.weights.safety + form.weights.fuel + form.weights.time}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Safety */}
            <div>
              <div className="flex-between mono-readout" style={{ fontSize: '11px', marginBottom: '3px' }}>
                <span style={{ color: 'var(--risk-low)' }}>Safety & Ice Avoidance</span>
                <span style={{ fontWeight: 600 }}>{form.weights.safety}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.weights.safety}
                onChange={e => handleWeightChange('safety', e.target.value)}
                className="slider-polar"
              />
            </div>

            {/* Fuel */}
            <div>
              <div className="flex-between mono-readout" style={{ fontSize: '11px', marginBottom: '3px' }}>
                <span style={{ color: 'var(--accent-ice)' }}>Fuel Efficiency</span>
                <span style={{ fontWeight: 600 }}>{form.weights.fuel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.weights.fuel}
                onChange={e => handleWeightChange('fuel', e.target.value)}
                className="slider-polar"
              />
            </div>

            {/* Time */}
            <div>
              <div className="flex-between mono-readout" style={{ fontSize: '11px', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transit Speed (Time)</span>
                <span style={{ fontWeight: 600 }}>{form.weights.time}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.weights.time}
                onChange={e => handleWeightChange('time', e.target.value)}
                className="slider-polar"
              />
            </div>
          </div>
        </div>

        {/* Optimization Loading Status or Action Button */}
        {isOptimizing ? (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(116, 179, 206, 0.08)',
              border: '1px dashed var(--accent-ice)',
              borderRadius: 'var(--radius-xs)',
              textAlign: 'center'
            }}
          >
            <div className="mono-readout" style={{ fontSize: '11px', color: 'var(--accent-ice)', fontWeight: 600, marginBottom: '4px' }}>
              CALCULATING OPTIMAL MARITIME ROUTE...
            </div>
            <div className="technical-label" style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
              {currentStep || 'Analyzing environmental conditions...'}
            </div>
          </div>
        ) : (
          <button type="submit" className="btn-polar btn-primary-action" style={{ width: '100%', padding: '10px' }}>
            <Navigation size={14} />
            <span>OPTIMIZE POLAR ROUTE</span>
          </button>
        )}
      </form>
    </div>
  );
}
