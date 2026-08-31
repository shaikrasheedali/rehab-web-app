import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, currentISODate, cn } from '../../utils/formatters.js';

export default function Residents() {
  const { admissions, notify } = useApp();
  const activeAdmissions = admissions.filter(x => x.status === 'Admitted');

  const [selectedAdmId, setSelectedAdmId] = useState(() => activeAdmissions[0]?.id || '');
  const [progressNotes, setProgressNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Note Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    note: '',
    author: 'Dr. Srinivas / Nurse Incharge',
    category: 'Therapy & Mobility'
  });

  const selectedPatient = activeAdmissions.find(x => x.id === selectedAdmId);

  const fetchProgress = useCallback(async (admId) => {
    if (!admId) return;
    setLoading(true);
    try {
      const data = await api.getProgressByAdmission(admId);
      setProgressNotes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAdmId) {
      fetchProgress(selectedAdmId);
    }
  }, [selectedAdmId, fetchProgress]);

  const addNote = async () => {
    if (!noteForm.title.trim() || !noteForm.note.trim()) {
      notify('Please enter a clinical title and progress description.', 'warning');
      return;
    }

    try {
      const newRec = await api.createProgressRecord({
        admissionId: selectedAdmId,
        date: currentISODate(),
        title: noteForm.title.trim(),
        note: noteForm.note.trim(),
        author: noteForm.author.trim(),
        category: noteForm.category
      });
      setProgressNotes(prev => [newRec, ...prev]);
      setModalOpen(false);
      setNoteForm({
        title: '',
        note: '',
        author: 'Dr. Srinivas / Nurse Incharge',
        category: 'Therapy & Mobility'
      });
      notify('Clinical progress note saved.');
    } catch (err) {
      notify(err.message || 'Failed to save note', 'warning');
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this clinical note?')) return;
    try {
      await api.deleteProgressRecord(id);
      setProgressNotes(prev => prev.filter(x => x.id !== id));
      notify('Clinical note deleted.');
    } catch (err) {
      notify(err.message || 'Failed to delete note', 'warning');
    }
  };

  return (
    <AdminLayout
      title="Resident Clinical Progress & Care Notes"
      subtitle="Multidisciplinary clinical log, rehabilitation milestones, and family communication records"
      action={
        <button
          disabled={!selectedAdmId}
          className="btn-primary mobile-hide !py-2 text-xs cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <Icon name="plus" size={14} /> Log Clinical Milestone
        </button>
      }
    >
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Active Patients Sidebar */}
        <div className="card p-4 bg-[var(--surface)] shadow-sm space-y-2">
          <span className="text-xs font-bold text-muted uppercase tracking-wider block px-2 mb-2">
            Active Patients ({activeAdmissions.length})
          </span>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {activeAdmissions.map((adm) => (
              <button
                key={adm.id}
                onClick={() => setSelectedAdmId(adm.id)}
                className={cn(
                  'w-full p-3 rounded-2xl text-left transition cursor-pointer flex items-center justify-between',
                  selectedAdmId === adm.id
                    ? 'bg-[var(--mist)] border border-[var(--teal)] ring-1 ring-[#0f5d5e]'
                    : 'hover:bg-[var(--mist)]/50'
                )}
              >
                <div>
                  <strong className="block text-main text-sm">{adm.patient}</strong>
                  <span className="text-xs text-muted font-mono">{adm.id} · {adm.accommodationId || 'Day Care'}</span>
                </div>
                <Icon name="chevron-right" size={16} className="text-muted" />
              </button>
            ))}
          </div>
        </div>

        {/* Clinical Notes Timeline */}
        <section className="card p-6 lg:p-8 bg-[var(--surface)] shadow-sm min-h-[500px]">
          {selectedPatient ? (
            <div>
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-ui pb-5">
                <div>
                  <span className="eyebrow">Patient Clinical Log</span>
                  <h2 className="font-display font-extrabold text-2xl text-main mt-1">
                    {selectedPatient.patient}
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    Admitted {fmtDate(selectedPatient.admissionDate)} · Placement: {selectedPatient.accommodationId || 'Non-staying'}
                  </p>
                </div>
                <button
                  className="btn-primary text-xs cursor-pointer"
                  onClick={() => setModalOpen(true)}
                >
                  <Icon name="plus" size={14} /> Add Note
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-muted">
                  <Icon name="loader-2" size={28} className="mx-auto animate-spin mb-2 text-[var(--teal)]" />
                  <p>Loading clinical notes…</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {progressNotes.map((rec) => (
                    <article
                      key={rec.id}
                      className="border border-ui rounded-2xl p-5 bg-[var(--surface)] hover:border-[var(--teal)] transition"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-[var(--mist)] text-[var(--teal)] grid place-items-center">
                            <Icon name="activity" size={15} />
                          </span>
                          <div>
                            <h3 className="font-display font-bold text-base text-main">{rec.title}</h3>
                            <span className="text-[11px] text-muted font-mono">
                              {fmtDate(rec.date)} · {rec.category} · Logged by {rec.author}
                            </span>
                          </div>
                        </div>
                        <button
                          className="icon-btn !w-7 !h-7 text-muted hover:text-red-600"
                          onClick={() => deleteNote(rec.id)}
                          title="Delete note"
                        >
                          <Icon name="trash-2" size={13} />
                        </button>
                      </div>
                      <p className="text-sm text-muted mt-3 leading-relaxed">{rec.note}</p>
                    </article>
                  ))}

                  {progressNotes.length === 0 && (
                    <div className="p-12 text-center text-muted">
                      <Icon name="file-text" size={36} className="mx-auto text-muted mb-2" />
                      <p>No clinical progress notes logged yet for {selectedPatient.patient}.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-muted">
              Select an admitted patient to view clinical timeline and milestones.
            </div>
          )}
        </section>
      </div>

      {/* New Note Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="card max-w-lg w-full p-7 bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="eyebrow">Clinical Documentation</span>
                <h2 className="font-display font-extrabold text-xl text-main mt-1">
                  Log Note for {selectedPatient?.patient}
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Milestone / Title *</span>
                <input
                  required
                  className="input text-sm"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Independent standing milestone achieved"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Category</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={noteForm.category}
                  onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                >
                  <option value="Therapy & Mobility">Therapy & Mobility</option>
                  <option value="Nursing & Vitals">Nursing & Vitals</option>
                  <option value="Doctor Review">Doctor Review</option>
                  <option value="Family Briefing">Family Briefing</option>
                  <option value="Nutrition & Diet">Nutrition & Diet</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Author / Clinician Name</span>
                <input
                  className="input text-sm"
                  value={noteForm.author}
                  onChange={(e) => setNoteForm({ ...noteForm, author: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Detailed Observation Note *</span>
                <textarea
                  required
                  rows={4}
                  className="input resize-none text-sm"
                  value={noteForm.note}
                  onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                  placeholder="Assisted gait with walker 20 meters; vitals stable; family briefed on weekend plan…"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-ui pt-4">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary text-xs cursor-pointer" onClick={addNote}>
                <Icon name="check" size={14} /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
