import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../common/Icon.jsx';

const STOCK_ELDER = "https://images.unsplash.com/photo-1581579185169-7f3db74f655e?auto=format&fit=crop&w=900&q=84";

export default function Testimonial() {
  const { t } = useApp();

  return (
    <section className="dot-grid py-20">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <span className="w-14 h-14 mx-auto rounded-full bg-[#fde7dd] text-[#bd5238] grid place-items-center shadow-sm">
          <Icon name="quote" size={26} />
        </span>
        <blockquote className="font-display text-[clamp(1.65rem,3vw,2.7rem)] font-bold leading-tight mt-7 text-main">
          {t('testimonialQuote')}
        </blockquote>
        <div className="mt-7 flex justify-center items-center gap-3">
          <img
            src={STOCK_ELDER}
            className="w-11 h-11 rounded-full object-cover shadow-sm"
            alt="Family reviewer"
          />
          <div className="text-left">
            <strong className="text-sm block text-main">{t('testimonialAuthor')}</strong>
            <span className="text-xs text-muted">{t('testimonialLocation')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
