export const currentISODate = () => new Date().toISOString().slice(0, 10);

/**
 * Calculates the inclusive day count between `from` and `to`,
 * optionally clamped within the window `[limitFrom, limitTo]`.
 */
export const inclusiveDays = (from, to, limitFrom = from, limitTo = to) => {
  if (!from || !to || !limitFrom || !limitTo) return 0;
  const a = Math.max(Date.parse(`${from}T00:00:00Z`), Date.parse(`${limitFrom}T00:00:00Z`));
  const b = Math.min(Date.parse(`${to}T00:00:00Z`), Date.parse(`${limitTo}T00:00:00Z`));
  return !Number.isFinite(a) || !Number.isFinite(b) || b < a ? 0 : Math.floor((b - a) / 86400000) + 1;
};

/**
 * Safely parse JSON strings or return fallback object/array
 */
export const parseJsonSafe = (data, fallback = []) => {
  if (data === undefined || data === null) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};
