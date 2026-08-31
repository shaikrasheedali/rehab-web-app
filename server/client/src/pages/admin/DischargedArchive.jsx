import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, money, currentISODate } from '../../utils/formatters.js';

export default function DischargedArchive() {
  const { admissions, notify, nav, fetchAdmissions } = useApp();
  const [q, setQ] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const discharged = admissions
    .filter(x => x.status === 'Discharged')
    .sort((a, b) => (b.actualDischarge || '').localeCompare(a.actualDischarge || ''));

  const filtered = discharged.filter(x =>
    `${x.patient} ${x.id} ${x.contact} ${x.dischargeSummary}`.toLowerCase().includes(q.toLowerCase())
  );

  const exportZip = async () => {
    if (!discharged.length) {
      notify('No discharged patient records available to export.', 'warning');
      return;
    }

    try {
      const zip = new JSZip();
      const payload = {
        format: 'sri-thirumala-discharge-archive',
        version: 1,
        exportedAt: new Date().toISOString(),
        totalRecords: discharged.length,
        patients: discharged
      };

      zip.file('discharged-patients.json', JSON.stringify(payload, null, 2));
      zip.file(
        'README.txt',
        'Sri Thirumala Rehabilitation Centre & Nursing Home\nDischarged Patient Archive\nContains medical summaries, stay history, and settled financial records.'
      );

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      saveAs(blob, `Sri-Thirumala-Discharge-Archive-${currentISODate()}.zip`);
      notify('Discharge archive ZIP package downloaded.');
    } catch (err) {
      notify('Failed to generate ZIP archive: ' + err.message, 'warning');
    }
  };

  const handleDelete = async (id, patient) => {
    if (!window.confirm(`Permanently delete archived record for ${patient} (${id})?`)) return;
    try {
      await api.deleteAdmission(id);
      fetchAdmissions();
      notify(`Archived record for ${patient} deleted.`);
    } catch (err) {
      notify(err.message || 'Failed to delete record', 'warning');
    }
  };

  return (
    <AdminLayout
      title="Discharged Patient Archive"
      subtitle="Audited records of completed stays, medical discharge summaries, and settled bills"
      action={
        <div className="mobile-hide flex gap-2">
          <button className="btn-secondary !py-2 text-xs cursor-pointer" onClick={() => nav('/admin/admissions')}>
            <Icon name="clipboard-check" size={14} /> Active Inpatients
          </button>
          <button className="btn-primary !py-2 text-xs cursor-pointer" onClick={exportZip}>
            <Icon name="download" size={14} /> Export Archive ZIP
          </button>
        </div>
      }
    >
      <div className="card p-4 mb-6 bg-[var(--surface)] shadow-sm">
        <label className="relative block">
          <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10 !py-2 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search discharged patient name, ID, or clinical summary…"
          />
        </label>
      </div>

      <section className="card overflow-hidden bg-[var(--surface)] shadow-sm">
        <div className="p-5 border-b border-ui flex justify-between items-center">
          <h2 className="font-display font-extrabold text-lg text-main">
            Archived Discharges ({filtered.length})
          </h2>
          <span className="text-xs text-muted">All balances verified 0 due upon discharge</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[var(--mist)] text-left text-xs text-muted">
              <tr>
                <th className="p-4">Admission ID</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Admission Date</th>
                <th className="p-4">Discharged Date</th>
                <th className="p-4">Final Settled Total</th>
                <th className="p-4">Discharge Summary</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const finalBill = row.finalBill;
                return (
                  <tr key={row.id} className="border-t border-ui hover:bg-[var(--mist)]/40 transition">
                    <td className="p-4 font-mono font-bold text-main">{row.id}</td>
                    <td className="p-4 font-semibold text-main">{row.patient}</td>
                    <td className="p-4 text-muted text-xs">{fmtDate(row.admissionDate)}</td>
                    <td className="p-4 text-muted text-xs font-semibold">
                      {fmtDate(row.actualDischarge || row.expectedDischarge)}
                    </td>
                    <td className="p-4 font-mono text-emerald-700 font-bold">
                      {finalBill ? money(finalBill.total) : 'Settled'}
                    </td>
                    <td className="p-4 text-xs text-muted max-w-[280px] line-clamp-2">
                      {row.dischargeSummary || 'Stay completed successfully.'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="icon-btn !w-8 !h-8 text-[var(--teal)]"
                          onClick={() => setSelectedPatient(row)}
                          title="View Archive Summary"
                        >
                          <Icon name="eye" size={14} />
                        </button>
                        <button
                          className="icon-btn !w-8 !h-8 text-muted hover:text-red-600"
                          onClick={() => handleDelete(row.id, row.patient)}
                          title="Delete Archive Record"
                        >
                          <Icon name="trash-2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted">
            <Icon name="archive" size={36} className="mx-auto text-muted mb-2" />
            <p>No archived discharged patients found.</p>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedPatient && (
        <div className="modal-backdrop" onClick={() => setSelectedPatient(null)}>
          <div
            className="card max-w-xl w-full p-7 bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="eyebrow">Archived Record</span>
                <h2 className="font-display font-extrabold text-2xl text-main mt-1">
                  {selectedPatient.patient}
                </h2>
                <span className="text-xs text-muted font-mono">{selectedPatient.id}</span>
              </div>
              <button className="icon-btn" onClick={() => setSelectedPatient(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="mt-6 bg-[var(--mist)] rounded-2xl p-5 border border-ui grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted text-xs block">Admission Date</span>
                <strong className="text-main">{fmtDate(selectedPatient.admissionDate)}</strong>
              </div>
              <div>
                <span className="text-muted text-xs block">Actual Discharge Date</span>
                <strong className="text-main">{fmtDate(selectedPatient.actualDischarge)}</strong>
              </div>
              <div>
                <span className="text-muted text-xs block">Contact / Guardian</span>
                <strong className="text-main">{selectedPatient.contact} ({selectedPatient.phone})</strong>
              </div>
              <div>
                <span className="text-muted text-xs block">Placement</span>
                <strong className="text-main">{selectedPatient.accommodationId || 'Non-staying'}</strong>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-bold text-main uppercase tracking-wider mb-2">
                Clinical Discharge Summary
              </h3>
              <div className="p-4 bg-[var(--mist)] rounded-xl border border-ui text-sm text-main leading-6">
                {selectedPatient.dischargeSummary || 'Completed full rehabilitation course.'}
              </div>
            </div>

            {selectedPatient.finalBill && (
              <div className="mt-6 border-t border-ui pt-4">
                <h3 className="text-xs font-bold text-main uppercase tracking-wider mb-2">
                  Financial Settlement Snapshot
                </h3>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted">Total Settled Amount</span>
                  <strong className="font-mono text-main">{money(selectedPatient.finalBill.total)}</strong>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted">Total Payments Recorded</span>
                  <strong className="font-mono text-emerald-600">{money(selectedPatient.finalBill.paid)}</strong>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted">Balance Due</span>
                  <strong className="font-mono text-emerald-600">₹0.00 (Cleared)</strong>
                </div>
              </div>
            )}

            <div className="mt-7 flex justify-end">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setSelectedPatient(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
