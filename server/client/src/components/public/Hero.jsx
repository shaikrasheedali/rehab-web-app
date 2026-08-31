import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../common/Icon.jsx';

const STOCK = {
  hero: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1500&q=88",
  therapist: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=84",
  elder: "https://images.unsplash.com/photo-1581579185169-7f3db74f655e?auto=format&fit=crop&w=900&q=84",
  team: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=84"
};

export default function Hero() {
  const { nav, t } = useApp();

  return (
    <section className="hero-grid relative overflow-hidden">
      <div className="absolute w-[520px] h-[520px] rounded-full bg-[#cfe8da]/60 blur-3xl -right-32 top-20 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
        {/* Left Copy */}
        <div className="relative z-10">
          <div className="eyebrow mb-6">{t('heroTag')}</div>
          <h1 className="text-[clamp(2.8rem,6.2vw,5.8rem)] leading-[0.96] font-extrabold max-w-[800px] text-main">
            {t('heroTitle')}{' '}
            <span className="text-[var(--teal)] relative whitespace-nowrap">
              {t('heroAccent')}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 16" fill="none">
                <path d="M3 11C80 2 202 4 297 9" stroke="#E96F51" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-muted leading-8 max-w-2xl mt-8">
            {t('heroCopy')}
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <button className="btn-primary px-6 py-4" onClick={() => nav('/services')}>
              {t('explore')} <Icon name="arrow-right" size={18} />
            </button>
            <button className="btn-secondary px-6 py-4" onClick={() => nav('/contact')}>
              <Icon name="phone-call" size={18} /> {t('talk')}
            </button>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="relative text-emerald-500 flex items-center justify-center">
                <span className="status-dot bg-emerald-500"></span>
                <span className="pulse-dot absolute inset-0"></span>
              </span>
              <strong className="text-main">{t('available')}</strong>
            </span>
            <span className="flex items-center gap-2 text-muted">
              <Icon name="shield-check" size={17} className="text-[var(--teal)]" />
              {t('confidential')}
            </span>
          </div>
        </div>

        {/* Right Photo & Dynamic Badges */}
        <div className="relative min-h-[460px] lg:min-h-[580px]">
          <div className="absolute inset-4 lg:inset-8 clip-organic overflow-hidden shadow-soft bg-[#bdd6c9]">
            <img
              src={STOCK.hero}
              alt="Compassionate clinician consulting with patient"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#073c3c]/35 via-transparent to-transparent"></div>
          </div>

          {/* Rating Badge */}
          <div className="floating absolute top-2 left-0 card shadow-soft p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
              <Icon name="badge-check" size={20} />
            </span>
            <div>
              <strong className="block text-main text-sm">{t('familyRating')}</strong>
              <span className="text-xs text-muted">{t('trustedLocal')}</span>
            </div>
          </div>

          {/* Recovery Progress Badge */}
          <div
            className="floating absolute right-0 bottom-6 card shadow-soft p-4 w-[240px]"
            style={{ animationDelay: '-2s' }}
          >
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-main">{t('recoveryPlan')}</span>
              <span className="text-xs text-[var(--teal)] font-bold">{t('onTrack')}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
              <div className="h-full w-[78%] rounded-full bg-[var(--teal)] bar-animate"></div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[STOCK.therapist, STOCK.team, STOCK.elder].map((s, i) => (
                  <img
                    key={i}
                    src={s}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    alt="Care team member"
                  />
                ))}
                <span className="w-8 h-8 rounded-full bg-[#e96f51] text-white text-[10px] font-bold grid place-items-center border-2 border-white shadow-sm">
                  +4
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted">Active Care</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
