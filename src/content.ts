import type { Copy, EvidenceCard, Locale, LocalizedList, LocalizedText, NoiseType } from './types';

export const copy: Record<Locale, Copy> = {
  ja: {
    appName: 'Noise Maker',
    appTagline: 'シンプルに、静かに、聞きたい音だけ。',
    install: 'ホーム画面に追加',
    installHint: 'ホーム画面に追加すると、起動が速くなります。',
    play: '再生',
    stop: '停止',
    addToHomeScreen: 'ホーム画面に追加',
    evidenceTitle: '説明と論文',
    platformTitle: 'PWA と端末差分',
    simpleExplanationTitle: '短い説明',
    volumeLabel: '音量',
    timerLabel: 'タイマー',
    timerOff: 'なし'
  },
  en: {
    appName: 'Noise Maker',
    appTagline: 'Simple noise and binaural beats, tuned for phones.',
    install: 'Add to Home Screen',
    installHint: 'Adding to the home screen makes launch faster.',
    play: 'Play',
    stop: 'Stop',
    addToHomeScreen: 'Add to Home Screen',
    evidenceTitle: 'Explanation and papers',
    platformTitle: 'PWA and platform differences',
    simpleExplanationTitle: 'Plain explanation',
    volumeLabel: 'Volume',
    timerLabel: 'Timer',
    timerOff: 'Off'
  },
  'zh-Hans': {
    appName: 'Noise Maker',
    appTagline: '简洁、安静，只播放你想听的声音。',
    install: '添加到主屏幕',
    installHint: '添加到主屏幕后，启动会更快。',
    play: '播放',
    stop: '停止',
    addToHomeScreen: '添加到主屏幕',
    evidenceTitle: '说明与论文',
    platformTitle: 'PWA 与设备差异',
    simpleExplanationTitle: '简短说明',
    volumeLabel: '音量',
    timerLabel: '计时器',
    timerOff: '关闭'
  },
  es: {
    appName: 'Noise Maker',
    appTagline: 'Simple, tranquilo, solo el sonido que quieres.',
    install: 'Agregar a pantalla de inicio',
    installHint: 'Agregarla a la pantalla de inicio acelera el inicio.',
    play: 'Reproducir',
    stop: 'Detener',
    addToHomeScreen: 'Agregar a pantalla de inicio',
    evidenceTitle: 'Explicación y estudios',
    platformTitle: 'PWA y diferencias de plataforma',
    simpleExplanationTitle: 'Explicación breve',
    volumeLabel: 'Volumen',
    timerLabel: 'Temporizador',
    timerOff: 'Desactivado'
  },
  hi: {
    appName: 'Noise Maker',
    appTagline: 'सरल, शांत, बस वही ध्वनि जो आप सुनना चाहें।',
    install: 'होम स्क्रीन पर जोड़ें',
    installHint: 'होम स्क्रीन पर जोड़ने से ऐप जल्दी खुलता है।',
    play: 'चलाएँ',
    stop: 'रोकें',
    addToHomeScreen: 'होम स्क्रीन पर जोड़ें',
    evidenceTitle: 'व्याख्या और शोध पत्र',
    platformTitle: 'PWA और प्लेटफ़ॉर्म अंतर',
    simpleExplanationTitle: 'संक्षिप्त व्याख्या',
    volumeLabel: 'आवाज़',
    timerLabel: 'टाइमर',
    timerOff: 'बंद'
  },
  bn: {
    appName: 'Noise Maker',
    appTagline: 'সহজ, শান্ত, শুধু আপনার পছন্দের শব্দ।',
    install: 'হোম স্ক্রিনে যোগ করুন',
    installHint: 'হোম স্ক্রিনে যোগ করলে দ্রুত চালু হবে।',
    play: 'চালু',
    stop: 'বন্ধ',
    addToHomeScreen: 'হোম স্ক্রিনে যোগ করুন',
    evidenceTitle: 'ব্যাখ্যা ও গবেষণা',
    platformTitle: 'PWA ও প্ল্যাটফর্ম পার্থক্য',
    simpleExplanationTitle: 'সংক্ষিপ্ত ব্যাখ্যা',
    volumeLabel: 'ভলিউম',
    timerLabel: 'টাইমার',
    timerOff: 'বন্ধ'
  },
  pt: {
    appName: 'Noise Maker',
    appTagline: 'Simples e calmo, apenas o som que voce quer ouvir.',
    install: 'Adicionar a tela inicial',
    installHint: 'Adicionar a tela inicial deixa a abertura mais rapida.',
    play: 'Reproduzir',
    stop: 'Parar',
    addToHomeScreen: 'Adicionar a tela inicial',
    evidenceTitle: 'Explicacao e artigos',
    platformTitle: 'PWA e diferencas de plataforma',
    simpleExplanationTitle: 'Explicacao curta',
    volumeLabel: 'Volume',
    timerLabel: 'Temporizador',
    timerOff: 'Desligado'
  },
  ru: {
    appName: 'Noise Maker',
    appTagline: 'Просто, спокойно, только нужный вам звук.',
    install: 'Добавить на главный экран',
    installHint: 'Добавление на главный экран ускоряет запуск.',
    play: 'Воспроизвести',
    stop: 'Остановить',
    addToHomeScreen: 'Добавить на главный экран',
    evidenceTitle: 'Объяснение и статьи',
    platformTitle: 'PWA и различия платформ',
    simpleExplanationTitle: 'Краткое объяснение',
    volumeLabel: 'Громкость',
    timerLabel: 'Таймер',
    timerOff: 'Выкл'
  },
  yue: {
    appName: 'Noise Maker',
    appTagline: '簡單、寧靜，只播你想聽嘅聲音。',
    install: '加入主畫面',
    installHint: '加入主畫面之後，啟動會更快。',
    play: '播放',
    stop: '停止',
    addToHomeScreen: '加入主畫面',
    evidenceTitle: '說明同論文',
    platformTitle: 'PWA 同平台差異',
    simpleExplanationTitle: '簡短說明',
    volumeLabel: '音量',
    timerLabel: '計時器',
    timerOff: '關閉'
  },
  vi: {
    appName: 'Noise Maker',
    appTagline: 'Don gian, yen tinh, chi phat am thanh ban muon nghe.',
    install: 'Them vao man hinh chinh',
    installHint: 'Them vao man hinh chinh giup mo nhanh hon.',
    play: 'Phat',
    stop: 'Dung',
    addToHomeScreen: 'Them vao man hinh chinh',
    evidenceTitle: 'Giai thich va bai bao',
    platformTitle: 'PWA va khac biet nen tang',
    simpleExplanationTitle: 'Giai thich ngan',
    volumeLabel: 'Am luong',
    timerLabel: 'Hen gio',
    timerOff: 'Tat'
  },
  mr: {
    appName: 'Noise Maker',
    appTagline: 'सोपे, शांत, फक्त तुम्हाला हवे तेच आवाज.',
    install: 'होम स्क्रीनवर जोडा',
    installHint: 'होम स्क्रीनवर जोडल्यास अॅप लवकर उघडते.',
    play: 'प्ले',
    stop: 'थांबवा',
    addToHomeScreen: 'होम स्क्रीनवर जोडा',
    evidenceTitle: 'स्पष्टीकरण आणि संदर्भ',
    platformTitle: 'PWA आणि प्लॅटफॉर्म फरक',
    simpleExplanationTitle: 'संक्षिप्त स्पष्टीकरण',
    volumeLabel: 'आवाज',
    timerLabel: 'टायमर',
    timerOff: 'बंद'
  },
  te: {
    appName: 'Noise Maker',
    appTagline: 'సరళంగా, ప్రశాంతంగా, మీకు కావలసిన శబ్దమే.',
    install: 'హోమ్ స్క్రీన్‌కు చేర్చు',
    installHint: 'హోమ్ స్క్రీన్‌కు చేర్చితే యాప్ త్వరగా తెరుచుకుంటుంది.',
    play: 'ప్లే',
    stop: 'ఆపు',
    addToHomeScreen: 'హోమ్ స్క్రీన్‌కు చేర్చు',
    evidenceTitle: 'వివరణ మరియు పత్రాలు',
    platformTitle: 'PWA మరియు ప్లాట్‌ఫార్మ్ తేడాలు',
    simpleExplanationTitle: 'సంక్షిప్త వివరణ',
    volumeLabel: 'వాల్యూం',
    timerLabel: 'టైమర్',
    timerOff: 'ఆఫ్'
  },
  tr: {
    appName: 'Noise Maker',
    appTagline: 'Basit, sakin, sadece duymak istedigin ses.',
    install: 'Ana ekrana ekle',
    installHint: 'Ana ekrana eklemek daha hizli acilis saglar.',
    play: 'Oynat',
    stop: 'Durdur',
    addToHomeScreen: 'Ana ekrana ekle',
    evidenceTitle: 'Aciklama ve makaleler',
    platformTitle: 'PWA ve platform farklari',
    simpleExplanationTitle: 'Kisa aciklama',
    volumeLabel: 'Ses',
    timerLabel: 'Zamanlayici',
    timerOff: 'Kapali'
  },
  ko: {
    appName: 'Noise Maker',
    appTagline: '간단하고 조용하게, 원하는 소리만.',
    install: '홈 화면에 추가',
    installHint: '홈 화면에 추가하면 더 빠르게 실행됩니다.',
    play: '재생',
    stop: '정지',
    addToHomeScreen: '홈 화면에 추가',
    evidenceTitle: '설명과 논문',
    platformTitle: 'PWA 및 플랫폼 차이',
    simpleExplanationTitle: '짧은 설명',
    volumeLabel: '볼륨',
    timerLabel: '타이머',
    timerOff: '끔'
  },
  pa: {
    appName: 'Noise Maker',
    appTagline: 'ਸੌਖਾ, ਸ਼ਾਂਤ, ਸਿਰਫ ਉਹੀ ਆਵਾਜ਼ ਜੋ ਤੁਸੀਂ ਸੁਣਨਾ ਚਾਹੋ।',
    install: 'ਹੋਮ ਸਕ੍ਰੀਨ ਤੇ ਜੋੜੋ',
    installHint: 'ਹੋਮ ਸਕ੍ਰੀਨ ਤੇ ਜੋੜਨ ਨਾਲ ਐਪ ਜਲਦੀ ਖੁਲਦਾ ਹੈ।',
    play: 'ਚਲਾਓ',
    stop: 'ਰੋਕੋ',
    addToHomeScreen: 'ਹੋਮ ਸਕ੍ਰੀਨ ਤੇ ਜੋੜੋ',
    evidenceTitle: 'ਵਿਆਖਿਆ ਅਤੇ ਲੇਖ',
    platformTitle: 'PWA ਅਤੇ ਪਲੇਟਫਾਰਮ ਅੰਤਰ',
    simpleExplanationTitle: 'ਛੋਟੀ ਵਿਆਖਿਆ',
    volumeLabel: 'ਆਵਾਜ਼',
    timerLabel: 'ਟਾਈਮਰ',
    timerOff: 'ਬੰਦ'
  },
  ta: {
    appName: 'Noise Maker',
    appTagline: 'எளிதாக, அமைதியாக, உங்களுக்கு வேண்டிய ஒலி மட்டும்.',
    install: 'முதற்பக்கத்தில் சேர்க்க',
    installHint: 'முதற்பக்கத்தில் சேர்த்தால் விரைவாக திறக்கும்.',
    play: 'இயக்கு',
    stop: 'நிறுத்து',
    addToHomeScreen: 'முதற்பக்கத்தில் சேர்க்க',
    evidenceTitle: 'விளக்கம் மற்றும் ஆய்வுகள்',
    platformTitle: 'PWA மற்றும் தளம் வேறுபாடுகள்',
    simpleExplanationTitle: 'சுருக்கமான விளக்கம்',
    volumeLabel: 'ஒலி அளவு',
    timerLabel: 'டைமர்',
    timerOff: 'ஆஃப்'
  },
  jv: {
    appName: 'Noise Maker',
    appTagline: 'Prasaja lan anteng, mung swara sing arep kok rungokke.',
    install: 'Tambahna menyang layar ngarep',
    installHint: 'Yen ditambah menyang layar ngarep, mbukak app luwih cepet.',
    play: 'Puter',
    stop: 'Mandheg',
    addToHomeScreen: 'Tambahna menyang layar ngarep',
    evidenceTitle: 'Panjelasan lan artikel',
    platformTitle: 'PWA lan bedane platform',
    simpleExplanationTitle: 'Panjelasan cekak',
    volumeLabel: 'Volume',
    timerLabel: 'Timer',
    timerOff: 'Mati'
  },
  it: {
    appName: 'Noise Maker',
    appTagline: 'Semplice e tranquillo, solo il suono che vuoi ascoltare.',
    install: 'Aggiungi alla schermata Home',
    installHint: 'Aggiungendola alla Home, si avvia piu rapidamente.',
    play: 'Riproduci',
    stop: 'Ferma',
    addToHomeScreen: 'Aggiungi alla schermata Home',
    evidenceTitle: 'Spiegazione e studi',
    platformTitle: 'PWA e differenze di piattaforma',
    simpleExplanationTitle: 'Spiegazione breve',
    volumeLabel: 'Volume',
    timerLabel: 'Timer',
    timerOff: 'Off'
  },
  fr: {
    appName: 'Noise Maker',
    appTagline: 'Simple et calme, uniquement le son que vous voulez.',
    install: 'Ajouter a l ecran d accueil',
    installHint: 'L ajout a l ecran d accueil accelere le lancement.',
    play: 'Lire',
    stop: 'Arreter',
    addToHomeScreen: 'Ajouter a l ecran d accueil',
    evidenceTitle: 'Explication et etudes',
    platformTitle: 'PWA et differences de plateforme',
    simpleExplanationTitle: 'Explication courte',
    volumeLabel: 'Volume',
    timerLabel: 'Minuteur',
    timerOff: 'Off'
  },
  de: {
    appName: 'Noise Maker',
    appTagline: 'Einfach und ruhig, nur der Klang, den du horen willst.',
    install: 'Zum Startbildschirm hinzufugen',
    installHint: 'Mit Startbildschirm startet die App schneller.',
    play: 'Abspielen',
    stop: 'Stoppen',
    addToHomeScreen: 'Zum Startbildschirm hinzufugen',
    evidenceTitle: 'Erklarung und Studien',
    platformTitle: 'PWA und Plattformunterschiede',
    simpleExplanationTitle: 'Kurze Erklarung',
    volumeLabel: 'Lautstarke',
    timerLabel: 'Timer',
    timerOff: 'Aus'
  },
  id: {
    appName: 'Noise Maker',
    appTagline: 'Sederhana dan tenang, hanya suara yang ingin kamu dengar.',
    install: 'Tambahkan ke layar utama',
    installHint: 'Menambahkan ke layar utama membuat aplikasi lebih cepat dibuka.',
    play: 'Putar',
    stop: 'Hentikan',
    addToHomeScreen: 'Tambahkan ke layar utama',
    evidenceTitle: 'Penjelasan dan studi',
    platformTitle: 'PWA dan perbedaan platform',
    simpleExplanationTitle: 'Penjelasan singkat',
    volumeLabel: 'Volume',
    timerLabel: 'Timer',
    timerOff: 'Mati'
  }
};

export function resolveLocalizedText(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en ?? text.ja;
}

function resolveLocalizedList(list: LocalizedList, locale: Locale): string[] {
  return list[locale] ?? list.en ?? list.ja;
}

export const noiseTypes: Array<{
  key: NoiseType;
  label: LocalizedText;
  short: LocalizedText;
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
  label: LocalizedText;
  effect: LocalizedText;
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

const platformNotes: LocalizedList = {
  ja: ['iOS はブラウザの制限が強く、バックグラウンド再生は OS の状態に左右されます。', 'Android は PWA と Media Session が比較的素直に動きますが、省電力設定で止まることがあります。', 'Desktop は最も安定しますが、タブを閉じると当然停止します。'],
  en: ['iOS has stricter browser limits, so background playback still depends on OS behavior.', 'Android usually handles PWA and Media Session well, but battery optimization can still interrupt playback.', 'Desktop is the most stable, though closing the tab will stop playback as expected.']
};

export function getPlatformNotes(locale: Locale): string[] {
  return resolveLocalizedList(platformNotes, locale);
}

export const timerOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60] as const;

export function getNoiseLabel(locale: Locale, key: NoiseType): string {
  const item = noiseTypes.find((noiseType) => noiseType.key === key);
  return item ? resolveLocalizedText(item.label, locale) : key;
}