import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';

const STOCK = {
  room: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=84",
  team: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=84"
};

export default function About() {
  const { nav, t } = useApp();

  const infrastructureHighlights = [
    ['accessibility', 'Step-Free Access', 'Wheelchair-friendly campus entry, patient suites, and accessible washrooms.'],
    ['sparkles', 'Hospital-Grade Hygiene', 'Continuous surface sanitization and clinical equipment sterilization protocols.'],
    ['users', 'Family Partnership', 'Transparent weekly progress briefings and shared care decisions.'],
    ['map-pin', 'Two Strategic Centers', 'Prakash Nagar campus and Venkatagiri center access in Khammam.']
  ];

  return (
    <PublicLayout>
      <PageIntro
        eyebrow={t('aboutEyebrow')}
        title={t('aboutTitle')}
        copy={t('aboutCopy')}
      />

      <section className="max-w-[1440px] mx-auto px-5 lg:px-10 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="grid grid-cols-2 gap-4">
          <img
            src={STOCK.room}
            className="rounded-[2rem] w-full h-72 object-cover mt-12 shadow-sm"
            alt="Bright, serene healthcare recovery room"
          />
          <img
            src={STOCK.team}
            className="rounded-[2rem] w-full h-72 object-cover shadow-sm"
            alt="Collaborative clinical care multidisciplinary team"
          />
        </div>

        <div>
          <div className="eyebrow mb-4">Designed for Recovery</div>
          <h2 className="section-title text-main">Clinical Standards. Familiar Warmth.</h2>
          <p className="text-muted leading-8 mt-6 text-base">
            Sri Thirumala Rehabilitation Centre & Nursing Home integrates physical and neurological rehabilitation,
            intensive nursing, palliative comfort, and assisted long-term care into one coordinated environment in Khammam.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {infrastructureHighlights.map(([icon, label, desc]) => (
              <div className="card p-5" key={label}>
                <Icon name={icon} className="text-[var(--teal)]" size={22} />
                <h3 className="font-bold mt-3 text-main text-base">{label}</h3>
                <p className="text-muted text-xs leading-5 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Plan Diagram */}
      <section className="bg-[var(--mist)] py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="text-center mb-10">
            <div className="eyebrow mb-4">Campus Guide</div>
            <h2 className="section-title text-main">Know the space before you arrive</h2>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="card p-5 bg-[var(--surface)] shadow-sm">
              <svg viewBox="0 0 900 420" className="w-full" role="img" aria-label="Accessible campus architectural schematic">
                <rect x="20" y="20" width="860" height="380" rx="28" fill="#f8fbf9" stroke="#bdd6c9" strokeWidth="3" />
                <path d="M330 20v380M600 20v380M20 205h860" stroke="#bdd6c9" strokeWidth="3" />
                <rect x="50" y="50" width="250" height="125" rx="18" fill="#dcefe6" />
                <rect x="360" y="50" width="210" height="125" rx="18" fill="#fbe7dc" />
                <rect x="630" y="50" width="220" height="125" rx="18" fill="#e5ede9" />
                <rect x="50" y="235" width="250" height="130" rx="18" fill="#e5ede9" />
                <rect x="360" y="235" width="210" height="130" rx="18" fill="#dcefe6" />
                <rect x="630" y="235" width="220" height="130" rx="18" fill="#f8edcc" />

                {[
                  [175, 112, "Physiotherapy Zone"],
                  [465, 112, "Nursing Station"],
                  [740, 112, "Resident Suites"],
                  [175, 300, "Accessible Reception"],
                  [465, 300, "Therapy Garden"],
                  [740, 300, "Family Lounge"]
                ].map(([x, y, label]) => (
                  <g key={label}>
                    <circle cx={x} cy={y - 18} r="12" fill="#0f5d5e" />
                    <text x={x} y={y + 18} textAnchor="middle" fill="#173a3a" fontSize="15" fontWeight="700">
                      {label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="card p-7 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-extrabold text-xl text-main">{t('aboutCampusTitle')}</h3>
                <p className="text-muted leading-7 mt-3 text-sm">{t('aboutCampusAddress')}</p>

                <div className="mt-7 grid gap-4">
                  {[
                    ['car', 'Accessible Parking'],
                    ['navigation', 'Step-Free Navigation Routes'],
                    ['clock', '24/7 Admitted Resident Care'],
                    ['shield-check', 'Sterile Clinical Zones']
                  ].map(([icon, title]) => (
                    <div key={title} className="flex gap-3 items-center">
                      <span className="w-9 h-9 rounded-lg bg-[var(--mist)] grid place-items-center text-[var(--teal)] shrink-0">
                        <Icon name={icon} size={16} />
                      </span>
                      <span className="font-semibold text-sm text-main">{title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn-primary w-full mt-7" onClick={() => nav('/inquiry')}>
                {t('campusVisit')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </PublicLayout>
  );
}
