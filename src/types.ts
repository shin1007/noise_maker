export type Locale = 'ja' | 'en';
export type NoiseType = 'white' | 'pink' | 'brown' | 'blue' | 'violet';
export type EvidenceStrength = 'Strong' | 'Moderate' | 'Limited' | 'Mixed';

export interface EvidenceLink {
  label: string;
  url: string;
}

export interface EvidenceCard {
  key: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  strength: EvidenceStrength;
  caveat: Record<Locale, string>;
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
  timerLabel: string;
  timerOff: string;
}