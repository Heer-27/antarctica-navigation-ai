import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShips } from '../hooks/useShips';
import { useApp } from '../context/AppContext';
import { formatFuel } from '../utils/formatting';
import { formatLatitude, formatLongitude } from '../utils/coordinates';
import { validateVesselForm } from '../utils/validation';
import CoordinateDisplay from '../components/common/CoordinateDisplay';
import { Ship, Plus, Edit2, Trash2, Navigation, Check, X, ShieldAlert } from 'lucide-react';

export default function Vessels() {
  const navigate = useNavigate();
  const { ships, loading, addShip, editShip, removeShip } = useShips();
  const { selectShipForNavigation } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    name: '',
    latitude: -64.82,
    longitude: -58.25,
    maxSpeed: 15.0,
    normalSpeed: 11.0,
    fuelCapacity: 900000,
    fuelConsumptionRate: 85,
    iceClass: 'PC3 (Polar Class 3)',
    destination: 'Rothera Research Station',
    destLatitude: -67.57,
    destLongitude: -68.13,
    operator: 'National Polar Research Institute'
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (vessel) => {
    setEditingId(vessel.id);
    setForm({
      name: vessel.name,
      latitude: vessel.latitude,
      longitude: vessel.longitude,
      maxSpeed: vessel.maxSpeed,
      normalSpeed: vessel.normalSpeed,
      fuelCapacity: vessel.fuelCapacity,
      fuelConsumptionRate: vessel.fuelConsumptionRate,
      iceClass: vessel.iceClass,
      destination: vessel.destination,
      destLatitude: vessel.destLatitude || -67.57,
      destLongitude: vessel.destLongitude || -68.13,
      operator: vessel.operator || 'Antarctic Expedition'
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validation = validateVesselForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      if (editingId) {
        await editShip(editingId, {
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          maxSpeed: Number(form.maxSpeed),
          normalSpeed: Number(form.normalSpeed),
          fuelCapacity: Number(form.fuelCapacity),
          fuelConsumptionRate: Number(form.fuelConsumptionRate),
          destLatitude: Number(form.destLatitude),
          destLongitude: Number(form.destLongitude)
        });
      } else {
        await addShip({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          maxSpeed: Number(form.maxSpeed),
          normalSpeed: Number(form.normalSpeed),
          fuelCapacity: Number(form.fuelCapacity),
          fuelConsumptionRate: Number(form.fuelConsumptionRate),
          destLatitude: Number(form.destLatitude),
          destLongitude: Number(form.destLongitude)
        });
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to persist vessel');
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Remove research vessel "${name}" from polar fleet registry?`)) {
      await removeShip(id);
    }
  };

  const handlePlanRoute = (vessel) => {
    selectShipForNavigation(vessel);
    navigate('/navigation');
  };

  return (
    <div style={{ flex: 1, padding: '20px 28px', backgroundColor: 'transparent', overflowY: 'auto' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <div className="technical-label">MARITIME ASSET DIRECTORY</div>
          <h2 className="mono-readout" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            REGISTERED ANTARCTIC RESEARCH FLEET
          </h2>
        </div>

        <button onClick={handleOpenAdd} className="btn-polar btn-primary-action">
          <Plus size={14} />
          <span>Register New Vessel</span>
        </button>
      </div>

      {/* Vessels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {ships.map(ship => (
          <div key={ship.id} className="tech-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '1px solid var(--accent-cyan)',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(91, 192, 190, 0.1)'
                  }}
                >
                  <Ship size={15} color="var(--accent-cyan)" />
                </div>
                <div>
                  <Link
                    to={`/vessels/${ship.id}`}
                    className="mono-readout"
                    style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                  >
                    {ship.name}
                  </Link>
                  <div className="technical-label" style={{ fontSize: '9px', color: 'var(--accent-ice)' }}>
                    {ship.iceClass}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleOpenEdit(ship)}
                  className="btn-polar"
                  style={{ padding: '4px', border: '1px solid var(--border-subtle)' }}
                  title="Edit Vessel Parameters"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(ship.id, ship.name)}
                  className="btn-polar btn-danger-action"
                  style={{ padding: '4px' }}
                  title="Remove from Registry"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Position and Destination */}
            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>CURRENT POSITION:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {formatLatitude(ship.latitude)} {formatLongitude(ship.longitude)}
                </span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>ASSIGNED DESTINATION:</span>
                <span style={{ color: 'var(--accent-ice)' }}>{ship.destination}</span>
              </div>
            </div>

            {/* Vessel Engineering Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>CRUISING SPEED</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ship.normalSpeed} kn</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>FUEL CAPACITY</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatFuel(ship.fuelCapacity, 't')}</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>BURN RATE</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ship.fuelConsumptionRate} L/nm</span>
              </div>
            </div>

            {/* Plan Route CTA */}
            <button
              onClick={() => handlePlanRoute(ship)}
              className="btn-polar btn-primary-action"
              style={{ width: '100%', marginTop: '4px', padding: '8px' }}
            >
              <Navigation size={13} />
              <span>Plan Route for this Vessel</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add / Edit Vessel Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 18, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="tech-card"
            style={{
              width: '560px',
              maxWidth: '100%',
              backgroundColor: 'var(--surface-overlay)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-overlay)',
              padding: '20px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div className="mono-readout" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingId ? 'EDIT VESSEL SPECIFICATIONS' : 'REGISTER NEW RESEARCH VESSEL'}
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Vessel Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. R/V Polarstern"
                  className="input-polar"
                />
                {errors.name && <div style={{ color: 'var(--risk-high)', fontSize: '10px', marginTop: '2px' }}>{errors.name}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Latitude (-90 to +90)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    className="input-polar"
                  />
                  {errors.latitude && <div style={{ color: 'var(--risk-high)', fontSize: '10px', marginTop: '2px' }}>{errors.latitude}</div>}
                </div>
                <div>
                  <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Longitude (-180 to +180)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    className="input-polar"
                  />
                  {errors.longitude && <div style={{ color: 'var(--risk-high)', fontSize: '10px', marginTop: '2px' }}>{errors.longitude}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Maximum Speed (kn)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.maxSpeed}
                    onChange={e => setForm({ ...form, maxSpeed: e.target.value })}
                    className="input-polar"
                  />
                  {errors.maxSpeed && <div style={{ color: 'var(--risk-high)', fontSize: '10px', marginTop: '2px' }}>{errors.maxSpeed}</div>}
                </div>
                <div>
                  <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Cruising Speed (kn)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.normalSpeed}
                    onChange={e => setForm({ ...form, normalSpeed: e.target.value })}
                    className="input-polar"
                  />
                  {errors.normalSpeed && <div style={{ color: 'var(--risk-high)', fontSize: '10px', marginTop: '2px' }}>{errors.normalSpeed}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Bunker Fuel Capacity (L)</label>
                  <input
                    type="number"
                    value={form.fuelCapacity}
                    onChange={e => setForm({ ...form, fuelCapacity: e.target.value })}
                    className="input-polar"
                  />
                  {errors.fuelCapacity && <div style={{ color: 'var(--risk-high)', fontSize: '10px', marginTop: '2px' }}>{errors.fuelCapacity}</div>}
                </div>
                <div>
                  <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Fuel Consumption Rate (L/nm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.fuelConsumptionRate}
                    onChange={e => setForm({ ...form, fuelConsumptionRate: e.target.value })}
                    className="input-polar"
                  />
                  {errors.fuelConsumptionRate && <div style={{ color: 'var(--risk-high)', fontSize: '10px', marginTop: '2px' }}>{errors.fuelConsumptionRate}</div>}
                </div>
              </div>

              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>IMO Polar Class Rating</label>
                <select
                  value={form.iceClass}
                  onChange={e => setForm({ ...form, iceClass: e.target.value })}
                  className="input-polar"
                >
                  <option value="PC1 (Year-round polar operation in all ice conditions)">PC1 - Year-round all polar ice</option>
                  <option value="PC2 (Year-round moderate multi-year ice conditions)">PC2 - Moderate multi-year ice</option>
                  <option value="PC3 (Year-round second-year ice with multi-year inclusions)">PC3 - Second-year ice / multi-year inclusions</option>
                  <option value="PC4 (Year-round thick first-year ice)">PC4 - Thick first-year ice</option>
                  <option value="PC5 (Year-round medium first-year ice)">PC5 - Medium first-year ice</option>
                  <option value="PC6 (Summer/autumn medium first-year ice)">PC6 - Summer/autumn first-year ice</option>
                  <option value="PC7 (Summer/autumn thin first-year ice)">PC7 - Thin first-year ice</option>
                </select>
              </div>

              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: '4px' }}>Destination Name</label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value })}
                  className="input-polar"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-polar">
                  Cancel
                </button>
                <button type="submit" className="btn-polar btn-primary-action">
                  <Check size={14} />
                  <span>{editingId ? 'Save Modifications' : 'Register Vessel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
