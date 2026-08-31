import React, { useRef, useEffect } from 'react';
import Icon from './Icon.jsx';

export default function RichTextEditor({ value, onChange, label = 'Detailed content' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const exec = (commandName, val = null) => {
    editorRef.current?.focus();
    document.execCommand(commandName, false, val);
    if (onChange) {
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const addLink = () => {
    const href = window.prompt('Enter full website URL (e.g. https://...):');
    if (href) {
      exec('createLink', href);
    }
  };

  const tools = [
    { cmd: 'bold', icon: 'bold', label: 'Bold' },
    { cmd: 'italic', icon: 'italic', label: 'Italic' },
    { cmd: 'underline', icon: 'underline', label: 'Underline' },
    { cmd: 'formatBlock', val: 'h2', icon: 'heading-2', label: 'Heading 2' },
    { cmd: 'formatBlock', val: 'h3', icon: 'heading-3', label: 'Heading 3' },
    { cmd: 'insertUnorderedList', icon: 'list', label: 'Bullet List' },
    { cmd: 'insertOrderedList', icon: 'list-ordered', label: 'Numbered List' },
    { cmd: 'formatBlock', val: 'blockquote', icon: 'quote', label: 'Quote' }
  ];

  return (
    <div>
      <span className="block text-sm font-bold mb-2">{label}</span>
      <div className="border border-ui rounded-2xl overflow-hidden bg-[var(--surface)] shadow-sm">
        <div className="p-2 border-b border-ui flex flex-wrap gap-1 bg-[var(--mist)]">
          {tools.map((t, idx) => (
            <button
              type="button"
              key={`${t.cmd}-${idx}`}
              className="icon-btn !w-8 !h-8"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(t.cmd, t.val)}
              title={t.label}
              aria-label={t.label}
            >
              <Icon name={t.icon} size={14} />
            </button>
          ))}
          <button
            type="button"
            className="icon-btn !w-8 !h-8"
            onMouseDown={(e) => e.preventDefault()}
            onClick={addLink}
            title="Insert Link"
            aria-label="Insert Link"
          >
            <Icon name="link" size={14} />
          </button>
          <button
            type="button"
            className="icon-btn !w-8 !h-8"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('removeFormat')}
            title="Clear Formatting"
            aria-label="Clear Formatting"
          >
            <Icon name="eraser" size={14} />
          </button>
        </div>
        <div
          ref={editorRef}
          className="rich-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange && onChange(e.currentTarget.innerHTML)}
          onBlur={(e) => onChange && onChange(e.currentTarget.innerHTML)}
        />
      </div>
      <p className="text-[10px] text-muted mt-2">
        Rich formatting is sanitized automatically to ensure secure rendering.
      </p>
    </div>
  );
}
