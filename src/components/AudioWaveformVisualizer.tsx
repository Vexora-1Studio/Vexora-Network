import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Mic, Square, Trash2, Send, Check } from 'lucide-react';

export interface AudioWaveformVisualizerProps {
  /** Source URL of the audio file or blob */
  audioUrl?: string;
  /** Audio blob directly if available */
  audioBlob?: Blob;
  /** Duration in seconds if known beforehand */
  initialDuration?: number;
  /** Precomputed or static waveform sound intensity array (values from 0.05 to 1.0) */
  amplitudes?: number[];
  /** Theme variant */
  variant?: 'purple' | 'emerald' | 'indigo' | 'amber';
  /** Compact mode for tight message bubbles */
  isCompact?: boolean;
  /** Sender indicator */
  isMe?: boolean;
  /** Title or label */
  title?: string;
  /** Callback when playback starts or stops */
  onPlayStateChange?: (isPlaying: boolean) => void;
  /** Optional language */
  language?: 'ar' | 'en';
}

/**
 * Generate a deterministic sound intensity bar profile if decoded PCM data is not ready
 */
function generateFallbackAmplitudes(seedStr: string, count: number = 32): number[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    // Generate natural-looking speech envelope (rhythmic peaks and valleys)
    const sin1 = Math.sin((i / count) * Math.PI * 3 + hash * 0.1);
    const sin2 = Math.cos((i / count) * Math.PI * 7 + hash * 0.3);
    const noise = Math.abs(Math.sin(hash * 99 + i * 13)) * 0.4;
    const envelope = Math.sin((i / count) * Math.PI); // tapering ends like real voice notes
    
    const rawVal = ((Math.abs(sin1) * 0.4 + Math.abs(sin2) * 0.3 + noise) * envelope) + 0.15;
    const clamped = Math.max(0.12, Math.min(1.0, rawVal));
    result.push(clamped);
  }
  return result;
}

export default function AudioWaveformVisualizer({
  audioUrl,
  audioBlob,
  initialDuration = 0,
  amplitudes: customAmplitudes,
  variant = 'purple',
  isCompact = false,
  isMe = false,
  title,
  onPlayStateChange,
  language = 'ar',
}: AudioWaveformVisualizerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialDuration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const [liveAmplitudes, setLiveAmplitudes] = useState<number[]>([]);
  const [realtimeIntensity, setRealtimeIntensity] = useState<number>(0);

  // Resolved URL from either prop or blob
  const resolvedUrl = useMemo(() => {
    if (audioUrl) return audioUrl;
    if (audioBlob) return URL.createObjectURL(audioBlob);
    return '';
  }, [audioUrl, audioBlob]);

  // Generate fallback or real waveform amplitudes
  const barCount = isCompact ? 24 : 36;
  const defaultAmplitudes = useMemo(() => {
    if (customAmplitudes && customAmplitudes.length > 0) {
      return customAmplitudes;
    }
    return generateFallbackAmplitudes(resolvedUrl || 'voice-note-seed', barCount);
  }, [customAmplitudes, resolvedUrl, barCount]);

  const displayAmplitudes = liveAmplitudes.length === barCount ? liveAmplitudes : defaultAmplitudes;

  // Extract true audio waveform intensity via Web Audio API decodeAudioData
  useEffect(() => {
    if (!resolvedUrl) return;

    let isMounted = true;
    const extractWaveform = async () => {
      try {
        const response = await fetch(resolvedUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        
        const tempCtx = new AudioCtx();
        const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
        
        if (!isMounted) {
          tempCtx.close();
          return;
        }

        if (audioBuffer.duration && (!duration || duration === 0)) {
          setDuration(audioBuffer.duration);
        }

        // Downsample channel data into barCount buckets
        const rawData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(rawData.length / barCount);
        const peaks: number[] = [];

        for (let i = 0; i < barCount; i++) {
          const start = i * blockSize;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            const val = rawData[start + j];
            sum += val * val; // RMS power
          }
          const rms = Math.sqrt(sum / blockSize);
          // Scale logarithmically for better visual dynamic range
          const intensity = Math.min(1.0, Math.max(0.12, Math.pow(rms * 3.5, 0.75)));
          peaks.push(intensity);
        }

        if (isMounted) {
          setLiveAmplitudes(peaks);
        }
        tempCtx.close();
      } catch (err) {
        // Fallback gracefully to procedural sound envelope
        // console.warn("Waveform audio analysis fallback:", err);
      }
    };

    extractWaveform();

    return () => {
      isMounted = false;
    };
  }, [resolvedUrl, barCount]);

  // Cleanup blob URL if generated locally
  useEffect(() => {
    return () => {
      if (audioBlob && resolvedUrl && !audioUrl) {
        URL.revokeObjectURL(resolvedUrl);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [audioBlob, resolvedUrl, audioUrl]);

  // Setup HTMLAudioElement & Web Audio live analyser for active playback
  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      // Connect live analyser on first play if supported
      try {
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);

            audioContextRef.current = ctx;
            analyserRef.current = analyser;
            sourceNodeRef.current = source;
          }
        }
      } catch (e) {
        // Web Audio element source can only be created once
      }

      audioRef.current.play().then(() => {
        setIsPlaying(true);
        onPlayStateChange?.(true);

        const updateLiveIntensity = () => {
          if (analyserRef.current && isPlaying) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / (dataArray.length * 255);
            setRealtimeIntensity(avg);
          }
          animationFrameRef.current = requestAnimationFrame(updateLiveIntensity);
        };
        animationFrameRef.current = requestAnimationFrame(updateLiveIntensity);
      }).catch(err => {
        console.warn("Audio play prevented:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setRealtimeIntensity(0);
    onPlayStateChange?.(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Interactive scrubbing by clicking or dragging on the waveform
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !audioRef.current || !duration) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percentage * duration;

    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleWaveformMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverProgress(percentage);
  };

  const handleCycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentProgress = duration > 0 ? currentTime / duration : 0;

  // Theme color accents
  const colors = {
    purple: {
      btn: isMe ? 'bg-white text-purple-900 hover:bg-zinc-100' : 'bg-purple-600 hover:bg-purple-500 text-white',
      playedBar: isMe ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
      unplayedBar: isMe ? 'bg-white/30' : 'bg-white/20',
      activeBorder: 'border-purple-500/30',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
      badge: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
    },
    emerald: {
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      playedBar: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      unplayedBar: 'bg-white/20',
      activeBorder: 'border-emerald-500/30',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    },
    indigo: {
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      playedBar: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]',
      unplayedBar: 'bg-white/20',
      activeBorder: 'border-indigo-500/30',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]',
      badge: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    },
    amber: {
      btn: 'bg-amber-500 hover:bg-amber-400 text-black',
      playedBar: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      unplayedBar: 'bg-white/20',
      activeBorder: 'border-amber-500/30',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      badge: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    }
  }[variant];

  return (
    <div 
      className={`relative rounded-2xl flex flex-col gap-2 transition-all select-none ${
        isCompact ? 'p-2.5 min-w-[220px]' : 'p-3.5 min-w-[280px] max-w-sm'
      } ${
        isMe 
          ? 'bg-transparent text-white' 
          : 'bg-white/[0.04] border border-white/10 hover:border-white/20 backdrop-blur-md'
      } ${isPlaying ? colors.glow : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverProgress(null);
      }}
    >
      <audio
        ref={audioRef}
        src={resolvedUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Header Info (Optional Title / Voice Tag) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded-md ${isMe ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-300'}`}>
            <Mic className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-80 truncate">
            {title || (language === 'ar' ? 'رسالة صوتية' : 'Voice Signal')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Playback speed toggle */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              playbackSpeed !== 1 
                ? (isMe ? 'bg-white text-purple-900 font-extrabold' : 'bg-purple-500 text-white shadow')
                : (isMe ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5')
            }`}
            title={language === 'ar' ? 'تغيير سرعة التشغيل' : 'Playback Speed'}
          >
            {playbackSpeed}x
          </button>

          {/* Mute toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-1 rounded text-white/50 hover:text-white transition-colors cursor-pointer ${isMuted ? 'text-red-400' : ''}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>

          {/* Download link */}
          {resolvedUrl && (
            <a
              href={resolvedUrl}
              download="voice_message.mp3"
              className="p-1 rounded text-white/40 hover:text-white transition-colors"
              title={language === 'ar' ? 'تحميل التسجيل' : 'Download Voice Message'}
              onClick={e => e.stopPropagation()}
            >
              <Download className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Waveform Bar Area with Play/Pause Button */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Main Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-md ${colors.btn} ${
            isPlaying ? 'ring-2 ring-purple-400/40 animate-pulse' : ''
          }`}
          title={isPlaying ? (language === 'ar' ? 'إيقاف مؤقت' : 'Pause') : (language === 'ar' ? 'تشغيل' : 'Play')}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Dynamic Waveform Visualizer Sound Intensity Bars */}
        <div 
          ref={containerRef}
          onClick={handleWaveformClick}
          onMouseMove={handleWaveformMouseMove}
          className="flex-1 flex items-center gap-[2.5px] h-9 cursor-pointer py-1 group/wave relative overflow-hidden"
          title={language === 'ar' ? 'انقر للتنقل في الرسالة' : 'Click or scrub waveform'}
        >
          {displayAmplitudes.map((amp, idx) => {
            const barProgress = (idx + 1) / barCount;
            const isPlayed = barProgress <= currentProgress;
            const isHoverTarget = hoverProgress !== null && barProgress <= hoverProgress;

            // Compute dynamic height based on intensity amplitude (min 4px, max 28px)
            let heightPx = Math.max(4, Math.round(amp * 28));

            // Dynamic live wave oscillation when actively playing
            if (isPlaying) {
              const liveWave = Math.sin(currentTime * 8 + idx * 0.4) * (realtimeIntensity > 0 ? realtimeIntensity * 12 : 4);
              heightPx = Math.max(4, Math.min(30, Math.round(heightPx + liveWave)));
            }

            return (
              <div
                key={idx}
                className="flex-1 flex items-center justify-center h-full group-hover/wave:opacity-95 transition-opacity"
              >
                <div
                  style={{ height: `${heightPx}px` }}
                  className={`w-full rounded-full transition-all duration-100 ${
                    isPlayed 
                      ? colors.playedBar 
                      : (isHoverTarget ? 'bg-white/50' : colors.unplayedBar)
                  } ${isPlayed && isPlaying ? 'scale-y-110' : ''}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Timeline & Intensity Indicator */}
      <div className="flex items-center justify-between text-[9px] font-mono tracking-wider opacity-70 px-0.5">
        <span className="font-bold">
          {formatTime(currentTime)}
        </span>

        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold">
              {language === 'ar' ? 'جاري التشغيل' : 'Live Sync'}
            </span>
          </div>
        )}

        <span className="text-zinc-400">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

/**
 * Live Voice Recorder Component with Real-Time Sound Intensity Waveform Visualizer
 */
export interface LiveVoiceRecorderProps {
  onSendVoice: (blob: Blob, duration: number, amplitudes: number[]) => void;
  onCancel: () => void;
  language?: 'ar' | 'en';
}

export function LiveVoiceRecorder({ onSendVoice, onCancel, language = 'ar' }: LiveVoiceRecorderProps) {
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAmplitudes, setRecordedAmplitudes] = useState<number[]>([]);
  const [liveIntensityLevels, setLiveIntensityLevels] = useState<number[]>(new Array(24).fill(0.15));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const startAudioCapture = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("MediaDevices not supported");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isCancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        // Set up real-time Web Audio Analyser
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.6;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioContextRef.current = ctx;
          analyserRef.current = analyser;

          // Frame loop to extract live microphone intensity
          const updateMicLevels = () => {
            if (analyserRef.current) {
              const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
              analyserRef.current.getByteFrequencyData(dataArray);

              // Downsample to 24 visualizer bars
              const bars: number[] = [];
              const step = Math.max(1, Math.floor(dataArray.length / 24));
              for (let i = 0; i < 24; i++) {
                const val = (dataArray[i * step] || 0) / 255;
                const dynamicVal = Math.max(0.12, Math.min(1.0, Math.pow(val * 1.5, 0.8)));
                bars.push(dynamicVal);
              }

              setLiveIntensityLevels(bars);
              setRecordedAmplitudes(prev => {
                // Keep rolling average intensity snapshot
                const avg = bars.reduce((a, b) => a + b, 0) / bars.length;
                if (prev.length < 36) {
                  return [...prev, avg];
                }
                return prev;
              });
            }
            animFrameRef.current = requestAnimationFrame(updateMicLevels);
          };

          animFrameRef.current = requestAnimationFrame(updateMicLevels);
        }

        // Setup MediaRecorder
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          setRecordedBlob(blob);
        };

        mediaRecorder.start(100);
        setIsRecording(true);

        intervalRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);

      } catch (err) {
        console.warn("Microphone access failed, using simulated sound intensity:", err);
        // Fallback simulation
        setIsRecording(true);
        intervalRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
          setLiveIntensityLevels(generateFallbackAmplitudes(`live-${Date.now()}`, 24));
        }, 1000);
      }
    };

    startAudioCapture();

    return () => {
      isCancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const handleSend = () => {
    handleStopRecording();
    setTimeout(() => {
      let finalBlob = recordedBlob;
      if (!finalBlob && audioChunksRef.current.length > 0) {
        finalBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      }
      if (!finalBlob) {
        // Safe synthetic silent audio fallback blob
        finalBlob = new Blob([new Uint8Array(1024)], { type: 'audio/mp3' });
      }
      const finalAmps = recordedAmplitudes.length > 0 ? recordedAmplitudes : generateFallbackAmplitudes('voice-note', 36);
      onSendVoice(finalBlob, Math.max(1, recordingSeconds), finalAmps);
    }, 150);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 w-full bg-zinc-900/90 border border-red-500/40 rounded-2xl p-2.5 px-4 shadow-[0_0_25px_rgba(239,68,68,0.2)] animate-in fade-in duration-200">
      {/* Live recording indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
        <span className="text-xs font-mono font-black text-red-400">
          {formatTimer(recordingSeconds)}
        </span>
      </div>

      {/* Live microphone intensity waveform bars */}
      <div className="flex-1 flex items-center gap-1 h-8 px-2 overflow-hidden">
        {liveIntensityLevels.map((lvl, idx) => (
          <div
            key={idx}
            className="flex-1 bg-red-500/30 rounded-full flex items-center justify-center"
          >
            <div
              style={{ height: `${Math.max(4, Math.round(lvl * 24))}px` }}
              className="w-full bg-gradient-to-t from-red-500 to-rose-400 rounded-full transition-all duration-75 shadow-[0_0_6px_rgba(244,63,94,0.4)]"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Cancel */}
        <button
          type="button"
          onClick={() => {
            handleStopRecording();
            onCancel();
          }}
          className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
          title={language === 'ar' ? 'إلغاء التسجيل' : 'Cancel Recording'}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Send Voice Note */}
        <button
          type="button"
          onClick={handleSend}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
}
