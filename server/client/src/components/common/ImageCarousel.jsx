import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { cn } from '../../utils/formatters.js';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=84';

export default function ImageCarousel({ images = [], title = 'Care image', className = 'h-56' }) {
  const swiperRef = useRef(null);
  const slides = Array.isArray(images) && images.length ? images : [FALLBACK_IMAGE];

  useEffect(() => {
    if (!swiperRef.current || slides.length <= 1) return;

    const instance = new Swiper(swiperRef.current, {
      modules: [Pagination, Autoplay],
      loop: slides.length > 1,
      speed: 500,
      grabCursor: true,
      pagination: {
        el: swiperRef.current.querySelector('.swiper-pagination'),
        clickable: true
      },
      autoplay: {
        delay: 4500,
        disableOnInteraction: false
      }
    });

    return () => {
      instance.destroy(true, true);
    };
  }, [slides]);

  if (slides.length <= 1) {
    return (
      <div className={cn('overflow-hidden relative bg-[var(--mist)]', className)}>
        <img src={slides[0]} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div ref={swiperRef} className={cn('swiper service-swiper overflow-hidden relative bg-[var(--mist)]', className)}>
      <div className="swiper-wrapper">
        {slides.map((src, index) => (
          <div className="swiper-slide" key={`${src}-${index}`}>
            <img src={src} alt={`${title} ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="swiper-pagination"></div>
    </div>
  );
}
