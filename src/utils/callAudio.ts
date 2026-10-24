// Vexora Neural Audio & Call Signaling Sound Engine
// Uses Web Audio API for 100% reliable synthesized calling, ringtone, connect, and disconnect sounds
// plus SpeechSynthesis for bidirectional voice responses.

class CallAudioManager {
  private ctx: AudioContext | null = null;
  private ringInterval: number | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isMuted: boolean = false;

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

  // Play outgoing ringing tone (Sonar / Dial tone: 440Hz + 480Hz pulses)
  public playOutgoingRinging() {
    this.stopAllSounds();
    const ctx = this.getContext();

    const playTone = () => {
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 1.6);
        gain.gain.linearRampToValueAtTime(0, now + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.8);
        osc2.stop(now + 1.8);

        this.currentOscillators.push(osc1, osc2);
        this.gainNodes.push(gain);
      } catch (e) {
        console.warn("Audio play tone error:", e);
      }
    };

    playTone();
    this.ringInterval = window.setInterval(playTone, 3500);
  }

  // Play incoming ringtone (High-tech harmonic melody loop)
  public playIncomingRingtone() {
    this.stopAllSounds();
    const ctx = this.getContext();

    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },    // C5
      { freq: 659.25, time: 0.18, dur: 0.15 }, // E5
      { freq: 783.99, time: 0.36, dur: 0.15 }, // G5
      { freq: 1046.50, time: 0.54, dur: 0.3 }, // C6
      { freq: 783.99, time: 0.90, dur: 0.15 }, // G5
      { freq: 1046.50, time: 1.08, dur: 0.4 }, // C6
    ];

    const playMelody = () => {
      try {
        const baseTime = ctx.currentTime;
        notes.forEach(n => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, baseTime + n.time);

          gain.gain.setValueAtTime(0, baseTime + n.time);
          gain.gain.linearRampToValueAtTime(0.2, baseTime + n.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, baseTime + n.time + n.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(baseTime + n.time);
          osc.stop(baseTime + n.time + n.dur + 0.05);

          this.currentOscillators.push(osc);
          this.gainNodes.push(gain);
        });
      } catch (e) {
        console.warn("Incoming ringtone error:", e);
      }
    };

    playMelody();
    this.ringInterval = window.setInterval(playMelody, 2400);

    // Vibration on mobile devices if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch {}
    }
  }

  // Play call connected chime (Ascending success chord)
  public playConnectedChime() {
    this.stopAllSounds();
    const ctx = this.getContext();
    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch (e) {
      console.warn("Connected chime error:", e);
    }
  }

  // Play call ended chime (Descending disconnect tone)
  public playEndedChime() {
    this.stopAllSounds();
    const ctx = this.getContext();
    try {
      const now = ctx.currentTime;
      const notes = [659.25, 523.25, 392]; // E5, C5, G4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {
      console.warn("Ended chime error:", e);
    }
  }

  // Stop all active sounds and intervals
  public stopAllSounds() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    this.currentOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch {}
    });
    this.gainNodes.forEach(g => {
      try { g.disconnect(); } catch {}
    });
    this.currentOscillators = [];
    this.gainNodes = [];
  }

  // Speak voice output through speakers with Web Speech API
  public speakVoice(text: string, lang: 'ar' | 'en' = 'ar', onStart?: () => void, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // cancel previous utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => lang === 'ar' ? v.lang.startsWith('ar') : v.lang.startsWith('en'));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      if (onStart) utterance.onstart = onStart;
      if (onEnd) utterance.onend = onEnd;
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      if (onEnd) onEnd();
      return false;
    }
  }

  public cancelSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const callAudio = new CallAudioManager();
