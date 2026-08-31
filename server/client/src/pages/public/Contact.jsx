import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';

export default function Contact() {
  const { notify, nav, t, fetchInquiries } = useApp();
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  const [sent, setSent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Care guidance',
    method: 'Phone call',
    message: '',
    consent: false
  });

  useEffect(() => {
    if (!mapRef.current || leafletInstance.current) return;

    try {
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false
      }).setView([17.2473, 80.1514], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([17.2473, 80.1514])
        .addTo(map)
        .bindPopup('<b>Sri Thirumala Care</b><br />Prakash Nagar, Khammam')
        .openPopup();

      leafletInstance.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    } catch (e) {
      console.error('Leaflet map error:', e);
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim() || !form.consent) {
      notify('Please complete the required fields and agree to the consent statement.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: form.name.trim(),
        contact: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        need: `[Contact Request · ${form.subject}] ${form.message.trim()} · Preferred channel: ${form.method}`,
        start: null,
        duration: 'To be discussed',
        room: 'No preference',
        currentLocation: 'Not specified',
        language: 'English',
        packageId: null,
        offPackageServiceIds: [],
        consent: true,
        contactRequest: true
      };

      const result = await api.createInquiry(payload);
      setSent(result.id);
      setForm({
        name: '',
        phone: '',
        email: '',
        subject: 'Care guidance',
        method: 'Phone call',
        message: '',
        consent: false
      });
      fetchInquiries();
      notify('Your message has been sent to our admissions team.');
    } catch (err) {
      notify(err.message || 'Failed to submit contact request', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <PageIntro
        eyebrow={t('contactEyebrow')}
        title={t('contactTitle')}
        copy={t('contactCopy')}
        action={
          <button className="btn-secondary mt-5" onClick={() => nav('/inquiry')}>
            <Icon name="clipboard-check" size={16} /> Detailed care request
          </button>
        }
      />

      <section className="max-w-[1200px] mx-auto px-5 lg:px-10 py-14">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8">
          {/* Contact Details & Campus Map */}
          <div className="grid gap-6 h-fit">
            <section className="rounded-[2.5rem] bg-[#083f40] text-white p-7 lg:p-9 shadow-sm">
              <span className="text-xs uppercase tracking-[.14em] text-[#bce9dc] font-bold">
                Prakash Nagar Campus
              </span>
              <h2 className="font-display font-extrabold text-3xl mt-4">
                Here when your family needs clarity.
              </h2>
              <p className="text-white/65 leading-7 mt-4 text-sm">
                Near AVR Homes, Chinna Venkatagiri Cross Road, Khammam – 507001, Telangana.
              </p>

              <div className="grid gap-4 mt-8 text-sm">
                {[
                  ['clock', 'Admissions Desk', '8:00 AM – 8:00 PM Daily'],
                  ['heart-pulse', 'Resident Support', '24/7 Nursing & Medical Staff'],
                  ['languages', 'Languages Supported', 'English · Telugu · Hindi · Urdu'],
                  ['accessibility', 'Accessibility', 'Wheelchair Ramps & Step-free Access']
                ].map(([icon, label, value]) => (
                  <div className="flex gap-3 items-center" key={label}>
                    <span className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0 text-[#a6e3d7]">
                      <Icon name={icon} size={17} />
                    </span>
                    <div>
                      <small className="text-white/50 block text-xs">{label}</small>
                      <strong className="text-white text-sm">{value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card overflow-hidden">
              <div ref={mapRef} className="h-[280px] w-full" aria-label="Interactive map of Sri Thirumala Care location" />
              <div className="p-4 flex items-center gap-2 text-xs text-muted">
                <Icon name="map-pin" size={14} className="text-[var(--teal)]" />
                <span>Interactive map · Use scroll/touch to navigate location</span>
              </div>
            </section>
          </div>

          {/* Form */}
          <section className="card p-6 lg:p-9 bg-[var(--surface)] shadow-sm">
            <div>
              <span className="eyebrow">Send a message</span>
              <h2 className="font-display font-extrabold text-3xl text-main mt-3">
                How can we help your family?
              </h2>
              <p className="text-muted mt-2 text-sm">
                Fill in your details below and a clinical care coordinator will follow up promptly.
              </p>
            </div>

            {sent && (
              <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 flex gap-3 items-start animate-in fade-in">
                <Icon name="check-circle" size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <strong className="block text-sm">Message received securely</strong>
                  <span className="text-xs leading-5">
                    Your request reference is <strong>{sent}</strong>. Our admissions team has been notified.
                  </span>
                </div>
              </div>
            )}

            <form className="grid sm:grid-cols-2 gap-4 mt-7" onSubmit={handleSubmit}>
              <label className="block">
                <span className="block text-sm font-bold text-main mb-2">{t('yourName')}</span>
                <input
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-bold text-main mb-2">{t('phoneNumber')}</span>
                <input
                  required
                  type="tel"
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98480 00000"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-bold text-main mb-2">{t('emailAddress')}</span>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-bold text-main mb-2">{t('preferredReply')}</span>
                <select
                  className="input cursor-pointer"
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                >
                  <option value="Phone call">Phone call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </label>

              <label className="sm:col-span-2 block">
                <span className="block text-sm font-bold text-main mb-2">{t('topic')}</span>
                <select
                  className="input cursor-pointer"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="Care guidance">General care guidance</option>
                  <option value="Admission availability">Admission & bed availability</option>
                  <option value="Rehabilitation services">Specialist rehabilitation</option>
                  <option value="Long-stay support">Long-stay nursing support</option>
                  <option value="Billing question">Private quote or billing inquiry</option>
                  <option value="Campus visit">Campus tour arrangement</option>
                </select>
              </label>

              <div className="sm:col-span-2">
                <label className="block">
                  <span className="block text-sm font-bold text-main mb-2">{t('message')}</span>
                  <textarea
                    required
                    rows={5}
                    className="input resize-none"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about the patient's current health status, mobility, hospital discharge date, or questions…"
                  />
                </label>
              </div>

              <label className="sm:col-span-2 border border-ui rounded-xl p-4 flex gap-3 items-start cursor-pointer bg-[var(--mist)] hover:border-[var(--teal)] transition">
                <input
                  type="checkbox"
                  required
                  className="mt-1 accent-[#0f5d5e] cursor-pointer"
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                />
                <span className="text-xs text-muted leading-5">
                  {t('consentAgreement')}
                </span>
              </label>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-7 py-3 text-sm cursor-pointer"
                >
                  {submitting ? 'Sending…' : t('sendSecurely')} <Icon name="send" size={16} />
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>

      <CTA />
    </PublicLayout>
  );
}
