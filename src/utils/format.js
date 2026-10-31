export function money(n) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function dateFmt(d, opts) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(
    'en-US',
    opts || { month: 'short', day: 'numeric', year: 'numeric' }
  );
}

export function timeFmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function dateTimeFmt(d) {
  if (!d) return '—';
  return `${dateFmt(d)} · ${timeFmt(d)}`;
}

export function relativeTime(d) {
  if (!d) return '—';
  const diff = (new Date(d) - new Date()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
}
