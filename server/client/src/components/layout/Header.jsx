import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AccessibilityBar from './AccessibilityBar.jsx';
import Icon from '../common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

export default function Header() {
  const { route, nav, basket, t, setCommandOpen } = useApp();
  const [mobile, setMobile] = useState(false);

  const links = [
    ['/', t('home')],
    ['/services', t('services')],
    ['/packages', t('packages')],
    ['/add-on-services', t('addons')],
    ['/about', t('about')],
    ['/gallery', t('gallery')],
    ['/blog', t('blog')],
    ['/contact', t('contact')]
  ];

  return (
    <>
      <AccessibilityBar />
      <header className="sticky top-0 z-40 glass border-b border-ui">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 h-[78px] flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => nav('/')}
            className="flex items-center gap-3 text-left cursor-pointer group shrink-0"
            aria-label="Sri Thirumala Home"
          >
            <span className="w-11 h-11 rounded-[15px] bg-[var(--teal)] text-white grid place-items-center relative shadow-sm group-hover:scale-105 transition-transform">
              <Icon name="heart-pulse" size={23} />
              <span className="absolute -right-1 -top-1 w-3 h-3 bg-[var(--coral)] border-2 border-white rounded-full"></span>
            </span>
            <span>
              <strong className="font-display block leading-tight text-[15px] text-main">
                Sri Thirumala
              </strong>
              <small className="text-muted text-[10px] tracking-[.12em] uppercase font-semibold">
                Rehabilitation & Nursing
              </small>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav flex items-center justify-center gap-1" aria-label="Main navigation">
            {links.map(([p, label]) => (
              <button
                key={p}
                onClick={() => nav(p)}
                className={cn(
                  'nav-link px-2.5 py-2 text-xs xl:text-sm font-semibold cursor-pointer',
                  (route === p || (p !== '/' && route.startsWith(p + '/'))) && 'active'
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Actions & Basket */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="icon-btn desktop-actions-optional"
              aria-label="Quick search (Ctrl+K)"
              title="Search (Ctrl+K)"
              onClick={() => setCommandOpen(true)}
            >
              <Icon name="search" size={17} />
            </button>

            <button
              className="relative icon-btn"
              aria-label={`${basket.length} items in care basket`}
              title="Care Basket"
              onClick={() => nav('/inquiry')}
            >
              <Icon name="shopping-basket" size={18} />
              {basket.length > 0 && (
                <span className="absolute -right-1 -top-1 bg-[var(--coral)] text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full grid place-items-center animate-bounce">
                  {basket.length}
                </span>
              )}
            </button>

            <button
              className="btn-primary desktop-actions-optional !py-2.5 text-xs xl:text-sm"
              onClick={() => nav('/inquiry')}
            >
              {t('quote')} <Icon name="arrow-up-right" size={16} />
            </button>

            <button
              className="icon-btn public-menu-toggle"
              aria-label="Toggle mobile menu"
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              <Icon name={mobile ? 'x' : 'menu'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobile && (
          <div className="public-mobile-menu surface border-t border-ui p-4 gap-1 animate-in slide-in-from-top-3">
            {links.map(([p, label]) => (
              <button
                key={p}
                onClick={() => {
                  nav(p);
                  setMobile(false);
                }}
                className={cn(
                  'text-left p-3 rounded-xl hover:bg-[var(--mist)] font-semibold text-main transition',
                  (route === p || (p !== '/' && route.startsWith(p + '/'))) && 'bg-[var(--mist)] text-[var(--teal)]'
                )}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => {
                nav('/estimator');
                setMobile(false);
              }}
              className="text-left p-3 rounded-xl hover:bg-[var(--mist)] font-semibold text-main transition"
            >
              {t('estimator')}
            </button>
            <div className="border-t border-ui pt-2 mt-2">
              <button
                onClick={() => {
                  nav('/admin/dashboard');
                  setMobile(false);
                }}
                className="w-full text-left p-3 rounded-xl text-[var(--teal)] font-bold bg-[var(--mist)] flex items-center justify-between"
              >
                <span>{t('staffPortal')}</span>
                <Icon name="shield" size={16} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
