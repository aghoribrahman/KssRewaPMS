import { useAuth } from './useAuth';
import { TRANSLATIONS } from '../constants/mp_data';

export type Language = 'en' | 'hi';
export type TranslationKeys = keyof typeof TRANSLATIONS['en'];

/**
 * Custom hook for type-safe translations across the application.
 * Centralizes language detection from user profile and provides
 * easy access to the TRANSLATIONS object.
 */
export function useTranslation() {
  const { profile } = useAuth();
  
  const lang: Language = (profile?.preferred_language as Language) || 'hi';
  const t = TRANSLATIONS[lang];

  /**
   * Helper to get a translation by key.
   * Useful for dynamic keys or simple lookups.
   */
  const translate = (key: TranslationKeys): string => {
    return t[key] || TRANSLATIONS['en'][key] || key;
  };

  return {
    lang,
    t,
    translate,
    isHindi: lang === 'hi',
    isEnglish: lang === 'en',
  };
}
