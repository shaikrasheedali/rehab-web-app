import React from 'react';

export default function PageIntro({ eyebrow, title, copy, action }) {
  return (
    <section className="hero-grid border-b border-ui">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-16 lg:py-20">
        <div className="eyebrow mb-4">{eyebrow}</div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7">
          <h1 className="section-title max-w-3xl">{title}</h1>
          <div className="max-w-xl">
            <p className="text-muted text-lg leading-8">{copy}</p>
            {action}
          </div>
        </div>
      </div>
    </section>
  );
}
