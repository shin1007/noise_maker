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
export type NoiseType = 'white' | 'pink' | 'brown' | 'blue' | 'violet' | 'off';
export type AudioMode = 'earphone' | 'speaker';
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

export interface Preset {
  key: string;
  label: LocalizedText;
  description: LocalizedText;
  noiseType: NoiseType;
  beatBand: string;
  baseFrequency: number;
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
  installInfo: string;
  addHome: string;
  aboutBackground: string;
  noiseType: string;
  noisePapers: string;
  noiseReferences: string;
  beatOn: string;
  beatHelp: string;
  beatDesc: string;
  earphoneMode: string;
  speakerMode: string;
  baseFreq: string;
  currentBand: string;
  footerNote: string;
  minute: string;
  second: string;
  iosStep1: string;
  iosStep2: string;
  iosStep3: string;
  androidStep1: string;
  androidStep2: string;
  gotIt: string;
  close: string;
  presetsTitle: string;
  resetPreset: string;
  settingsTitle: string;
  advancedSettings: string;
  noiseOff: string;
}