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
  { key: 'white', label: { ja: 'ホワイト', en: 'White' }, short: { ja: '全体の帯域を広く含む、基準に近いノイズです。', en: 'A baseline noise with energy spread broadly across the spectrum.' } },
  { key: 'pink', label: { ja: 'ピンク', en: 'Pink' }, short: { ja: '低い音がやや強く、耳にやわらかく感じやすいノイズです。', en: 'Lower frequencies are relatively stronger, so it often feels softer.' } },
  { key: 'brown', label: { ja: 'ブラウン', en: 'Brown' }, short: { ja: 'さらに低音寄りで、深くこもった感じになりやすいノイズです。', en: 'Even more low-frequency weighted and usually deeper sounding.' } },
  { key: 'blue', label: { ja: 'ブルー', en: 'Blue' }, short: { ja: '高音が相対的に強く、少し明るく感じるノイズです。', en: 'Higher frequencies are emphasized, which can sound brighter.' } },
  { key: 'violet', label: { ja: 'ヴァイオレット', en: 'Violet' }, short: { ja: 'さらに高音寄りで、鋭さのあるノイズです。', en: 'A very high-frequency weighted noise with a sharper feel.' } }
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

export const timerOptions = [0, 15, 30, 60] as const;

export function getNoiseLabel(locale: Locale, key: NoiseType): string {
  const item = noiseTypes.find((noiseType) => noiseType.key === key);
  return item?.label[locale] ?? key;
}