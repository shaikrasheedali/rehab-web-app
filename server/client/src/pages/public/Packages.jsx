import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import PublicPackageCard from '../../components/public/PublicPackageCard.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function Packages() {
  const { packages, services, nav, t } = useApp();
  const [q, setQ] = useState('');

  const activePackages = useMemo(
    () => packages.filter(x => x.active),
    [packages]
  );

  const filtered = useMemo(() => {
    if (!q) return activePackages;
    const fuse = new Fuse(activePackages, {
      keys: ['name', 'benefits'],
      threshold: 0.35
    });
    return fuse.search(q).map(result => result.item);
  }, [activePackages, q]);

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Care packages"
        title="Collections of in-package services, coordinated as one plan."
        copy="Choose a package as the core of care, then add optional off-package services only for the days they are needed. Transparent, coordinated recovery."
        action={
          <button className="btn-secondary mt-5" onClick={() => nav('/services')}>
            <Icon name="layers" size={16} /> Browse included services
          </button>
        }
      />

      <section className="max-w-[1200px] mx-auto px-5 lg:px-10 py-12">
        <label className="relative block max-w-xl mx-auto">
          <span className="sr-only">Search care packages</span>
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-12 shadow-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search available care packages…"
          />
        </label>

        <div className="flex justify-between items-center mt-10 mb-6">
          <h2 className="font-display font-extrabold text-2xl text-main">
            {filtered.length} care packages
          </h2>
          <span className="text-sm text-muted">Confidential quotes upon request</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map(pkg => (
            <PublicPackageCard key={pkg.id} packageItem={pkg} services={services} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 card p-8">
            <Icon name="search-x" size={42} className="mx-auto text-muted" />
            <h3 className="font-bold text-xl mt-4 text-main">No package matches that search</h3>
            <p className="text-sm text-muted mt-2">Try searching for Recovery or Comfort & Long-Stay.</p>
          </div>
        )}
      </section>

      <CTA />
    </PublicLayout>
  );
}
