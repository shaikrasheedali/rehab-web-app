import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, cn } from '../../utils/formatters.js';

export default function Beds() {
  const { accommodations, notify, fetchAccommodations } = useApp();
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ id: '', label: '', type: 'Room', floor: '1st Floor' });
  const [submitting, setSubmitting] = useState(false);

  const filtered = accommodations.filter(item => {
    if (filter === 'occupied') return item.isOccupied;
    if (filter === 'vacant') return !item.isOccupied;
    if (filter === 'rooms') return item.type === 'Room';
    if (filter === 'beds') return item.type === 'Bed';
    return true;
  });

  const occupiedCount = accommodations.filter(x => x.isOccupied).length;
  const vacantCount = accommodations.length - occupiedCount;

  const saveUnit = async () => {
    if (!form.id.trim() || !form.label.trim()) {
      notify('Please provide a unique code ID and label.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.createAccommodation({
        id: form.id.trim().toUpperCase(),
        label: form.label.trim(),
        type: form.type,
        floor: form.floor
      });
      setModalOpen(false);
      setForm({ id: '', label: '', type: 'Room', floor: '1st Floor' });
      notify(`Unit ${form.id} registered.`);
      fetchAccommodations();
    } catch (err) {
      notify(err.message || 'Failed to create unit', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUnit = async (unit) => {
    if (unit.isOccupied) {
      notify('Cannot delete an occupied room or bed. Discharge or transfer patient first.', 'warning');
      return;
    }
    if (!window.confirm(`Delete accommodation unit ${unit.id}?`)) return;
    try {
      await api.deleteAccommodation(unit.id);
      notify(`Unit ${unit.id} deleted.`);
      fetchAccommodations();
    } catch (err) {
      notify(err.message || 'Failed to delete unit', 'warning');
    }
  };

  return (
    <AdminLayout
      title="Rooms & Beds Inventory"
      subtitle="Real-time occupancy tracking, bed allocations, and campus facility management"
      action={
        <button className="btn-primary mobile-hide !py-2 text-xs cursor-pointer" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={14} /> Add Accommodation Unit
        </button>
      }
    >
      {/* 3 Metric Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Total Campus Capacity</span>
          <strong className="block text-3xl font-display font-extrabold text-main mt-1">
            {accommodations.length} Units
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Currently Occupied</span>
          <strong className="block text-3xl font-display font-extrabold text-amber-600 mt-1">
            {occupiedCount} Patients
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Vacant & Ready</span>
          <strong className="block text-3xl font-display font-extrabold text-emerald-600 mt-1">
            {vacantCount} Available
          </strong>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card p-4 mb-6 bg-[var(--surface)] shadow-sm flex flex-wrap gap-2 justify-between items-center">
        <div className="flex rounded-full bg-[var(--mist)] p-1">
          {[
            ['all', 'All Units'],
            ['vacant', `Vacant (${vacantCount})`],
            ['occupied', `Occupied (${occupiedCount})`],
            ['rooms', 'Rooms Only'],
            ['beds', 'Beds Only']
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer',
                filter === val ? 'bg-[var(--surface)] text-[var(--teal)] shadow-sm' : 'text-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accommodation Cards Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <article
            key={item.id}
            className={cn(
              'card p-5 bg-[var(--surface)] shadow-sm flex flex-col justify-between transition border-2',
              item.isOccupied ? 'border-amber-200' : 'border-emerald-200'
            )}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-base font-extrabold text-main">{item.id}</span>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5',
                    item.isOccupied ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {item.isOccupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>

              <h3 className="font-display font-bold text-sm text-main mt-3">{item.label}</h3>
              <span className="text-xs text-muted block mt-0.5">{item.floor} · {item.type}</span>

              {item.isOccupied && item.occupant ? (
                <div className="mt-4 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
                  <span className="text-amber-800 font-bold block">{item.occupant.patient}</span>
                  <span className="text-amber-700 block text-[11px]">
                    Admitted: {fmtDate(item.occupant.admissionDate)}
                  </span>
                </div>
              ) : (
                <div className="mt-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                  Ready for new patient admission
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-ui flex justify-end">
              <button
                disabled={item.isOccupied}
                className={cn(
                  'icon-btn !w-7 !h-7 text-muted hover:text-red-600',
                  item.isOccupied && 'opacity-30 cursor-not-allowed'
                )}
                onClick={() => deleteUnit(item)}
                title="Delete unit"
              >
                <Icon name="trash-2" size={13} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Add Accommodation Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="card max-w-md w-full p-7 bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="eyebrow">Facility Setup</span>
                <h2 className="font-display font-extrabold text-xl text-main mt-1">
                  Add Accommodation Unit
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Unit Identifier Code *</span>
                <input
                  required
                  className="input font-mono text-sm uppercase"
                  placeholder="e.g. ROOM-106 or BED-08"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Display Label *</span>
                <input
                  required
                  className="input text-sm"
                  placeholder="e.g. Deluxe Garden Room or Step-Down Bed"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Accommodation Type</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Room">Private Room</option>
                  <option value="Bed">Assisted Suite Bed</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Floor / Wing</span>
                <input
                  className="input text-sm"
                  placeholder="e.g. 1st Floor North Wing"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-7 border-t border-ui pt-4">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                disabled={submitting}
                className="btn-primary text-xs cursor-pointer"
                onClick={saveUnit}
              >
                <Icon name="check" size={14} /> Register Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
