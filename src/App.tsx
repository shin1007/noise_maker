import { useEffect, useRef, useState } from 'react';
import { copy, evidenceCards, getNoiseLabel, noiseTypes, platformNotes, timerOptions } from './content';
import { clampSettings, NoiseEngine } from './audio/noiseEngine';
import type { Locale, NoiseType } from './types';

const defaultState = {
  noiseType: 'pink' as NoiseType,
  volume: 55,
  binauralEnabled: false,
  baseFrequency: 220,
  differenceFrequency: 6,
  timerMinutes: 0
};

function resolveLocale(): Locale {
  const urlLocale = new URLSearchParams(window.location.search).get('lang');
  if (urlLocale === 'ja' || urlLocale === 'en') {
    return urlLocale;
  }

  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

function clampTimerValue(value: number): number {
  return timerOptions.includes(value as 0 | 15 | 30 | 60) ? value : 0;
}

export function App() {
  const locale = resolveLocale();
  const strings = copy[locale];

  const [noiseType, setNoiseType] = useState<NoiseType>(defaultState.noiseType);
  const [volume, setVolume] = useState(defaultState.volume);
  const [binauralEnabled, setBinauralEnabled] = useState(defaultState.binauralEnabled);
  const [baseFrequency, setBaseFrequency] = useState(defaultState.baseFrequency);
  const [differenceFrequency, setDifferenceFrequency] = useState(defaultState.differenceFrequency);
  const [timerMinutes, setTimerMinutes] = useState(defaultState.timerMinutes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [selectedEvidenceKey, setSelectedEvidenceKey] = useState(evidenceCards[0].key);
  const engineRef = useRef<NoiseEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
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

  const activeEvidence = evidenceCards.find((card) => card.key === selectedEvidenceKey) ?? evidenceCards[0];

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">PWA · Vercel-ready</p>
          <h1>{strings.appName}</h1>
          <p className="lead">{strings.appTagline}</p>
        </div>

        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={() => void togglePlayback()}>
            {isPlaying ? strings.stop : strings.play}
          </button>
          <button className="secondary-button" type="button" onClick={() => void triggerInstall()}>
            {strings.install}
          </button>
        </div>

        <div className="status-row">
          <span className={`status-pill ${isPlaying ? 'is-active' : ''}`}>{isPlaying ? 'Playing' : 'Stopped'}</span>
          <span className="status-pill subtle">{remainingSeconds !== null ? formatRemaining(locale, remainingSeconds) : strings.installHint}</span>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>{strings.simpleExplanationTitle}</h2>
          <p>「今すぐ使えること」と「研究の強さ」を分けて表示します。</p>
        </div>

        <div className="noise-grid" role="tablist" aria-label="Noise types">
          {noiseTypes.map((noiseTypeOption) => (
            <button
              key={noiseTypeOption.key}
              type="button"
              className={`noise-chip ${noiseType === noiseTypeOption.key ? 'selected' : ''}`}
              onClick={() => setNoiseType(noiseTypeOption.key)}
              role="tab"
              aria-selected={noiseType === noiseTypeOption.key}
            >
              <strong>{noiseTypeOption.label[locale]}</strong>
              <span>{noiseTypeOption.short[locale]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card controls-card">
        <div className="control-group">
          <label>
            <span>Volume</span>
            <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
            <strong>{volume}%</strong>
          </label>
        </div>

        <div className="toggle-row">
          <label className="switch">
            <input type="checkbox" checked={binauralEnabled} onChange={(event) => setBinauralEnabled(event.target.checked)} />
            <span>{locale === 'ja' ? 'バイノーラルビート ON' : 'Binaural beats on'}</span>
          </label>
        </div>

        <div className="frequency-grid" aria-disabled={!binauralEnabled}>
          <label>
            <span>{locale === 'ja' ? 'ベース周波数' : 'Base frequency'}</span>
            <input type="number" min="40" max="1000" step="1" value={baseFrequency} onChange={(event) => setBaseFrequency(Number(event.target.value) || defaultState.baseFrequency)} disabled={!binauralEnabled} />
          </label>
          <label>
            <span>{locale === 'ja' ? '差分周波数' : 'Beat frequency'}</span>
            <input type="number" min="0" max="40" step="0.5" value={differenceFrequency} onChange={(event) => setDifferenceFrequency(Number(event.target.value) || defaultState.differenceFrequency)} disabled={!binauralEnabled} />
          </label>
        </div>

        <div className="timer-row">
          <span>{strings.timerLabel}</span>
          <div className="timer-pills">
            {timerOptions.map((timerOption) => (
              <button key={timerOption} type="button" className={timerMinutes === timerOption ? 'pill selected' : 'pill'} onClick={() => setTimerMinutes(clampTimerValue(timerOption))}>
                {timerOption === 0 ? strings.timerOff : `${timerOption}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="action-row">
          <button className="primary-button" type="button" onClick={() => void togglePlayback()}>{isPlaying ? strings.stop : strings.play}</button>
          <button className="secondary-button" type="button" onClick={() => void stopPlayback()}>{strings.stop}</button>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>{strings.evidenceTitle}</h2>
          <p>説明は短く、詳細はリンク先で確認できる二層構造です。</p>
        </div>

        <div className="evidence-selector" role="tablist" aria-label="Evidence sections">
          {evidenceCards.map((card) => (
            <button key={card.key} type="button" className={selectedEvidenceKey === card.key ? 'pill selected' : 'pill'} onClick={() => setSelectedEvidenceKey(card.key)}>
              {card.title[locale]}
            </button>
          ))}
        </div>

        <article className="evidence-panel">
          <div className="evidence-panel-head">
            <h3>{activeEvidence.title[locale]}</h3>
            <span className={`evidence-badge strength-${activeEvidence.strength.toLowerCase()}`}>{activeEvidence.strength}</span>
          </div>
          <p>{activeEvidence.summary[locale]}</p>
          <p className="caution">{activeEvidence.caveat[locale]}</p>
          <ul className="paper-list">
            {activeEvidence.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>{strings.platformTitle}</h2>
          <p>実装上の制約を先に明記して、期待値をずらしません。</p>
        </div>

        <ul className="platform-list">
          {platformNotes[locale].map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <div className="install-guide">
          <button className="secondary-button" type="button" onClick={() => setInstallGuideOpen((current) => !current)}>{strings.addToHomeScreen}</button>
          {installGuideOpen ? (
            <div className="guide-panel">
              <p>{locale === 'ja' ? 'Chrome/Android では「インストール」ボタン、iPhone では共有メニューから「ホーム画面に追加」を使ってください。' : 'Use the Install button on Chrome/Android, or the Share menu on iPhone to add this app to the home screen.'}</p>
            </div>
          ) : null}
        </div>
      </section>

      <footer className="footer-note">
        <p>{locale === 'ja' ? '医療効果は断定しません。用途に合わせて慎重に使ってください。' : 'No medical claims are made. Use it cautiously and fit it to your context.'}</p>
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