import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import ImageCarousel from '../../components/common/ImageCarousel.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';
import { fmtDate } from '../../utils/formatters.js';

export default function Blog() {
  const { mediaItems, nav } = useApp();
  const [q, setQ] = useState('');

  const blogs = useMemo(() => {
    const active = mediaItems.filter(item => item.active && item.section === 'blog');
    if (!q) return active;
    const fuse = new Fuse(active, {
      keys: ['title', 'excerpt', 'caption', 'author'],
      threshold: 0.35
    });
    return fuse.search(q).map(result => result.item);
  }, [mediaItems, q]);

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Clinical Blog & Insights"
        title="Practical guidance for recovery, care and family decisions."
        copy="Thoughtful, clinically informed articles from our doctor, therapy, and nursing team—written to make complex rehabilitation and long-stay choices easier to navigate."
      />

      <section className="max-w-[1200px] mx-auto px-5 lg:px-10 py-14">
        <label className="relative block max-w-xl mx-auto">
          <span className="sr-only">Search blog articles</span>
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-12 shadow-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles on stroke, mobility, nursing, home care…"
          />
        </label>

        <div className="flex flex-wrap justify-between items-end gap-4 mt-12 mb-7">
          <div>
            <span className="eyebrow">Latest Writing</span>
            <h2 className="font-display font-extrabold text-3xl text-main mt-2">
              Care Insights & Recovery Guides
            </h2>
          </div>
          <span className="text-sm text-muted">{blogs.length} articles published</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {blogs.map(item => {
            const displayImages =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : item.image
                ? [item.image]
                : [];

            return (
              <article
                key={item.id}
                tabIndex={0}
                role="link"
                aria-label={`Read ${item.title}`}
                onClick={() => nav(`/blog/${item.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') nav(`/blog/${item.id}`);
                }}
                className="card interactive-card overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f5d5e] flex flex-col justify-between"
              >
                <div>
                  <figure>
                    <ImageCarousel images={displayImages} title={item.title} className="h-64" />
                    {item.caption && (
                      <figcaption className="px-5 py-3 text-xs text-muted border-b border-ui bg-[var(--mist)]">
                        {item.caption}
                      </figcaption>
                    )}
                  </figure>

                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--teal)]">
                      {fmtDate(item.publishedAt)} · {item.author}
                    </div>
                    <h3 className="font-display font-extrabold text-2xl text-main mt-3">
                      {item.title}
                    </h3>
                    <p className="text-muted text-sm leading-6 mt-3 line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    className="text-sm font-bold text-[var(--teal)] flex items-center gap-1 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      nav(`/blog/${item.id}`);
                    }}
                  >
                    Read article <Icon name="arrow-right" size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {blogs.length === 0 && (
          <div className="card p-14 text-center text-muted">
            <Icon name="newspaper" size={38} className="mx-auto text-muted" />
            <h3 className="font-display font-extrabold text-xl mt-4 text-main">
              No articles match your search
            </h3>
            <p className="text-sm text-muted mt-2">Try searching with a broader clinical topic keyword.</p>
          </div>
        )}
      </section>

      <CTA />
    </PublicLayout>
  );
}
