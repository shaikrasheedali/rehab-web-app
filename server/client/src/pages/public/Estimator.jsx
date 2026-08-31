import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import Icon from '../../components/common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

export default function Estimator() {
  const { nav, t } = useApp();
  const [days, setDays] = useState(30);
  const [level, setLevel] = useState('Assisted');
  const [therapies, setTherapies] = useState(['Physiotherapy']);

  const toggleTherapy = (therapy) => {
    setTherapies(curr =>
      curr.includes(therapy) ? curr.filter(x => x !== therapy) : [...curr, therapy]
    );
  };

  const therapyOptions = [
    'Daily Physiotherapy',
    'Intensive Neuro Rehab',
    'Speech & Swallow Therapy',
    'Psychosocial & Family Support',
    'Occupational Balance Retraining',
    'Respiratory & Oxygen Care'
  ];

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Care plan estimator"
        title="Sketch the clinical support your family may need."
        copy="This non-binding guide creates a transparent care outline based on duration, nursing intensity, and therapies. A clinical evaluation precedes confirmed recommendations."
      />

      <section className="max-w-5xl mx-auto px-5 py-14">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Controls */}
          <div className="card p-6 lg:p-9 bg-[var(--surface)] shadow-sm">
            <div>
              <label className="font-bold text-main block text-base">
                Expected Duration: <span className="text-[var(--teal)] font-extrabold">{days} Days</span>
              </label>
              <input
                aria-label="Expected care duration in days"
                type="range"
                min="7"
                max="180"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-[#0f5d5e] mt-4 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted mt-2 font-medium">
                <span>1 Week (7d)</span>
                <span>1 Month (30d)</span>
                <span>3 Months (90d)</span>
                <span>6 Months (180d)</span>
              </div>
            </div>

            <hr className="my-8 border-ui" />

            <div>
              <h3 className="font-bold text-main mb-4 text-base">Nursing & Medical Intensity</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { title: 'Guided', desc: 'Periodic doctor checkups & mobility assistance', icon: 'clipboard-heart' },
                  { title: 'Assisted', desc: 'Daily nursing supervision & medication support', icon: 'heart-handshake' },
                  { title: '24/7 Skilled', desc: 'Round-the-clock intensive skilled nursing', icon: 'shield-plus' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.title}
                    onClick={() => setLevel(item.title)}
                    className={cn(
                      'border rounded-2xl p-4 text-left transition cursor-pointer flex flex-col justify-between',
                      level === item.title
                        ? 'border-[var(--teal)] bg-[var(--mist)] ring-2 ring-[#0f5d5e]'
                        : 'border-ui hover:border-slate-300'
                    )}
                  >
                    <div>
                      <Icon name={item.icon} size={20} className="text-[var(--teal)]" />
                      <strong className="block mt-3 text-sm text-main">{item.title}</strong>
                      <p className="text-xs text-muted mt-1 leading-snug">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-8 border-ui" />

            <div>
              <h3 className="font-bold text-main mb-4 text-base">Targeted Therapy Support</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {therapyOptions.map((th) => (
                  <label
                    key={th}
                    className={cn(
                      'border rounded-xl p-4 flex gap-3 items-center cursor-pointer transition',
                      therapies.includes(th)
                        ? 'border-[var(--teal)] bg-[var(--mist)]'
                        : 'border-ui hover:border-slate-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={therapies.includes(th)}
                      onChange={() => toggleTherapy(th)}
                      className="accent-[#0f5d5e] cursor-pointer"
                    />
                    <span className="font-semibold text-sm text-main">{th}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Summary Card */}
          <aside className="rounded-3xl bg-[#0a4b4b] text-white p-7 h-fit sticky top-28 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a8dbd0]">
              Care Outline Preview
            </span>
            <h2 className="font-display font-bold text-2xl mt-3">{level} Care Plan</h2>

            <div className="mt-6 grid gap-4 text-sm">
              <div className="flex justify-between border-b border-white/15 pb-3">
                <span className="text-white/65">Estimated Stay</span>
                <strong className="text-white">{days} Days</strong>
              </div>
              <div className="flex justify-between border-b border-white/15 pb-3">
                <span className="text-white/65">Selected Therapies</span>
                <strong className="text-white">{therapies.length} Modalities</strong>
              </div>
              <div className="flex justify-between border-b border-white/15 pb-3">
                <span className="text-white/65">Review Frequency</span>
                <strong className="text-white">Weekly Doctor Briefings</strong>
              </div>
            </div>

            <div className="mt-6 bg-white/10 rounded-2xl p-4 text-xs leading-6 text-white/80 flex items-start gap-2.5">
              <Icon name="info" size={18} className="shrink-0 mt-0.5 text-[#a8dbd0]" />
              <span>
                No binding monetary estimate is displayed. Final plan and transparent quotes are established post clinical evaluation.
              </span>
            </div>

            <button
              className="w-full mt-7 rounded-full bg-white text-[#0a4b4b] font-bold py-3.5 hover:bg-[#edf5f1] transition cursor-pointer text-sm shadow-md flex items-center justify-center gap-2"
              onClick={() => nav('/inquiry')}
            >
              <span>Continue to Care Request</span>
              <Icon name="arrow-right" size={16} />
            </button>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
