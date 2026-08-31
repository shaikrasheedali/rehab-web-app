import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import Icon from '../../components/common/Icon.jsx';
import { fmtDate, money, cn } from '../../utils/formatters.js';

function KPI({ icon, label, value, trend, color = 'teal' }) {
  return (
    <div className="card p-5 bg-[var(--surface)] shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'w-10 h-10 rounded-xl grid place-items-center shrink-0',
            color === 'coral'
              ? 'bg-orange-100 text-orange-700'
              : color === 'blue'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-[var(--mist)] text-[var(--teal)]'
          )}
        >
          <Icon name={icon} size={18} />
        </span>
        <span
          className={cn(
            'text-xs font-bold rounded-full px-2.5 py-1',
            String(trend).startsWith('+')
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          )}
        >
          {trend}
        </span>
      </div>
      <div className="mt-4 text-3xl font-display font-extrabold text-main">{value}</div>
      <div className="text-xs text-muted mt-1 font-medium">{label}</div>
    </div>
  );
}

function MiniLineChart() {
  return (
    <svg viewBox="0 0 600 190" className="w-full h-[200px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f5d5e" stopOpacity="0.25" />
          <stop offset="1" stopColor="#0f5d5e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 70, 110, 150].map((y) => (
        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="var(--line)" strokeDasharray="5 6" />
      ))}
      <path
        d="M0 164 C55 155 64 90 112 112 S177 148 218 93 S286 60 328 88 S397 137 438 73 S525 31 600 47 L600 190 L0 190Z"
        fill="url(#area)"
      />
      <path
        d="M0 164 C55 155 64 90 112 112 S177 148 218 93 S286 60 328 88 S397 137 438 73 S525 31 600 47"
        fill="none"
        stroke="#0f5d5e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="600" cy="47" r="5.5" fill="#e96f51" stroke="white" strokeWidth="2.5" />
    </svg>
  );
}

export default function Dashboard() {
  const { admissions, accommodations, inquiries, packages, nav, notify, stats } = useApp();

  const activeAdmissions = admissions.filter(x => x.status === 'Admitted');
  const openInquiries = inquiries.filter(x => x.status !== 'Admitted');

  const occupiedUnits = accommodations.filter(a => a.isOccupied).length;
  const availableUnits = accommodations.length - occupiedUnits;

  return (
    <AdminLayout
      title="Clinical Operations Dashboard"
      subtitle="Prakash Nagar & Venkatagiri Centers · Live Status"
      action={
        <button
          className="btn-primary mobile-hide !py-2 text-xs cursor-pointer"
          onClick={() => notify('Daily census report downloaded')}
        >
          <Icon name="download" size={15} /> Daily Census
        </button>
      }
    >
      {/* 4 Main KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI
          icon="users"
          label="Active Inpatient Census"
          value={activeAdmissions.length}
          trend={`${activeAdmissions.length} admitted`}
        />
        <KPI
          icon="door-open"
          label="Rooms & Beds Available"
          value={availableUnits}
          trend={`${accommodations.length} total units`}
          color="blue"
        />
        <KPI
          icon="inbox"
          label="Open Inquiries Pipeline"
          value={openInquiries.length}
          trend={`${inquiries.length} total`}
          color="coral"
        />
        <KPI
          icon="wallet"
          label="Total Revenue Collected"
          value={money(stats?.totalRevenueCollected || 105000)}
          trend="Audited"
        />
      </div>

      {/* Graphs & Accommodations Section */}
      <div className="grid xl:grid-cols-[1.25fr_.75fr] gap-6 mb-6">
        {/* Inquiry Velocity Chart */}
        <section className="card p-6 bg-[var(--surface)] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-extrabold text-lg text-main">Inquiry & Admission Velocity</h2>
              <p className="text-xs text-muted mt-1">Patient inquiry volume over the last 30 days</p>
            </div>
            <span className="text-xs bg-[var(--mist)] text-[var(--teal)] font-bold px-3 py-1 rounded-full">
              Live Stream
            </span>
          </div>

          <MiniLineChart />

          <div className="flex justify-between text-[11px] text-muted px-1 mt-2">
            <span>01 Aug</span>
            <span>08 Aug</span>
            <span>15 Aug</span>
            <span>22 Aug</span>
            <span>30 Aug</span>
          </div>
        </section>

        {/* Accommodation Breakdown */}
        <section className="card p-6 bg-[var(--surface)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-display font-extrabold text-lg text-main">Accommodation Inventory</h2>
                <p className="text-xs text-muted mt-1">Real-time room and bed occupancy</p>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-100 rounded-full px-2.5 py-1 font-bold">
                Live
              </span>
            </div>

            <div className="mt-6 grid gap-3.5">
              {[
                ['Private Rooms', accommodations.filter(x => x.type === 'Room').length, 'door-open'],
                ['Assisted Beds', accommodations.filter(x => x.type === 'Bed').length, 'bed-single'],
                ['Occupied Units', occupiedUnits, 'user-check'],
                ['Vacant Units', availableUnits, 'circle-check']
              ].map(([label, val, icon]) => (
                <div key={label} className="flex items-center gap-3 border-b border-ui pb-3 last:border-0">
                  <span className="w-9 h-9 rounded-xl bg-[var(--mist)] text-[var(--teal)] grid place-items-center shrink-0">
                    <Icon name={icon} size={16} />
                  </span>
                  <span className="text-sm font-medium text-main flex-1">{label}</span>
                  <strong className="text-main font-bold text-base">{val}</strong>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn-secondary w-full mt-5 !py-2.5 text-xs cursor-pointer"
            onClick={() => nav('/admin/beds')}
          >
            Manage Rooms & Beds →
          </button>
        </section>
      </div>

      {/* Recent Admissions Table */}
      <section className="card overflow-hidden bg-[var(--surface)] shadow-sm">
        <div className="p-5 border-b border-ui flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-lg text-main">Recent Admissions</h2>
            <p className="text-xs text-muted">Placement, billing model, and stay status</p>
          </div>
          <button
            className="btn-secondary !py-2 text-xs cursor-pointer"
            onClick={() => nav('/admin/admissions')}
          >
            Admission Register
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--mist)] text-left text-xs text-muted">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Admission Date</th>
                <th className="p-4">Billing Package</th>
                <th className="p-4">Placement</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeAdmissions.slice(0, 5).map((row) => {
                const pkg = packages.find(x => x.id === row.packageId);
                return (
                  <tr key={row.id} className="border-t border-ui hover:bg-[var(--mist)]/40 transition">
                    <td className="p-4">
                      <strong className="text-main block">{row.patient}</strong>
                      <span className="block text-xs text-muted font-mono">{row.id}</span>
                    </td>
                    <td className="p-4 text-muted">{fmtDate(row.admissionDate)}</td>
                    <td className="p-4">
                      <span className="font-medium text-main">{pkg?.name || 'Custom Plan'}</span>
                    </td>
                    <td className="p-4">
                      {row.stayType === 'staying' ? (
                        <span className="font-mono text-xs text-[var(--teal)] font-bold">
                          {row.accommodationId || 'Unassigned'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Non-staying patient</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-emerald-100 text-emerald-700">
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        className="text-xs font-bold text-[var(--teal)] hover:underline cursor-pointer"
                        onClick={() => {
                          localStorage.setItem('st-billing-target', row.id);
                          nav('/admin/billing/create');
                        }}
                      >
                        Open Bill →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
