import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import ImageCarousel from '../../components/common/ImageCarousel.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';
import NotFound from './NotFound.jsx';
import { fmtDate, sanitizeHtml } from '../../utils/formatters.js';

export default function BlogDetail({ blogId }) {
  const { mediaItems, nav } = useApp();
  const item = mediaItems.find(row => row.id === blogId && row.active && row.section === 'blog');

  if (!item) {
    return <NotFound />;
  }

  const related = mediaItems
    .filter(row => row.active && row.section === 'blog' && row.id !== item.id)
    .slice(0, 2);

  const displayImages =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];

  return (
    <PublicLayout>
      <article className="max-w-[1000px] mx-auto px-5 py-12">
        <button
          className="btn-secondary !py-2 text-xs cursor-pointer"
          onClick={() => nav('/blog')}
        >
          <Icon name="arrow-left" size={14} /> Back to All Articles
        </button>

        <header className="max-w-4xl mt-9">
          <span className="eyebrow">Clinical Blog</span>
          <h1 className="section-title mt-4 text-main">{item.title}</h1>
          {item.excerpt && (
            <p className="text-xl text-muted leading-8 mt-5">{item.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-6">
            <span className="w-9 h-9 rounded-full bg-[var(--mist)] text-[var(--teal)] grid place-items-center">
              <Icon name="pen-tool" size={15} />
            </span>
            <strong className="text-main text-sm">{item.author}</strong>
            <span>·</span>
            <time>{fmtDate(item.publishedAt)}</time>
          </div>
        </header>

        {displayImages.length > 0 && (
          <figure className="rounded-[2rem] overflow-hidden mt-10 shadow-soft bg-[var(--surface)]">
            <ImageCarousel images={displayImages} title={item.title} className="h-[360px] lg:h-[560px]" />
            {item.caption && (
              <figcaption className="p-4 text-sm text-muted border-t border-ui text-center bg-[var(--mist)]">
                {item.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div
          className="rich-content card p-7 lg:p-12 mt-10 shadow-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
        />
      </article>

      {/* Related Reading Section */}
      {related.length > 0 && (
        <section className="max-w-[1000px] mx-auto px-5 pb-10">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-display font-extrabold text-2xl text-main">Continue Reading</h2>
            <button
              className="text-sm font-bold text-[var(--teal)] hover:underline cursor-pointer"
              onClick={() => nav('/blog')}
            >
              View all articles →
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {related.map(row => {
              const relImg = (row.images && row.images[0]) || row.image;
              return (
                <button
                  key={row.id}
                  className="card interactive-card p-4 text-left flex gap-4 cursor-pointer"
                  onClick={() => nav(`/blog/${row.id}`)}
                >
                  {relImg && (
                    <img
                      src={relImg}
                      alt=""
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div>
                    <strong className="font-display block text-main text-base line-clamp-2">
                      {row.title}
                    </strong>
                    <small className="text-muted mt-1 block line-clamp-2 text-xs">
                      {row.excerpt || row.caption}
                    </small>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <CTA />
    </PublicLayout>
  );
}
