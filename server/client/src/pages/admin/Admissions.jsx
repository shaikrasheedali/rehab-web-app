import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, money, currentISODate, cn } from '../../utils/formatters.js';

export default function Admissions() {
  const {
    admissions,
    setAdmissions,
    admissionDraft,
    setAdmissionDraft,
    services,
    packages,
    accommodations,
    notify,
    nav,
    fetchAdmissions,
    fetchAccommodations
  } = useApp();

  const [form, setForm] = useState(null);
  const [dischargeModal, setDischargeModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const activeAdmissions = admissions.filter(x => x.status === 'Admitted');
  const dischargedAdmissions = admissions.filter(x => x.status === 'Discharged');

  const blankForm = () => ({
    patient: '',
    age: '',
    gender: 'Female',
    contact: '',
    phone: '',
    address: '',
    need: '',
    language: 'English',
    currentLocation: 'At home',
    roomPreference: 'No preference',
    admissionDate: currentISODate(),
    expectedDischarge: '',
    stayType: 'staying',
    accommodationId: '',
    packageId: '',
    offPackageServiceIds: [],
    sourceInquiryId: ''
  });

  useEffect(() => {
    if (admissionDraft !== null) {
      setForm({ ...blankForm(), ...admissionDraft });
    }
  }, [admissionDraft]);

  const openDirectAdmission = () => {
    setAdmissionDraft({});
    setForm(blankForm());
  };

  const editAdmission = (adm) => {
    setAdmissionDraft(null);
    setForm({
      ...blankForm(),
      ...adm,
      age: adm.age || ''
    });
  };

  const toggleAddOn = (id) => {
    setForm(f => ({
      ...f,
      offPackageServiceIds: f.offPackageServiceIds.includes(id)
        ? f.offPackageServiceIds.filter(x => x !== id)
        : [...f.offPackageServiceIds, id]
    }));
  };

  const availableUnits = accommodations.filter(
    unit => !activeAdmissions.some(
      row => row.id !== form?.id && row.stayType === 'staying' && row.accommodationId === unit.id
    )
  );

  const handleSave = async (openBilling = false) => {
    if (!form.patient.trim() || !form.contact.trim() || !form.phone.trim() || !form.admissionDate) {
      notify('Please complete patient name, guardian contact, phone, and admission date.', 'warning');
      return;
    }

    if (form.stayType === 'staying' && !form.accommodationId) {
      notify('Please assign a room/bed unit or choose non-staying patient status.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let savedAdmission;
      if (form.id) {
        savedAdmission = await api.updateAdmission(form.id, form);
        setAdmissions(prev => prev.map(x => (x.id === form.id ? savedAdmission : x)));
        notify(`Admission ${form.id} updated successfully.`);
      } else {
        savedAdmission = await api.createAdmission(form);
        setAdmissions(prev => [savedAdmission, ...prev]);
        notify(`Patient ${savedAdmission.patient} admitted (${savedAdmission.id}).`);
      }

      setForm(null);
      setAdmissionDraft(null);
      fetchAdmissions();
      fetchAccommodations();

      if (openBilling && savedAdmission?.id) {
        localStorage.setItem('st-billing-target', savedAdmission.id);
        nav('/admin/billing/create');
      }
    } catch (err) {
      notify(err.message || 'Failed to save admission', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const openDischarge = async (adm) => {
    try {
      const billingData = await api.getBillingByAdmission(adm.id, { through: currentISODate() });
      const bill = billingData.bill;
      setDischargeModal({
        admissionId: adm.id,
        patient: adm.patient,
        admissionDate: adm.admissionDate,
        date: currentISODate(),
        summary: '',
        total: bill.total,
        paid: bill.paid,
        due: bill.due
      });
    } catch (err) {
      notify(err.message || 'Failed to fetch billing status for discharge', 'warning');
    }
  };

  const handleDischargeDateChange = async (newDate) => {
    if (!dischargeModal) return;
    try {
      const billingData = await api.getBillingByAdmission(dischargeModal.admissionId, { through: newDate });
      const bill = billingData.bill;
      setDischargeModal(prev => ({
        ...prev,
        date: newDate,
        total: bill.total,
        paid: bill.paid,
        due: bill.due
      }));
    } catch {
      // safe fallback
    }
  };

  const confirmDischarge = async () => {
    if (!dischargeModal.summary.trim()) {
      notify('Please write a clinical discharge summary note.', 'warning');
      return;
    }

    if (dischargeModal.due > 0.01) {
      notify('Clear the outstanding patient balance before completing discharge.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.dischargePatient(dischargeModal.admissionId, {
        actualDischarge: dischargeModal.date,
        dischargeSummary: dischargeModal.summary.trim()
      });
      notify(`${dischargeModal.patient} discharged and archived.`);
      setDischargeModal(null);
      fetchAdmissions();
      fetchAccommodations();
    } catch (err) {
      notify(err.message || 'Discharge failed', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Admissions & Inpatient Register"
      subtitle="Register admissions, assign accommodations, adjust care packages, and process discharge"
      action={
        <div className="mobile-hide flex gap-2">
          <button className="btn-secondary !py-2 text-xs cursor-pointer" onClick={() => nav('/admin/discharged')}>
            <Icon name="archive" size={14} /> Discharged Archive ({dischargedAdmissions.length})
          </button>
          <button className="btn-primary !py-2 text-xs cursor-pointer" onClick={openDirectAdmission}>
            <Icon name="user-plus" size={14} /> New Admission
          </button>
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Active Admissions</span>
          <strong className="block text-3xl font-display font-extrabold text-main mt-1">
            {activeAdmissions.length}
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Archived Discharges</span>
          <strong className="block text-3xl font-display font-extrabold text-[var(--teal)] mt-1">
            {dischargedAdmissions.length}
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Available Units</span>
          <strong className="block text-3xl font-display font-extrabold text-emerald-600 mt-1">
            {accommodations.length - activeAdmissions.filter(x => x.stayType === 'staying' && x.accommodationId).length}
          </strong>
        </div>
      </div>

      {/* Admission Form (Modal or Inline Panel) */}
      {form && (
        <section className="card p-6 lg:p-8 mb-8 bg-[var(--surface)] shadow-soft border-2 border-[var(--teal)]/30 animate-in fade-in">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <span className="eyebrow">
                {form.sourceInquiryId ? `Converted from ${form.sourceInquiryId}` : form.id ? 'Edit Admission' : 'New Direct Admission'}
              </span>
              <h2 className="font-display font-extrabold text-2xl text-main mt-1">
                {form.id ? `Edit ${form.patient}` : 'Patient Admission Registration'}
              </h2>
            </div>
            <button
              className="icon-btn cursor-pointer"
              onClick={() => {
                setForm(null);
                setAdmissionDraft(null);
              }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Patient Name *</span>
              <input
                required
                className="input text-sm"
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Age</span>
              <input
                type="number"
                min="0"
                className="input text-sm"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Gender</span>
              <select
                className="input text-sm cursor-pointer"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Language</span>
              <select
                className="input text-sm cursor-pointer"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="Urdu">Urdu</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Family Contact Name *</span>
              <input
                required
                className="input text-sm"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Phone Number *</span>
              <input
                required
                type="tel"
                className="input text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Admission Date *</span>
              <input
                required
                type="date"
                className="input text-sm"
                value={form.admissionDate}
                onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Tentative Discharge</span>
              <input
                type="date"
                min={form.admissionDate}
                className="input text-sm"
                value={form.expectedDischarge || ''}
                onChange={(e) => setForm({ ...form, expectedDischarge: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Attendance Type *</span>
              <select
                className="input text-sm cursor-pointer"
                value={form.stayType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stayType: e.target.value,
                    accommodationId: e.target.value === 'staying' ? form.accommodationId : ''
                  })
                }
              >
                <option value="staying">Staying Inpatient (Room / Bed assigned)</option>
                <option value="non-staying">Non-staying Day Care / Outpatient</option>
              </select>
            </label>

            {form.stayType === 'staying' ? (
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Assigned Room or Bed *</span>
                <select
                  required
                  className="input text-sm cursor-pointer"
                  value={form.accommodationId}
                  onChange={(e) => setForm({ ...form, accommodationId: e.target.value })}
                >
                  <option value="">Select available unit</option>
                  {availableUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.id} · {unit.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="rounded-xl bg-[var(--mist)] p-3 flex items-center gap-2.5 text-xs text-muted">
                <Icon name="home" size={16} className="text-[var(--teal)] shrink-0" />
                <span>Non-staying patient (no bed reservation required)</span>
              </div>
            )}

            <label className="sm:col-span-2 block">
              <span className="block text-xs font-bold text-main mb-1.5">Core Package (Optional)</span>
              <select
                className="input text-sm cursor-pointer"
                value={form.packageId || ''}
                onChange={(e) => setForm({ ...form, packageId: e.target.value })}
              >
                <option value="">No package — flexible custom daily billing</option>
                {packages.filter(x => x.active).map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} · {money(pkg.rate)}/day
                  </option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Diagnosis & Care Plan Notes</span>
                <textarea
                  rows={2}
                  className="input resize-none text-sm"
                  value={form.need || ''}
                  onChange={(e) => setForm({ ...form, need: e.target.value })}
                  placeholder="Primary condition, clinical roadmap notes…"
                />
              </label>
            </div>
          </div>

          {/* Add-ons selection */}
          <div className="mt-6">
            <span className="block text-xs font-bold text-main mb-2">Optional Off-package Add-ons</span>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {services.filter(x => x.kind === 'off-package' && x.active).map(svc => (
                <label
                  key={svc.id}
                  className={cn(
                    'border rounded-xl p-3 flex gap-2.5 items-start cursor-pointer text-xs transition',
                    form.offPackageServiceIds.includes(svc.id)
                      ? 'border-[var(--teal)] bg-[var(--mist)] ring-1 ring-[#0f5d5e]'
                      : 'border-ui hover:border-slate-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={form.offPackageServiceIds.includes(svc.id)}
                    onChange={() => toggleAddOn(svc.id)}
                    className="accent-[#0f5d5e] cursor-pointer mt-0.5"
                  />
                  <div>
                    <strong className="block text-main">{svc.name}</strong>
                    <span className="text-muted">{money(svc.rate)}/day</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-ui pt-4">
            <button
              className="btn-secondary text-xs cursor-pointer"
              onClick={() => {
                setForm(null);
                setAdmissionDraft(null);
              }}
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              className="btn-secondary text-xs font-bold cursor-pointer"
              onClick={() => handleSave(false)}
            >
              <Icon name="check" size={14} /> Save Admission
            </button>
            <button
              disabled={submitting}
              className="btn-primary text-xs cursor-pointer"
              onClick={() => handleSave(true)}
            >
              <Icon name="receipt" size={14} /> Save & Open Billing
            </button>
          </div>
        </section>
      )}

      {/* Active Admissions Table */}
      <section className="card overflow-hidden bg-[var(--surface)] shadow-sm">
        <div className="p-5 border-b border-ui flex flex-wrap gap-3 justify-between items-center">
          <div>
            <h2 className="font-display font-extrabold text-lg text-main">Active Inpatient Census</h2>
            <p className="text-xs text-muted mt-0.5">
              Edit patient records, open individual billing profiles, or perform structured discharge
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead className="bg-[var(--mist)] text-left text-xs text-muted">
              <tr>
                <th className="p-4">Admission ID</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Stay Dates</th>
                <th className="p-4">Placement</th>
                <th className="p-4">Billing Model</th>
                <th className="p-4">Add-ons</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeAdmissions.map((row) => {
                const pkg = packages.find(x => x.id === row.packageId);
                return (
                  <tr key={row.id} className="border-t border-ui hover:bg-[var(--mist)]/40 transition">
                    <td className="p-4">
                      <strong className="font-mono text-main block">{row.id}</strong>
                      <span className="text-[11px] text-muted">{row.sourceInquiryId || 'Direct'}</span>
                    </td>

                    <td className="p-4">
                      <strong className="text-main block">{row.patient}</strong>
                      <span className="text-xs text-muted">{row.contact} · {row.phone}</span>
                    </td>

                    <td className="p-4 text-xs">
                      <span className="font-medium text-main block">{fmtDate(row.admissionDate)}</span>
                      <span className="text-muted block mt-0.5">
                        {row.expectedDischarge ? 'Est. ' + fmtDate(row.expectedDischarge) : 'Open-ended'}
                      </span>
                    </td>

                    <td className="p-4">
                      {row.stayType === 'staying' ? (
                        <span className="font-mono text-xs text-[var(--teal)] font-bold bg-[var(--mist)] px-2.5 py-1 rounded-md">
                          {row.accommodationId || 'Pending'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Non-staying</span>
                      )}
                    </td>

                    <td className="p-4">
                      <strong className="text-main block text-xs">{pkg?.name || 'Custom Plan'}</strong>
                      <span className="text-xs text-muted">{pkg ? money(pkg.rate) + '/day' : 'Daily items'}</span>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-1 text-[11px] font-bold">
                        {(row.offPackageServiceIds || []).length} Services
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="icon-btn !w-8 !h-8"
                          onClick={() => editAdmission(row)}
                          title={`Edit ${row.patient}`}
                        >
                          <Icon name="pencil" size={14} />
                        </button>
                        <button
                          className="icon-btn !w-8 !h-8 text-[var(--teal)]"
                          onClick={() => {
                            localStorage.setItem('st-billing-target', row.id);
                            nav('/admin/billing/create');
                          }}
                          title={`Open Bill for ${row.patient}`}
                        >
                          <Icon name="receipt" size={14} />
                        </button>
                        <button
                          className="icon-btn !w-8 !h-8 text-[var(--coral)] hover:bg-orange-50"
                          onClick={() => openDischarge(row)}
                          title={`Discharge ${row.patient}`}
                        >
                          <Icon name="log-out" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeAdmissions.length === 0 && (
          <div className="p-12 text-center text-muted">
            <Icon name="clipboard-check" size={36} className="mx-auto text-muted mb-2" />
            <p>No active inpatients currently registered.</p>
          </div>
        )}
      </section>

      {/* Discharge Verification Modal */}
      {dischargeModal && (
        <div className="modal-backdrop" onClick={() => setDischargeModal(null)}>
          <div
            className="card max-w-xl w-full p-7 bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="eyebrow">Discharge Protocol</span>
                <h2 className="font-display font-extrabold text-2xl text-main mt-1">
                  Discharge {dischargeModal.patient}
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setDischargeModal(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Financial Status Summary */}
            <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
              <div className="bg-[var(--mist)] rounded-xl p-3.5 border border-ui">
                <span className="text-xs text-muted block">Gross Bill</span>
                <strong className="text-main font-bold text-base mt-1 block">
                  {money(dischargeModal.total)}
                </strong>
              </div>
              <div className="bg-[var(--mist)] rounded-xl p-3.5 border border-ui">
                <span className="text-xs text-muted block">Paid to Date</span>
                <strong className="text-emerald-600 font-bold text-base mt-1 block">
                  {money(dischargeModal.paid)}
                </strong>
              </div>
              <div className="bg-[var(--mist)] rounded-xl p-3.5 border border-ui">
                <span className="text-xs text-muted block">Outstanding Due</span>
                <strong
                  className={cn(
                    'font-bold text-base mt-1 block',
                    dischargeModal.due > 0.01 ? 'text-red-600' : 'text-emerald-600'
                  )}
                >
                  {money(dischargeModal.due)}
                </strong>
              </div>
            </div>

            {/* Warning if due > 0 */}
            {dischargeModal.due > 0.01 && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 p-4 text-xs flex gap-3 items-start">
                <Icon name="alert-triangle" size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-bold">Outstanding Balance Detected</strong>
                  <span>
                    The patient cannot be discharged until the remaining amount of {money(dischargeModal.due)} is recorded in payments or adjusted on the bill.
                  </span>
                  <button
                    className="font-bold underline block mt-2 text-[var(--teal)] cursor-pointer"
                    onClick={() => {
                      localStorage.setItem('st-billing-target', dischargeModal.admissionId);
                      setDischargeModal(null);
                      nav('/admin/billing/create');
                    }}
                  >
                    Open patient billing screen →
                  </button>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Actual Discharge Date</span>
                <input
                  type="date"
                  min={dischargeModal.admissionDate}
                  max={currentISODate()}
                  className="input text-sm"
                  value={dischargeModal.date}
                  onChange={(e) => handleDischargeDateChange(e.target.value)}
                />
              </label>

              <div className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Archive Status</span>
                <div className="input flex items-center gap-2 text-xs text-muted font-medium bg-[var(--mist)]">
                  <Icon name="archive" size={15} />
                  <span>Ready upon confirmation</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Discharge Summary & Instructions *</span>
                <textarea
                  required
                  rows={4}
                  className="input resize-none text-sm"
                  value={dischargeModal.summary}
                  onChange={(e) =>
                    setDischargeModal({ ...dischargeModal, summary: e.target.value })
                  }
                  placeholder="Patient outcome status, mobility goals achieved, post-discharge medication instructions…"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-ui pt-4">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setDischargeModal(null)}>
                Cancel
              </button>
              <button
                disabled={dischargeModal.due > 0.01 || submitting}
                className={cn(
                  'btn-primary text-xs cursor-pointer',
                  dischargeModal.due > 0.01 && 'opacity-50 cursor-not-allowed bg-slate-300'
                )}
                onClick={confirmDischarge}
              >
                <Icon name="archive" size={14} /> Confirm Discharge & Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
