import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import ImageCarousel from '../../components/common/ImageCarousel.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';
import NotFound from './NotFound.jsx';
import { cn, sanitizeHtml } from '../../utils/formatters.js';

export default function ServiceDetail({ serviceId, kind }) {
  const { services, nav, basket, addItem, t } = useApp();
  const service = services.find(x => x.id === serviceId && x.kind === kind && x.active);

  if (!service) {
    return <NotFound />;
  }

  const isAddOn = kind === 'off-package';
  const added = basket.some(x => x.id === service.id);

  const handleAdd = () => {
    addItem({
      id: service.id,
      title: service.name,
      category: 'Off-package service',
      icon: 'circle-plus',
      duration: 'Charged only for availed days'
    });
  };

  return (
    <PublicLayout>
      <section className="max-w-[1200px] mx-auto px-5 lg:px-10 py-12">
        <button
          className="btn-secondary !py-2 text-xs mb-8 cursor-pointer"
          onClick={() => nav(isAddOn ? '/add-on-services' : '/services')}
        >
          <Icon name="arrow-left" size={14} /> Back to {isAddOn ? 'add-on services' : 'services'}
        </button>

        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-10 items-start">
          <div className="rounded-[2rem] overflow-hidden shadow-soft">
            <ImageCarousel
              images={service.images}
              title={service.name}
              className="h-[360px] lg:h-[520px]"
            />
          </div>

          <div className="lg:pt-4">
            <span
              className={cn(
                'inline-flex rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-bold shadow-sm',
                isAddOn ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              )}
            >
              {isAddOn ? 'Optional off-package service' : 'In-package service'}
            </span>

            <h1 className="section-title mt-4 text-main">{service.name}</h1>
            <p className="text-lg text-muted leading-8 mt-5">{service.summary}</p>

            <div className="card p-5 mt-7 bg-[var(--surface)]">
              <span className="text-xs uppercase tracking-wider font-bold text-muted block">
                Key benefits & clinical deliverables
              </span>
              <div className="grid gap-3 mt-4">
                {(service.benefits || []).map((benefit) => (
                  <span key={benefit} className="flex items-center gap-3 text-sm text-main">
                    <Icon name="check-circle" size={16} className="text-emerald-600 shrink-0" />
                    <span>{benefit}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isAddOn ? (
                <button
                  disabled={added}
                  className={cn(
                    'btn-primary cursor-pointer',
                    added && 'bg-emerald-600 hover:bg-emerald-700'
                  )}
                  onClick={handleAdd}
                >
                  {added ? (
                    <>
                      <Icon name="check" size={18} /> {t('addedToBasket')}
                    </>
                  ) : (
                    <>
                      <Icon name="plus" size={18} /> Add optional service
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="btn-primary cursor-pointer"
                  onClick={() => nav('/packages')}
                >
                  See packages containing this service <Icon name="arrow-right" size={18} />
                </button>
              )}

              <button className="btn-secondary" onClick={() => nav('/contact')}>
                <Icon name="phone" size={16} /> Talk to doctor
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Sanitized Content */}
        {service.content && (
          <article
            className="rich-content max-w-4xl mx-auto mt-16 card p-7 lg:p-12 shadow-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(service.content) }}
          />
        )}
      </section>

      <CTA />
    </PublicLayout>
  );
}
