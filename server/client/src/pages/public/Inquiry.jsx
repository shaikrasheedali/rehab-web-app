import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { cn, fmtDate } from '../../utils/formatters.js';

export default function Inquiry() {
  const { basket, setBasket, notify, nav, packages, services, fetchInquiries } = useApp();

  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState('');

  const [form, setForm] = useState(() => ({
    patient: '',
    contact: '',
    phone: '',
    need: '',
    start: '',
    duration: '30 days',
    room: 'No preference',
    currentLocation: 'At home',
    language: 'English',
    packageId: basket.find(x => x.category === 'Care package')?.id || packages.find(x => x.active)?.id || '',
    offPackageServiceIds: basket.filter(x => x.category === 'Off-package service').map(x => x.id),
    consent: false
  }));

  const validateStep = () => {
    if (step === 1) return form.patient.trim() && form.contact.trim() && form.phone.trim();
    if (step === 2) return form.need.trim();
    if (step === 3) return form.start;
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      notify('Please complete the required details before continuing.', 'warning');
      return;
    }
    setStep(s => Math.min(5, s + 1));
  };

  const prevStep = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const toggleAddOn = (serviceId) => {
    setForm(f => ({
      ...f,
      offPackageServiceIds: f.offPackageServiceIds.includes(serviceId)
        ? f.offPackageServiceIds.filter(x => x !== serviceId)
        : [...f.offPackageServiceIds, serviceId]
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const response = await api.uploadMultipleFiles(files, 'documents');
      const newFiles = response.files || [];
      setUploadedFiles(prev => [...prev, ...newFiles]);
      notify(`${newFiles.length} medical document(s) uploaded.`);
    } catch (err) {
      notify(err.message || 'Failed to upload files', 'warning');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.consent) {
      notify('Please confirm consent to submit the request.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        basket: basket.map(x => x.title)
      };

      const result = await api.createInquiry(payload);
      setReference(result.id);
      setDone(true);
      fetchInquiries();
      notify('Your care request has been submitted successfully.');

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // safe
      }
    } catch (err) {
      notify(err.message || 'Failed to submit care request', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <PublicLayout>
        <section className="min-h-[70vh] grid place-items-center px-5 py-16">
          <div className="card max-w-xl p-10 text-center shadow-soft animate-in zoom-in-95 bg-[var(--surface)]">
            <span className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto shadow-sm">
              <Icon name="check-check" size={38} />
            </span>
            <div className="eyebrow mt-7 mb-4">Request Registered</div>
            <h1 className="font-display text-4xl font-extrabold text-main">We’ll take it from here.</h1>
            <p className="text-muted leading-7 mt-4 text-sm">
              Your private reference number is <strong className="text-main font-bold">{reference}</strong>.
              A care coordinator will review your submitted health details and contact {form.contact} ({form.phone}) with a tailored care plan.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button className="btn-primary" onClick={() => nav('/')}>
                Return to Home
              </button>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const selectedPkg = packages.find(x => x.id === form.packageId);

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Private Care Request"
        title="Tell us what support your family needs."
        copy="No advance payment is required. Your information is used securely to prepare a confidential clinical recommendation and transparent care estimate."
      />

      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Main Wizard Form */}
          <div className="card p-6 lg:p-9 bg-[var(--surface)] shadow-sm">
            {/* Step Progress Bar */}
            <div className="flex gap-2 mb-9" aria-label={`Step ${step} of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-all',
                    n <= step ? 'bg-[var(--teal)]' : 'bg-[var(--line)]'
                  )}
                />
              ))}
            </div>

            {/* Step 1: Patient & Family Info */}
            {step === 1 && (
              <div className="animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--teal)]">
                  Step 1 of 5
                </span>
                <h2 className="font-display text-3xl font-extrabold text-main mt-2">
                  Patient & Family Details
                </h2>
                <p className="text-muted mt-2 mb-7 text-sm">
                  Who is the care request for, and who should our admissions coordinator contact?
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-bold text-main mb-2">Patient Full Name *</span>
                    <input
                      required
                      className="input"
                      value={form.patient}
                      onChange={(e) => setForm({ ...form, patient: e.target.value })}
                      placeholder="e.g. Savitri Devi"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-bold text-main mb-2">Family Contact Name *</span>
                    <input
                      required
                      className="input"
                      value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      placeholder="e.g. Arjun Rao"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-bold text-main mb-2">Phone Number *</span>
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
                    <span className="block text-sm font-bold text-main mb-2">Preferred Communication Language</span>
                    <select
                      className="input cursor-pointer"
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                      <option value="Urdu">اردو (Urdu)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Package & Add-ons Selection */}
            {step === 2 && (
              <div className="animate-in fade-in space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--teal)]">
                    Step 2 of 5
                  </span>
                  <h2 className="font-display text-3xl font-extrabold text-main mt-2">
                    Care Package & Add-on Selection
                  </h2>
                  <p className="text-muted mt-2 text-sm">
                    Select a core care package or continue with custom daily care planning.
                  </p>
                </div>

                <div>
                  <span className="block text-sm font-bold text-main mb-3">Core Care Package (Optional)</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, packageId: '' })}
                      className={cn(
                        'border rounded-2xl p-4 text-left cursor-pointer transition',
                        !form.packageId
                          ? 'border-[var(--teal)] bg-[var(--mist)] ring-2 ring-[#0f5d5e]'
                          : 'border-ui hover:border-slate-300'
                      )}
                    >
                      <strong className="block text-main text-sm">No Package (Custom Plan)</strong>
                      <span className="text-xs text-muted mt-1 block">
                        Our clinical coordinator will tailor a custom daily routine
                      </span>
                    </button>

                    {packages.filter(x => x.active).map(pkg => (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => setForm({ ...form, packageId: pkg.id })}
                        className={cn(
                          'border rounded-2xl p-4 text-left cursor-pointer transition',
                          form.packageId === pkg.id
                            ? 'border-[var(--teal)] bg-[var(--mist)] ring-2 ring-[#0f5d5e]'
                            : 'border-ui hover:border-slate-300'
                        )}
                      >
                        <strong className="block text-main text-sm">{pkg.name}</strong>
                        <span className="text-xs text-muted mt-1 block">
                          {(pkg.serviceIds || []).length} included clinical disciplines
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-bold text-main mb-3">Optional Add-on Services</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.filter(x => x.kind === 'off-package' && x.active).map(svc => (
                      <label
                        key={svc.id}
                        className={cn(
                          'border rounded-2xl p-4 flex gap-3 cursor-pointer transition',
                          form.offPackageServiceIds.includes(svc.id)
                            ? 'border-[var(--teal)] bg-[var(--mist)] ring-1 ring-[#0f5d5e]'
                            : 'border-ui hover:border-slate-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={form.offPackageServiceIds.includes(svc.id)}
                          onChange={() => toggleAddOn(svc.id)}
                          className="accent-[#0f5d5e] cursor-pointer mt-0.5"
                        />
                        <div>
                          <strong className="text-sm block text-main">{svc.name}</strong>
                          <small className="text-muted text-xs block leading-snug mt-0.5">
                            {svc.summary}
                          </small>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="block text-sm font-bold text-main mb-2">Primary Diagnosis & Care Needs *</span>
                  <textarea
                    required
                    rows={4}
                    className="input resize-none"
                    value={form.need}
                    onChange={(e) => setForm({ ...form, need: e.target.value })}
                    placeholder="Diagnosis, mobility limits, recent surgeries, tracheostomy/Ryle's tube, or care goals…"
                  />
                </label>
              </div>
            )}

            {/* Step 3: Timing & Duration */}
            {step === 3 && (
              <div className="animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--teal)]">
                  Step 3 of 5
                </span>
                <h2 className="font-display text-3xl font-extrabold text-main mt-2">
                  Timing & Admission Preferences
                </h2>
                <p className="text-muted mt-2 mb-7 text-sm">
                  Let us know when you anticipate admission and room preferences.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-bold text-main mb-2">Anticipated Start Date *</span>
                    <input
                      required
                      type="date"
                      className="input"
                      value={form.start}
                      onChange={(e) => setForm({ ...form, start: e.target.value })}
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-bold text-main mb-2">Anticipated Stay Duration</span>
                    <select
                      className="input cursor-pointer"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    >
                      <option value="14 days">14 days (Short-term recovery)</option>
                      <option value="30 days">30 days (Standard rehabilitation)</option>
                      <option value="60–90 days">60–90 days (Intensive recovery)</option>
                      <option value="Ongoing care">Ongoing / Long-term stay</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-sm font-bold text-main mb-2">Accommodation Preference</span>
                    <select
                      className="input cursor-pointer"
                      value={form.room}
                      onChange={(e) => setForm({ ...form, room: e.target.value })}
                    >
                      <option value="No preference">No preference</option>
                      <option value="Private room">Private room</option>
                      <option value="Shared room">Shared room</option>
                      <option value="Individual bed">Individual bed in assisted suite</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-sm font-bold text-main mb-2">Patient's Current Location</span>
                    <select
                      className="input cursor-pointer"
                      value={form.currentLocation}
                      onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                    >
                      <option value="At home">At home</option>
                      <option value="Hospital">Hospital / ICU (Preparing for discharge)</option>
                      <option value="Another care facility">Another care facility</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Medical Documents Upload */}
            {step === 4 && (
              <div className="animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--teal)]">
                  Step 4 of 5
                </span>
                <h2 className="font-display text-3xl font-extrabold text-main mt-2">
                  Upload Medical Records
                </h2>
                <p className="text-muted mt-2 mb-7 text-sm">
                  Upload discharge summaries, doctor prescriptions, or imaging reports (optional but helpful).
                </p>

                <label className="border-2 border-dashed border-ui rounded-3xl p-10 text-center block cursor-pointer hover:bg-[var(--mist)] transition">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                  <Icon name="upload-cloud" size={40} className="mx-auto text-[var(--teal)]" />
                  <strong className="block mt-3 text-main text-base">
                    {uploading ? 'Uploading documents…' : 'Drop hospital discharge summaries & reports here'}
                  </strong>
                  <span className="text-xs text-muted block mt-1">
                    PDF, JPG, PNG or WebP files · Up to 10 MB each
                  </span>
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="mt-5 grid gap-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-[var(--mist)] p-3.5 rounded-xl border border-ui text-sm"
                      >
                        <Icon name="file-text" size={18} className="text-[var(--teal)] shrink-0" />
                        <span className="font-semibold text-main flex-1 truncate">{file.originalName}</span>
                        <span className="text-xs text-muted font-mono">{Math.round(file.size / 1024)} KB</span>
                        <span className="text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          Uploaded
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review & Consent */}
            {step === 5 && (
              <div className="animate-in fade-in space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--teal)]">
                    Step 5 of 5
                  </span>
                  <h2 className="font-display text-3xl font-extrabold text-main mt-2">
                    Review & Acknowledgement
                  </h2>
                  <p className="text-muted mt-2 text-sm">
                    Confirm your submitted request details before transmitting securely to the admissions desk.
                  </p>
                </div>

                <div className="bg-[var(--mist)] rounded-2xl p-6 grid sm:grid-cols-2 gap-4 text-sm border border-ui">
                  <div>
                    <span className="text-muted text-xs block">Patient Name</span>
                    <strong className="text-main">{form.patient}</strong>
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Family Contact</span>
                    <strong className="text-main">{form.contact} ({form.phone})</strong>
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Selected Package</span>
                    <strong className="text-main">{selectedPkg?.name || 'Custom Plan'}</strong>
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Selected Add-ons</span>
                    <strong className="text-main">{form.offPackageServiceIds.length} Add-on Services</strong>
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Anticipated Start Date</span>
                    <strong className="text-main">{form.start ? fmtDate(form.start) : 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Stay Duration</span>
                    <strong className="text-main">{form.duration}</strong>
                  </div>
                </div>

                <label className="flex gap-3 items-start border border-ui rounded-xl p-4 cursor-pointer bg-[var(--surface)] hover:border-[var(--teal)] transition">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    className="mt-1 accent-[#0f5d5e] cursor-pointer"
                  />
                  <span className="text-xs text-muted leading-5">
                    I consent to Sri Thirumala Care reviewing the submitted clinical information and contacting me with a private care quote.
                  </span>
                </label>

                <div className="border border-ui rounded-2xl p-4 flex items-end justify-between bg-[var(--mist)] text-muted">
                  <span className="text-xs">Digital Submitter Signature</span>
                  <span className="font-display italic text-lg text-main font-bold">
                    {form.contact || 'Submitter Name'}
                  </span>
                </div>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="mt-10 flex justify-between items-center border-t border-ui pt-6">
              <button
                type="button"
                className={cn('btn-secondary cursor-pointer', step === 1 && 'invisible')}
                onClick={prevStep}
              >
                <Icon name="arrow-left" size={16} /> Back
              </button>

              {step < 5 ? (
                <button type="button" className="btn-primary cursor-pointer" onClick={nextStep}>
                  Continue <Icon name="arrow-right" size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  className="btn-primary cursor-pointer"
                  onClick={handleSubmit}
                >
                  {submitting ? 'Submitting…' : 'Transmit Care Request'} <Icon name="send" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Cart Preview */}
          <aside className="card p-6 h-fit sticky top-28 bg-[var(--surface)] shadow-sm">
            <h3 className="font-display font-extrabold text-xl text-main">Your Care Basket</h3>
            <p className="text-xs text-muted mt-1">Confidential clinical review</p>

            <div className="mt-5 rounded-xl bg-[var(--mist)] p-4 border border-ui">
              <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">
                Selected Package
              </span>
              <strong className="block mt-1 text-sm text-main">
                {selectedPkg?.name || 'Custom Plan / No Package'}
              </strong>
              <span className="text-xs text-muted">
                {form.offPackageServiceIds.length} optional add-ons selected
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {basket.map(x => (
                <div key={x.id} className="flex gap-3 text-sm items-start">
                  <Icon name="check-circle" size={16} className="text-[var(--teal)] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="text-main block text-xs">{x.title}</strong>
                    <div className="text-[11px] text-muted">{x.duration || x.category}</div>
                  </div>
                  <button
                    className="text-muted hover:text-red-500 text-xs cursor-pointer p-1"
                    onClick={() => setBasket(b => b.filter(item => item.id !== x.id))}
                    title="Remove from basket"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-ui mt-6 pt-5 flex items-center gap-2 text-xs text-muted">
              <Icon name="shield-check" size={16} className="text-emerald-600 shrink-0" />
              <span>Encrypted, HIPAA/DISHA aligned clinical inquiry</span>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
