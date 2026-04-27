import type { Locale } from './types';

export const localeMetadata: Record<Locale, { name: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  'zh-Hans': { name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  pt: { name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  yue: { name: 'Cantonese', nativeName: '粵語', dir: 'ltr' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  mr: { name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  ko: { name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  jv: { name: 'Javanese', nativeName: 'Basa Jawa', dir: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' }
};

export const supportedLocales = Object.keys(localeMetadata) as Locale[];

const localeAliasMap: Record<string, Locale> = {
  ja: 'ja',
  en: 'en',
  zh: 'zh-Hans',
  'zh-cn': 'zh-Hans',
  'zh-hans': 'zh-Hans',
  es: 'es',
  hi: 'hi',
  bn: 'bn',
  pt: 'pt',
  ru: 'ru',
  yue: 'yue',
  'zh-hk': 'yue',
  'zh-mo': 'yue',
  cantonese: 'yue',
  vi: 'vi',
  mr: 'mr',
  te: 'te',
  tr: 'tr',
  ko: 'ko',
  pa: 'pa',
  ta: 'ta',
  jv: 'jv',
  it: 'it',
  fr: 'fr',
  de: 'de',
  id: 'id'
};

export function normalizeLocale(candidate: string | null | undefined): Locale | null {
  if (!candidate) {
    return null;
  }

  const normalized = candidate.trim().toLowerCase();
  const mapped = localeAliasMap[normalized];
  if (mapped) {
    return mapped;
  }

  const primary = normalized.split('-')[0];
  return localeAliasMap[primary] ?? null;
}

export function resolveLocaleFromBrowserLang(browserLang: string): Locale {
  return normalizeLocale(browserLang) ?? 'en';
}
