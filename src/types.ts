export type Locale =
  | 'ja'
  | 'en'
  | 'zh-Hans'
  | 'es'
  | 'hi'
  | 'bn'
  | 'pt'
  | 'ru'
  | 'yue'
  | 'vi'
  | 'mr'
  | 'te'
  | 'tr'
  | 'ko'
  | 'pa'
  | 'ta'
  | 'jv'
  | 'it'
  | 'fr'
  | 'de'
  | 'id';
export type NoiseType = 'white' | 'pink' | 'brown' | 'blue' | 'violet';
export type EvidenceStrength = 'Strong' | 'Moderate' | 'Limited' | 'Mixed';

export type LocalizedText = {
  ja: string;
  en: string;
} & Partial<Record<Locale, string>>;

export type LocalizedList = {
  ja: string[];
  en: string[];
} & Partial<Record<Locale, string[]>>;

export interface EvidenceLink {
  label: string;
  url: string;
}

export interface EvidenceCard {
  key: string;
  title: LocalizedText;
  summary: LocalizedText;
  strength: EvidenceStrength;
  caveat: LocalizedText;
  links: EvidenceLink[];
}

export interface Copy {
  appName: string;
  appTagline: string;
  install: string;
  installHint: string;
  play: string;
  stop: string;
  addToHomeScreen: string;
  evidenceTitle: string;
  platformTitle: string;
  simpleExplanationTitle: string;
  volumeLabel: string;
  timerLabel: string;
  timerOff: string;
}