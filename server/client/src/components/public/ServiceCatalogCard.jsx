import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import ImageCarousel from '../common/ImageCarousel.jsx';
import Icon from '../common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

export default function ServiceCatalogCard({ service }) {
  const { nav, basket, addItem, t } = useApp();
  const isAddOn = service.kind === 'off-package';
  const added = basket.some(x => x.id === service.id);
  const detailPath = `${isAddOn ? '/add-on-services' : '/services'}/${service.id}`;

  const add = (e) => {
    e.stopPropagation();
    addItem({
      id: service.id,
      title: service.name,
      category: 'Off-package service',
      icon: 'circle-plus',
      duration: 'Charged only for availed days'
    });
  };

  return (
    <article
      tabIndex={0}
      role="link"
      onClick={() => nav(detailPath)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') nav(detailPath);
      }}
      className="card overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f5d5e] interactive-card flex flex-col justify-between"
    >
      <div className="relative">
        <ImageCarousel images={service.images} title={service.name} className="h-52" />
        <span
          className={cn(
            'absolute z-10 left-4 top-4 rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold shadow-sm',
            isAddOn ? 'bg-blue-100 text-blue-700' : 'bg-white/95 text-[#0f5d5e]'
          )}
        >
          {isAddOn ? 'Off-package Add-on' : 'In-package Service'}
        </span>
      </div>

      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-display font-extrabold text-xl text-main">{service.name}</h3>
          <p className="text-sm text-muted leading-6 mt-3 line-clamp-3">
            {service.summary}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {(service.benefits || []).slice(0, 3).map((benefit) => (
              <span
                key={benefit}
                className="text-[10px] font-bold rounded-full bg-[var(--mist)] text-[var(--teal)] px-2.5 py-1"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-ui mt-6 pt-5 flex justify-between items-center">
          <button
            className="text-sm font-bold text-[var(--teal)] flex items-center gap-1 hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              nav(detailPath);
            }}
          >
            {t('viewDetails')} <Icon name="arrow-right" size={15} />
          </button>

          {isAddOn && (
            <button
              disabled={added}
              className={cn(
                'text-xs font-bold px-3 py-1.5 rounded-full transition cursor-pointer',
                added
                  ? 'bg-emerald-50 text-emerald-700 cursor-default'
                  : 'bg-[var(--mist)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white'
              )}
              onClick={add}
            >
              {added ? '✓ ' + t('addedToBasket') : t('addService')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
