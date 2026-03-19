/**
 * en-NG (Nigerian English) locale formatting. Plan 9 Q9.4.
 * DD/MM/YYYY, 24h time, ₦ with space (e.g. ₦ 50,000).
 */

const LOCALE = 'en-NG';

/** Format date as DD/MM/YYYY. */
export function formatDateEnNG(date: Date | string | number): string {
  const d = typeof date === 'object' ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Format time as 24-hour (HH:mm). */
export function formatTimeEnNG(date: Date | string | number): string {
  const d = typeof date === 'object' ? date : new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Format date and time: DD/MM/YYYY, HH:mm. */
export function formatDateTimeEnNG(date: Date | string | number): string {
  return `${formatDateEnNG(date)}, ${formatTimeEnNG(date)}`;
}

/** Format currency: ₦ with space, comma thousands (e.g. ₦ 50,000). Amount in major units (naira). */
export function formatCurrencyEnNG(amountNaira: number, currency = 'NGN'): string {
  if (currency !== 'NGN') {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(amountNaira);
  }
  const formatted = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amountNaira));
  return `₦ ${formatted}`;
}

/** Format kobo to display: ₦ 50,000 (converts kobo → naira). */
export function formatKoboEnNG(kobo: number, currency = 'NGN'): string {
  const naira = kobo / 100;
  return formatCurrencyEnNG(naira, currency);
}
