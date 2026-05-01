import { useCallback, useEffect, useRef, useState } from 'react';
import { binauralBands, copy, evidenceCards, getNoiseLabel, getPlatformNotes, noiseTypes, presets, resolveLocalizedText, timerOptions } from './content';
import { localeMetadata, normalizeLocale, resolveLocaleFromBrowserLang, supportedLocales } from './i18n';
import { clampSettings, NoiseEngine, resolveBeatFrequencies } from './audio/noiseEngine';
import type { AudioMode, Locale, NoiseType, Preset } from './types';

const STORAGE_KEY = 'noise_maker_settings';

const solfeggioFrequencies = [174, 285, 396, 417, 440, 528, 639, 741, 852, 963]; // Added 440 for Preset 1

function findNearestSolfeggio(freq: number): number {
  return solfeggioFrequencies.reduce((prev, curr) => Math.abs(curr - freq) < Math.abs(prev - freq) ? curr : prev);
}

interface UserSettings {
  noiseType: NoiseType;
  volume: number;
  beatEnabled: boolean;
  beatMode: AudioMode;
  baseFrequency: number;
  differenceFrequency: number;
  timerMinutes: number;
}

const defaultState: UserSettings = {
  noiseType: 'brown' as NoiseType,
  volume: 55,
  beatEnabled: true,
  beatMode: 'earphone',
  baseFrequency: 528,
  differenceFrequency: 10,
  timerMinutes: 30
};

function loadSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

function resolveLocale(): Locale {
  const savedLocale = localStorage.getItem('noise_maker_locale') as Locale;
  if (savedLocale && supportedLocales.includes(savedLocale)) {
    return savedLocale;
  }

  const urlLocale = normalizeLocale(new URLSearchParams(window.location.search).get('lang'));
  if (urlLocale) {
    return urlLocale;
  }

  return resolveLocaleFromBrowserLang(navigator.language);
}

function clampTimerValue(value: number): number {
  return timerOptions.includes(value as (typeof timerOptions)[number]) ? value : timerOptions[0];
}

function generateMediaArtwork(color: string, symbol?: string): string {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '/icon.svg';

  const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
  bgGrad.addColorStop(0, '#121826');
  bgGrad.addColorStop(1, '#080c14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  ctx.shadowBlur = 20;
  ctx.shadowColor = color;

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.2;
  ctx.fill();

  if (symbol) {
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = color;
    ctx.font = `800 ${size * 0.45}px "Avenir Next", "SF Pro Display", "Hiragino Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, size / 2, size / 2);
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 5) {
      const y = size / 2 + Math.sin(x * 0.04) * 20;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  return canvas.toDataURL('image/jpeg', 0.8);
}

const binauralTargetByKey: Record<string, number> = {
  delta: 2,
  theta: 6,
  alpha: 10,
  beta: 18,
  gamma: 36
};

export function App() {
  const [locale, setLocale] = useState<Locale>(() => resolveLocale());
  const strings = copy[locale] ?? copy.en;

  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const { noiseType, volume, beatEnabled, beatMode, baseFrequency, differenceFrequency, timerMinutes } = settings;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNoiseHelpOpen, setIsNoiseHelpOpen] = useState(false);
  const [isBeatHelpOpen, setIsBeatHelpOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const engineRef = useRef<NoiseEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  const updateSetting = useCallback((key: keyof UserSettings, value: any) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    // Invalidate active preset on manual change
    if (key !== 'volume' && key !== 'timerMinutes') {
      setActivePreset(null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('noise_maker_locale', locale);
  }, [locale]);

  const startPlayback = useCallback(async (overrideSettings?: UserSettings) => {
    const engine = engineRef.current ?? new NoiseEngine();
    engineRef.current = engine;
    const currentToUse = overrideSettings || settings;
    await engine.start(clampSettings(currentToUse));
    setIsPlaying(true);
  }, [settings]);

  const stopPlayback = useCallback(async () => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    setRemainingSeconds(null);
    setIsPlaying(false);
    await engineRef.current?.stop();
    engineRef.current = null;
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) { await stopPlayback(); return; }
    await startPlayback();
  }, [isPlaying, startPlayback, stopPlayback]);

  const applyPreset = useCallback((preset: Preset) => {
    const nextSettings: UserSettings = {
      ...settings,
      noiseType: preset.noiseType,
      baseFrequency: preset.baseFrequency,
      differenceFrequency: binauralTargetByKey[preset.beatBand] ?? settings.differenceFrequency,
      beatEnabled: true
    };
    setSettings(nextSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
    setActivePreset(preset.key);
    if (!isPlaying) void startPlayback(nextSettings);
  }, [isPlaying, settings, startPlayback]);

  useEffect(() => {
    if (isPlaying && engineRef.current) {
      engineRef.current.update(clampSettings(settings));
    }
  }, [settings, isPlaying]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeMetadata[locale].dir;
    document.title = strings.appName;
  }, [locale, strings.appName]);

  useEffect(() => {
    const beforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', beforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', beforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
      setRemainingSeconds(null);
      return;
    }
    if (timerMinutes <= 0) return;
    const totalSeconds = timerMinutes * 60;
    setRemainingSeconds(totalSeconds);
    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds === null) return null;
        if (currentSeconds <= 1) {
          if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
          void stopPlayback();
          return 0;
        }
        return currentSeconds - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } };
  }, [isPlaying, stopPlayback, timerMinutes]);

  const activeBinauralBand =
    binauralBands.find((band) => differenceFrequency >= band.min && (band.key === 'gamma' ? differenceFrequency <= band.max : differenceFrequency < band.max)) ??
    binauralBands[1];

  const activeBeatFrequencies = resolveBeatFrequencies(clampSettings(settings));
  const beatFrequencySummary = beatEnabled
    ? beatMode === 'earphone'
      ? `${formatFrequency(activeBeatFrequencies.leftFrequency)} / ${formatFrequency(activeBeatFrequencies.rightFrequency)}`
      : `${formatFrequency(activeBeatFrequencies.carrierFrequency)} / ${formatFrequency(activeBeatFrequencies.modulatorFrequency)}`
    : '';

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const noiseLabel = getNoiseLabel(locale, noiseType);
    const bandReading = beatEnabled ? resolveLocalizedText(activeBinauralBand.reading, locale) : '';
    const displayTitle = beatEnabled ? `${noiseLabel} + ${bandReading}` : noiseLabel;
    const colors: Record<NoiseType, string> = { white: '#ffffff', pink: '#ff94c1', brown: '#a97554', blue: '#5da5ff', violet: '#c683ff', off: '#444444' };
    navigator.mediaSession.metadata = new MediaMetadata({
      title: displayTitle, artist: strings.appName, album: strings.appTagline,
      artwork: [{ src: generateMediaArtwork(colors[noiseType], beatEnabled ? activeBinauralBand.symbol : ''), sizes: '256x256', type: 'image/jpeg' }]
    });
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('play', () => { void startPlayback(); });
    navigator.mediaSession.setActionHandler('pause', () => { void stopPlayback(); });
    navigator.mediaSession.setActionHandler('stop', () => { void stopPlayback(); });
  }, [activeBinauralBand.reading, activeBinauralBand.symbol, beatEnabled, isPlaying, locale, noiseType, startPlayback, stopPlayback, strings.appName, strings.appTagline]);

  async function triggerInstall() {
    if (!installPrompt) { setInstallGuideOpen(true); return; }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  const noiseEvidence = evidenceCards.find((card) => card.key === 'noise-colors') ?? evidenceCards[0];
  const binauralEvidence = evidenceCards.find((card) => card.key === 'binaural-beats') ?? evidenceCards[0];

  useEffect(() => {
    const colors: Record<NoiseType, string> = { white: '#ffffff', pink: '#ff94c1', brown: '#a97554', blue: '#5da5ff', violet: '#c683ff', off: '#444444' };
    const rgbs: Record<NoiseType, string> = { white: '255, 255, 255', pink: '255, 148, 193', brown: '169, 117, 84', blue: '93, 165, 255', violet: '198, 131, 255', off: '68, 68, 68' };
    document.body.style.setProperty('--accent-color', colors[noiseType]);
    document.body.style.setProperty('--accent-rgb', rgbs[noiseType]);
  }, [noiseType]);

  return (
    <main className="app-shell">
      <section className="hero card">
        <div className="hero-header">
          <div className="hero-meta-row compact">
            <div className="install-action-simple">
              <button className="text-button" type="button" onClick={() => void triggerInstall()}>{strings.install}</button>
            </div>
            <div className="top-right-actions">
              <button className="icon-button settings-gear" onClick={() => setIsSettingsOpen(true)} aria-label={strings.settingsTitle}>⚙️</button>
              <div className="locale-select-wrap">
                <select className="locale-select" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
                  {supportedLocales.map((l) => <option key={l} value={l}>{localeMetadata[l].nativeName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="title-section compact">
            <div className="title-group">
              <div className="title-inline">
                <div className="title-with-symbol">
                  <h1 className="hero-title">{strings.appName}</h1>
                  {beatEnabled && <span className="wave-symbol">{activeBinauralBand.symbol}</span>}
                </div>
                <button className={`play-icon-button ${isPlaying ? 'is-playing' : ''}`} type="button" onClick={() => void togglePlayback()}>
                  <span className="icon">{isPlaying ? '■' : '▶'}</span>
                </button>
              </div>
              <p className="lead">{strings.appTagline}</p>
            </div>
          </div>
        </div>

        <div className="hero-quick-controls">
          <div className="control-stack">
            <div className="control-group">
              <label>
                <div className="label-row">
                  <span className="label-text">{strings.volumeLabel}</span>
                  <div className="value-with-stepper">
                    <button className="step-button" onClick={() => updateSetting('volume', Math.max(0, volume - 1))}>-</button>
                    <span className="value-display">{volume}%</span>
                    <button className="step-button" onClick={() => updateSetting('volume', Math.min(100, volume + 1))}>+</button>
                  </div>
                </div>
                <input type="range" min="0" max="100" value={volume} onChange={(e) => updateSetting('volume', Number(e.target.value))} />
              </label>
            </div>
            <div className="control-group">
              <label>
                <div className="label-row">
                  <span className="label-text">{strings.timerLabel}</span>
                  <div className="timer-values">
                    {remainingSeconds !== null && <span className="status-pill timer-pill">{formatRemaining(locale, remainingSeconds, strings)}</span>}
                    <div className="value-with-stepper">
                      <button className="step-button" onClick={() => updateSetting('timerMinutes', Math.max(0, timerMinutes - 5))}>-</button>
                      <span className="value-display">{timerMinutes}{strings.minute}</span>
                      <button className="step-button" onClick={() => updateSetting('timerMinutes', Math.min(60, timerMinutes + 5))}>+</button>
                    </div>
                  </div>
                </div>
                <input type="range" min="5" max="60" step="5" value={timerMinutes} onChange={(e) => updateSetting('timerMinutes', clampTimerValue(Number(e.target.value)))} />
              </label>
            </div>
          </div>
        </div>

        <div className="presets-section">
          <h2 className="section-title">{strings.presetsTitle}</h2>
          <div className="preset-list">
            {presets.map((preset) => (
              <button key={preset.key} className={`preset-card ${activePreset === preset.key ? 'active' : ''}`} onClick={() => applyPreset(preset)}>
                <div className="preset-info">
                  <strong>{resolveLocalizedText(preset.label, locale)}</strong>
                  <p>{resolveLocalizedText(preset.description, locale)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{strings.settingsTitle}</h2>
              <button className="close-modal" onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="control-section">
                <div className="noise-head">
                  <strong>{strings.noiseType}</strong>
                  <button className="help-button" onClick={() => setIsNoiseHelpOpen(!isNoiseHelpOpen)}>?</button>
                </div>
                {isNoiseHelpOpen && (
                  <div className="help-links-panel">
                    <ul className="paper-list compact">
                      {noiseEvidence.links.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label}</a></li>)}
                    </ul>
                  </div>
                )}
                <div className="noise-grid">
                  {noiseTypes.map((t) => (
                    <button key={t.key} className={`noise-chip noise-${t.key} ${noiseType === t.key ? 'selected' : ''}`} onClick={() => updateSetting('noiseType', t.key)}>
                      <strong>{resolveLocalizedText(t.label, locale)}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-section">
                <div className="toggle-row">
                  <label className="switch">
                    <input type="checkbox" checked={beatEnabled} onChange={(e) => updateSetting('beatEnabled', e.target.checked)} />
                    <span className="binaural-label">{strings.beatOn}</span>
                  </label>
                  <button className="help-button" onClick={() => setIsBeatHelpOpen(!isBeatHelpOpen)}>?</button>
                </div>
                {isBeatHelpOpen && (
                  <div className="help-links-panel">
                    <p>{strings.beatDesc}</p>
                    <ul className="paper-list compact">
                      {binauralEvidence.links.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label}</a></li>)}
                    </ul>
                  </div>
                )}
                <div className="mode-toggle-group">
                  <button className={`mode-button ${beatMode === 'earphone' ? 'active' : ''}`} onClick={() => updateSetting('beatMode', 'earphone')}>{strings.earphoneMode}</button>
                  <button className={`mode-button ${beatMode === 'speaker' ? 'active' : ''}`} onClick={() => updateSetting('beatMode', 'speaker')}>{strings.speakerMode}</button>
                </div>
                {beatEnabled && (
                  <p className="status-pill beat-frequency-pill">
                    {strings.currentBand}: {beatFrequencySummary}
                  </p>
                )}
                <div className="control-group">
                  <label>
                    <div className="label-row">
                      <span className="label-text">{strings.baseFreq}</span>
                      <div className="value-with-stepper">
                        <button className="step-button" onClick={() => updateSetting('baseFrequency', findNearestSolfeggio(baseFrequency - 1))}>-</button>
                        <span className="value-display">{baseFrequency}Hz</span>
                        <button className="step-button" onClick={() => updateSetting('baseFrequency', findNearestSolfeggio(baseFrequency + 1))}>+</button>
                      </div>
                    </div>
                    <input type="range" min="174" max="963" step="1" value={baseFrequency} 
                      onChange={(e) => updateSetting('baseFrequency', findNearestSolfeggio(Number(e.target.value)))} />
                  </label>
                </div>
                <ul className="binaural-band-list compact-grid">
                  {binauralBands.map((band) => (
                    <li key={band.key}>
                      <button className={`band-button ${band.key === activeBinauralBand.key ? 'active' : ''}`} onClick={() => updateSetting('differenceFrequency', binauralTargetByKey[band.key])}>
                        {resolveLocalizedText(band.label, locale)} ({formatFrequency(binauralTargetByKey[band.key])})
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button className="primary-button full-width" onClick={() => setIsSettingsOpen(false)}>{strings.gotIt}</button>
          </div>
        </div>
      )}

      {installGuideOpen && (
        <div className="install-guide-overlay" onClick={() => setInstallGuideOpen(false)}>
          <div className="install-guide-content card" onClick={(e) => e.stopPropagation()}>
            <div className="guide-header"><h2>{strings.addHome}</h2><button className="close-guide" onClick={() => setInstallGuideOpen(false)}>×</button></div>
            <div className="guide-body">
              <div className="guide-section"><h3>iOS (Safari)</h3><ol><li>{strings.iosStep1}</li><li>{strings.iosStep2}</li><li>{strings.iosStep3}</li></ol></div>
              <div className="guide-section"><h3>Android (Chrome)</h3><ol><li>{strings.androidStep1}</li><li>{strings.androidStep2}</li></ol></div>
              <div className="guide-section"><h3>{strings.aboutBackground}</h3><ul className="platform-list compact">{getPlatformNotes(locale).map((n) => <li key={n}>{n}</li>)}</ul></div>
            </div>
            <button className="primary-button full-width" onClick={() => setInstallGuideOpen(false)}>{strings.gotIt}</button>
          </div>
        </div>
      )}

      <footer className="footer-note"><p>{strings.footerNote}</p></footer>
    </main>
  );
}

function formatRemaining(locale: Locale, totalSeconds: number, strings: any): string {
  const m = Math.floor(totalSeconds / 60); const s = totalSeconds % 60;
  if (['ja', 'zh-Hans', 'yue', 'ko'].includes(locale)) return `${m}${strings.minute}${String(s).padStart(2, '0')}${strings.second}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function formatFrequency(value: number): string {
  return Number.isInteger(value) ? `${value}Hz` : `${value.toFixed(1)}Hz`;
}
