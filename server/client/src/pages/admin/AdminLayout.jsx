import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../../components/common/Icon.jsx';
import CommandPalette from '../../components/layout/CommandPalette.jsx';
import Toast from '../../components/layout/Toast.jsx';
import { cn } from '../../utils/formatters.js';

const ADMIN_NAV = [
  ['/admin/dashboard', 'layout-dashboard', 'Overview'],
  ['/admin/inquiries', 'inbox', 'Inquiries'],
  ['/admin/admissions', 'clipboard-plus', 'Admissions'],
  ['/admin/discharged', 'archive', 'Discharged'],
  ['/admin/catalog', 'package-search', 'Services & Packages'],
  ['/admin/media', 'images', 'Gallery & Blog'],
  ['/admin/billing/create', 'receipt', 'Billing'],
  ['/admin/billing/invoices', 'landmark', 'Invoices'],
  ['/admin/residents', 'users', 'Residents Care'],
  ['/admin/beds', 'bed-single', 'Rooms & Beds']
];

export default function AdminLayout({ children, title, subtitle, action }) {
  const { route, nav, setCommandOpen, toast } = useApp();

  return (
    <div className="admin-shell bg-[var(--bg)] min-h-screen">
      {/* Sticky Admin Sidebar */}
      <aside className="admin-sidebar px-4 py-5 flex flex-col justify-between select-none">
        <div>
          {/* Logo & Portal Branding */}
          <button
            className="admin-brand flex items-center gap-3 px-2 mb-8 text-left cursor-pointer group w-full"
            onClick={() => nav('/')}
          >
            <span className="w-10 h-10 rounded-xl bg-white text-[#0b4546] grid place-items-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Icon name="heart-pulse" size={20} />
            </span>
            <span className="admin-brand-text">
              <strong className="font-display block text-sm font-extrabold text-white">Sri Thirumala</strong>
              <small className="text-white/60 text-[11px] block font-medium">Clinical Operating System</small>
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="admin-nav grid gap-1" aria-label="Admin navigation">
            {ADMIN_NAV.map(([p, icon, label]) => {
              const active = route === p || (p !== '/admin/dashboard' && route.startsWith(p));
              return (
                <button
                  key={p}
                  aria-label={label}
                  onClick={() => nav(p)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer',
                    active
                      ? 'active text-white bg-white/20 shadow-sm'
                      : 'text-[#b9dbd7] hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon name={icon} size={18} className="shrink-0" />
                  <span className="admin-label truncate">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status & Portal Exit */}
        <div className="admin-extra mt-auto pt-4">
          <div className="rounded-xl bg-white/8 p-3 mb-3 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white">
              <span className="relative text-emerald-400 flex items-center justify-center">
                <span className="status-dot bg-emerald-400"></span>
                <span className="pulse-dot absolute inset-0"></span>
              </span>
              <span>Systems Online</span>
            </div>
            <div className="text-[10px] text-white/45 mt-1.5 font-mono">SQLite Dev · MySQL Ready</div>
          </div>

          <button
            onClick={() => nav('/')}
            className="w-full flex gap-3 items-center px-3 py-2 text-sm text-white/65 hover:text-white transition cursor-pointer rounded-xl hover:bg-white/10"
          >
            <Icon name="log-out" size={16} />
            <span className="admin-label">Public Website</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main min-w-0 flex-1 flex flex-col justify-between overflow-x-hidden max-w-full">
        <div className="w-full max-w-full overflow-x-hidden">
          {/* Header Bar */}
          <header className="surface border-b border-ui px-4 lg:px-8 py-4 sticky top-0 z-30 flex items-center justify-between gap-4 glass w-full max-w-full">
            <div className="min-w-0 flex-1">
              <h1 className="font-display font-extrabold text-lg lg:text-2xl text-main truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted mt-0.5 mobile-hide truncate">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                className="icon-btn"
                onClick={() => setCommandOpen(true)}
                aria-label="Quick command search"
                title="Quick command (Ctrl+K)"
              >
                <Icon name="search" size={17} />
              </button>

              {action}

              <div className="mobile-hide flex items-center gap-2 ml-2 pl-3 border-l border-ui">
                <div className="w-8 h-8 rounded-full bg-[var(--teal)] text-white grid place-items-center text-xs font-bold shadow-sm">
                  AR
                </div>
                <div className="text-xs">
                  <strong className="block text-main">Ananya Rao</strong>
                  <span className="text-muted">Administrator</span>
                </div>
              </div>
            </div>
          </header>

          {/* Child Page Content */}
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full max-w-full overflow-x-hidden">{children}</div>
        </div>

        {/* Global modals */}
        <CommandPalette />
        {toast && <Toast {...toast} />}
      </main>
    </div>
  );
}
