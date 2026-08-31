import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../common/Icon.jsx';

export default function CTA() {
  const { nav, t } = useApp();

  return (
    <section className="max-w-[1440px] mx-auto px-5 lg:px-10 mt-20 no-print">
      <div className="rounded-[2.5rem] bg-[#dcebe3] text-[#173a3a] p-8 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
        <div className="absolute -right-12 -top-20 w-72 h-72 border-[40px] border-white/40 rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <span className="eyebrow mb-3">{t('ctaEyebrow')}</span>
          <h2 className="font-display font-extrabold text-3xl lg:text-5xl text-[#173a3a] mt-2">
            {t('ctaTitle')}
          </h2>
          <p className="mt-3 text-[#3f5f5d] text-base lg:text-lg max-w-xl">
            {t('ctaSubtitle')}
          </p>
        </div>

        <button
          className="btn-primary shrink-0 relative z-10 text-base px-7 py-4"
          onClick={() => nav('/inquiry')}
        >
          {t('ctaButton')} <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </section>
  );
}
