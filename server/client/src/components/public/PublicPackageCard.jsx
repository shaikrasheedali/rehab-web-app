import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

const STOCK_ROOM = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=84";
const STOCK_REHAB = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=84";

export default function PublicPackageCard({ packageItem, services = [] }) {
  const { basket, setBasket, notify, nav, t } = useApp();
  const chosen = basket.some(x => x.id === packageItem.id);

  const included = (packageItem.serviceIds || [])
    .map(id => services.find(x => x.id === id))
    .filter(Boolean);

  const choose = () => {
    const item = {
      id: packageItem.id,
      title: packageItem.name,
      category: 'Care package',
      icon: 'package-check',
      duration: 'Duration confirmed during inquiry'
    };
    setBasket(rows => [...rows.filter(x => x.category !== 'Care package'), item]);
    notify(`${packageItem.name} selected`);
  };

  const imageSrc = packageItem.id?.includes('comfort') ? STOCK_ROOM : STOCK_REHAB;

  return (
    <article className="card overflow-hidden group interactive-card">
      <div className="h-52 overflow-hidden relative">
        <img
          src={imageSrc}
          alt={packageItem.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute left-4 top-4 bg-white/90 backdrop-blur text-[#0f5d5e] rounded-full px-3 py-1 text-xs font-bold shadow-sm">
          {t('packagesEyebrow') || 'Care package'}
        </span>
      </div>

      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-display font-extrabold text-xl text-main">{packageItem.name}</h3>
            <span className="w-10 h-10 shrink-0 rounded-xl bg-[var(--mist)] text-[var(--teal)] grid place-items-center">
              <Icon name="package-check" size={18} />
            </span>
          </div>

          <p className="text-sm text-muted mt-3 leading-6">
            {(packageItem.benefits || []).join(' · ')}
          </p>

          <div className="mt-5 rounded-xl bg-[var(--mist)] p-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted block">
              {t('includedInPackage') || 'Included in the package'}
            </span>
            <div className="grid gap-2 mt-3">
              {included.map(service => (
                <span key={service.id} className="text-xs text-main flex items-center gap-2">
                  <Icon name="check-circle" size={14} className="text-emerald-600 shrink-0" />
                  <span>{service.name}</span>
                </span>
              ))}
              {included.length === 0 && (
                <span className="text-xs text-muted">Comprehensive doctor & nursing care bundle</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-ui flex items-center justify-between">
          <span className="text-xs text-muted flex items-center gap-1">
            <Icon name="lock" size={13} className="text-muted" />
            <span>{t('privatePricing')}</span>
          </span>

          <div className="flex items-center gap-2">
            {chosen && (
              <button
                className="text-xs font-bold text-[var(--teal)] hover:underline cursor-pointer"
                onClick={() => nav('/inquiry')}
              >
                {t('continue')} →
              </button>
            )}
            <button
              onClick={choose}
              className={cn(
                'text-sm font-bold flex items-center gap-1 transition cursor-pointer',
                chosen ? 'text-emerald-600' : 'text-[var(--teal)] hover:underline'
              )}
            >
              {chosen ? (
                <>
                  <Icon name="check" size={16} /> {t('selected')}
                </>
              ) : (
                <>
                  {t('choosePackage')} <Icon name="plus" size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
