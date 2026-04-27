import type { Copy, EvidenceCard, Locale, NoiseType } from './types';

export const copy: Record<Locale, Copy> = {
  ja: {
    appName: 'Noise Maker',
    appTagline: 'シンプルに、静かに、聞きたい音だけ。',
    install: 'インストール',
    installHint: 'ホーム画面に追加すると、起動が速くなります。',
    play: '再生',
    stop: '停止',
    addToHomeScreen: 'ホーム画面に追加',
    evidenceTitle: '説明と論文',
    platformTitle: 'PWA と端末差分',
    simpleExplanationTitle: '短い説明',
    timerLabel: 'タイマー',
    timerOff: 'なし'
  },
  en: {
    appName: 'Noise Maker',
    appTagline: 'Simple noise and binaural beats, tuned for phones.',
    install: 'Install',
    installHint: 'Adding to the home screen makes launch faster.',
    play: 'Play',
    stop: 'Stop',
    addToHomeScreen: 'Add to Home Screen',
    evidenceTitle: 'Explanation and papers',
    platformTitle: 'PWA and platform differences',
    simpleExplanationTitle: 'Plain explanation',
    timerLabel: 'Timer',
    timerOff: 'Off'
  }
};

export const noiseTypes: Array<{
  key: NoiseType;
  label: Record<Locale, string>;
  short: Record<Locale, string>;
}> = [
  { key: 'white', label: { ja: 'ホワイト', en: 'White' }, short: { ja: '環境音を目立ちにくくして、作業や休憩の切り替えに使われることがあります。', en: 'Often used to mask background sounds and support task or rest transitions.' } },
  { key: 'pink', label: { ja: 'ピンク', en: 'Pink' }, short: { ja: '就寝前に落ち着きやすいと感じる人がいます。睡眠への効果は研究でも個人差があります。', en: 'Some people find it easier to settle before sleep. Sleep effects vary across studies and individuals.' } },
  { key: 'brown', label: { ja: 'ブラウン', en: 'Brown' }, short: { ja: '低めで包まれる感覚があり、リラックス目的で選ばれることがあります。', en: 'Its deeper tone can feel enveloping, so some listeners choose it for relaxation.' } },
  { key: 'blue', label: { ja: 'ブルー', en: 'Blue' }, short: { ja: '気分を切り替えたい場面で、短時間の集中スイッチとして使う人もいます。', en: 'Sometimes used as a short focus reset when people want a quick mental shift.' } },
  { key: 'violet', label: { ja: 'ヴァイオレット', en: 'Violet' }, short: { ja: '高めの刺激で注意を向けやすいと感じる人がいますが、長時間は疲れやすいことがあります。', en: 'Some listeners feel more alert with it, though long sessions can become fatiguing.' } }
];

export const binauralBands: Array<{
  key: string;
  min: number;
  max: number;
  label: Record<Locale, string>;
  effect: Record<Locale, string>;
}> = [
  {
    key: 'delta',
    min: 0.5,
    max: 4,
    label: { ja: 'デルタ (0.5-4 Hz)', en: 'Delta (0.5-4 Hz)' },
    effect: {
      ja: '深い休息モードに寄せたいときの目安です。夜の静かな時間に合わせやすい帯域です。',
      en: 'A common target when aiming for a deeper rest mood, especially in quiet night sessions.'
    }
  },
  {
    key: 'theta',
    min: 4,
    max: 8,
    label: { ja: 'シータ (4-8 Hz)', en: 'Theta (4-8 Hz)' },
    effect: {
      ja: '落ち着きや内省の感覚と結びつけられることがあります。体感は人によって大きく変わります。',
      en: 'Sometimes linked to calm or inward attention, with large person-to-person variation.'
    }
  },
  {
    key: 'alpha',
    min: 8,
    max: 13,
    label: { ja: 'アルファ (8-13 Hz)', en: 'Alpha (8-13 Hz)' },
    effect: {
      ja: 'リラックスしつつ作業したいときに選ばれやすい、バランス型の帯域です。',
      en: 'A balanced range often chosen for relaxed but awake sessions.'
    }
  },
  {
    key: 'beta',
    min: 13,
    max: 30,
    label: { ja: 'ベータ (13-30 Hz)', en: 'Beta (13-30 Hz)' },
    effect: {
      ja: '注意や課題集中に関連づけられる帯域です。人によっては刺激が強すぎる場合があります。',
      en: 'Often associated with attention and task focus, though it may feel overstimulating for some.'
    }
  },
  {
    key: 'gamma',
    min: 30,
    max: 40,
    label: { ja: 'ガンマ (30-40 Hz)', en: 'Gamma (30-40 Hz)' },
    effect: {
      ja: '切り替えや短時間の高集中に向けた高めの帯域です。刺激が強く感じる場合があります。',
      en: 'A higher band often used for short, high-focus pushes; it can feel intense for some.'
    }
  }
];

export const evidenceCards: EvidenceCard[] = [
  { key: 'noise-colors', title: { ja: 'ノイズ色の違い', en: 'Differences between noise colors' }, summary: { ja: '白・ピンク・ブラウン・ブルー・ヴァイオレットは、周波数ごとの強さが違う音です。効果を断定せず、まずは音の性質として扱います。', en: 'White, pink, brown, blue, and violet noise differ by frequency weighting. The app treats them as sound-shape tools, not medical treatments.' }, strength: 'Strong', caveat: { ja: '音響的な違いは明確ですが、使い方による体感は個人差があります。', en: 'The spectral differences are clear, but user experience varies a lot.' }, links: [{ label: 'Pink noise and auditory stimulation review', url: 'https://pubmed.ncbi.nlm.nih.gov/34964434/' }, { label: 'Pink noise and NREM sleep review', url: 'https://pubmed.ncbi.nlm.nih.gov/32765139/' }] },
  { key: 'binaural-beats', title: { ja: 'バイノーラルビート', en: 'Binaural beats' }, summary: { ja: '左右の耳に少し違う周波数を出して、差分のうなりを知覚させます。研究はありますが、結果は一貫していません。', en: 'Two nearby tones are sent separately to each ear so the listener perceives a beat. Studies exist, but results are inconsistent.' }, strength: 'Mixed', caveat: { ja: '睡眠改善、不安軽減、ADHD 改善などを断定しません。可能性はあっても、結論は控えめに扱います。', en: 'No claims are made about sleep, anxiety, ADHD, or similar outcomes. Possible effects are described cautiously.' }, links: [{ label: 'Systematic review on binaural beats and brain oscillatory activity', url: 'https://pubmed.ncbi.nlm.nih.gov/37205669/' }, { label: 'Systematic review and meta-review on binaural beats', url: 'https://pubmed.ncbi.nlm.nih.gov/38458383/' }] },
  { key: 'auditory-stimulation', title: { ja: '静かな音の使い方', en: 'Using quiet background sound' }, summary: { ja: 'ノイズは環境音を目立ちにくくする目的で使われることがありますが、効果は文脈と個人差に強く左右されます。', en: 'Noise can mask environmental sounds, but any benefit depends heavily on context and the person.' }, strength: 'Moderate', caveat: { ja: '「役立つことがある」程度の表現にとどめ、医療的な効果は言いません。', en: 'Use only cautious language such as “may help” and avoid medical claims.' }, links: [{ label: 'Systematic review: auditory stimulation and sleep', url: 'https://pubmed.ncbi.nlm.nih.gov/34964434/' }, { label: 'White noise and sleep-quality study example', url: 'https://pubmed.ncbi.nlm.nih.gov/34931413/' }] }
];

export const platformNotes: Record<Locale, string[]> = {
  ja: ['iOS はブラウザの制限が強く、バックグラウンド再生は OS の状態に左右されます。', 'Android は PWA と Media Session が比較的素直に動きますが、省電力設定で止まることがあります。', 'Desktop は最も安定しますが、タブを閉じると当然停止します。'],
  en: ['iOS has stricter browser limits, so background playback still depends on OS behavior.', 'Android usually handles PWA and Media Session well, but battery optimization can still interrupt playback.', 'Desktop is the most stable, though closing the tab will stop playback as expected.']
};

export const timerOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60] as const;

export function getNoiseLabel(locale: Locale, key: NoiseType): string {
  const item = noiseTypes.find((noiseType) => noiseType.key === key);
  return item?.label[locale] ?? key;
}