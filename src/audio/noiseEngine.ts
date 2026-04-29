import type { AudioMode, NoiseType } from '../types';

export interface AudioSettings {
  noiseType: NoiseType;
  volume: number;
  beatEnabled: boolean;
  beatMode: AudioMode;
  baseFrequency: number;
  differenceFrequency: number;
}

const workletSource = `class NoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.type = 'white';
    this.state = { pinkB0: 0, pinkB1: 0, pinkB2: 0, pinkB3: 0, pinkB4: 0, pinkB5: 0, pinkB6: 0, brown: 0, previousWhite: 0, previousWhite2: 0, seed: 0x12345678 };
    this.port.onmessage = (event) => { if (event.data && typeof event.data.type === 'string') { this.type = event.data.type; } };
  }
  random() {
    let value = this.state.seed;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state.seed = value;
    return (value >>> 0) / 4294967295;
  }
  createSample() {
    const white = this.random() * 2 - 1;
    if (this.type === 'pink') {
      const state = this.state;
      state.pinkB0 = 0.99886 * state.pinkB0 + white * 0.0555179;
      state.pinkB1 = 0.99332 * state.pinkB1 + white * 0.0750759;
      state.pinkB2 = 0.96900 * state.pinkB2 + white * 0.1538520;
      state.pinkB3 = 0.86650 * state.pinkB3 + white * 0.3104856;
      state.pinkB4 = 0.55000 * state.pinkB4 + white * 0.5329522;
      state.pinkB5 = -0.7616 * state.pinkB5 - white * 0.0168980;
      const pink = state.pinkB0 + state.pinkB1 + state.pinkB2 + state.pinkB3 + state.pinkB4 + state.pinkB5 + state.pinkB6 + white * 0.5362;
      state.pinkB6 = white * 0.115926;
      return pink * 0.11;
    }
    if (this.type === 'brown') {
      const state = this.state;
      state.brown = (state.brown + white * 0.02) / 1.02;
      return Math.max(-1, Math.min(1, state.brown * 3.5));
    }
    if (this.type === 'blue') {
      const state = this.state;
      const blue = white - state.previousWhite;
      state.previousWhite = white;
      return blue * 0.5;
    }
    if (this.type === 'violet') {
      const state = this.state;
      const violet = white - 2 * state.previousWhite + state.previousWhite2;
      state.previousWhite2 = state.previousWhite;
      state.previousWhite = white;
      return violet * 0.35;
    }
    if (this.type === 'off') {
      return 0;
    }
    return white * 0.28;
  }
  process(inputs, outputs) {
    const output = outputs[0];
    const left = output[0];
    const right = output[1] ?? output[0];
    for (let index = 0; index < left.length; index += 1) {
      const sample = this.createSample();
      left[index] = sample;
      right[index] = sample;
    }
    return true;
  }
}
registerProcessor('noise-processor', NoiseProcessor);`;

// 1x1 pixel silent MP4 video
const SILENT_VIDEO = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAAAAGlzb21hdmMxcAAAAAAgbW9vdgAAAGxtdmhkAAAAAM7pI7HO6SOxAAACWAAAAnEAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAcbWRhdAAAAAAAAAAYAHByaW1lIGZsdXNoZWQAAAAAAAAnYXZjY0ABAAz/4AArZGF0YTptZDRhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7AAAAAAt0cmFrawAAAFx0a2hkAAAAAs7pI7HO6SOxAAAAAQAAAAAAAAnEAAAAAAAAAAAAAAAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAABAG1kaWEAAAAgbWRoZAAAAADO6SOxzukjsQAAAlgAAAJxAFh9AAAAMWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABQ21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAxtZDAAAAAAAAAAAAAAAAAAAACUc3RibAAAAGRzdHNkAAAAAAAAAAEAAABUYXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAABABIAEgAAAlgAAAJxAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAACVzdHRzAAAAAAAAAAEAAAABAAACcQAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABxzdHN6AAAAAAAAAAAAAAABAAABLAAAABRzdGNvAAAAAAAAAAEAAAAwAAAAYXVkZf8AAAAsYXVkaW8vYWFjIAAAAAAAAABhYWMgYXVkaW8gZmlsZQAAAAAAAAAAACR1dWlkAAAAAABYWFhYWFhYWFhYWFhYWFhYWFhYWFhYAAAAAAA=';

// 1 second of silence as a base64 WAV
const SILENCE_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

let cachedWorkletUrl: string | null = null;

function getWorkletUrl(): string {
  if (!cachedWorkletUrl) {
    cachedWorkletUrl = URL.createObjectURL(new Blob([workletSource], { type: 'text/javascript' }));
  }
  return cachedWorkletUrl;
}

export class NoiseEngine {
  private context: AudioContext | null = null;
  private worklet: AudioWorkletNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private leftMix: GainNode | null = null;
  private rightMix: GainNode | null = null;
  private leftToneGain: GainNode | null = null;
  private rightToneGain: GainNode | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private modulator: OscillatorNode | null = null;
  private modulatorGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentSettings: AudioSettings | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isFirstUpdate: boolean = true;

  async start(settings: AudioSettings): Promise<void> {
    this.currentSettings = settings;
    this.isFirstUpdate = true;

    if (!this.context) {
      const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextImpl) {
        throw new Error('AudioContext is not available');
      }

      this.context = new AudioContextImpl({
        latencyHint: 'playback'
      });
      
      // On iOS, we must resume the context immediately in the user gesture
      if (this.context.state === 'suspended') {
        void this.context.resume();
      }

      await this.context.audioWorklet.addModule(getWorkletUrl());
      this.buildGraph();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    if (this.audioElement) {
      // Priming for Safari browser:
      this.audioElement.src = SILENCE_WAV;
      this.audioElement.load();
      await this.audioElement.play().catch(() => {});
      
      await this.audioElement.play().catch((err) => {
        console.error('Audio element playback failed:', err);
      });
    }

    this.update(settings);
  }

  update(settings: AudioSettings): void {
    this.currentSettings = settings;

    if (!this.context || !this.worklet || !this.leftMix || !this.rightMix || !this.leftToneGain || !this.rightToneGain || !this.masterGain) {
      return;
    }

    // Ensure context is running when updating (helps with iOS resuming)
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }

    this.worklet.port.postMessage({ type: settings.noiseType });

    const level = Math.max(0, Math.min(1, settings.volume / 100));
    const noiseLevel = settings.beatEnabled ? level * 0.86 : level;
    const toneLevel = settings.beatEnabled ? level * 0.12 : 0;

    const fadeTime = this.isFirstUpdate ? 1.5 : 0.05;
    if (this.isFirstUpdate) {
      this.masterGain.gain.setValueAtTime(0, this.context.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(1, this.context.currentTime + fadeTime);
      this.isFirstUpdate = false;
    }

    this.leftMix.gain.setTargetAtTime(noiseLevel, this.context.currentTime, 0.05);
    this.rightMix.gain.setTargetAtTime(noiseLevel, this.context.currentTime, 0.05);
    this.leftToneGain.gain.setTargetAtTime(toneLevel, this.context.currentTime, 0.05);
    this.rightToneGain.gain.setTargetAtTime(toneLevel, this.context.currentTime, 0.05);

    if (settings.beatEnabled) {
      this.ensureTones(settings);
    } else {
      this.stopTones();
    }
  }

  async stop(): Promise<void> {
    if (this.context && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0, this.context.currentTime, 0.05);
      // Wait a bit for fade-out before full stop
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.stopTones();

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement.remove();
      this.audioElement = null;
    }

    if (this.worklet) {
      this.worklet.disconnect();
      this.worklet = null;
    }

    this.leftMix?.disconnect();
    this.rightMix?.disconnect();
    this.leftToneGain?.disconnect();
    this.rightToneGain?.disconnect();
    this.merger?.disconnect();
    this.masterGain?.disconnect();

    if (this.context) {
      await this.context.close();
      this.context = null;
    }
  }

  private buildGraph(): void {
    if (!this.context) {
      return;
    }

    this.worklet = new AudioWorkletNode(this.context, 'noise-processor', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
    this.merger = this.context.createChannelMerger(2);
    this.leftMix = this.context.createGain();
    this.rightMix = this.context.createGain();
    this.leftToneGain = this.context.createGain();
    this.rightToneGain = this.context.createGain();
    this.masterGain = this.context.createGain();

    this.worklet.connect(this.leftMix);
    this.worklet.connect(this.rightMix);
    this.leftMix.connect(this.merger, 0, 0);
    this.rightMix.connect(this.merger, 0, 1);
    this.leftToneGain.connect(this.merger, 0, 0);
    this.rightToneGain.connect(this.merger, 0, 1);
    
    this.merger.connect(this.masterGain);

    // Check if we are on iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      const destination = this.context.createMediaStreamDestination();
      this.masterGain.connect(destination);

      this.audioElement = new Audio();
      this.audioElement.srcObject = destination.stream;
      this.audioElement.muted = false;
      this.audioElement.setAttribute('playsinline', '');
      this.audioElement.style.position = 'fixed';
      this.audioElement.style.pointerEvents = 'none';
      this.audioElement.style.opacity = '0.001';
      this.audioElement.style.left = '0';
      this.audioElement.style.top = '0';
      this.audioElement.style.width = '1px';
      this.audioElement.style.height = '1px';
      document.body.appendChild(this.audioElement);
    } else {
      this.masterGain.connect(this.context.destination);
    }
  }

  private ensureTones(settings: AudioSettings): void {
    if (!this.context) {
      return;
    }

    const isEarphone = settings.beatMode === 'earphone';
    const leftFrequency = isEarphone ? Math.max(20, settings.baseFrequency - settings.differenceFrequency / 2) : settings.baseFrequency;
    const rightFrequency = isEarphone ? Math.max(20, settings.baseFrequency + settings.differenceFrequency / 2) : settings.baseFrequency;

    if (!this.leftOscillator) {
      this.leftOscillator = this.context.createOscillator();
      this.leftOscillator.type = 'sine';
      this.leftOscillator.connect(this.leftToneGain!);
      this.leftOscillator.start();
    }

    if (!this.rightOscillator) {
      this.rightOscillator = this.context.createOscillator();
      this.rightOscillator.type = 'sine';
      this.rightOscillator.connect(this.rightToneGain!);
      this.rightOscillator.start();
    }

    this.leftOscillator.frequency.setTargetAtTime(leftFrequency, this.context.currentTime, 0.01);
    this.rightOscillator.frequency.setTargetAtTime(rightFrequency, this.context.currentTime, 0.01);

    if (settings.beatMode === 'speaker') {
      // Isochronic tone logic: Modulate gain with a square wave
      if (!this.modulator) {
        this.modulator = this.context.createOscillator();
        this.modulator.type = 'square';
        this.modulatorGain = this.context.createGain();
        
        // Modulate gain between 0 and 1
        // Modulator outputs -1 to 1. We want 0 to 1.
        // So we add 1 and multiply by 0.5.
        // Actually, we can just connect oscillator to gain param.
        this.modulatorGain.gain.value = 0.5; // DC offset
        const modulationScale = this.context.createGain();
        modulationScale.gain.value = 0.5;
        this.modulator.connect(modulationScale);
        modulationScale.connect(this.modulatorGain.gain);
        
        // Now modulatorGain.gain cycles between 0 and 1
        // We need to insert this into the tone path.
        this.leftToneGain!.disconnect();
        this.rightToneGain!.disconnect();
        this.leftToneGain!.connect(this.modulatorGain);
        this.rightToneGain!.connect(this.modulatorGain);
        this.modulatorGain.connect(this.merger!);

        this.modulator.start();
      }
      this.modulator.frequency.setTargetAtTime(settings.differenceFrequency, this.context.currentTime, 0.01);
    } else {
      // Remove isochronic modulation if exists
      if (this.modulator) {
        this.modulator.stop();
        this.modulator.disconnect();
        this.modulatorGain?.disconnect();
        this.modulator = null;
        this.modulatorGain = null;

        // Reconnect tone gains directly to merger
        this.leftToneGain!.disconnect();
        this.rightToneGain!.disconnect();
        this.leftToneGain!.connect(this.merger!, 0, 0);
        this.rightToneGain!.connect(this.merger!, 0, 1);
      }
    }
  }

  private stopTones(): void {
    this.leftOscillator?.stop();
    this.rightOscillator?.stop();
    this.leftOscillator?.disconnect();
    this.rightOscillator?.disconnect();
    this.leftOscillator = null;
    this.rightOscillator = null;

    if (this.modulator) {
      this.modulator.stop();
      this.modulator.disconnect();
      this.modulatorGain?.disconnect();
      this.modulator = null;
      this.modulatorGain = null;

      // Ensure tone gains are reconnected for next time (though they'll be null anyway)
    }
  }
}

export function clampSettings(settings: AudioSettings): AudioSettings {
  return {
    noiseType: settings.noiseType,
    volume: Math.max(0, Math.min(100, settings.volume)),
    beatEnabled: settings.beatEnabled,
    beatMode: settings.beatMode,
    baseFrequency: Math.max(40, Math.min(1000, settings.baseFrequency)),
    differenceFrequency: Math.max(0, Math.min(40, settings.differenceFrequency))
  };
}