import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import Hero from '../../components/public/Hero.jsx';
import PublicPackageCard from '../../components/public/PublicPackageCard.jsx';
import Testimonial from '../../components/public/Testimonial.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

const STOCK_REHAB = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=84";

export default function Home() {
  const { nav, t, packages, services } = useApp();
  const activePackages = packages.filter(x => x.active);

  const stats = [
    ['24/7', t('statNursing')],
    ['10+', t('statDisciplines')],
    ['2', t('statLocations')],
    ['AAA', t('statAccess')]
  ];

  const whyCards = [
    {
      icon: 'brain',
      title: t('featureRehabTitle'),
      text: t('featureRehabText')
    },
    {
      icon: 'heart-handshake',
      title: t('featureHumanTitle'),
      text: t('featureHumanText')
    },
    {
      icon: 'clipboard-check',
      title: t('featurePlanTitle'),
      text: t('featurePlanText')
    }
  ];

  const roadmapSteps = [
    ['01', t('step1Title'), t('step1Text')],
    ['02', t('step2Title'), t('step2Text')],
    ['03', t('step3Title'), t('step3Text')]
  ];

  return (
    <PublicLayout>
      <Hero />

      {/* Stats Bar */}
      <section className="max-w-[1440px] mx-auto px-5 lg:px-10 -mt-4 relative z-20">
        <div className="card shadow-soft grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
          {stats.map(([n, l]) => (
            <div className="p-6 lg:p-8 text-center" key={l}>
              <div className="font-display font-extrabold text-3xl text-[var(--teal)]">{n}</div>
              <div className="text-sm text-muted mt-1 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Families Choose Us */}
      <section className="max-w-[1440px] mx-auto px-5 lg:px-10 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="eyebrow mb-4">Care made clearer</div>
            <h2 className="section-title max-w-2xl text-main">{t('why')}</h2>
          </div>
          <p className="max-w-md text-muted leading-7 text-base">
            {t('whySubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {whyCards.map((x, i) => (
            <article key={x.title} className="card p-7 hover:-translate-y-1 transition-all interactive-card">
              <span
                className={cn(
                  'w-14 h-14 rounded-2xl grid place-items-center mb-8 shadow-sm',
                  i === 1 ? 'bg-[#fde7dd] text-[#b84a30]' : 'bg-[var(--mist)] text-[var(--teal)]'
                )}
              >
                <Icon name={x.icon} size={26} />
              </span>
              <div className="text-xs font-bold text-muted mb-2 tracking-wider">0{i + 1}</div>
              <h3 className="text-xl font-extrabold mb-3 text-main">{x.title}</h3>
              <p className="text-muted leading-7 text-sm">{x.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Recovery Roadmap Section */}
      <section className="bg-[#0a4b4b] text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-soft">
              <img
                src={STOCK_REHAB}
                className="w-full h-full object-cover"
                alt="Physiotherapist assisting with rehabilitation exercise"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 bg-[#f6c86e] text-[#173a3a] rounded-2xl p-5 max-w-[240px] shadow-soft">
              <Icon name="sparkles" size={20} />
              <strong className="block mt-2 text-sm leading-snug">
                Every small recovery milestone is meaningful progress.
              </strong>
            </div>
          </div>

          <div>
            <div className="eyebrow !text-[#bce9dc] mb-4">{t('roadmapEyebrow')}</div>
            <h2 className="section-title text-white">{t('roadmapTitle')}</h2>

            <div className="mt-9 grid gap-6">
              {roadmapSteps.map(([n, h, p]) => (
                <div key={n} className="flex gap-5 items-start">
                  <span className="text-[#f2b693] font-display font-extrabold text-xl shrink-0">{n}</span>
                  <div>
                    <h3 className="font-bold text-lg text-white">{h}</h3>
                    <p className="text-white/65 mt-1 leading-7 text-sm">{p}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="mt-9 rounded-full bg-white text-[#0a4b4b] font-bold px-6 py-3.5 hover:bg-[#edf5f1] transition cursor-pointer inline-flex items-center gap-2"
              onClick={() => nav('/estimator')}
            >
              <span>{t('buildInitialPlan')}</span>
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Packages Showcase */}
      <section className="max-w-[1200px] mx-auto px-5 lg:px-10 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="eyebrow mb-4">{t('packagesEyebrow')}</div>
          <h2 className="section-title text-main">{t('packagesTitle')}</h2>
          <p className="text-muted mt-5 leading-7 text-base">
            {t('packagesSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {activePackages.map(pkg => (
            <PublicPackageCard key={pkg.id} packageItem={pkg} services={services} />
          ))}
        </div>

        <div className="text-center mt-10 flex flex-wrap justify-center gap-3">
          <button className="btn-secondary" onClick={() => nav('/packages')}>
            {t('viewPackages')} <Icon name="arrow-right" size={16} />
          </button>
          <button className="btn-secondary" onClick={() => nav('/add-on-services')}>
            {t('viewOptional')} <Icon name="circle-plus" size={16} />
          </button>
        </div>
      </section>

      <Testimonial />
      <CTA />
    </PublicLayout>
  );
}
