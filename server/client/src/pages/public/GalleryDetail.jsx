import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import MediaVisual from '../../components/public/MediaVisual.jsx';
import CTA from '../../components/public/CTA.jsx';
import Icon from '../../components/common/Icon.jsx';
import NotFound from './NotFound.jsx';
import { fmtDate, sanitizeHtml } from '../../utils/formatters.js';

export default function GalleryDetail({ mediaId }) {
  const { mediaItems, nav } = useApp();
  const item = mediaItems.find(row => row.id === mediaId && row.active && row.section !== 'blog');

  if (!item) {
    return <NotFound />;
  }

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
    return map[subtype] || 'Gallery';
  };

  return (
    <PublicLayout>
      <article className="max-w-[920px] mx-auto px-5 py-12">
        <button
          className="btn-secondary !py-2 text-xs cursor-pointer"
          onClick={() => nav('/gallery')}
        >
          <Icon name="arrow-left" size={14} /> Back to Gallery
        </button>

        <header className="mt-8">
          <span className="eyebrow">{mediaLabel(item.subtype)}</span>
          <h1 className="section-title mt-4 text-main">{item.title}</h1>
          {item.excerpt && (
            <p className="text-lg text-muted leading-8 mt-4">{item.excerpt}</p>
          )}
          <div className="text-xs text-muted mt-5 flex items-center gap-2">
            <span>{item.author}</span>
            <span>·</span>
            <time>{fmtDate(item.publishedAt)}</time>
          </div>
        </header>

        <div className="rounded-[2rem] overflow-hidden mt-8 shadow-soft">
          <MediaVisual item={item} className="h-[360px] lg:h-[520px]" />
        </div>

        {item.content && (
          <div
            className="rich-content card p-7 lg:p-10 mt-8 shadow-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
          />
        )}

        {item.mediaUrl && !['youtube-video', 'testimonial-video'].includes(item.subtype) && (
          <div className="mt-8">
            <a
              className="btn-primary"
              href={item.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View original publication <Icon name="external-link" size={16} />
            </a>
          </div>
        )}
      </article>

      <CTA />
    </PublicLayout>
  );
}
