import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../common/Icon.jsx';

export default function Footer() {
  const { nav, t } = useApp();

  return (
    <footer className="bg-[#083f40] text-white mt-24 no-print">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Purpose */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-xl bg-white/10 grid place-items-center">
                <Icon name="heart-pulse" size={22} className="text-[#a6e3d7]" />
              </span>
              <strong className="font-display text-lg tracking-tight">Sri Thirumala Care</strong>
            </div>
            <p className="text-white/65 text-sm leading-7">
              {t('footerDescription')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base">{t('footerCareHeading')}</h4>
            <div className="grid gap-2.5 text-sm text-white/65">
              <button className="text-left hover:text-white transition cursor-pointer" onClick={() => nav('/services')}>
                {t('services')}
              </button>
              <button className="text-left hover:text-white transition cursor-pointer" onClick={() => nav('/packages')}>
                {t('packages')}
              </button>
              <button className="text-left hover:text-white transition cursor-pointer" onClick={() => nav('/add-on-services')}>
                {t('addons')}
              </button>
              <button className="text-left hover:text-white transition cursor-pointer" onClick={() => nav('/estimator')}>
                {t('estimator')}
              </button>
              <button className="text-left hover:text-white transition cursor-pointer" onClick={() => nav('/gallery')}>
                {t('gallery')}
              </button>
              <button className="text-left hover:text-white transition cursor-pointer" onClick={() => nav('/blog')}>
                {t('blog')}
              </button>
              <button className="text-left hover:text-white transition cursor-pointer" onClick={() => nav('/contact')}>
                {t('contact')}
              </button>
            </div>
          </div>

          {/* Campus Location */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base">{t('footerCampusHeading')}</h4>
            <p className="text-sm text-white/65 leading-7">
              Near AVR Homes, Chinna Venkatagiri Cross Road<br />
              Prakash Nagar, Khammam – 507001<br />
              Telangana, India
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#a6e3d7]">
              <Icon name="map-pin" size={14} />
              <span>Two locations in Khammam</span>
            </div>
          </div>

          {/* Hours & Contact */}
          <div>
            <h4 className="font-bold mb-4 text-white text-base">{t('footerHoursHeading')}</h4>
            <p className="text-sm text-white/65 mb-4 leading-6 whitespace-pre-line">
              {t('footerHoursText')}
            </p>
            <button
              className="rounded-full bg-white text-[#083f40] px-5 py-2.5 font-bold text-sm hover:-translate-y-0.5 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
              onClick={() => nav('/contact')}
            >
              <span>{t('contact')}</span>
              <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-wrap justify-between items-center gap-3 text-xs text-white/50">
          <span>{t('footerCopyright')}</span>
          <button
            onClick={() => nav('/admin/dashboard')}
            className="hover:text-white transition font-medium flex items-center gap-1.5 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg"
          >
            <Icon name="shield-check" size={14} />
            <span>{t('staffPortal')} →</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
