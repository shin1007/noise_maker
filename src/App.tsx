import { useCallback, useEffect, useRef, useState } from 'react';
import { binauralBands, copy, evidenceCards, getNoiseLabel, getPlatformNotes, noiseTypes, resolveLocalizedText, timerOptions } from './content';
import { localeMetadata, normalizeLocale, resolveLocaleFromBrowserLang, supportedLocales } from './i18n';
import { clampSettings, NoiseEngine } from './audio/noiseEngine';
import type { Locale, NoiseType } from './types';

const STORAGE_KEY = 'noise_maker_settings';

interface UserSettings {
  noiseType: NoiseType;
  volume: number;
  binauralEnabled: boolean;
  baseFrequency: number;
  differenceFrequency: number;
  timerMinutes: number;
}

const defaultState: UserSettings = {
  noiseType: 'pink' as NoiseType,
  volume: 55,
  binauralEnabled: false,
  baseFrequency: 220,
  differenceFrequency: 6,
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

export function App() {
  const [locale, setLocale] = useState<Locale>(() => resolveLocale());
  const strings = copy[locale] ?? copy.en;

  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  
  // Destructure for easy access
  const { noiseType, volume, binauralEnabled, baseFrequency, differenceFrequency, timerMinutes } = settings;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isNoiseHelpOpen, setIsNoiseHelpOpen] = useState(false);
  const [isBinauralHelpOpen, setIsBinauralHelpOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const engineRef = useRef<NoiseEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  // Helper to update specific setting
  const updateSetting = useCallback((key: keyof UserSettings, value: any) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('noise_maker_locale', locale);
  }, [locale]);

  const startPlayback = useCallback(async () => {
    const engine = engineRef.current ?? new NoiseEngine();
    engineRef.current = engine;

    await engine.start(
      clampSettings({
        noiseType,
        volume,
        binauralEnabled,
        baseFrequency,
        differenceFrequency
      })
    );

    setIsPlaying(true);
  }, [baseFrequency, binauralEnabled, differenceFrequency, noiseType, volume]);

  const stopPlayback = useCallback(async () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRemainingSeconds(null);
    setIsPlaying(false);
    await engineRef.current?.stop();
    engineRef.current = null;
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await stopPlayback();
      return;
    }

    await startPlayback();
  }, [isPlaying, startPlayback, stopPlayback]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying && engineRef.current) {
        engineRef.current.update({
          noiseType,
          volume,
          binauralEnabled,
          baseFrequency,
          differenceFrequency
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [baseFrequency, binauralEnabled, differenceFrequency, isPlaying, noiseType, volume]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeMetadata[locale].dir;
    document.title = strings.appName;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', strings.appTagline);
    }
  }, [locale, strings.appName, strings.appTagline]);

  useEffect(() => {
    const beforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', beforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const isLocalPreview = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalPreview) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {
          // Ignore cleanup failures in dev.
        });
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration failures in unsupported or dev contexts.
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRemainingSeconds(null);
      return;
    }

    if (timerMinutes <= 0) {
      return;
    }

    const totalSeconds = timerMinutes * 60;
    setRemainingSeconds(totalSeconds);
    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds === null) {
          return null;
        }

        if (currentSeconds <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          void stopPlayback();
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, stopPlayback, timerMinutes]);

  useEffect(() => {
    if (!isPlaying || !engineRef.current) {
      return;
    }

    engineRef.current.update(
      clampSettings({
        noiseType,
        volume,
        binauralEnabled,
        baseFrequency,
        differenceFrequency
      })
    );
  }, [baseFrequency, binauralEnabled, differenceFrequency, isPlaying, noiseType, volume]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: strings.appName,
      artist: strings.appTagline,
      album: getNoiseLabel(locale, noiseType),
      artwork: [{ src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }]
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    
    // Core MediaSession handlers
    navigator.mediaSession.setActionHandler('play', () => {
      void startPlayback();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      void stopPlayback();
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      void stopPlayback();
    });
  }, [isPlaying, locale, noiseType, startPlayback, stopPlayback, strings.appName, strings.appTagline]);

  async function triggerInstall() {
    if (!installPrompt) {
      setInstallGuideOpen(true);
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function handleLocaleChange(nextLocale: Locale) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLocale);
    window.history.replaceState({}, '', url.toString());
    setLocale(nextLocale);
  }

  const noiseEvidence = evidenceCards.find((card) => card.key === 'noise-colors') ?? evidenceCards[0];
  const binauralEvidence = evidenceCards.find((card) => card.key === 'binaural-beats') ?? evidenceCards[0];
  const binauralTargetByKey: Record<string, number> = {
    delta: 2,
    theta: 6,
    alpha: 10,
    beta: 18,
    gamma: 36
  };
  const activeBinauralBand =
    binauralBands.find((band) => differenceFrequency >= band.min && (band.key === 'gamma' ? differenceFrequency <= band.max : differenceFrequency < band.max)) ??
    binauralBands[1];

  useEffect(() => {
    const colors: Record<NoiseType, string> = {
      white: '#ffffff',
      pink: '#ff94c1',
      brown: '#a97554',
      blue: '#5da5ff',
      violet: '#c683ff'
    };
    const rgbs: Record<NoiseType, string> = {
      white: '255, 255, 255',
      pink: '255, 148, 193',
      brown: '169, 117, 84',
      blue: '93, 165, 255',
      violet: '198, 131, 255'
    };
    document.body.style.setProperty('--accent-color', colors[noiseType]);
    document.body.style.setProperty('--accent-rgb', rgbs[noiseType]);
  }, [noiseType]);

  return (
    <main className="app-shell">
      <section className="hero card">
        <div className="hero-header">
          <div className="hero-meta-row compact">
            <p className="eyebrow">PWA · Global</p>
            <div className="locale-select-wrap">
              <select className="locale-select" value={locale} onChange={(event) => handleLocaleChange(event.target.value as Locale)} aria-label="Language">
                {supportedLocales.map((supportedLocale) => (
                  <option key={supportedLocale} value={supportedLocale}>
                    {localeMetadata[supportedLocale].nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="title-section compact">
            <div className="title-group">
              <div className="title-inline">
                <h1 className="hero-title">{strings.appName}</h1>
                <button
                  className={`play-icon-button ${isPlaying ? 'is-playing' : ''}`}
                  type="button"
                  onClick={() => void togglePlayback()}
                  aria-label={isPlaying ? strings.stop : strings.play}
                  title={isPlaying ? strings.stop : strings.play}
                >
                  <span className="icon">{isPlaying ? '■' : '▶'}</span>
                </button>
              </div>
              <p className="lead">{strings.appTagline}</p>
            </div>
          </div>

          <div className="status-action-row">
            <div className="status-group">
              {remainingSeconds !== null && (
                <span className="status-pill timer-pill">
                  {formatRemaining(locale, remainingSeconds, strings)}
                </span>
              )}
              {isPlaying && (
                <span className="status-pill config-pill">
                  {getNoiseLabel(locale, noiseType)}
                  {binauralEnabled && ` + ${resolveLocalizedText(activeBinauralBand.label, locale).split(' ')[0]}`}
                </span>
              )}
            </div>
            
            <div className="install-action-simple">
              <button className="text-button" type="button" onClick={() => void triggerInstall()}>
                {strings.install}
              </button>
              <button
                type="button"
                className="help-button-small"
                onClick={() => setInstallGuideOpen((current) => !current)}
                aria-expanded={installGuideOpen}
                aria-label={strings.installInfo}
              >
                ?
              </button>
            </div>
          </div>

          {installGuideOpen ? (
            <div className="install-guide-overlay" onClick={() => setInstallGuideOpen(false)}>
              <div className="install-guide-content card" onClick={(e) => e.stopPropagation()}>
                <div className="guide-header">
                  <h2 className="guide-title">{strings.addHome}</h2>
                  <button className="close-guide" onClick={() => setInstallGuideOpen(false)} aria-label="Close">×</button>
                </div>
                
                <div className="guide-body">
                  <div className="guide-section">
                    <h3>iOS (Safari)</h3>
                    <ol>
                      <li>{locale === 'ja' ? 'ブラウザ下の「共有」ボタン（角丸四角から矢印が出ているアイコン）をタップします。' : 'Tap the "Share" button at the bottom of Safari.'}</li>
                      <li>{locale === 'ja' ? 'メニューをスクロールし、「ホーム画面に追加」を選択します。' : 'Scroll down and tap "Add to Home Screen".'}</li>
                      <li>{locale === 'ja' ? '右上の「追加」をタップすれば完了です。' : 'Tap "Add" in the top right corner.'}</li>
                    </ol>
                  </div>
                  
                  <div className="guide-section">
                    <h3>Android (Chrome)</h3>
                    <ol>
                      <li>{locale === 'ja' ? 'ブラウザ右上の「3つの点」アイコンをタップします。' : 'Tap the three dots menu icon in the top right.'}</li>
                      <li>{locale === 'ja' ? '「アプリをインストール」または「ホーム画面に追加」を選択します。' : 'Tap "Install app" or "Add to Home Screen".'}</li>
                    </ol>
                  </div>

                  <div className="guide-section platform-notes-section">
                    <h3>{strings.aboutBackground}</h3>
                    <ul className="platform-list compact">
                      {getPlatformNotes(locale).map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button className="primary-button full-width" onClick={() => setInstallGuideOpen(false)}>
                  {locale === 'ja' ? '閉じる' : 'Got it'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="noise-head">
          <strong>{strings.noiseType}</strong>
          <button
            type="button"
            className="help-button"
            onClick={() => setIsNoiseHelpOpen((current) => !current)}
            aria-expanded={isNoiseHelpOpen}
            aria-label={strings.noisePapers}
          >
            ?
          </button>
        </div>

        {isNoiseHelpOpen ? (
          <div className="help-links-panel">
            <p>{strings.noiseReferences}</p>
            <ul className="paper-list compact">
              {noiseEvidence.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={`noise-grid hero-noise-grid ${isPlaying ? 'is-playing' : ''}`} role="tablist" aria-label="Noise types">
          {noiseTypes.map((noiseTypeOption) => (
            <button
              key={noiseTypeOption.key}
              type="button"
              className={`noise-chip noise-${noiseTypeOption.key} ${noiseType === noiseTypeOption.key ? 'selected' : ''}`}
              onClick={() => updateSetting('noiseType', noiseTypeOption.key)}
              role="tab"
              aria-selected={noiseType === noiseTypeOption.key}
            >
              <strong>{resolveLocalizedText(noiseTypeOption.label, locale)}</strong>
              <span>{resolveLocalizedText(noiseTypeOption.short, locale)}</span>
            </button>
          ))}
        </div>

        <div className="hero-quick-controls">
          <div className="control-stack">
            <div className="control-group">
              <label>
                <div className="label-row">
                  <span className="label-text">{strings.volumeLabel}</span>
                  <span className="value-display">{volume}%</span>
                </div>
                <input type="range" min="0" max="100" value={volume} onChange={(event) => updateSetting('volume', Number(event.target.value))} />
              </label>
            </div>

            <div className="control-group">
              <label>
                <div className="label-row">
                  <span className="label-text">{strings.timerLabel}</span>
                  <span className="value-display">{timerMinutes}{strings.minute}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={timerMinutes}
                  onChange={(event) => updateSetting('timerMinutes', clampTimerValue(Number(event.target.value)))}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="card controls-card">
        <details className="binaural-details" open={binauralEnabled}>
          <summary className="toggle-row">
            <label className="switch" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={binauralEnabled}
                onChange={(event) => {
                  const isEnabled = event.target.checked;
                  updateSetting('binauralEnabled', isEnabled);
                  if (!isEnabled) {
                    setIsBinauralHelpOpen(false);
                  }
                }}
              />
              <span className="binaural-label">{strings.binauralOn}</span>
            </label>
            <button
              type="button"
              className="help-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBinauralHelpOpen((current) => !current);
              }}
              aria-expanded={isBinauralHelpOpen}
              aria-label={strings.binauralHelp}
            >
              ?
            </button>
          </summary>

          <div className="binaural-content">
            {isBinauralHelpOpen ? (
              <div className="binaural-help-panel help-links-panel">
                <p>
                  {strings.binauralDesc}
                </p>
                <ul className="paper-list compact">
                  {binauralEvidence.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="frequency-grid">
              <div className="control-group">
                <label>
                  <div className="label-row">
                    <span className="label-text">{strings.baseFreq}</span>
                    <span className="value-display">{Math.round(baseFrequency)}Hz</span>
                  </div>
                  <input type="range" min="40" max="1000" step="1" value={baseFrequency} onChange={(event) => updateSetting('baseFrequency', Number(event.target.value) || defaultState.baseFrequency)} />
                </label>
              </div>
            </div>

            <div className="binaural-guide" aria-live="polite">
              <p className="binaural-current">
                {strings.currentBand}: <strong>{resolveLocalizedText(activeBinauralBand.label, locale)}</strong>
              </p>
              <ul className="binaural-band-list">
                {binauralBands.map((band) => (
                  <li key={band.key}>
                    <button
                      type="button"
                      className={`band-button ${band.key === activeBinauralBand.key ? 'active' : ''}`}
                      onClick={() => updateSetting('differenceFrequency', binauralTargetByKey[band.key] ?? differenceFrequency)}
                      aria-pressed={band.key === activeBinauralBand.key}
                    >
                      <strong>{resolveLocalizedText(band.label, locale)} ({binauralTargetByKey[band.key] ?? '-'}Hz)</strong>
                      <span>{resolveLocalizedText(band.effect, locale)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </section>

      <footer className="footer-note">
        <p>{strings.footerNote}</p>
      </footer>
    </main>
  );
}

function formatRemaining(locale: Locale, totalSeconds: number, strings: any): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (locale === 'ja' || locale === 'zh-Hans' || locale === 'yue' || locale === 'ko') {
    return `${minutes}${strings.minute}${String(seconds).padStart(2, '0')}${strings.second}`;
  }
  
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
