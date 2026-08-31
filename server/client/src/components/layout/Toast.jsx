import React from 'react';
import Icon from '../common/Icon.jsx';
import { cn } from '../../utils/formatters.js';

export default function Toast({ message, type = 'success' }) {
  return (
    <div className="toast card shadow-soft p-4 flex gap-3 items-center" role="status" aria-live="polite">
      <span
        className={cn(
          'w-10 h-10 rounded-full grid place-items-center shrink-0',
          type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        )}
      >
        <Icon name={type === 'success' ? 'check' : 'bell'} size={18} />
      </span>
      <div>
        <div className="font-bold text-sm text-main">{type === 'success' ? 'Success' : 'Notice'}</div>
        <div className="text-xs text-muted leading-5">{message}</div>
      </div>
    </div>
  );
}
