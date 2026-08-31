import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../common/Icon.jsx';

export default function CommandPalette() {
  const { commandOpen, setCommandOpen, nav } = useApp();
  const [q, setQ] = useState('');

  const actions = useMemo(() => [
    { label: 'Browse in-package services', path: '/services', icon: 'layers' },
    { label: 'Browse care packages', path: '/packages', icon: 'package' },
    { label: 'Browse add-on services', path: '/add-on-services', icon: 'plus-circle' },
    { label: 'Open gallery & stories', path: '/gallery', icon: 'image' },
    { label: 'Read clinical blog', path: '/blog', icon: 'newspaper' },
    { label: 'About our infrastructure', path: '/about', icon: 'info' },
    { label: 'Contact the care team', path: '/contact', icon: 'phone-call' },
    { label: 'Care plan estimator', path: '/estimator', icon: 'calculator' },
    { label: 'Open care basket & checkout', path: '/inquiry', icon: 'shopping-basket' },
    { label: 'Open admin dashboard', path: '/admin/dashboard', icon: 'layout-dashboard' },
    { label: 'Register a new admission', path: '/admin/admissions', icon: 'clipboard-plus' },
    { label: 'Open discharged archive', path: '/admin/discharged', icon: 'archive' },
    { label: 'Manage services & packages', path: '/admin/catalog', icon: 'package-search' },
    { label: 'Manage gallery & blog', path: '/admin/media', icon: 'images' },
    { label: 'Create a flexible patient bill', path: '/admin/billing/create', icon: 'receipt' },
    { label: 'View all invoices', path: '/admin/billing/invoices', icon: 'landmark' },
    { label: 'Manage rooms & beds inventory', path: '/admin/beds', icon: 'bed-single' }
  ], []);

  const results = actions.filter(a =>
    a.label.toLowerCase().includes(q.toLowerCase())
  );

  if (!commandOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Quick navigation"
      onClick={() => setCommandOpen(false)}
    >
      <div
        className="card w-full max-w-xl shadow-soft overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-ui flex items-center gap-3 bg-[var(--surface)]">
          <Icon name="search" size={20} className="text-muted" />
          <input
            autoFocus
            className="bg-transparent outline-none flex-1 text-lg text-main"
            placeholder="Search pages and administrative actions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd className="text-xs border border-ui rounded px-2 py-1 bg-[var(--mist)] text-muted font-mono">
            ESC
          </kbd>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {results.map((a) => (
            <button
              key={a.path}
              className="w-full p-3 rounded-xl hover:bg-[var(--mist)] flex items-center gap-3 text-left transition"
              onClick={() => {
                nav(a.path);
                setCommandOpen(false);
              }}
            >
              <span className="w-9 h-9 rounded-lg bg-[var(--mist)] grid place-items-center text-[var(--teal)] shrink-0">
                <Icon name={a.icon} size={16} />
              </span>
              <span className="font-semibold text-sm text-main flex-1">{a.label}</span>
              <Icon name="arrow-up-right" size={14} className="text-muted" />
            </button>
          ))}
          {results.length === 0 && (
            <div className="p-6 text-center text-sm text-muted">
              No matching pages or actions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
