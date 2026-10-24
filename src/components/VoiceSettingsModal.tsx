import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Sliders, 
  Radio, 
  Play, 
  Square, 
  Check, 
  RefreshCw, 
  Sparkles, 
  X, 
  Activity, 
  ShieldCheck, 
  Music, 
  Volume1, 
  CheckCircle2, 
  Zap, 
  Disc
} from 'lucide-react';
import { 
  AudioSettingsState, 
  loadAudioSettings, 
  saveAudioSettings, 
  audioEngine 
} from '../utils/audioSettings';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'ar' | 'en';
  onAddNotification?: (text: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export function VoiceSettingsModal({
  isOpen,
  onClose,
  language = 'ar',
  onAddNotification
}: VoiceSettingsModalProps) {
  const isAr = language === 'ar';
  const [settings, setSettings] = useState<AudioSettingsState>(loadAudioSettings());
  const [activeTab, setActiveTab] = useState<'volume' | 'mic' | 'ringtone' | 'voice'>('volume');

  // Mic test state
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micLiveLevel, setMicLiveLevel] = useState(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Voice speech test text
  const [speechTestText, setSpeechTestText] = useState(
    isAr ? 'مرحباً بك في شبكة فيكسورا، تم ضبط إعدادات الصوت بنجاح.' : 'Welcome to Vexora Network. Audio parameters tuned successfully.'
  );

  // Update language default speech text
  useEffect(() => {
    setSpeechTestText(
      isAr ? 'مرحباً بك في شبكة فيكسورا، تم ضبط إعدادات الصوت بنجاح.' : 'Welcome to Vexora Network. Audio parameters tuned successfully.'
    );
  }, [language]);

  // Clean up mic test when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopMicTest();
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof AudioSettingsState>(key: K, value: AudioSettingsState[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveAudioSettings(updated);
  };

  // Start Mic Live Audio Meter Test
  const startMicTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: settings.noiseSuppression,
          echoCancellation: settings.echoCancellation,
          autoGainControl: settings.autoGainControl
        }
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsTestingMic(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100 * settings.micSensitivity));
        setMicLiveLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (e) {
      console.warn("Failed to access microphone:", e);
      if (onAddNotification) {
        onAddNotification(isAr ? 'تعذر الوصول إلى الميكروفون. يرجى منح الإذن للمتصفح.' : 'Microphone access denied.', 'error');
      }
    }
  };

  // Stop Mic Test
  const stopMicTest = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsTestingMic(false);
    setMicLiveLevel(0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-[#0b0a14] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase italic tracking-wider text-white flex items-center gap-2">
                <span>{isAr ? 'ضبط إعدادات الصوت والميكروفون' : 'Voice & Audio Tuning Studio'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono not-italic font-bold">
                  HD AUDIO
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {isAr ? 'التحكم بمستوى الصوت، حساسية المايكروفون، عزل الضوضاء والرنات' : 'Master Volume, Mic Gain, Noise Filtering & Ringtone Previews'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 bg-black/20 p-2 gap-1 overflow-x-auto justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setActiveTab('volume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'volume'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isAr ? '1. مستويات الصوت' : '1. Volume Levels'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mic')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mic'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isAr ? '2. المايك وعزل الضوضاء' : '2. Mic & Filters'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ringtone')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ringtone'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>{isAr ? '3. الرنات والمؤثرات' : '3. Ringtones & SFX'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isAr ? '4. الصوت التوليدي الذكي' : '4. AI Voice'}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VOLUME LEVELS */}
          {activeTab === 'volume' && (
            <div className="space-y-6">
              {/* Master Volume */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'مستوى الصوت العام (Master Volume)' : 'Master Volume'}</span>
                  </div>
                  <span className="font-mono text-purple-300 font-bold">{settings.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              {/* Ringtone & Call Volume */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'صوت رنات واستقبال المكالمات' : 'Call & Ringtone Volume'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-indigo-300 font-bold">{settings.callRingtoneVolume}%</span>
                    <button
                      type="button"
                      onClick={() => audioEngine.playRingtonePreview(settings.ringtoneSound, settings.callRingtoneVolume)}
                      className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isAr ? 'تجربة' : 'Test'}</span>
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.callRingtoneVolume}
                  onChange={(e) => updateSetting('callRingtoneVolume', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              {/* SFX Volume */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'صوت التفاعل والمؤثرات (UI Sounds)' : 'UI Clicks & Effects Volume'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-300 font-bold">{settings.sfxVolume}%</span>
                    <button
                      type="button"
                      onClick={() => audioEngine.playClickSFX(settings.sfxVolume)}
                      className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isAr ? 'تجربة' : 'Test'}</span>
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-xs text-white font-semibold">
                    {isAr ? 'تشغيل المؤثرات الصوتية' : 'Sound Effects Enabled'}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.soundEffectsEnabled}
                    onChange={(e) => updateSetting('soundEffectsEnabled', e.target.checked)}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-xs text-white font-semibold">
                    {isAr ? 'الاهتزاز اللمسي (Haptics)' : 'Haptic Vibration'}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.hapticFeedbackEnabled}
                    onChange={(e) => updateSetting('hapticFeedbackEnabled', e.target.checked)}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: MIC & FILTERS */}
          {activeTab === 'mic' && (
            <div className="space-y-6">
              {/* Live Mic Test Meter Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 to-black border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Mic className={`w-4 h-4 ${isTestingMic ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
                    <span>{isAr ? 'اختبار الميكروفون المباشر:' : 'Live Microphone Meter Test:'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={isTestingMic ? stopMicTest : startMicTest}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isTestingMic
                        ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                        : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isTestingMic ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'إيقاف الاختبار' : 'Stop Test'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'بدء اختبار المايك الآن' : 'Test Mic Now'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Meter Visualizer Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-0.5 flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        micLiveLevel > 75 
                          ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500' 
                          : 'bg-gradient-to-r from-emerald-500 to-purple-500'
                      }`}
                      style={{ width: `${Math.max(2, micLiveLevel)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{isAr ? 'صامت (0%)' : 'Silent (0%)'}</span>
                    <span className="text-white font-bold">{micLiveLevel}%</span>
                    <span>{isAr ? 'أقصى مستوى (100%)' : 'Peak (100%)'}</span>
                  </div>
                </div>
              </div>

              {/* Mic Sensitivity Slider */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold">{isAr ? 'حساسية الميكروفون (Mic Gain / Boost)' : 'Microphone Gain / Sensitivity'}</span>
                  <span className="font-mono text-purple-300 font-bold">{settings.micSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={settings.micSensitivity}
                  onChange={(e) => updateSetting('micSensitivity', Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              {/* Audio Filters (Noise suppression, echo cancellation) */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  {isAr ? 'فلاتر المعالجة الصوتية الذكية:' : 'Hardware Voice Processing Filters:'}
                </span>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04]">
                    <div className="space-y-0.5">
                      <span className="text-xs text-white font-bold block">
                        {isAr ? 'عزل الضوضاء المحيطة (Noise Suppression)' : 'Noise Suppression'}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {isAr ? 'فلترة أصوات الخلفية والتشويش أثناء التحدث' : 'Filters background noises and fan hums'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.noiseSuppression}
                      onChange={(e) => updateSetting('noiseSuppression', e.target.checked)}
                      className="accent-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04]">
                    <div className="space-y-0.5">
                      <span className="text-xs text-white font-bold block">
                        {isAr ? 'إلغاء صدى الصوت (Echo Cancellation)' : 'Echo Cancellation'}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {isAr ? 'منع رجوع الصوت وتكرار الصدى في المكالمات' : 'Prevents speaker feedback and echo loops'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.echoCancellation}
                      onChange={(e) => updateSetting('echoCancellation', e.target.checked)}
                      className="accent-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04]">
                    <div className="space-y-0.5">
                      <span className="text-xs text-white font-bold block">
                        {isAr ? 'التحكم التلقائي بمستوى الصوت (Auto Gain Control)' : 'Auto Gain Control'}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {isAr ? 'موازنة الصوت الهادئ والعالي تلقائياً' : 'Automatically balances loud and quiet speaking levels'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoGainControl}
                      onChange={(e) => updateSetting('autoGainControl', e.target.checked)}
                      className="accent-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RINGTONES & SFX */}
          {activeTab === 'ringtone' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  {isAr ? 'اختر نغمة رنين المكالمات المفضلة:' : 'Select Call Ringtone Style:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'cyberpulse', name: isAr ? 'سبراني نيون (Cyberpulse)' : 'Cyberpulse Neon', desc: 'Electronic pulse melody' },
                    { id: 'harmonic', name: isAr ? 'هارمونيك كلاسيكي (Harmonic)' : 'Harmonic Classic', desc: 'Smooth sine wave chords' },
                    { id: 'retro', name: isAr ? 'ريترو 8-بت (Retro 8-Bit)' : 'Retro 8-Bit Arcade', desc: 'Chiptune game tones' },
                    { id: 'cosmic', name: isAr ? 'كوزميك فضاء (Cosmic Wave)' : 'Cosmic Wave', desc: 'Deep ambient resonance' }
                  ].map((r) => (
                    <div
                      key={r.id}
                      onClick={() => updateSetting('ringtoneSound', r.id as any)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        settings.ringtoneSound === r.id
                          ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{r.name}</span>
                          {settings.ringtoneSound === r.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 block">{r.desc}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.playRingtonePreview(r.id as any, settings.callRingtoneVolume);
                        }}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-purple-600 text-white transition-all cursor-pointer"
                        title={isAr ? 'استماع للنغمة' : 'Play preview'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification SFX Previews */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  {isAr ? 'اختبار مؤثرات الإشعارات والأزرار:' : 'Notification & UI SFX Previews:'}
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => audioEngine.playNotificationSFX(settings.sfxVolume)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isAr ? 'صوت الإشعار الجديد' : 'Notification Chime'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => audioEngine.playClickSFX(settings.sfxVolume)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isAr ? 'صوت النقر السريع' : 'UI Click SFX'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI VOICE */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Pitch & Rate Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold">{isAr ? 'نبرة الصوت (Pitch)' : 'Voice Pitch'}</span>
                    <span className="font-mono text-purple-300 font-bold">{settings.voicePitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={settings.voicePitch}
                    onChange={(e) => updateSetting('voicePitch', Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold">{isAr ? 'سرعة الكلام (Speech Rate)' : 'Speech Rate'}</span>
                    <span className="font-mono text-purple-300 font-bold">{settings.voiceRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.05"
                    value={settings.voiceRate}
                    onChange={(e) => updateSetting('voiceRate', Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                </div>
              </div>

              {/* Test Speech Input Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  {isAr ? 'نص التجربة الصوتية:' : 'Test Speech Sample:'}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={speechTestText}
                    onChange={(e) => setSpeechTestText(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 h-11 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => audioEngine.speakSample(speechTestText, isAr ? 'ar-SA' : 'en-US', settings.voicePitch, settings.voiceRate)}
                    className="px-5 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isAr ? 'نطق النص الآن' : 'Speak Sample'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
