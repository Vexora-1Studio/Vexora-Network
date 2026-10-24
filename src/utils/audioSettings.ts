// Vexora Audio Engine & Voice Settings System
// Manages volume sliders, mic sensitivity testing, noise suppression, ringtone customization, and SFX synthesizers.

export interface AudioSettingsState {
  masterVolume: number;        // 0 - 100
  callRingtoneVolume: number;  // 0 - 100
  sfxVolume: number;           // 0 - 100
  voiceAssistantVolume: number;// 0 - 100
  ringtoneSound: 'cyberpulse' | 'harmonic' | 'retro' | 'cosmic';
  micSensitivity: number;      // 0.5 - 2.0
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  voicePitch: number;          // 0.5 - 1.5
  voiceRate: number;           // 0.5 - 2.0
  soundEffectsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettingsState = {
  masterVolume: 85,
  callRingtoneVolume: 90,
  sfxVolume: 80,
  voiceAssistantVolume: 90,
  ringtoneSound: 'cyberpulse',
  micSensitivity: 1.0,
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  voicePitch: 1.0,
  voiceRate: 1.0,
  soundEffectsEnabled: true,
  hapticFeedbackEnabled: true
};

const AUDIO_SETTINGS_KEY = 'vexora_audio_settings_v1';

export function loadAudioSettings(): AudioSettingsState {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettingsState) {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Error saving audio settings:", e);
  }
}

class AudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play click / tap UI sound effect
  public playClickSFX(volume = 80) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const gainVal = (volume / 100) * 0.15;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Play notification chime
  public playNotificationSFX(volume = 80) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const freqs = [587.33, 880]; // D5, A5
      const gainVal = (volume / 100) * 0.2;

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {}
  }

  // Play Ringtone Preview according to theme
  public playRingtonePreview(theme: AudioSettingsState['ringtoneSound'], volume = 90) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const gainVal = (volume / 100) * 0.25;

      let notes = [523.25, 659.25, 783.99, 1046.50]; // Cyberpulse default
      if (theme === 'harmonic') notes = [440, 554.37, 659.25, 880];
      if (theme === 'retro') notes = [330, 440, 550, 660];
      if (theme === 'cosmic') notes = [261.63, 392.00, 523.25, 659.25, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = theme === 'retro' ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch {}
  }

  // Speak voice sample using browser SpeechSynthesis
  public speakSample(text: string, lang = 'ar-SA', pitch = 1.0, rate = 1.0) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.pitch = pitch;
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }
}

export const audioEngine = new AudioEngine();
