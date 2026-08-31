import React, { useState, useEffect } from 'react';
import Icon from '../common/Icon.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function FloatingActions() {
  const { t } = useApp();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col gap-3 items-end floating-action-buttons">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="w-11 h-11 rounded-full bg-[var(--surface)] border border-ui text-[var(--teal)] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center cursor-pointer"
        >
          <Icon name="arrow-up" size={18} />
        </button>
      )}

      {/* Direct Phone Call Button */}
      <a
        href="tel:+919848021042"
        aria-label={t('callUs') || 'Call Admissions'}
        title="+91 98480 21042 · 24/7 Support"
        className="w-12 h-12 rounded-full bg-[var(--teal)] text-white shadow-lg hover:bg-[var(--teal-dark)] hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer relative group"
      >
        <Icon name="phone" size={20} />
        <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          {t('callUs') || 'Call 24/7'}: +91 98480 21042
        </span>
      </a>

      {/* WhatsApp Chat Button */}
      <a
        href="https://wa.me/919848021042?text=Hello%20Sri%20Thirumala%20Care%2C%20I%20would%20like%20to%20inquire%20about%20rehabilitation%20and%20nursing%20care."
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsappChat') || 'Chat on WhatsApp'}
        title="Chat on WhatsApp"
        className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer relative group"
      >
        <Icon name="message-circle" size={22} />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
        <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          {t('whatsappChat') || 'WhatsApp Care Team'}
        </span>
      </a>
    </div>
  );
}
