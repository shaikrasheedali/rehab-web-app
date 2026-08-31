import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

export default function AccessibilityBar() {
  const { theme, setTheme, largeText, setLargeText, lang, setLang, t } = useApp();

  return (
    <div className="bg-[#0a4546] text-white text-xs border-b border-white/10 no-print">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 min-h-9 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="shield-check" size={14} className="text-[#a6e3d7]" />
          <span className="font-medium">
            {t('accessibilityBanner')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'px-2 py-0.5 rounded transition cursor-pointer',
              largeText ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
            )}
            aria-label={t('largeText')}
            aria-pressed={largeText}
            onClick={() => setLargeText(!largeText)}
            title={t('largeText')}
          >
            A<span className="text-sm font-bold">A</span>
          </button>
          <button
            className={cn(
              'px-2 py-0.5 rounded transition cursor-pointer',
              theme === 'contrast' ? 'bg-white/20' : 'hover:bg-white/10'
            )}
            aria-label={t('highContrast')}
            aria-pressed={theme === 'contrast'}
            onClick={() => setTheme(theme === 'contrast' ? 'light' : 'contrast')}
            title={t('highContrast')}
          >
            <Icon name="circle-half" size={14} />
          </button>
          <button
            className={cn(
              'px-2 py-0.5 rounded transition cursor-pointer',
              theme === 'dark' ? 'bg-white/20' : 'hover:bg-white/10'
            )}
            aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
          </button>
          <div className="border-l border-white/20 pl-2 ml-1">
            <select
              aria-label={t('langChoice')}
              className="bg-transparent border-0 outline-none cursor-pointer text-white font-medium text-xs pr-1"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option className="text-black" value="en">English</option>
              <option className="text-black" value="te">తెలుగు</option>
              <option className="text-black" value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
