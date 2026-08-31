import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import Hero from '../../components/public/Hero.jsx';
import PublicPackageCard from '../../components/public/PublicPackageCard.jsx';
import ServiceCatalogCard from '../../components/public/ServiceCatalogCard.jsx';
import Testimonial from '../../components/public/Testimonial.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, money, cn } from '../../utils/formatters.js';

const STOCK_REHAB = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=84";
const STOCK_ROOM = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=84";
const STOCK_THERAPIST = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=84";
const STOCK_TEAM = "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=84";

export default function Home() {
  const { nav, t, packages, services, mediaItems, notify } = useApp();

  // Contact CTA Form State
  const [contactForm, setContactForm] = useState({
    patient: '',
    phone: '',
    need: '',
    currentLocation: 'At home'
  });
  const [submitting, setSubmitting] = useState(false);

  const activePackages = packages.filter(x => x.active);
  const inPackageServices = services.filter(x => x.kind === 'in-package' && x.active);
  const offPackageServices = services.filter(x => x.kind === 'off-package' && x.active);
  const blogArticles = mediaItems.filter(x => x.section === 'blog' && x.active).slice(0, 3);

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

  const facilityHighlights = [
    {
      icon: 'activity',
      title: 'Advanced Physiotherapy Gym',
      text: 'Equipped with parallel bars, bodyweight-supported harnesses, digital gait trainers, and neuromuscular stimulation.',
      image: STOCK_REHAB
    },
    {
      icon: 'home',
      title: 'Assisted Living & Deluxe Suites',
      text: 'Private and semi-private climate-controlled recovery rooms with nurse call bells, orthopaedic beds, and companion seating.',
      image: STOCK_ROOM
    },
    {
      icon: 'heart-pulse',
      title: '24/7 Nursing & ICU Step-Down Care',
      text: 'Continuous cardiac monitoring, oxygen concentrators, tracheostomy maintenance, and round-the-clock emergency doctor coverage.',
      image: STOCK_TEAM
    },
    {
      icon: 'utensils',
      title: 'Therapeutic Clinical Nutrition',
      text: 'Customised low-sodium, diabetic-friendly, and puree diets prepared fresh by clinical nutritionists for optimal patient recovery.',
      image: STOCK_THERAPIST
    }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.patient || !contactForm.phone) {
      notify('Please provide your name and phone number.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.createInquiry({
        patient: contactForm.patient.trim(),
        contact: contactForm.patient.trim(),
        phone: contactForm.phone.trim(),
        need: contactForm.need?.trim() || 'General rehabilitation and inpatient nursing inquiry from home CTA',
        currentLocation: contactForm.currentLocation,
        duration: '15 to 30 days',
        room: 'No preference',
        language: 'Telugu',
        consent: true,
        contactRequest: true
      });

      notify('Inquiry received! Our medical duty officer will call you within 15 minutes.');
      setContactForm({ patient: '', phone: '', need: '', currentLocation: 'At home' });
    } catch (err) {
      notify(err.message || 'Failed to submit inquiry', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      {/* 1. HERO SECTION */}
      <Hero />

      {/* Stats Bar */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 -mt-4 relative z-20">
        <div className="card shadow-soft grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)] bg-[var(--surface)]">
          {stats.map(([n, l]) => (
            <div className="p-5 sm:p-6 lg:p-8 text-center" key={l}>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--teal)]">{n}</div>
              <div className="text-xs sm:text-sm text-muted mt-1 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section id="about" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="eyebrow mb-3">About Sri Thirumala Care</div>
            <h2 className="section-title max-w-2xl text-main">{t('why')}</h2>
          </div>
          <p className="max-w-md text-muted leading-7 text-sm sm:text-base">
            {t('whySubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {whyCards.map((x, i) => (
            <article key={x.title} className="card p-6 sm:p-8 hover:-translate-y-1 transition-all interactive-card bg-[var(--surface)]">
              <span
                className={cn(
                  'w-14 h-14 rounded-2xl grid place-items-center mb-6 shadow-sm',
                  i === 1 ? 'bg-[#fde7dd] text-[#b84a30]' : 'bg-[var(--mist)] text-[var(--teal)]'
                )}
              >
                <Icon name={x.icon} size={26} />
              </span>
              <div className="text-xs font-bold text-muted mb-2 tracking-wider">0{i + 1}</div>
              <h3 className="text-lg sm:text-xl font-extrabold mb-3 text-main">{x.title}</h3>
              <p className="text-muted leading-relaxed text-sm">{x.text}</p>
            </article>
          ))}
        </div>

        {/* Clinical Mission Banner */}
        <div className="mt-12 p-6 sm:p-10 rounded-3xl bg-[var(--mist)] border border-ui flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-main">
              Over 25 Years of Healing, Nursing & Community Trust in Telangana
            </h3>
            <p className="text-muted text-xs sm:text-sm mt-2 leading-relaxed">
              Founded with the vision of compassionate inpatient rehabilitation, Sri Thirumala Rehabilitation Centre bridges hospital discharge and independent living at home.
            </p>
          </div>
          <button className="btn-secondary whitespace-nowrap cursor-pointer shrink-0" onClick={() => nav('/about')}>
            <span>Discover Our Clinical Story</span>
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </section>

      {/* 3. SERVICES SECTION (Core In-package Clinical Services) */}
      <section id="services" className="bg-[var(--mist)]/50 py-16 sm:py-24 border-y border-ui">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="eyebrow mb-3">Core Clinical Services</div>
              <h2 className="section-title text-main">Inpatient Rehabilitation & Care</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => nav('/services')}>
                <span>Explore All Services</span>
                <Icon name="arrow-right" size={15} />
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inPackageServices.slice(0, 4).map(service => (
              <ServiceCatalogCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FACILITIES & CAMPUS INFRASTRUCTURE SECTION */}
      <section id="facilities" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="eyebrow mb-3">Healing Environment</div>
          <h2 className="section-title text-main">State-of-the-Art Clinical Campus</h2>
          <p className="text-muted mt-3 text-sm sm:text-base leading-relaxed">
            Purpose-built infrastructure designed to ensure safety, dignity, comfort, and active physical recovery.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilityHighlights.map((fac, idx) => (
            <div
              key={idx}
              className="card overflow-hidden bg-[var(--surface)] shadow-soft border border-ui rounded-3xl flex flex-col justify-between interactive-card"
            >
              <div>
                <div className="h-48 overflow-hidden relative bg-[var(--mist)]">
                  <img src={fac.image} alt={fac.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 text-[var(--teal)] grid place-items-center shadow-md">
                    <Icon name={fac.icon} size={20} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display font-extrabold text-lg text-main mb-2">
                    {fac.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {fac.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PACKAGES SECTION */}
      <section id="packages" className="bg-[#0a4b4b] text-white py-16 sm:py-24 overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="eyebrow !text-[#bce9dc] mb-3">{t('packagesEyebrow')}</div>
            <h2 className="section-title text-white">{t('packagesTitle')}</h2>
            <p className="text-white/70 mt-3 text-sm sm:text-base leading-relaxed">
              {t('packagesSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {activePackages.map(pkg => (
              <PublicPackageCard key={pkg.id} packageItem={pkg} services={services} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              className="rounded-full bg-white text-[#0a4b4b] font-bold px-8 py-3.5 hover:bg-[#edf5f1] transition cursor-pointer inline-flex items-center gap-2 shadow-md text-sm"
              onClick={() => nav('/estimator')}
            >
              <Icon name="calculator" size={17} />
              <span>{t('buildInitialPlan')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. ADD-ON SERVICES SECTION (Off-package Clinical Add-ons) */}
      <section id="add-ons" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="eyebrow mb-3">Customised Clinical Therapies</div>
            <h2 className="section-title text-main">Specialised Add-on Services</h2>
            <p className="text-muted text-sm sm:text-base mt-2 max-w-xl">
              Tailor daily care plans with targeted neuro-rehabilitation, swallow therapy, speech recovery, and wound dressings.
            </p>
          </div>
          <button className="btn-secondary text-xs cursor-pointer whitespace-nowrap shrink-0" onClick={() => nav('/add-on-services')}>
            <span>View All Add-on Therapies</span>
            <Icon name="arrow-right" size={15} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offPackageServices.slice(0, 3).map(service => (
            <ServiceCatalogCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section id="testimonials" className="bg-[var(--mist)]/40 border-y border-ui py-16 sm:py-24">
        <Testimonial />
      </section>

      {/* 8. BLOGS & CLINICAL INSIGHTS SECTION */}
      <section id="blogs" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="eyebrow mb-3">Clinical Insights & Recovery Guides</div>
            <h2 className="section-title text-main">Latest Medical Articles</h2>
          </div>
          <button className="btn-secondary text-xs cursor-pointer whitespace-nowrap shrink-0" onClick={() => nav('/blog')}>
            <span>Read All Articles</span>
            <Icon name="arrow-right" size={15} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogArticles.map(article => (
            <article
              key={article.id}
              onClick={() => nav(`/blog/${article.id}`)}
              className="card overflow-hidden bg-[var(--surface)] shadow-soft border border-ui rounded-3xl flex flex-col justify-between interactive-card cursor-pointer"
            >
              <div>
                <div className="h-48 overflow-hidden bg-[var(--mist)]">
                  {article.image ? (
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted">
                      <Icon name="file-text" size={32} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-mono text-[var(--teal)] font-bold uppercase tracking-wider block mb-2">
                    {fmtDate(article.publishedAt)} · {article.author}
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-main line-clamp-2 hover:text-[var(--teal)] transition">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted mt-2.5 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-ui flex items-center justify-between text-xs text-[var(--teal)] font-bold bg-[var(--mist)]/20">
                <span>Read Full Article</span>
                <Icon name="arrow-right" size={14} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 9. CONTACT FORM CTA SECTION */}
      <section id="contact-cta" className="bg-[var(--surface)] border-t border-ui py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="card p-8 sm:p-12 bg-gradient-to-br from-[#0c3939] to-[#082222] text-white shadow-soft rounded-3xl">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-[#86bfba] uppercase">
                  Immediate Family Assistance
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-2 leading-tight">
                  Discuss Your Loved One's Care With Our Clinical Team
                </h2>
                <p className="text-white/70 text-sm sm:text-base mt-4 leading-relaxed">
                  Have urgent questions about room availability, doctor supervision, or recovery costs? Send us a quick note and our medical coordinator will get in touch immediately.
                </p>

                <div className="mt-8 space-y-3">
                  <a
                    href="tel:+919848021042"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition"
                  >
                    <span className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-emerald-400">
                      <Icon name="phone-call" size={18} />
                    </span>
                    <div>
                      <span className="text-[10px] text-white/50 uppercase block font-mono">Direct Admissions Desk</span>
                      <strong className="text-base font-mono">+91 98480 21042</strong>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/919848021042"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition"
                  >
                    <span className="w-10 h-10 rounded-full bg-[#25D366]/20 grid place-items-center text-[#25D366]">
                      <Icon name="message-circle" size={18} />
                    </span>
                    <div>
                      <span className="text-[10px] text-white/50 uppercase block font-mono">WhatsApp Care Coordination</span>
                      <strong className="text-base">Chat with Doctor on Call</strong>
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick Contact Form */}
              <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
                <h3 className="font-display font-extrabold text-xl text-slate-900 mb-1">
                  Request Care Callback
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  We respect your privacy and will respond promptly.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Patient / Family Name *</label>
                    <input
                      required
                      type="text"
                      className="input text-sm !bg-slate-50 !border-slate-300 !text-slate-900"
                      placeholder="e.g. Ramesh Varma"
                      value={contactForm.patient}
                      onChange={(e) => setContactForm({ ...contactForm, patient: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Calling / WhatsApp) *</label>
                    <input
                      required
                      type="tel"
                      className="input text-sm font-mono !bg-slate-50 !border-slate-300 !text-slate-900"
                      placeholder="+91 98480 XXXXX"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Patient Condition / Need</label>
                    <input
                      type="text"
                      className="input text-sm !bg-slate-50 !border-slate-300 !text-slate-900"
                      placeholder="e.g. Post-stroke therapy / Bedridden nursing"
                      value={contactForm.need}
                      onChange={(e) => setContactForm({ ...contactForm, need: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Location</label>
                    <select
                      className="input text-sm cursor-pointer !bg-slate-50 !border-slate-300 !text-slate-900"
                      value={contactForm.currentLocation}
                      onChange={(e) => setContactForm({ ...contactForm, currentLocation: e.target.value })}
                    >
                      <option value="At home">Currently at Home</option>
                      <option value="Hospital ICU / Ward">Hospital ICU / Ward (Discharge Planned)</option>
                      <option value="Other city">Other City / District</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full justify-center !py-3 text-sm font-bold shadow-md cursor-pointer mt-3"
                  >
                    {submitting ? (
                      <>
                        <Icon name="loader-2" size={16} className="animate-spin" />
                        <span>Submitting Request…</span>
                      </>
                    ) : (
                      <>
                        <Icon name="send" size={16} />
                        <span>Request Immediate Callback</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER is rendered automatically inside PublicLayout */}
    </PublicLayout>
  );
}
