import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, money, currentISODate, cn } from '../../utils/formatters.js';

export default function Invoices() {
  const { admissions, nav } = useApp();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadAllInvoices() {
      setLoading(true);
      try {
        const results = await Promise.all(
          admissions.map(async (adm) => {
            try {
              const res = await api.getBillingByAdmission(adm.id, { through: currentISODate() });
              return {
                admission: adm,
                bill: res.bill,
                profile: res.profile
              };
            } catch {
              return null;
            }
          })
        );
        setInvoices(results.filter(Boolean));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAllInvoices();
  }, [admissions]);

  const filtered = invoices.filter(inv => {
    if (filter === 'due') return inv.bill.due > 0.01;
    if (filter === 'cleared') return inv.bill.due <= 0.01;
    return true;
  });

  const totalBilled = invoices.reduce((acc, curr) => acc + (curr.bill?.total || 0), 0);
  const totalPaid = invoices.reduce((acc, curr) => acc + (curr.bill?.paid || 0), 0);
  const totalDue = invoices.reduce((acc, curr) => acc + (curr.bill?.due || 0), 0);

  return (
    <AdminLayout
      title="Invoices & Accounts Receivable"
      subtitle="Financial ledgers, gross assessments, payments collected, and outstanding balances across all patients"
      action={
        <button
          className="btn-primary mobile-hide !py-2 text-xs cursor-pointer"
          onClick={() => nav('/admin/billing/create')}
        >
          <Icon name="receipt" size={14} /> Open Patient Billing
        </button>
      }
    >
      {/* 3 Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Total Assessed / Billed</span>
          <strong className="block text-3xl font-display font-extrabold text-main mt-1">
            {money(totalBilled)}
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Total Payments Collected</span>
          <strong className="block text-3xl font-display font-extrabold text-emerald-600 mt-1">
            {money(totalPaid)}
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Total Outstanding Receivables</span>
          <strong className="block text-3xl font-display font-extrabold text-red-600 mt-1">
            {money(totalDue)}
          </strong>
        </div>
      </div>

      {/* Invoices List Table */}
      <section className="card overflow-hidden bg-[var(--surface)] shadow-sm">
        <div className="p-4 border-b border-ui flex justify-between items-center flex-wrap gap-3">
          <div className="flex rounded-full bg-[var(--mist)] p-1">
            {[
              ['all', `All Statements (${invoices.length})`],
              ['due', 'Outstanding Due'],
              ['cleared', 'Zero Due / Cleared']
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

        {loading ? (
          <div className="p-12 text-center text-muted">
            <Icon name="loader-2" size={28} className="mx-auto animate-spin mb-2 text-[var(--teal)]" />
            <p>Loading patient statements…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-[var(--mist)] text-left text-xs text-muted">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Billing Window</th>
                  <th className="p-4">Total Assessed</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Balance Due</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ admission: adm, bill }) => (
                  <tr key={adm.id} className="border-t border-ui hover:bg-[var(--mist)]/40 transition">
                    <td className="p-4 font-mono font-bold text-main">INV-{adm.id}</td>
                    <td className="p-4">
                      <strong className="block text-main">{adm.patient}</strong>
                      <span className="text-xs text-muted font-mono">{adm.id} · {adm.status}</span>
                    </td>
                    <td className="p-4 text-xs text-muted">
                      {fmtDate(bill.billFrom)} – {fmtDate(bill.billTo)}
                    </td>
                    <td className="p-4 font-mono font-semibold text-main">{money(bill.total)}</td>
                    <td className="p-4 font-mono text-emerald-600 font-semibold">{money(bill.paid)}</td>
                    <td className="p-4 font-mono font-bold">
                      <span className={bill.due > 0.01 ? 'text-red-600' : 'text-emerald-600'}>
                        {money(bill.due)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        className="btn-secondary !py-1.5 text-xs font-bold cursor-pointer"
                        onClick={() => {
                          localStorage.setItem('st-billing-target', adm.id);
                          nav('/admin/billing/create');
                        }}
                      >
                        <Icon name="receipt" size={13} /> View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
