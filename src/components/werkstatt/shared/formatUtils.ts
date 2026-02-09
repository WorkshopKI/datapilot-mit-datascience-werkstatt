/** Format a cell value for data preview tables */
export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '–';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(4);
  }
  return String(value);
}

/** Format a number for statistics display (de-DE locale for large numbers) */
export function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '–';
  if (Math.abs(value) >= 1000) return value.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return value.toFixed(4);
}

/** Map correlation value (-1..+1) to an RGB color string */
export function getCorrelationColor(value: number): string {
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped >= 0) {
    const intensity = Math.round(clamped * 200);
    return `rgb(${220 - intensity}, ${220 - intensity * 0.5}, 255)`;
  }
  const intensity = Math.round(Math.abs(clamped) * 200);
  return `rgb(255, ${220 - intensity * 0.7}, ${220 - intensity})`;
}

/** Map missing-value percentage to a Tailwind bg-color class */
export function getMissingBarColor(percent: number): string {
  if (percent === 0) return 'bg-green-400';
  if (percent <= 10) return 'bg-amber-400';
  if (percent <= 50) return 'bg-orange-500';
  return 'bg-red-500';
}
