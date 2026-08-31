import DOMPurify from 'dompurify';

export const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(n) || 0);

export const fmtDate = (d) => {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(d));
  } catch {
    return String(d);
  }
};

export const cn = (...v) => v.filter(Boolean).join(' ');

export const currentISODate = () => new Date().toISOString().slice(0, 10);

export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h2', 'h3', 'h4', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li',
      'blockquote', 'a', 'br', 'span', 'b', 'i'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
};

export const compressImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.74));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
