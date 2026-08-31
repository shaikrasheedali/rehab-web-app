import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { cn } from '../../utils/formatters.js';

export default function Inquiries() {
  const { inquiries, setInquiries, beginAdmission, notify, fetchInquiries } = useApp();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sort, setSort] = useState('Newest');

  const statusCounts = useMemo(() => {
    return ['All', 'New', 'Contacted', 'Quote sent'].map(label => [
      label,
      label === 'All' ? inquiries.length : inquiries.filter(x => x.status === label).length
    ]);
  }, [inquiries]);

  const filteredData = useMemo(() => {
    let rows = inquiries.filter(x => {
      const matchesStatus = statusFilter === 'All' || x.status === statusFilter;
      const searchStr = `${x.patient} ${x.contact} ${x.phone} ${x.need} ${x.id}`.toLowerCase();
      const matchesSearch = searchStr.includes(q.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    return [...rows].sort((a, b) => {
      if (sort === 'Patient A–Z') return a.patient.localeCompare(b.patient);
      if (sort === 'Priority') return a.priority === 'High' ? -1 : 1;
      return b.id.localeCompare(a.id);
    });
  }, [inquiries, q, statusFilter, sort]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateInquiryStatus(id, { status: newStatus });
      setInquiries(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
      notify(`Inquiry ${id} updated to ${newStatus}`);
    } catch (err) {
      notify(err.message || 'Failed to update status', 'warning');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete inquiry ${id}?`)) return;
    try {
      await api.deleteInquiry(id);
      setInquiries(prev => prev.filter(item => item.id !== id));
      notify(`Inquiry ${id} deleted.`);
    } catch (err) {
      notify(err.message || 'Failed to delete inquiry', 'warning');
    }
  };

  return (
    <AdminLayout
      title="Inquiries & Admissions Pipeline"
      subtitle="Triage patient requests, track contact stages, and convert to admissions"
      action={
        <button
          className="btn-primary mobile-hide !py-2 text-xs cursor-pointer"
          onClick={() => beginAdmission(null)}
        >
          <Icon name="user-plus" size={15} /> Direct Admission
        </button>
      }
    >
      {/* Metric Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusCounts.map(([label, count]) => (
          <button
            key={label}
            onClick={() => setStatusFilter(label)}
            className={cn(
              'card p-4 text-left transition cursor-pointer bg-[var(--surface)] shadow-sm',
              statusFilter === label && 'ring-2 ring-[#0f5d5e] border-[var(--teal)]'
            )}
          >
            <span className="text-xs text-muted font-medium">{label} Inquiries</span>
            <strong className="block text-2xl font-display font-extrabold text-main mt-1">
              {count}
            </strong>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <section className="card overflow-hidden bg-[var(--surface)] shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-ui">
          <label className="relative flex-1">
            <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-10 !py-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by patient name, phone, need or inquiry ID…"
            />
          </label>

          <select
            className="input !w-auto !py-2 text-sm cursor-pointer"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="Newest">Newest First</option>
            <option value="Priority">High Priority First</option>
            <option value="Patient A–Z">Patient Name A–Z</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[var(--mist)] text-left text-xs text-muted">
              <tr>
                <th className="p-4">Inquiry ID</th>
                <th className="p-4">Patient & Clinical Need</th>
                <th className="p-4">Family Contact</th>
                <th className="p-4">Received</th>
                <th className="p-4">Status</th>
                <th className="p-4">Admission</th>
                <th className="p-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((r) => (
                <tr key={r.id} className="border-t border-ui hover:bg-[var(--mist)]/40 transition">
                  <td className="p-4">
                    <strong className="font-mono text-main block">{r.id}</strong>
                    <span
                      className={cn(
                        'block text-[10px] font-bold mt-1',
                        r.priority === 'High' ? 'text-red-600' : 'text-muted'
                      )}
                    >
                      {r.priority} Priority
                    </span>
                  </td>

                  <td className="p-4">
                    <strong className="text-main block">{r.patient}</strong>
                    <span className="block text-xs text-muted mt-1 max-w-[280px] line-clamp-2">
                      {r.need}
                    </span>
                  </td>

                  <td className="p-4">
                    <strong className="block text-main">{r.contact}</strong>
                    <span className="text-xs text-muted font-mono">{r.phone}</span>
                  </td>

                  <td className="p-4 text-muted text-xs whitespace-nowrap">{r.date}</td>

                  <td className="p-4">
                    <select
                      aria-label={`Status for ${r.id}`}
                      className="input !py-1.5 !w-36 text-xs cursor-pointer font-medium"
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quote sent">Quote sent</option>
                      <option value="Admitted">Admitted</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <button
                      disabled={r.status === 'Admitted'}
                      className={cn(
                        'btn-secondary !py-1.5 text-xs font-bold transition cursor-pointer',
                        r.status === 'Admitted' && 'opacity-50 cursor-not-allowed bg-slate-100'
                      )}
                      onClick={() => beginAdmission(r)}
                    >
                      <Icon
                        name={r.status === 'Admitted' ? 'check' : 'clipboard-plus'}
                        size={14}
                      />{' '}
                      {r.status === 'Admitted' ? 'Admitted' : 'Convert'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      className="icon-btn !w-8 !h-8 text-muted hover:text-red-600"
                      onClick={() => handleDelete(r.id)}
                      title="Delete inquiry"
                    >
                      <Icon name="trash-2" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-ui text-xs text-muted flex justify-between items-center">
          <span>Showing {filteredData.length} of {inquiries.length} inquiries</span>
          <button className="text-[var(--teal)] font-bold hover:underline cursor-pointer" onClick={fetchInquiries}>
            Refresh Pipeline
          </button>
        </div>
      </section>
    </AdminLayout>
  );
}
