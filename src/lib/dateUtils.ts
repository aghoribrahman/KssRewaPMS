import { Language } from '../hooks/useTranslation';

/**
 * Returns a time-based greeting in the specified language.
 */
export function getTimeGreeting(lang: Language): string {
  const hour = new Date().getHours();
  if (hour < 12) return lang === 'en' ? 'Good Morning' : 'शुभ प्रभात';
  if (hour < 17) return lang === 'en' ? 'Good Afternoon' : 'शुभ दोपहर';
  return lang === 'en' ? 'Good Evening' : 'शुभ संध्या';
}

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
