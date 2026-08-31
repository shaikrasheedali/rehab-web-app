import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function NotFound() {
  const { nav } = useApp();

  return (
    <PublicLayout>
      <section className="min-h-[60vh] grid place-items-center px-5 py-20 text-center">
        <div className="card max-w-lg p-10 shadow-soft bg-[var(--surface)]">
          <span className="w-16 h-16 rounded-full bg-[var(--mist)] text-[var(--teal)] grid place-items-center mx-auto mb-6">
            <Icon name="search-x" size={32} />
          </span>
          <h1 className="font-display font-extrabold text-3xl text-main">Page Not Found</h1>
          <p className="text-muted text-sm leading-6 mt-3">
            The page or clinical resource you requested is unavailable or has been relocated.
          </p>
          <button className="btn-primary mt-7 cursor-pointer" onClick={() => nav('/')}>
            <Icon name="home" size={16} /> Return to Home
          </button>
        </div>
      </section>
    </PublicLayout>
  );
}
