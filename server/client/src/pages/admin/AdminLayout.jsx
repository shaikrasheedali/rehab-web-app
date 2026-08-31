import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../../components/common/Icon.jsx';
import Toast from '../../components/layout/Toast.jsx';
import CommandPalette from '../../components/layout/CommandPalette.jsx';
import AdminLogin from './AdminLogin.jsx';
import { cn } from '../../utils/formatters.js';

const ADMIN_NAV = [
  { p: '/admin/dashboard', icon: 'activity', label: 'Operations & Census' },
  { p: '/admin/inquiries', icon: 'inbox', label: 'Inquiries Pipeline' },
  { p: '/admin/admissions', icon: 'user-check', label: 'Admissions Register' },
  { p: '/admin/discharged', icon: 'archive', label: 'Discharged Archive' },
  { p: '/admin/catalog', icon: 'layers', label: 'Clinical Catalog' },
  { p: '/admin/media', icon: 'image', label: 'Gallery & Blogs' },
  { p: '/admin/billing/create', icon: 'file-text', label: 'Inpatient Statements' },
  { p: '/admin/billing/invoices', icon: 'credit-card', label: 'Ledger & Receipts' },
  { p: '/admin/residents', icon: 'clipboard-list', label: 'Resident Clinical Log' },
  { p: '/admin/beds', icon: 'layout-grid', label: 'Bed & Room Inventory' }
];

export default function AdminLayout({ children, title, subtitle, action }) {
  const {
    route,
    nav,
    toast,
    setCommandOpen,
    adminUser,
    adminToken,
    logout,
    notify
  } = useApp();

  // If not authenticated, require login
  if (!adminUser || !adminToken) {
    return <AdminLogin />;
  }

  const handleLogout = async () => {
    await logout();
    notify('You have been logged out of the admin portal.');
  };

  return (
    <div className="admin-shell flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--bg)] text-main">
      {/* Sidebar on Desktop (Fixed height, independent scroll, docked) */}
      <aside className="admin-sidebar w-64 bg-[#0c2f2f] text-white flex-col justify-between shrink-0 h-screen overflow-y-auto z-40 hidden md:flex border-r border-[#194b4b]">
        <div className="p-5">
          {/* Brand Header */}
          <div className="admin-brand flex items-center justify-between pb-5 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--teal)] text-white grid place-items-center font-display font-extrabold shadow-sm text-sm">
                ST
              </div>
              <div>
                <strong className="block text-sm font-bold text-white tracking-tight">Sri Thirumala</strong>
                <span className="text-[10px] text-[#86bfba] uppercase tracking-wider block font-mono">
                  Clinical Portal
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Admin navigation">
            {ADMIN_NAV.map(({ p, icon, label }) => {
              const active = route === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-label={label}
                  onClick={() => nav(p)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left',
                    active
                      ? 'active text-white bg-white/20 shadow-sm font-bold'
                      : 'text-[#b9dbd7] hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon name={icon} size={17} className="shrink-0" />
                  <span className="admin-label truncate">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-white/10 mt-auto bg-[#082424]">
          <div className="rounded-xl bg-white/5 p-3 mb-3 border border-white/10">
            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="relative text-emerald-400 flex items-center justify-center">
                  <span className="status-dot bg-emerald-400"></span>
                  <span className="pulse-dot absolute inset-0"></span>
                </span>
                <span className="text-[11px] font-medium">Session Active</span>
              </div>
              <span className="text-[9px] bg-white/10 text-[#86bfba] px-1.5 py-0.5 rounded font-mono">
                Argon2id
              </span>
            </div>
            <div className="text-[10px] text-white/50 mt-1 truncate">
              Signed in as: <strong className="text-white/80">{adminUser?.name || adminUser?.username}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => nav('/')}
              className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs text-white/70 hover:text-white transition cursor-pointer rounded-xl bg-white/5 hover:bg-white/15"
              title="Return to Public Website"
            >
              <Icon name="globe" size={14} />
              <span>Website</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs text-red-300 hover:text-red-100 transition cursor-pointer rounded-xl bg-red-950/40 hover:bg-red-900/60"
              title="Log out of admin portal"
            >
              <Icon name="log-out" size={14} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Independent scroll, smooth container) */}
      <main className="admin-main flex-1 h-screen overflow-y-auto flex flex-col justify-between bg-[var(--bg)] min-w-0 max-w-full">
        <div className="w-full max-w-full">
          {/* Header Bar */}
          <header className="surface border-b border-ui px-4 lg:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-3 glass w-full max-w-full bg-[var(--surface)]/90 backdrop-blur-md">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 md:hidden mb-0.5">
                <span className="text-[10px] font-bold text-[var(--teal)] uppercase tracking-wider font-mono">
                  Admin Portal
                </span>
              </div>
              <h1 className="font-display font-extrabold text-lg lg:text-2xl text-main truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted mt-0.5 hidden lg:block truncate">{subtitle}</p>}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="icon-btn"
                onClick={() => setCommandOpen(true)}
                aria-label="Quick command search"
                title="Quick command (Ctrl+K)"
              >
                <Icon name="search" size={16} />
              </button>

              {action}

              {/* Desktop Admin Profile Badge */}
              <div className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-ui">
                <div className="w-8 h-8 rounded-full bg-[var(--teal)] text-white grid place-items-center text-xs font-bold shadow-sm">
                  {adminUser?.username?.slice(0, 2).toUpperCase() || 'AD'}
                </div>
                <div className="text-xs hidden md:block">
                  <strong className="block text-main">{adminUser?.name || 'Administrator'}</strong>
                  <span className="text-muted text-[10px] uppercase font-mono">{adminUser?.role || 'Admin'}</span>
                </div>
              </div>

              {/* Mobile and Header Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-secondary !py-1.5 !px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer flex items-center gap-1.5 ml-1"
                title="Log out of session"
              >
                <Icon name="log-out" size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </header>

          {/* Child Page Content */}
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full max-w-full overflow-x-hidden pb-20 md:pb-8">
            {children}
          </div>
        </div>

        {/* Global modals */}
        {toast && <Toast message={toast.message} type={toast.type} />}
        <CommandPalette />
      </main>

      {/* Mobile Bottom Navigation Bar (Scroll-free, fixed bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c2f2f] text-white border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {ADMIN_NAV.slice(0, 5).map(({ p, icon, label }) => {
          const active = route === p;
          return (
            <button
              key={p}
              type="button"
              aria-label={label}
              onClick={() => nav(p)}
              className={cn(
                'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer',
                active ? 'text-white font-bold bg-white/20' : 'text-[#86bfba] hover:text-white'
              )}
            >
              <Icon name={icon} size={17} />
              <span className="mt-0.5 truncate max-w-[55px]">{label.split(' ')[0]}</span>
            </button>
          );
        })}
        {/* Mobile quick exit to website */}
        <button
          type="button"
          aria-label="Public website"
          onClick={() => nav('/')}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-[#86bfba] hover:text-white transition cursor-pointer"
        >
          <Icon name="globe" size={17} />
          <span className="mt-0.5">Site</span>
        </button>
      </nav>
    </div>
  );
}
