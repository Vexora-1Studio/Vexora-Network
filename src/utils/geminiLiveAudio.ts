// Real-Time Audio Utilities for Gemini Live API (gemini-3.1-flash-live-preview)
// Handles 16kHz PCM audio capture & encoding, and 24kHz PCM audio playback queue

export function float32ToPcm16Base64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert float -1.0..1.0 to 16-bit signed integer Little-Endian
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(i * 2, val, true);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunking to prevent max call stack
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

export function base64ToPcmFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7FFF);
  }
  
  return float32;
}

export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  private activeSources: AudioBufferSourceNode[] = [];
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private onLevelCallback: ((level: number) => void) | null = null;
  private animationFrameId: number | null = null;

  constructor(onLevel?: (level: number) => void) {
    this.onLevelCallback = onLevel || null;
  }

  private initContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      
      this.gainNode = this.audioCtx.createGain();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.startLevelLoop();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private startLevelLoop() {
    if (!this.analyserNode || !this.onLevelCallback) return;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const tick = () => {
      if (!this.analyserNode || !this.onLevelCallback) return;
      this.analyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      this.onLevelCallback(Math.min(100, Math.round(avg * 2.5)));
      this.animationFrameId = requestAnimationFrame(tick);
    };
    tick();
  }

  public playChunk(base64Pcm: string) {
    this.initContext();
    if (!this.audioCtx || !this.gainNode) return;

    try {
      const float32 = base64ToPcmFloat32(base64Pcm);
      const audioBuffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      const currentTime = this.audioCtx.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.activeSources.push(source);
      this.isPlaying = true;

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx > -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0) {
          this.isPlaying = false;
        }
      };
    } catch (e) {
      console.error("Error playing audio chunk:", e);
    }
  }

  public stop() {
    this.activeSources.forEach(s => {
      try { s.stop(); s.disconnect(); } catch {}
    });
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    }
    this.isPlaying = false;
    if (this.onLevelCallback) {
      this.onLevelCallback(0);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(2, volume));
    }
  }

  public close() {
    this.stop();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch {}
      this.audioCtx = null;
    }
  }
}

export class LiveAudioRecorder {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private onChunkCallback: (base64Chunk: string) => void;
  private onLevelCallback?: (level: number) => void;
  private isRecording: boolean = false;
  private animationFrameId: number | null = null;

  constructor(
    onChunk: (base64Chunk: string) => void,
    onLevel?: (level: number) => void
  ) {
    this.onChunkCallback = onChunk;
    this.onLevelCallback = onLevel;
  }

  public async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;

      // 2048 buffer size gives ~128ms packets at 16kHz
      this.processor = this.audioCtx.createScriptProcessor(2048, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const base64 = float32ToPcm16Base64(inputData);
        this.onChunkCallback(base64);
      };

      this.source.connect(this.analyser);
      this.analyser.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);

      this.isRecording = true;
      this.startLevelLoop();
      return true;
    } catch (e) {
      console.error("Failed to start LiveAudioRecorder:", e);
      return false;
    }
  }

  private startLevelLoop() {
    if (!this.analyser || !this.onLevelCallback) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const tick = () => {
      if (!this.analyser || !this.onLevelCallback || !this.isRecording) return;
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      this.onLevelCallback(Math.min(100, Math.round(avg * 2.8)));
      this.animationFrameId = requestAnimationFrame(tick);
    };
    tick();
  }

  public stop() {
    this.isRecording = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.processor) {
      try { this.processor.disconnect(); } catch {}
      this.processor = null;
    }
    if (this.source) {
      try { this.source.disconnect(); } catch {}
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch {}
      this.audioCtx = null;
    }
    if (this.onLevelCallback) {
      this.onLevelCallback(0);
    }
  }
}
