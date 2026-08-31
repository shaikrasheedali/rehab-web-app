import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, money, currentISODate, cn } from '../../utils/formatters.js';

export default function BillingCreate() {
  const { admissions, notify, nav } = useApp();

  const [selectedAdmissionId, setSelectedAdmissionId] = useState(() => {
    return localStorage.getItem('st-billing-target') || admissions.find(x => x.status === 'Admitted')?.id || admissions[0]?.id || '';
  });

  const [billingProfile, setBillingProfile] = useState(null);
  const [bill, setBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payment form modal state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI / Bank Transfer');
  const [payNotes, setPayNotes] = useState('');
  const [payModal, setPayModal] = useState(false);

  // Custom line item state
  const [newLine, setNewLine] = useState({ description: '', amount: '', type: 'fixed', days: 1 });

  const activeAdmissions = admissions.filter(x => x.status === 'Admitted');
  const currentAdmission = admissions.find(x => x.id === selectedAdmissionId) || admissions[0];

  const fetchBillingData = useCallback(async (admissionId) => {
    if (!admissionId) return;
    setLoading(true);
    try {
      const response = await api.getBillingByAdmission(admissionId);
      setBillingProfile(response.profile || {});
      setBill(response.bill || null);
      setPayments(response.payments || []);
    } catch (err) {
      notify(err.message || 'Failed to load billing profile', 'warning');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!selectedAdmissionId && admissions.length > 0) {
      const defaultId = admissions.find(x => x.status === 'Admitted')?.id || admissions[0].id;
      setSelectedAdmissionId(defaultId);
    }
  }, [admissions, selectedAdmissionId]);

  useEffect(() => {
    if (selectedAdmissionId) {
      localStorage.setItem('st-billing-target', selectedAdmissionId);
      fetchBillingData(selectedAdmissionId);
    }
  }, [selectedAdmissionId, fetchBillingData]);

  const handleProfileChange = (field, value) => {
    setBillingProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddOnChange = (serviceId, days) => {
    setBillingProfile(prev => ({
      ...prev,
      addOns: (prev?.addOns || []).map(a =>
        a.serviceId === serviceId ? { ...a, days: Number(days) } : a
      )
    }));
  };

  const addCustomLine = () => {
    if (!newLine.description.trim() || Number(newLine.amount) <= 0) {
      notify('Please specify line description and amount.', 'warning');
      return;
    }

    setBillingProfile(prev => ({
      ...prev,
      customLines: [
        ...(prev?.customLines || []),
        {
          id: 'custom-' + Date.now(),
          description: newLine.description.trim(),
          amount: Number(newLine.amount),
          type: newLine.type,
          days: newLine.type === 'daily' ? Number(newLine.days) || 1 : undefined
        }
      ]
    }));
    setNewLine({ description: '', amount: '', type: 'fixed', days: 1 });
    notify('Custom line added to bill.');
  };

  const removeCustomLine = (id) => {
    setBillingProfile(prev => ({
      ...prev,
      customLines: (prev?.customLines || []).filter(x => x.id !== id)
    }));
  };

  const saveProfile = async () => {
    if (!selectedAdmissionId || !billingProfile) return;
    try {
      const response = await api.saveBillingProfile(selectedAdmissionId, billingProfile);
      setBillingProfile(response.profile || {});
      setBill(response.bill || null);
      notify('Billing calculation saved and updated.');
    } catch (err) {
      notify(err.message || 'Failed to save billing profile', 'warning');
    }
  };

  const recordPayment = async () => {
    const amount = Number(payAmount);
    if (amount <= 0) {
      notify('Please enter a valid positive payment amount.', 'warning');
      return;
    }

    try {
      await api.recordPayment({
        admissionId: selectedAdmissionId,
        amount,
        method: payMethod,
        notes: payNotes.trim()
      });
      setPayModal(false);
      setPayAmount('');
      setPayNotes('');
      notify(`Payment of ${money(amount)} recorded.`);
      fetchBillingData(selectedAdmissionId);
    } catch (err) {
      notify(err.message || 'Failed to record payment', 'warning');
    }
  };

  const advanceWindow = async (days = 30) => {
    if (!billingProfile) return;
    const currentTo = new Date(`${billingProfile.billTo || currentISODate()}T00:00:00Z`);
    const newFrom = new Date(currentTo);
    newFrom.setUTCDate(newFrom.getUTCDate() + 1);
    const newTo = new Date(newFrom);
    newTo.setUTCDate(newTo.getUTCDate() + days - 1);

    const updated = {
      ...billingProfile,
      billFrom: newFrom.toISOString().slice(0, 10),
      billTo: newTo.toISOString().slice(0, 10),
      start: newFrom.toISOString().slice(0, 10),
      end: newTo.toISOString().slice(0, 10)
    };

    setBillingProfile(updated);
    try {
      const response = await api.saveBillingProfile(selectedAdmissionId, updated);
      setBillingProfile(response.profile || {});
      setBill(response.bill || null);
      notify(`Billing window extended by ${days} days.`);
    } catch (err) {
      notify(err.message || 'Failed to advance billing window', 'warning');
    }
  };

  const lines = bill?.lines || bill?.computed || [];

  return (
    <AdminLayout
      title="Inpatient Billing & Financial Engine"
      subtitle="Structured patient statements, flexible days tracking, itemized ledger, and receipt generation"
      action={
        <div className="flex gap-2">
          <button className="btn-secondary !py-2 text-xs cursor-pointer no-print" onClick={() => window.print()}>
            <Icon name="printer" size={14} /> Print Statement
          </button>
          <button className="btn-primary !py-2 text-xs cursor-pointer no-print" onClick={() => setPayModal(true)}>
            <Icon name="plus-circle" size={14} /> Record Payment
          </button>
        </div>
      }
    >
      {/* Patient Selector */}
      <div className="card p-4 mb-6 bg-[var(--surface)] shadow-sm no-print">
        <label className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <span className="text-xs font-bold text-main whitespace-nowrap">Select Inpatient:</span>
          <select
            className="input !py-2 text-sm flex-1 cursor-pointer"
            value={selectedAdmissionId}
            onChange={(e) => setSelectedAdmissionId(e.target.value)}
          >
            {activeAdmissions.map(adm => (
              <option key={adm.id} value={adm.id}>
                {adm.patient} ({adm.id}) · Admitted: {fmtDate(adm.admissionDate)} · Placement: {adm.accommodationId || 'Non-staying'}
              </option>
            ))}
            {admissions.filter(x => x.status === 'Discharged').map(adm => (
              <option key={adm.id} value={adm.id}>
                [Discharged] {adm.patient} ({adm.id}) · {fmtDate(adm.admissionDate)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <div className="card p-12 text-center text-muted">
          <Icon name="loader-2" size={32} className="mx-auto animate-spin mb-2 text-[var(--teal)]" />
          <p>Calculating live billing balances…</p>
        </div>
      )}

      {!loading && (!billingProfile || !bill) && (
        <div className="card p-12 text-center text-muted">
          <Icon name="receipt" size={36} className="mx-auto text-muted mb-2" />
          <p>Select an admitted patient to view their billing statement.</p>
        </div>
      )}

      {!loading && billingProfile && bill && (
        <div className="grid xl:grid-cols-[1.05fr_.95fr] gap-6 items-start">
          {/* Billing Configuration Form (No print) */}
          <div className="card p-5 lg:p-7 bg-[var(--surface)] shadow-sm no-print space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="eyebrow">Financial Profile</span>
                <h2 className="font-display font-extrabold text-xl text-main">
                  Billing Configuration for {currentAdmission?.patient}
                </h2>
              </div>
              <button
                className="btn-secondary !py-1.5 text-xs font-bold cursor-pointer"
                onClick={() => advanceWindow(30)}
              >
                <Icon name="calendar-plus" size={14} /> Extend +30 Days
              </button>
            </div>

            {/* Stay Window */}
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Bill Window From</span>
                <input
                  type="date"
                  className="input text-sm"
                  value={billingProfile.billFrom || billingProfile.start || ''}
                  onChange={(e) => {
                    handleProfileChange('billFrom', e.target.value);
                    handleProfileChange('start', e.target.value);
                  }}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Bill Window To</span>
                <input
                  type="date"
                  className="input text-sm"
                  value={billingProfile.billTo || billingProfile.end || ''}
                  onChange={(e) => {
                    handleProfileChange('billTo', e.target.value);
                    handleProfileChange('end', e.target.value);
                  }}
                />
              </label>
            </div>

            {/* Base Daily Package */}
            <div className="border-t border-ui pt-5">
              <h3 className="text-xs font-bold text-main uppercase tracking-wider mb-3">
                Core Care Package
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs text-muted mb-1">Package Name</span>
                  <input
                    className="input text-sm"
                    value={billingProfile.packageName || ''}
                    onChange={(e) => handleProfileChange('packageName', e.target.value)}
                    placeholder="e.g. Stroke Recovery Package"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs text-muted mb-1">Daily Package Rate (₹)</span>
                  <input
                    type="number"
                    min="0"
                    className="input text-sm font-mono"
                    value={billingProfile.packageRate || 0}
                    onChange={(e) => handleProfileChange('packageRate', Number(e.target.value))}
                  />
                </label>
              </div>
            </div>

            {/* Availed Add-on Days */}
            <div className="border-t border-ui pt-5">
              <h3 className="text-xs font-bold text-main uppercase tracking-wider mb-3">
                Availed Add-on Service Days
              </h3>
              <div className="grid gap-3">
                {(billingProfile.addOns || []).map((addon, idx) => (
                  <div
                    key={addon.serviceId || idx}
                    className="flex items-center justify-between gap-3 bg-[var(--mist)] p-3 rounded-xl border border-ui text-sm"
                  >
                    <div>
                      <strong className="block text-main">{addon.name || addon.serviceId}</strong>
                      <span className="text-xs text-muted font-mono">{money(addon.rate)} / day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted font-medium">Days:</span>
                      <input
                        type="number"
                        min="0"
                        max="365"
                        className="input !w-20 !py-1 text-center font-mono font-bold"
                        value={addon.days !== undefined ? addon.days : 1}
                        onChange={(e) => handleAddOnChange(addon.serviceId, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                {(billingProfile.addOns || []).length === 0 && (
                  <p className="text-xs text-muted">No add-ons associated with this patient admission.</p>
                )}
              </div>
            </div>

            {/* Custom Line Items */}
            <div className="border-t border-ui pt-5">
              <h3 className="text-xs font-bold text-main uppercase tracking-wider mb-3">
                Custom Charges & Medications
              </h3>
              <div className="grid gap-2 mb-3">
                {(billingProfile.customLines || []).map(line => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between bg-[var(--mist)] p-3 rounded-xl border border-ui text-xs"
                  >
                    <div>
                      <strong className="text-main">{line.description || line.name}</strong>
                      <span className="text-muted block">
                        {line.type === 'daily' || line.pricingMode === 'daily'
                          ? `${line.days || 1} days @ ${money(line.amount || line.rate)}/day`
                          : 'Fixed charge'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong className="font-mono text-main">
                        {money(
                          (line.type === 'daily' || line.pricingMode === 'daily')
                            ? (line.amount || line.rate) * (line.days || 1)
                            : (line.amount || line.rate)
                        )}
                      </strong>
                      <button
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                        onClick={() => removeCustomLine(line.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Line Input Row */}
              <div className="grid sm:grid-cols-4 gap-2 bg-[var(--mist)] p-3 rounded-2xl border border-ui">
                <input
                  className="input sm:col-span-2 text-xs"
                  placeholder="Item description (e.g. ICU Meds, Lab)"
                  value={newLine.description}
                  onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="input text-xs font-mono"
                  placeholder="Amount ₹"
                  value={newLine.amount}
                  onChange={(e) => setNewLine({ ...newLine, amount: e.target.value })}
                />
                <button
                  type="button"
                  className="btn-primary text-xs !py-1 cursor-pointer"
                  onClick={addCustomLine}
                >
                  + Add Line
                </button>
              </div>
            </div>

            {/* Discounts & Taxes */}
            <div className="border-t border-ui pt-5 grid sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Discount Type</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={billingProfile.discountType || billingProfile.globalType || 'percentage'}
                  onChange={(e) => {
                    handleProfileChange('discountType', e.target.value);
                    handleProfileChange('globalType', e.target.value);
                  }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Discount Value</span>
                <input
                  type="number"
                  min="0"
                  className="input text-sm font-mono"
                  value={billingProfile.discountValue !== undefined ? billingProfile.discountValue : (billingProfile.globalDiscount || 0)}
                  onChange={(e) => {
                    handleProfileChange('discountValue', Number(e.target.value));
                    handleProfileChange('globalDiscount', Number(e.target.value));
                  }}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input text-sm font-mono"
                  value={billingProfile.taxPercent !== undefined ? billingProfile.taxPercent : (billingProfile.tax || 0)}
                  onChange={(e) => {
                    handleProfileChange('taxPercent', Number(e.target.value));
                    handleProfileChange('tax', Number(e.target.value));
                  }}
                />
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-ui">
              <button className="btn-primary text-xs cursor-pointer" onClick={saveProfile}>
                <Icon name="check" size={14} /> Update Calculation
              </button>
            </div>
          </div>

          {/* Printable Invoice Statement */}
          <div className="card p-6 lg:p-9 bg-white text-slate-900 shadow-soft border border-slate-200 invoice-preview rounded-3xl">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0f5d5e] font-bold">
                  Official Inpatient Statement
                </span>
                <h2 className="font-display font-extrabold text-2xl text-[#173a3a] mt-1">
                  Sri Thirumala Care
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-5">
                  Prakash Nagar, Chinna Venkatagiri Cross Road<br />
                  Khammam – 507001, Telangana
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-slate-800 block">
                  INV-{selectedAdmissionId}
                </span>
                <span className="text-xs text-slate-500 block mt-1">Date: {fmtDate(currentISODate())}</span>
                <span className="text-xs text-slate-500 block font-mono">
                  Window: {fmtDate(bill.billFrom || bill.start)} – {fmtDate(bill.billTo || bill.end)}
                </span>
              </div>
            </div>

            {/* Patient Details Row */}
            <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Patient Details
                </span>
                <strong className="text-slate-800 text-sm block mt-1">{currentAdmission?.patient}</strong>
                <span className="text-slate-600 block">
                  Age: {currentAdmission?.age || '—'} · Gender: {currentAdmission?.gender || '—'}
                </span>
                <span className="text-slate-600 block">Placement: {currentAdmission?.accommodationId || 'Non-staying'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Guardian / Contact
                </span>
                <strong className="text-slate-800 text-sm block mt-1">{currentAdmission?.contact}</strong>
                <span className="text-slate-600 block font-mono">{currentAdmission?.phone}</span>
                <span className="text-slate-600 block">Admitted: {fmtDate(currentAdmission?.admissionDate)}</span>
              </div>
            </div>

            {/* Itemized Lines */}
            <div className="py-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-200 text-left">
                    <th className="pb-2">Clinical Service / Item</th>
                    <th className="pb-2 text-center">Days / Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2.5 font-medium text-slate-800">{line.description || line.name}</td>
                      <td className="py-2.5 text-center font-mono">{line.days !== undefined ? line.days : (line.qty || 1)}</td>
                      <td className="py-2.5 text-right font-mono text-slate-500">{money(line.rate)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {money(line.total !== undefined ? line.total : line.net)}
                      </td>
                    </tr>
                  ))}
                  {lines.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">No billed items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Calculation */}
            <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Gross</span>
                <span className="font-mono font-bold">{money(bill.subtotal)}</span>
              </div>
              {(bill.discountAmount > 0 || bill.gd > 0) && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount Applied</span>
                  <span className="font-mono">- {money(bill.discountAmount || bill.gd)}</span>
                </div>
              )}
              {(bill.taxAmount > 0 || bill.taxAmt > 0) && (
                <div className="flex justify-between text-slate-600">
                  <span>Applicable GST / Tax ({billingProfile.taxPercent || billingProfile.tax || 0}%)</span>
                  <span className="font-mono">+ {money(bill.taxAmount || bill.taxAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Assessment</span>
                <span className="font-mono text-base text-[#0f5d5e]">{money(bill.total)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Amount Settled / Paid</span>
                <span className="font-mono">{money(bill.paid)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold border-t-2 border-slate-800 pt-2 text-slate-900">
                <span>Outstanding Balance Due</span>
                <span
                  className={cn(
                    'font-mono',
                    bill.due > 0.01 ? 'text-red-600' : 'text-emerald-600'
                  )}
                >
                  {money(bill.due)}
                </span>
              </div>
            </div>

            {/* Payment History Sub-ledger */}
            {payments.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-4 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-2">
                  Recorded Payments & Receipts
                </span>
                <div className="space-y-1.5">
                  {payments.map(p => (
                    <div key={p.id} className="flex justify-between bg-slate-50 p-2 rounded text-slate-700">
                      <span>
                        {fmtDate(p.date)} · {p.method} {p.receiptNo && `(${p.receiptNo})`}
                      </span>
                      <strong className="font-mono text-emerald-700">{money(p.amount)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 border-t border-slate-200 pt-4 flex justify-between items-end text-[10px] text-slate-400">
              <div>
                <span>Sri Thirumala Care • Authorised Clinical Billing</span>
                <span className="block font-mono">PAN / GST Registration Verified</span>
              </div>
              <div className="text-right">
                <span className="font-display italic text-slate-700 font-bold block text-sm">
                  Accounts Department
                </span>
                <span>Signature & Stamp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payModal && (
        <div className="modal-backdrop" onClick={() => setPayModal(false)}>
          <div
            className="card max-w-md w-full p-7 bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="eyebrow">Payment Collection</span>
                <h2 className="font-display font-extrabold text-xl text-main mt-1">
                  Record Payment for {currentAdmission?.patient}
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setPayModal(false)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Payment Amount (₹) *</span>
                <input
                  required
                  type="number"
                  min="1"
                  className="input font-mono text-base font-bold"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 50000"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Payment Method</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="UPI / Bank Transfer">UPI / Bank Transfer</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque / DD">Cheque / Demand Draft</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Notes / Transaction Reference</span>
                <input
                  className="input text-sm"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="UTR number or receipt remarks"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-7 border-t border-ui pt-4">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setPayModal(false)}>
                Cancel
              </button>
              <button className="btn-primary text-xs cursor-pointer" onClick={recordPayment}>
                <Icon name="check" size={14} /> Submit Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
