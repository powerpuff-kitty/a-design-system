export function formatDate(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale?: string,
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
export function formatBytes(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  if (value === 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(Math.abs(value)) / Math.log(1024)), units.length - 1);
  return `${new Intl.NumberFormat(locale, options).format(value / 1024 ** index)} ${units[index]}`;
}
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit = 'second',
  locale?: string,
  options?: Intl.RelativeTimeFormatOptions,
): string {
  return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
}
