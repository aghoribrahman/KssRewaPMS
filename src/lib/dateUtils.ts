import { Language } from '../hooks/useTranslation';
import { TRANSLATIONS } from '../constants/mp_data';

/**
 * Returns a time-based greeting in the specified language.
 */
export const getTimeGreeting = (lang: 'en' | 'hi' = 'en') => {
  const hour = new Date().getHours();
  const t = TRANSLATIONS[lang];
  if (hour < 12) return t.goodMorning;
  if (hour < 17) return t.goodAfternoon;
  return t.goodEvening;
};

/**
 * Formats a date string into a localized time string.
 * Example: "10:30 AM"
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats a date string into a localized date string.
 * Example: "07 May"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/**
 * Formats a full date and time.
 * Example: "07 May, 10:30 AM"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return `${formatDate(date)}, ${formatTime(date)}`;
}
