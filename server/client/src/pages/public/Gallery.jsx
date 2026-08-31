import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PageIntro from '../../components/common/PageIntro.jsx';
import MediaVisual from '../../components/public/MediaVisual.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';
import { fmtDate } from '../../utils/formatters.js';

export default function Gallery() {
  const { mediaItems, nav } = useApp();

  const activeMedia = useMemo(
    () => mediaItems.filter(item => item.active && item.section !== 'blog'),
    [mediaItems]
  );

  const testimonials = useMemo(
    () => activeMedia.filter(item => item.section === 'testimonial'),
    [activeMedia]
  );

  const posts = useMemo(
    () => activeMedia.filter(item => item.section === 'post'),
    [activeMedia]
  );

  const mediaLabel = (subtype) => {
    const map = {
      'testimonial-video': 'Testimonial video',
      'youtube-video': 'YouTube video',
      'instagram-post': 'Instagram post',
      'instagram-reel': 'Instagram reel',
      'facebook-reel': 'Facebook reel',
      'facebook-post': 'Facebook post',
      'x-post': 'X post',
      image: 'Image'
    };
    return map[subtype] || 'Gallery Item';
  };

  return (
    <PublicLayout>
      <PageIntro
        eyebrow="Gallery & Community"
        title="Care moments, family voices and community updates."
        copy="Explore video testimonials, clinical routines, reels and photograph moments from the Sri Thirumala Care community in Khammam."
      />

      {/* Testimonial Videos Section */}
      <section className="bg-[#083f40] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
            <div>
              <span className="text-xs uppercase tracking-[.15em] font-bold text-[#bce9dc]">
                Testimonial Videos
              </span>
              <h2 className="font-display font-extrabold text-3xl mt-2">
                Families share their experience
              </h2>
            </div>
            <span className="text-sm text-white/55">{testimonials.length} video stories</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {testimonials.map(item => (
              <article
                key={item.id}
                className="interactive-card rounded-3xl overflow-hidden bg-white/8 border border-white/10 flex flex-col justify-between"
              >
                <MediaVisual item={item} className="h-72" />
                <div className="p-6">
                  <h3 className="font-display font-extrabold text-xl text-white">{item.title}</h3>
                  <p className="text-sm text-white/65 mt-2 leading-6">{item.excerpt}</p>
                  <button
                    className="mt-5 text-sm font-bold text-[#bce9dc] flex items-center gap-1.5 hover:underline cursor-pointer"
                    onClick={() => nav(`/gallery/${item.id}`)}
                  >
                    <span>View story & details</span>
                    <Icon name="arrow-right" size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {testimonials.length === 0 && (
            <div className="rounded-2xl border border-white/15 p-10 text-center text-white/65">
              Testimonial videos will appear here once published by the team.
            </div>
          )}
        </div>
      </section>

      {/* Posts & Reels Gallery */}
      <section className="max-w-[1200px] mx-auto px-5 lg:px-10 py-16">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <span className="eyebrow">Community Gallery</span>
            <h2 className="section-title text-main mt-2">Social posts, reels & photos</h2>
          </div>
          <span className="text-sm text-muted">{posts.length} posts</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(item => (
            <article key={item.id} className="card interactive-card overflow-hidden flex flex-col justify-between">
              <div>
                <MediaVisual item={item} className="h-56" />
                <div className="p-5">
                  <span className="text-[10px] uppercase tracking-wider font-bold rounded-full bg-[var(--mist)] text-[var(--teal)] px-2.5 py-1">
                    {mediaLabel(item.subtype)}
                  </span>
                  <h3 className="font-display font-extrabold text-lg mt-3 text-main line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted mt-2 leading-6 line-clamp-2">
                    {item.excerpt}
                  </p>
                  <button
                    className="mt-4 text-xs font-bold text-[var(--teal)] flex items-center gap-1 hover:underline cursor-pointer"
                    onClick={() => nav(`/gallery/${item.id}`)}
                  >
                    Open gallery item <Icon name="arrow-right" size={14} />
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-ui flex justify-between text-[11px] text-muted">
                <span>{item.author}</span>
                <span>{fmtDate(item.publishedAt)}</span>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="card p-12 text-center text-muted">
            Community gallery posts will appear here once published.
          </div>
        )}
      </section>

      <CTA />
    </PublicLayout>
  );
}
