import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import ServiceCatalogCard from '../../components/public/ServiceCatalogCard.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function Services() {
  const { services, nav, t } = useApp();
  const [q, setQ] = useState('');

  const activeServices = useMemo(
    () => services.filter(x => x.kind === 'in-package' && x.active),
    [services]
  );

  const filtered = useMemo(() => {
    if (!q) return activeServices;
    const fuse = new Fuse(activeServices, {
      keys: ['name', 'summary', 'benefits'],
      threshold: 0.35
    });
    return fuse.search(q).map(result => result.item);
  }, [activeServices, q]);

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="In-package services"
        title="Services that form the foundation of every care package."
        copy="Explore each in-package service, its benefits, images and full clinical description. These services are selected together through a coordinated care package."
        action={
          <button className="btn-secondary mt-5" onClick={() => nav('/packages')}>
            <Icon name="package-check" size={16} /> {t('viewPackages')}
          </button>
        }
      />

      <section className="max-w-[1200px] mx-auto px-5 lg:px-10 py-12">
        <label className="relative block max-w-xl mx-auto">
          <span className="sr-only">Search services</span>
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-12 shadow-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search in-package services and clinical therapies…"
          />
        </label>

        <div className="flex justify-between items-center mt-10 mb-6">
          <h2 className="font-display font-extrabold text-2xl text-main">
            {filtered.length} in-package services
          </h2>
          <span className="text-sm text-muted">Included through care packages</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(service => (
            <ServiceCatalogCard key={service.id} service={service} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 card p-8">
            <Icon name="search-x" size={42} className="mx-auto text-muted" />
            <h3 className="font-bold text-xl mt-4 text-main">No service matches that search</h3>
            <p className="text-sm text-muted mt-2">Try searching for nursing, mobility, physio, or assisted living.</p>
          </div>
        )}
      </section>

      <CTA />
    </PublicLayout>
  );
}
