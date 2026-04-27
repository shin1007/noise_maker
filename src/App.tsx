import { useEffect, useRef, useState } from 'react';
import { binauralBands, copy, evidenceCards, getNoiseLabel, getPlatformNotes, noiseTypes, resolveLocalizedText, timerOptions } from './content';
import { localeMetadata, normalizeLocale, resolveLocaleFromBrowserLang, supportedLocales } from './i18n';
import { clampSettings, NoiseEngine } from './audio/noiseEngine';
import type { Locale, NoiseType } from './types';

const defaultState = {
  noiseType: 'pink' as NoiseType,
  volume: 55,
  binauralEnabled: false,
  baseFrequency: 220,
  differenceFrequency: 6,
  timerMinutes: 30
};

function resolveLocale(): Locale {
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

  const [noiseType, setNoiseType] = useState<NoiseType>(defaultState.noiseType);
  const [volume, setVolume] = useState(defaultState.volume);
  const [binauralEnabled, setBinauralEnabled] = useState(defaultState.binauralEnabled);
  const [baseFrequency, setBaseFrequency] = useState(defaultState.baseFrequency);
  const [differenceFrequency, setDifferenceFrequency] = useState(defaultState.differenceFrequency);
  const [timerMinutes, setTimerMinutes] = useState(defaultState.timerMinutes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNoiseHelpOpen, setIsNoiseHelpOpen] = useState(false);
  const [isBinauralHelpOpen, setIsBinauralHelpOpen] = useState(false);
  const [isInstallHelpOpen, setIsInstallHelpOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const engineRef = useRef<NoiseEngine | null>(null);
  const timerRef = useRef<number | null>(null);

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
  }, [isPlaying, timerMinutes]);

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
      album: getNoiseLabel(locale, noiseType)
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('play', () => {
      void startPlayback();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      void stopPlayback();
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      void stopPlayback();
    });
  }, [isPlaying, locale, noiseType, strings.appName, strings.appTagline]);

  async function startPlayback() {
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
  }

  async function stopPlayback() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRemainingSeconds(null);
    setIsPlaying(false);
    await engineRef.current?.stop();
    engineRef.current = null;
  }

  async function togglePlayback() {
    if (isPlaying) {
      await stopPlayback();
      return;
    }

    await startPlayback();
  }

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

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <div className="hero-meta-row">
            <p className="eyebrow">PWA · Vercel-ready</p>
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
          <div className="hero-actions">
            <div className="title-inline">
              <h1 className="hero-title">{strings.appName}</h1>
              <button
                className="play-icon-button"
                type="button"
                onClick={() => void togglePlayback()}
                aria-label={isPlaying ? strings.stop : strings.play}
                title={isPlaying ? strings.stop : strings.play}
              >
                {isPlaying ? '■' : '▶'}
              </button>
            </div>
            <div className="install-action">
              <button className="secondary-button" type="button" onClick={() => void triggerInstall()}>
                {strings.install}
              </button>
              <button
                type="button"
                className="help-button"
                onClick={() => setIsInstallHelpOpen((current) => !current)}
                aria-expanded={isInstallHelpOpen}
                aria-label={locale === 'ja' ? 'インストール情報を表示' : 'Show installation info'}
              >
                ?
              </button>
            </div>

            {isInstallHelpOpen ? (
              <div className="help-links-panel">
                <div>
                  <p className="help-panel-label">{locale === 'ja' ? 'ホーム画面に追加' : 'Add to home screen'}</p>
                  <p>{strings.installHint}</p>
                </div>

                <div>
                  <p className="help-panel-label">{locale === 'ja' ? 'バックグラウンドでの動作について' : 'About background playback'}</p>
                  <ul className="platform-list compact">
                    {getPlatformNotes(locale).map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
          <p className="lead">{strings.appTagline}</p>
        </div>

        {remainingSeconds !== null ? (
          <div className="status-row">
            <span className="status-pill subtle">{formatRemaining(locale, remainingSeconds)}</span>
          </div>
        ) : null}

        <div className="noise-head">
          <strong>{locale === 'ja' ? 'ノイズタイプ' : 'Noise type'}</strong>
          <button
            type="button"
            className="help-button"
            onClick={() => setIsNoiseHelpOpen((current) => !current)}
            aria-expanded={isNoiseHelpOpen}
            aria-label={locale === 'ja' ? 'ノイズの論文リンクを表示' : 'Show noise papers'}
          >
            ?
          </button>
        </div>

        {isNoiseHelpOpen ? (
          <div className="help-links-panel">
            <p>{locale === 'ja' ? 'ノイズに関する参考論文' : 'References for noise studies'}</p>
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

        <div className="noise-grid hero-noise-grid" role="tablist" aria-label="Noise types">
          {noiseTypes.map((noiseTypeOption) => (
            <button
              key={noiseTypeOption.key}
              type="button"
              className={`noise-chip noise-${noiseTypeOption.key} ${noiseType === noiseTypeOption.key ? 'selected' : ''}`}
              onClick={() => setNoiseType(noiseTypeOption.key)}
              role="tab"
              aria-selected={noiseType === noiseTypeOption.key}
            >
              <strong>{resolveLocalizedText(noiseTypeOption.label, locale)}</strong>
              <span>{resolveLocalizedText(noiseTypeOption.short, locale)}</span>
            </button>
          ))}
        </div>

        <div className="hero-quick-controls">
          <div className="control-group">
            <label>
              <span>{strings.volumeLabel}: {volume}%</span>
              <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
            </label>
          </div>

          <div className="timer-row">
            <label className="timer-slider-wrap">
              <span>
                {strings.timerLabel}: <strong>{timerMinutes}m</strong>
              </span>
              <input
                className="timer-slider"
                type="range"
                min="5"
                max="60"
                step="5"
                value={timerMinutes}
                onChange={(event) => setTimerMinutes(clampTimerValue(Number(event.target.value)))}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="card controls-card">
        <div className="toggle-row">
          <label className="switch">
            <input
              type="checkbox"
              checked={binauralEnabled}
              onChange={(event) => {
                const isEnabled = event.target.checked;
                setBinauralEnabled(isEnabled);
                if (!isEnabled) {
                  setIsBinauralHelpOpen(false);
                }
              }}
            />
            <span>{locale === 'ja' ? 'バイノーラルビート ON' : 'Binaural beats on'}</span>
          </label>
          <button
            type="button"
            className="help-button"
            onClick={() => setIsBinauralHelpOpen((current) => !current)}
            aria-expanded={isBinauralHelpOpen}
            aria-label={locale === 'ja' ? 'バイノーラルビートの説明を表示' : 'Show binaural beat help'}
          >
            ?
          </button>
        </div>

        {isBinauralHelpOpen ? (
          <div className="binaural-help-panel help-links-panel">
            <p>
              {locale === 'ja'
                ? '左右の耳に少し異なる周波数を流し、差分周波数を体感しやすくする機能です。'
                : 'This sends slightly different tones to each ear so the beat difference can be perceived more clearly.'}
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

        {binauralEnabled ? (
          <>
            <div className="frequency-grid">
              <label>
                <span>{locale === 'ja' ? 'ベース周波数' : 'Base frequency'}: {Math.round(baseFrequency)}Hz</span>
                <input type="range" min="40" max="1000" step="1" value={baseFrequency} onChange={(event) => setBaseFrequency(Number(event.target.value) || defaultState.baseFrequency)} />
              </label>
            </div>

            <div className="binaural-guide" aria-live="polite">
              <p className="binaural-current">
                {locale === 'ja' ? '現在の差分周波数の目安' : 'Current beat band'}: <strong>{resolveLocalizedText(activeBinauralBand.label, locale)}</strong>
              </p>
              <ul className="binaural-band-list">
                {binauralBands.map((band) => (
                  <li key={band.key} className={band.key === activeBinauralBand.key ? 'active' : ''}>
                    <button
                      type="button"
                      className={band.key === activeBinauralBand.key ? 'band-button active' : 'band-button'}
                      onClick={() => setDifferenceFrequency(binauralTargetByKey[band.key] ?? differenceFrequency)}
                      aria-pressed={band.key === activeBinauralBand.key}
                    >
                      <strong>{resolveLocalizedText(band.label, locale)} ({binauralTargetByKey[band.key] ?? '-'}Hz)</strong>
                      <span>{resolveLocalizedText(band.effect, locale)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

      </section>

      <footer className="footer-note">
        <p>{locale === 'ja' ? '医療効果を保証するものではありません。用途に合わせて慎重に使ってください。' : 'No medical claims are made. Use it cautiously and fit it to your context.'}</p>
      </footer>
    </main>
  );
}

function formatRemaining(locale: Locale, totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return locale === 'ja' ? `${minutes}分${String(seconds).padStart(2, '0')}秒` : `${minutes}:${String(seconds).padStart(2, '0')}`;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}