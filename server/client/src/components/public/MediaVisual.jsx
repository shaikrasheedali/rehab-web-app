import React from 'react';
import Icon from '../common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

export default function MediaVisual({ item, className = 'h-56' }) {
  const isVideoEmbed =
    item.mediaUrl &&
    (item.subtype === 'youtube-video' ||
      item.subtype === 'testimonial-video' ||
      item.mediaUrl.includes('youtube.com/embed') ||
      item.mediaUrl.includes('youtu.be'));

  if (isVideoEmbed) {
    let embedUrl = item.mediaUrl;
    if (embedUrl.includes('watch?v=')) {
      embedUrl = embedUrl.replace('watch?v=', 'embed/');
    }
    return (
      <iframe
        className={cn('w-full border-0', className)}
        src={embedUrl}
        title={item.title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-[var(--mist)]', className)}>
      {item.image ? (
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid place-items-center text-[var(--teal)]">
          <Icon name={item.subtype === 'x-post' ? 'at-sign' : 'image'} size={44} />
        </div>
      )}
      {(item.subtype?.includes('video') || item.subtype?.includes('reel')) && (
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="w-14 h-14 rounded-full bg-white/90 text-[var(--teal)] grid place-items-center shadow-soft">
            <Icon name="play" size={24} />
          </span>
        </span>
      )}
    </div>
  );
}
