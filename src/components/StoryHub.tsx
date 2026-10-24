import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Heart, 
  Plus, 
  Sparkles, 
  Smile, 
  Send, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  MessageSquare,
  Volume2, 
  VolumeX,
  MoreHorizontal, 
  ChevronDown, 
  Check, 
  Info,
  ThumbsUp,
  Palette,
  Type,
  Music
} from 'lucide-react';
import { Story, UserProfile } from '../types';

// ==========================================
// 🌌 STORY BACKDROP SPECIAL EFFECTS
// ==========================================

export function MatrixRainEffect() {
  return (
    <div className="absolute inset-0 bg-black/30 overflow-hidden pointer-events-none select-none font-mono text-[9px] text-[#22c55e]/35 flex justify-between px-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col gap-0.5 animate-[pulse_2s_infinite]" 
          style={{ 
            animationDelay: `${i * 0.25}s`,
            opacity: 0.15 + (i % 4) * 0.2
          }}
        >
          {Array.from({ length: 12 }).map((_, k) => (
            <span key={k}>{Math.random() > 0.5 ? '1' : '0'}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TwinklingStarsEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-white rounded-full animate-ping"
          style={{
            width: `${1.5 + (i % 3)}px`,
            height: `${1.5 + (i % 3)}px`,
            left: `${(i * 7) % 95}%`,
            top: `${(i * 11) % 80 + 10}%`,
            animationDuration: `${1.2 + (i % 4) * 0.4}s`,
            animationDelay: `${i * 0.15}s`
          }}
        />
      ))}
    </div>
  );
}

export function ScanlinesEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/[0.04] to-white/0 bg-[size:100%_4px] opacity-70" />
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/15 mix-blend-color-dodge animate-pulse" />
    </div>
  );
}

export function NeonStaticEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <div className="absolute top-[20%] left-[15%] w-36 h-36 bg-cyan-500/15 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-[20%] right-[15%] w-36 h-36 bg-fuchsia-500/15 rounded-full filter blur-3xl animate-pulse [animation-delay:1s]" />
    </div>
  );
}

// ==========================================
// 🎵 WEB AUDIO SYNTH MUSIC VIBE CONTROLLER
// ==========================================
let audioContextInstance: AudioContext | null = null;
let vibeOscillator: OscillatorNode | null = null;
let vibeGain: GainNode | null = null;
let lfoOscillator: OscillatorNode | null = null;

export function playVibeSound(vibe: 'cosmic' | 'ambient' | 'glitch' | 'peace' | 'none') {
  try {
    if (vibe === 'none') {
      stopVibeSound();
      return;
    }

    // Lazy load audio element safely
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextInstance) {
      audioContextInstance = new AudioContextClass();
    }

    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }

    stopVibeSound();

    const ctx = audioContextInstance;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (vibe === 'cosmic') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 4);
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.5;
      lfoGain.gain.value = 15;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      lfoOscillator = lfo;

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
    } else if (vibe === 'ambient') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(147, ctx.currentTime);
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.25;
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      lfoOscillator = lfo;

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
    } else if (vibe === 'glitch') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'square';
      lfo.frequency.value = 4.0;
      lfoGain.gain.value = 40;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      lfoOscillator = lfo;

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
    } else if (vibe === 'peace') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 1.2;
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      lfoOscillator = lfo;

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    vibeOscillator = osc;
    vibeGain = gain;
  } catch (error) {
    console.warn('Vibe synthesis failed:', error);
  }
}

export function stopVibeSound() {
  try {
    if (vibeOscillator) {
      vibeOscillator.stop();
      vibeOscillator.disconnect();
      vibeOscillator = null;
    }
    if (vibeGain) {
      vibeGain.disconnect();
      vibeGain = null;
    }
    if (lfoOscillator) {
      lfoOscillator.stop();
      lfoOscillator.disconnect();
      lfoOscillator = null;
    }
  } catch (err) {
    console.warn(err);
  }
}

// ==========================================
// 🛠️ STORY DECORATION FORMATTING HELPERS
// ==========================================

export function getStoryFontClass(font: Story['fontStyle']) {
  switch (font) {
    case 'cyber':
      return 'font-mono tracking-widest uppercase font-extrabold text-[12px] md:text-sm text-cyan-400';
    case 'poetic':
      return 'font-serif italic font-medium text-base md:text-lg leading-relaxed';
    case 'heavy':
      return 'font-sans font-black uppercase italic tracking-tighter text-lg md:text-xl text-amber-300';
    case 'vintage':
      return 'font-mono text-emerald-400 border border-emerald-500/20 bg-black/60 p-4 rounded-xl text-xs md:text-sm leading-normal';
    case 'standard':
    default:
      return 'font-sans font-bold text-sm md:text-base leading-normal';
  }
}

export function renderStorySticker(sticker: string | undefined) {
  if (!sticker || sticker === 'none') return null;
  switch (sticker) {
    case 'live':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 border border-red-500 text-white text-[8px] font-mono tracking-widest uppercase animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.5)] mb-3 leading-none">
          <span className="w-1 h-1 bg-white rounded-full animate-ping" />
          LIVE PROTOCOL
        </span>
      );
    case 'vip':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400 text-purple-100 text-[8px] font-bold tracking-widest uppercase shadow-[0_0_12px_rgba(168,85,247,0.4)] mb-3 leading-none">
          ⭐ EXCLUSIVE NODE
        </span>
      );
    case 'peace':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/30 backdrop-blur-md border border-emerald-500/60 text-emerald-300 text-[8px] font-black tracking-widest uppercase mb-3 leading-none">
          🕊️ PEACE SIGNAL
        </span>
      );
    case 'pilot':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-black text-[8px] font-mono font-black tracking-widest uppercase border border-amber-400 mb-3 shadow-lg skew-x-[-6deg] leading-none">
          ⚠️ PILOT ONLY
        </span>
      );
    case 'exp':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/40 text-sky-400 text-[8px] font-mono tracking-wider uppercase mb-3 leading-none">
          🧬 EXPERIMENTAL NODE
        </span>
      );
    default:
      return null;
  }
}

export function renderBackdropOverlay(effect: Story['effectStyle']) {
  switch (effect) {
    case 'matrix':
      return <MatrixRainEffect />;
    case 'stars':
      return <TwinklingStarsEffect />;
    case 'scanlines':
      return <ScanlinesEffect />;
    case 'neon':
      return <NeonStaticEffect />;
    case 'none':
    default:
      return null;
  }
}

// ==========================================
// 🕊️ PEACE DOVE BACKGROUND (حمام السلام)
// ==========================================
export function PeaceDoveBackground() {
  return (
    <div className="absolute inset-0 bg-[#eac626] overflow-hidden select-none pointer-events-none">
      {/* Repeating background soft birds & branch textures */}
      <div className="absolute inset-0 opacity-15">
        <svg viewBox="0 0 100 100" className="absolute top-8 left-12 w-28 h-28 fill-white/40">
          <path d="M10 20 C15 30 15 45 10 60 C20 50 30 50 40 40 Z" />
        </svg>
        <svg viewBox="0 0 100 100" className="absolute bottom-24 right-16 w-32 h-32 fill-white/40 rotate-[45deg]">
          <path d="M10 20 C15 30 15 45 10 60 C20 50 30 50 40 40 Z" />
        </svg>
      </div>

      {/* Bird 1: Top-Center Flying Downward (FACING LEFT LIKE PHOTO) */}
      <div className="absolute top-6 left-[15%] w-56 h-56 rotate-[5deg] opacity-90 animate-pulse">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Wings */}
          <path d="M50 35 C65 15 80 18 85 28 C73 38 62 40 50 35" fill="#FFFDEF" />
          <path d="M42 40 C52 10 68 5 73 15 C62 26 52 35 42 40" fill="#FFFDEF" />
          {/* Main Body */}
          <path d="M50 35 C45 42 22 45 12 55 C5 62 10 72 22 71 C35 70 45 60 50 35" fill="#FFFFFF" />
          {/* Tail feathers */}
          <path d="M12 55 C4 49 2 54 0 58 C6 62 12 60 12 55" fill="#FFFFFF" />
          {/* Head */}
          <circle cx="53" cy="33" r="8.5" fill="#FFFFFF" />
          {/* Eye */}
          <circle cx="55" cy="31" r="1.5" fill="#1C1917" />
          {/* Beak */}
          <polygon points="61 31 69 27 62 36" fill="#EA580C" />
          {/* Legs */}
          <line x1="28" y1="65" x2="25" y2="76" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="21" y1="64" x2="17" y2="75" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Bird 2: Main Bottom-Center Flying Left with Olive Branch (FACING LEFT EXACTLY LIKE PHOTO) */}
      <div className="absolute top-[48%] left-[10%] w-64 h-64 rotate-[-12deg] opacity-95">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Upper Wings with detailed feather segments */}
          <path d="M38 52 C26 36 12 42 6 54 C12 65 24 61 38 52" fill="#FFFDF2" />
          <path d="M46 47 C34 18 18 20 12 32 C22 44 32 49 46 47" fill="#FFFDF2" />
          {/* Flying Body */}
          <path d="M38 52 C44 43 65 41 82 54 C92 62 94 76 80 79 C64 82 48 73 38 52" fill="#FFFFFF" />
          {/* Tail feathers */}
          <path d="M80 79 C91 89 98 85 101 81 C96 75 88 75 80 79" fill="#FFFFFF" />
          {/* Cute Head */}
          <circle cx="34" cy="49" r="9.5" fill="#FFFFFF" />
          {/* Pixel Eye */}
          <circle cx="31" cy="47" r="1.5" fill="#171412" />
          {/* Orange Beak */}
          <polygon points="24.5 49 16 53 25.5 56" fill="#EA580C" />
          {/* Legs */}
          <line x1="58" y1="74" x2="54" y2="87" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="66" y1="73" x2="70" y2="86" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          {/* Olive Branch in Beak */}
          <path d="M18 54 C9 50 6 45 4 40" fill="none" stroke="#65A30D" strokeWidth="2" strokeLinecap="round" />
          {/* Olive Leaves */}
          <path d="M11 50 C9 46 11 44 14 47" fill="#65A30D" />
          <path d="M7 45 C5 41 7 39 10 42" fill="#65A30D" />
          <path d="M5 41 C3 37 5 35 8 38" fill="#65A30D" />
        </svg>
      </div>

      {/* Floating scattered leaves in Yellow and Olive Green */}
      <div className="absolute top-[28%] left-[75%] w-6 h-6 rotate-[35deg] opacity-70">
        <svg viewBox="0 0 20 20" className="w-full h-full fill-[#FFFCA8]"><path d="M10 2 C13 7 13 13 10 18 C7 13 7 7 10 2" /></svg>
      </div>
      <div className="absolute top-[42%] left-[45%] w-5 h-5 rotate-[110deg] opacity-60">
        <svg viewBox="0 0 20 20" className="w-full h-full fill-[#FFFFFF]"><path d="M10 2 C13 7 13 13 10 18 C7 13 7 7 10 2" /></svg>
      </div>
      <div className="absolute top-[20%] left-[5%] w-6 h-6 rotate-[-45deg] opacity-60">
        <svg viewBox="0 0 20 20" className="w-full h-full fill-[#65A30D]"><path d="M10 2 C13 7 13 13 10 18 C7 13 7 7 10 2" /></svg>
      </div>
      <div className="absolute bottom-[20%] left-[82%] w-7 h-7 rotate-[85deg] opacity-80">
        <svg viewBox="0 0 20 20" className="w-full h-full fill-[#FFFCE0]"><path d="M10 2 C13 7 13 13 10 18 C7 13 7 7 10 2" /></svg>
      </div>
      <div className="absolute bottom-[40%] left-[88%] w-5 h-5 rotate-[15deg] opacity-50">
        <svg viewBox="0 0 20 20" className="w-full h-full fill-[#65A30D]"><path d="M10 2 C13 7 13 13 10 18 C7 13 7 7 10 2" /></svg>
      </div>
      <div className="absolute top-[68%] left-[30%] w-6 h-6 rotate-[145deg] opacity-50">
        <svg viewBox="0 0 20 20" className="w-full h-full fill-[#FFFCA8]"><path d="M10 2 C13 7 13 13 10 18 C7 13 7 7 10 2" /></svg>
      </div>
    </div>
  );
}

// ==========================================
// ✨ STORY CREATOR MODAL
// ==========================================
interface CreateStoryModalProps {
  onClose: () => void;
  currentUser: UserProfile | null;
  onPublish: (story: Story) => void;
}

export function CreateStoryModal({ onClose, currentUser, onPublish }: CreateStoryModalProps) {
  const [content, setContent] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'dove' | 'neon' | 'sunset' | 'cobalt' | 'emerald'>('dove');
  const [selectedFont, setSelectedFont] = useState<'standard' | 'cyber' | 'poetic' | 'heavy' | 'vintage'>('standard');
  const [selectedEffect, setSelectedEffect] = useState<'none' | 'matrix' | 'neon' | 'stars' | 'scanlines'>('none');
  const [selectedVibe, setSelectedVibe] = useState<'none' | 'cosmic' | 'ambient' | 'glitch' | 'peace'>('none');
  const [selectedSticker, setSelectedSticker] = useState<'none' | 'live' | 'vip' | 'peace' | 'pilot' | 'exp'>('none');
  const [textColor, setTextColor] = useState('#ffffff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presets = [
    { id: 'dove', label: 'حمام السلام', desc: 'ذهب دافئ بطيور السلام', bg: 'bg-[#eac626]' },
    { id: 'neon', label: 'سايبر نيون', desc: 'توهج فسفوري غامض', bg: 'bg-[#090714] border border-cyan-500/20' },
    { id: 'sunset', label: 'شروق الورد', desc: 'تدرج شروق الشمس المشرق', bg: 'bg-gradient-to-tr from-pink-500 to-orange-400' },
    { id: 'cobalt', label: 'الفضاء العميق', desc: 'كوبالت ومجرات الكواكب', bg: 'bg-gradient-to-br from-[#0c0a1a] via-blue-950 to-slate-950' },
    { id: 'emerald', label: 'زمرد المصفوفة', desc: 'زبرجدي المصفوفة الهادئة', bg: 'bg-gradient-to-tr from-emerald-950 to-green-900' }
  ];

  const fonts = [
    { id: 'standard', label: 'عادي / Classic', desc: 'Inter Sans Bold' },
    { id: 'cyber', label: 'سيبراني / Cyber', desc: 'Fira JetBrains Mono' },
    { id: 'poetic', label: 'شاعري / Poetic', desc: 'Editorial Serif Italic' },
    { id: 'heavy', label: 'مائل ثقيل / Heavy', desc: 'Impact Heavy Slant' },
    { id: 'vintage', label: 'شاشة قديمة / Retro', desc: 'Matrix Terminal Monitor' }
  ];

  const effects = [
    { id: 'none', label: 'العادي / Static', desc: 'بدون تأثيرات حية' },
    { id: 'matrix', label: 'مطر مصفوفة / Matrix', desc: 'حزم شفرات ثنائية خضراء' },
    { id: 'neon', label: 'توهج نيون / Neon Glow', desc: 'سحب وغيوم نيون متوهجة' },
    { id: 'stars', label: 'غبار الفضاء / Space Star', desc: 'نجوم متألقة ووميض لامع' },
    { id: 'scanlines', label: 'خطوط قديمة / CRT Scan', desc: 'خطوط زجاج شاشة سيبرانية' }
  ];

  const vibes = [
    { id: 'none', label: 'صامت / Mute', desc: 'بدون أصوات موجات للقصة' },
    { id: 'cosmic', label: 'كون عميق / Cosmic', desc: 'رنين مداري عميق مستمر' },
    { id: 'ambient', label: 'نبضة تردد / Ambient', desc: 'نبضة ترددات Solfeggio هادئة' },
    { id: 'glitch', label: 'نبض سيبراني / Glitch', desc: 'موجات تشويش حاسوبية عشوائي' },
    { id: 'peace', label: 'موجة سلام / Peace', desc: 'صفير ناي دافئ وناعم' }
  ];

  const stickers = [
    { id: 'none', label: 'بدون وسم / No Tag', desc: 'مظهر بسيط للنبضة' },
    { id: 'live', label: 'بث قصة / Live Tag', desc: 'شريط بث مباشر يومي' },
    { id: 'vip', label: 'عضوية معتمدة / Certified', desc: 'ملصق العضوية الذهبية البراقة' },
    { id: 'peace', label: 'نبضة سلام / Peace Signal', desc: 'راية حمام وسلام وئام' },
    { id: 'pilot', label: 'لقيادة المركز / Admin Only', desc: 'سلامة وتحكم كابتن السفينة' },
    { id: 'exp', label: 'تحديث تجريبي / Beta Code', desc: 'مخاض التعديل وتطوير الكود' }
  ];

  const textColors = [
    { name: 'أبيض / Pure Default', code: '#ffffff' },
    { name: 'مصفوفة خضراء / Matrix Green', code: '#4ade80' },
    { name: 'سايبر نيون / Neon Cyan', code: '#22d3ee' },
    { name: 'نبض فوشيا / Flare Fuchsia', code: '#f472b6' },
    { name: 'ذهب السلام / Gold Dust', code: '#facc15' },
    { name: 'جمر برتقالي / Heat Orange', code: '#fb923c' }
  ];

  // Preview music vibe audio triggers
  useEffect(() => {
    if (selectedVibe !== 'none') {
      playVibeSound(selectedVibe as any);
    } else {
      stopVibeSound();
    }
    return () => {
      stopVibeSound();
    };
  }, [selectedVibe]);

  const handlePublish = () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    // Stop any preview sound immediately
    stopVibeSound();

    setTimeout(() => {
      const newStory: Story = {
        id: 'story-' + Math.random().toString(36).substr(2, 6),
        name: currentUser?.name || 'Cyber Node',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        content: content.trim(),
        timestamp: 'الآن',
        preset: selectedPreset,
        likesCount: 0,
        loveCount: 0,
        hahaCount: 0,
        replies: [],
        fontStyle: selectedFont,
        effectStyle: selectedEffect,
        musicVibe: selectedVibe as any,
        textColor: textColor,
        customImage: selectedSticker !== 'none' ? selectedSticker : undefined,
        views: Math.floor(Math.random() * 20) + 5
      };
      
      onPublish(newStory);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => { stopVibeSound(); onClose(); }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="w-full max-w-6xl bg-[#0d0a1b]/95 border border-purple-500/15 rounded-3xl shadow-[0_0_80px_rgba(110,68,255,0.2)] overflow-hidden flex flex-col lg:flex-row max-h-[90vh] lg:h-[720px]"
        onClick={e => e.stopPropagation()}
      >
        {/* LEFT COLUMN: LIVE STORY PREVIEW */}
        <div className="w-full lg:w-[35%] bg-black/70 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-4 inset-x-4 flex justify-between items-center z-30">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-400">Live Visual Rendering</span>
            {selectedVibe !== 'none' && (
              <span className="text-[7.5px] font-mono uppercase tracking-[0.1em] text-emerald-400 animate-pulse bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                VIBE FEED ACTIVE
              </span>
            )}
          </div>
          
          {/* Simulated Mobile Frame mimicking story view */}
          <div className="w-[230px] h-[390px] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10 flex flex-col mt-4">
            {/* Theme Render Canvas */}
            {selectedPreset === 'dove' ? (
              <PeaceDoveBackground />
            ) : selectedPreset === 'neon' ? (
              <div className="absolute inset-0 bg-[#090714] border-t border-cyan-500/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,35,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,16,35,0.8)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                <div className="absolute w-56 h-56 bg-purple-500/5 rounded-full filter blur-[100px]" />
              </div>
            ) : selectedPreset === 'sunset' ? (
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-orange-400" />
            ) : selectedPreset === 'cobalt' ? (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-950" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 to-green-800" />
            )}

            {/* Render Overlay Backdrop effects dynamic preview */}
            {renderBackdropOverlay(selectedEffect)}

            {/* Simulated stories progress timer bar */}
            <div className="absolute top-3 inset-x-3 flex gap-1 z-20">
              <div className="h-0.5 bg-white/20 flex-1 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-white" />
              </div>
            </div>

            {/* Simulated Top Author row */}
            <div className="absolute top-4.5 inset-x-3 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img src={currentUser?.avatar} className="w-7 h-7 rounded-lg object-cover border border-white/30" alt="" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full border border-black" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black tracking-wide text-white leading-none">{currentUser?.name || "Sender Node"}</span>
                  <span className="text-[7.5px] text-white/50 leading-none mt-0.5">قصة معيارية</span>
                </div>
              </div>
              <div className="flex gap-1 text-white/40">
                <MoreHorizontal className="w-3 h-3" />
                <X className="w-3 h-3" />
              </div>
            </div>

            {/* Main Centered Content bubble styled as photo */}
            <div className="flex-1 w-full flex flex-col items-center justify-center px-4 z-20 relative">
              {/* Sticker overlay rendering */}
              <div className="transform scale-90 mb-1">
                {renderStorySticker(selectedSticker)}
              </div>

              <div className="w-full max-h-[70%] overflow-y-auto scrollbar-hide flex items-center justify-center">
                {content.trim() ? (
                  <div 
                    className={`p-4 rounded-2xl text-center leading-relaxed break-words max-w-[95%] shadow-2xl transition-all ${getStoryFontClass(selectedFont)}`}
                    style={{ 
                      color: textColor,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      backgroundColor: selectedPreset === 'dove' ? '#4ABEFF' : 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {content}
                  </div>
                ) : (
                  <span className="text-white/20 text-[9px] font-mono animate-pulse font-bold tracking-widest text-center px-2 py-4 border border-dashed border-white/5 rounded-xl uppercase">
                     Waiting for payload...
                  </span>
                )}
              </div>
            </div>

            {/* Bottom simulated interact */}
            <div className="absolute bottom-3.5 inset-x-3 flex items-center gap-2 z-20">
              <div className="flex gap-0.5 text-[11px] drop-shadow-md select-none">
                <span>😂</span>
                <span>❤️</span>
                <span>👍</span>
              </div>
              <div className="flex-1 h-7 bg-black/40 hover:bg-black/60 rounded-full border border-white/5 px-2 flex items-center justify-end">
                <span className="text-[7px] text-white/35">إرسال رسالة رد...</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STORY PREFERENCES & WRITING */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                تخصيص القصة الفاخر / Advanced Story Lab
              </h3>
              <p className="text-[9px] text-purple-400 font-mono tracking-widest mt-1 uppercase">GRID TELEMETRY BROADCAST CHANNELS</p>
            </div>
            <button 
              onClick={() => { stopVibeSound(); onClose(); }} 
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6 flex-1 pr-1">
            {/* Story Text Area */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
                ١. محتوى القصة / STORY BURST CONTENT
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="اكتب نبضتك هنا! 'الساده اولياء امور طلبه الصف الاول الإعدادي...'"
                maxLength={180}
                className="w-full h-24 bg-black/40 border border-purple-500/10 rounded-2xl p-4 text-white text-sm font-sans leading-relaxed placeholder:text-white/20 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <div className="flex justify-between items-center text-[9px] font-mono text-white/30">
                <span className="flex items-center gap-1 text-emerald-400/80">
                  <Info className="w-3 h-3" />
                  الحد الأقصى ١٨٠ حرفاً لمنع تشوه التدرج الهندسي
                </span>
                <span>{content.length}/180</span>
              </div>
            </div>

            {/* Grid 1: Basic Preset Themes & Text Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Story Preset Theme */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  ٢. تدرجات الخلفية / CANVAS COLOR GRADIENTS
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id as any)}
                      className={`p-2.5 rounded-xl flex items-center gap-3 text-left border transition-all hover:translate-x-1 cursor-pointer ${
                        selectedPreset === preset.id 
                          ? 'border-purple-500 bg-purple-950/20' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${preset.bg}`}>
                        {selectedPreset === preset.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold text-white truncate">{preset.label}</span>
                        <span className="text-[8px] text-white/40 truncate mt-0.5">{preset.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Custom Color */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                  ٣. تلوين الخط الجوهري / FOREGROUND TEXT HUE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {textColors.map(color => (
                    <button
                      key={color.code}
                      onClick={() => setTextColor(color.code)}
                      className={`p-2.5 rounded-xl flex items-center gap-2.5 text-left border transition-all cursor-pointer ${
                        textColor === color.code 
                          ? 'border-purple-500 bg-purple-950/20' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.code }} />
                      <span className="text-[10px] font-medium text-white/80 whitespace-nowrap truncate">{color.name}</span>
                    </button>
                  ))}
                </div>
                
                {/* Advanced Fonts selecting */}
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    ٤. نوع الخط والبروتوكول / DISPLAY TYPOGRAPHY
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {fonts.slice(0, 4).map(font => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFont(font.id as any)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedFont === font.id 
                            ? 'border-purple-500 bg-purple-950/20' 
                            : 'border-white/5 bg-white/5'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-white block truncate">{font.label}</span>
                        <span className="text-[7.5px] text-white/40 block truncate">{font.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: Animated Overlays, Audio Vibes & Stickers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              
              {/* Dynamic Overlays */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  ٥. خلفيات حية / MATRIX LIVE EFFECTS
                </label>
                <div className="flex flex-col gap-1.5">
                  {effects.map(fx => (
                    <button
                      key={fx.id}
                      onClick={() => setSelectedEffect(fx.id as any)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedEffect === fx.id 
                          ? 'border-purple-500 bg-purple-950/25' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <span className="text-[10.5px] font-bold text-white block">{fx.label}</span>
                      <span className="text-[7.5px] text-white/40 block">{fx.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Audio Vibes */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-teal-400" />
                  ٦. نبرة صوتية / SYNTH AUDIO FREQUENCY
                </label>
                <div className="flex flex-col gap-1.5">
                  {vibes.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVibe(v.id as any)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedVibe === v.id 
                          ? 'border-purple-500 bg-purple-950/25' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <span className="text-[10.5px] font-bold text-white block">{v.label}</span>
                      <span className="text-[7.5px] text-white/45 block">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Sticker Stamps */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-indigo-400" />
                  ٧. وسم الطابع / ACTIVE STICKER LABEL
                </label>
                <div className="flex flex-col gap-1.5">
                  {stickers.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedSticker(st.id as any)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedSticker === st.id 
                          ? 'border-purple-500 bg-purple-950/25' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <span className="text-[10.5px] font-bold text-white block">{st.label}</span>
                      <span className="text-[7.5px] text-white/40 block">{st.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-white/5 mt-6 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={() => { stopVibeSound(); onClose(); }}
              className="px-6 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              إلغاء الحفظ
            </button>
            <button
              onClick={handlePublish}
              disabled={!content.trim() || isSubmitting}
              className="px-8 h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>برمجة التثبيت والترميز...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>تثبيت النشر والبث / Publish Story</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ==========================================
// 📺 PREMIUM STORY VIEWER MODAL
// ==========================================
interface StoryViewerModalProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  currentUser: UserProfile | null;
  onDeleteStory?: (id: string) => void;
  onAddReply?: (storyId: string, replyText: string) => void;
}

export function StoryViewerModal({ 
  stories, 
  currentIndex, 
  onClose, 
  onNavigate, 
  currentUser,
  onDeleteStory,
  onAddReply 
}: StoryViewerModalProps) {
  const activeStory = stories[currentIndex];
  
  const [replyInput, setReplyInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; char: string; left: number }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'confirm'; onConfirm?: () => void } | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressStep = 1.4; // controls filling rate (~5 seconds per slide)

  // Automatic progression logic
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + progressStep;
      });
    }, 70);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  // Handle auto-advance when progress reaches 100% safely outside the render phase
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress]);

  // Restart progress when index shifts
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Trigger audio vibe synth safely
  useEffect(() => {
    if (activeStory && activeStory.musicVibe && activeStory.musicVibe !== 'none') {
      playVibeSound(activeStory.musicVibe as any);
    } else {
      stopVibeSound();
    }
    return () => {
      stopVibeSound();
    };
  }, [currentIndex, activeStory]);

  const handleNext = () => {
    stopVibeSound();
    if (currentIndex < stories.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onClose(); // Automatically exit on last story
    }
  };

  const handlePrev = () => {
    stopVibeSound();
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') {
      stopVibeSound();
      onClose();
    }
  };

  const handleSendReply = (e?: any) => {
    if (e) e.preventDefault();
    if (!replyInput.trim()) return;
    setIsPaused(true);

    if (onAddReply) {
      onAddReply(activeStory.id, replyInput.trim());
    }
    setReplyInput('');
    
    // Spawn float info indicator
    setToast({
      message: "تم إرسال ردك الخاص على القصة بنجاح! / Reply sent successfully!",
      type: "success"
    });
  };

  const triggerCelebrationEmoji = (char: string) => {
    const freshId = Date.now() + Math.random();
    const freshLeft = Math.floor(Math.random() * 60) + 20; // 20% to 80% left range
    
    setFloatingEmojis(prev => [...prev, { id: freshId, char, left: freshLeft }]);
    
    // Clean up
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== freshId));
    }, 1500);

    // Save reaction to story state count locally
    if (char === '😂') {
      activeStory.hahaCount = (activeStory.hahaCount || 0) + 1;
    } else if (char === '👍') {
      activeStory.likesCount = (activeStory.likesCount || 0) + 1;
    } else if (char === '❤️') {
      activeStory.loveCount = (activeStory.loveCount || 0) + 1;
    }
  };

  const isCurrentStoryOwner = (story: Story) => {
    if (!currentUser) return false;
    if (story.name === currentUser.name) return true;
    
    // Admins or site owners
    const adminEmails = ['fluxstudio4@gmail.com', 'vexora.network@gmail.com'];
    if (currentUser.email && adminEmails.includes(currentUser.email)) return true;
    if (currentUser.name && (
      currentUser.name === 'Vexora Owner' || 
      currentUser.name === 'Vexora Admin 🛡️' ||
      currentUser.name === 'CyberPioneer'
    )) return true;
    
    return false;
  };

  if (!activeStory) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-4 outline-none"
      onKeyDown={handleKeyPress}
      tabIndex={0}
      autoFocus
    >
      {/* Visual Navigation Buttons on Desktop */}
      <button 
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="absolute left-8 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hidden md:flex transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
        title="Previous Story"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Main Core Container: Formatted exactly as mobile device aspect preview */}
      <div 
        className="w-full max-w-[430px] h-full md:h-[90vh] md:max-h-[820px] bg-black md:rounded-3xl overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Render Active Presets Background */}
        {activeStory.preset === 'dove' ? (
          <PeaceDoveBackground />
        ) : activeStory.preset === 'neon' ? (
          <div className="absolute inset-0 bg-[#090714] border-t border-cyan-500/10 flex items-center justify-center">
            {/* Dark background matrix visual grids */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,35,0.85)_1px,transparent_1px),linear-gradient(90deg,rgba(18,16,35,0.85)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
            <div className="absolute w-72 h-72 bg-purple-500/5 rounded-full filter blur-[100px]" />
          </div>
        ) : activeStory.preset === 'sunset' ? (
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-orange-400" />
        ) : activeStory.preset === 'cobalt' ? (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-950" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 to-green-800" />
        )}

        {/* Dynamic backdrop effects */}
        {renderBackdropOverlay(activeStory.effectStyle)}

        {/* Floating Emojis Animation Track */}
        <div className="absolute inset-x-0 bottom-32 top-20 pointer-events-none z-30 overflow-hidden">
          <AnimatePresence>
            {floatingEmojis.map(emoji => (
              <motion.div
                key={emoji.id}
                initial={{ y: 400, opacity: 1, scale: 0.6, rotate: 0 }}
                animate={{ 
                  y: -100, 
                  opacity: 0, 
                  scale: 1.8, 
                  rotate: Math.random() > 0.5 ? 25 : -25,
                  x: (Math.random() - 0.5) * 80
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="absolute text-5xl select-none"
                style={{ left: `${emoji.left}%` }}
              >
                {emoji.char}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* STORY TIMER INDICATORS AT TOP */}
        <div className="absolute top-3 inset-x-3 flex gap-1 z-40">
          {stories.map((story, index) => (
            <div 
              key={`bar-${index}`} 
              className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden cursor-pointer"
              onClick={() => onNavigate(index)}
            >
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: index === currentIndex 
                    ? `${progress}%` 
                    : index < currentIndex 
                      ? '100%' 
                      : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* TOP AUTHOR CONTENT ROW (Mimicking exact photo view) */}
        <div className="absolute top-5 inset-x-3.5 flex items-center justify-between z-40">
          {/* Right Aligned: User info (Arabic RTL orientation friendly) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={activeStory.avatar} 
                className="w-10 h-10 rounded-xl object-cover border-2 border-white/25 shadow-lg" 
                alt="" 
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm tracking-wide text-white drop-shadow-md">{activeStory.name}</span>
                <span className="text-[10px] text-white/50 drop-shadow-md ml-1 font-mono">{activeStory.timestamp}</span>
              </div>
              <span className="text-[10px] font-black text-white/70 tracking-wider uppercase mt-0.5" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                 قصة نصية
              </span>
            </div>
          </div>

          {/* Left Aligned: Controls */}
          <div className="flex items-center gap-2">
            {/* Delete Option under More dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="w-10 h-10 rounded-xl bg-black/45 hover:bg-black/80 flex items-center justify-center text-white transition-colors cursor-pointer border border-white/10"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showOptions && (
                <div className="absolute top-12 left-0 w-44 bg-[#141221] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl flex flex-col gap-1">
                  {isCurrentStoryOwner(activeStory) ? (
                    <button 
                      onClick={() => {
                        setIsPaused(true);
                        setShowOptions(false);
                        setToast({
                          message: "هل تريد حذف هذه القصة للأبد؟ / Are you sure you want to delete this story permanently?",
                          type: "confirm",
                          onConfirm: () => {
                            onDeleteStory?.(activeStory.id);
                            onClose();
                          }
                        });
                      }}
                      className="w-full h-10 px-3 hover:bg-red-950/50 text-red-400 hover:text-white rounded-xl text-left text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف القصة / Delete</span>
                    </button>
                  ) : (
                    <div className="p-2 text-[9px] text-white/40 leading-normal">
                       Viewing authenticated node. Active link secured.
                    </div>
                  )}
                  {activeStory.replies && activeStory.replies.length > 0 && isCurrentStoryOwner(activeStory) && (
                    <button 
                      onClick={() => {
                        setShowRepliesModal(true);
                        setShowOptions(false);
                      }}
                      className="w-full h-10 px-3 hover:bg-purple-900/30 text-purple-300 rounded-xl text-left text-xs font-bold leading-none flex items-center gap-2 cursor-pointer transition-all border-t border-white/5 mt-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>عرض الردود ({activeStory.replies.length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Down Chevron / Close */}
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-black/45 hover:bg-black/80 flex items-center justify-center text-white transition-colors cursor-pointer border border-white/10"
              title="Close System Overview"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CENTERED BODY DESIGN (As seen in the photo) */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          {/* Render Story sticker badge inside the viewer if selected */}
          {activeStory.customImage && activeStory.customImage !== 'none' && (
            <div className="transform scale-[0.85] mb-2 z-20">
              {renderStorySticker(activeStory.customImage as any)}
            </div>
          )}

          <div className="w-full max-h-[75%] overflow-y-auto scrollbar-hide flex items-center justify-center z-10">
            {activeStory.preset === 'dove' ? (
              /* Custom Padded sky-blue blocked wrapper exactly as photo */
              <div 
                className={`text-center leading-relaxed p-4 md:p-5 rounded-2xl shadow-[0_10px_35px_rgba(74,190,255,0.45)] border border-white/20 select-none text-base md:text-xl break-words max-w-[90%] transform scale-100 hover:scale-[1.01] transition-transform ${getStoryFontClass(activeStory.fontStyle)}`}
                style={{ 
                  color: activeStory.textColor || '#ffffff',
                  backgroundColor: '#4ABEFF',
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                {activeStory.content}
              </div>
            ) : (
              <div 
                className={`p-6 rounded-2xl text-center leading-relaxed text-sm md:text-base max-w-[85%] break-words shadow-2xl border transition-all ${getStoryFontClass(activeStory.fontStyle)}`}
                style={{ 
                  color: activeStory.textColor || '#ffffff',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                }}
              >
                {activeStory.content}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM INTERACTION TRACK (Exact replica of photo design) */}
        <div className="p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent relative z-40 mt-auto flex flex-col gap-3">
          
          <div className="flex items-center gap-3">
            {/* Bottom-left: Interaction button emojis 😂, 👍, ❤️ */}
            <div className="flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
              <button 
                onClick={() => triggerCelebrationEmoji('😂')}
                className="w-10 h-10 flex items-center justify-center hover:scale-125 hover:rotate-12 transition-transform text-2xl select-none cursor-pointer"
                title="Haha Reaction"
              >
                😂
              </button>
              <button 
                onClick={() => triggerCelebrationEmoji('👍')}
                className="w-10 h-10 flex items-center justify-center hover:scale-125 hover:rotate-[-12deg] transition-transform text-2xl select-none cursor-pointer"
                title="Like Reaction"
              >
                👍
              </button>
              <button 
                onClick={() => triggerCelebrationEmoji('❤️')}
                className="w-10 h-10 flex items-center justify-center hover:scale-125 hover:rotate-12 transition-transform text-[26px] select-none cursor-pointer"
                title="Heart Reaction"
              >
                ❤️
              </button>
            </div>

            {/* Bottom-center/right: Rounded Capsule Message Reply Input Form */}
            <form onSubmit={handleSendReply} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={replyInput}
                  onChange={e => setReplyInput(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  placeholder="إرسال رسالة..."
                  dir="rtl"
                  className="w-full h-11 bg-black/50 hover:bg-black/75 focus:bg-black/90 border border-white/15 focus:border-purple-500 rounded-full px-5 text-right text-xs text-white placeholder:text-white/40 focus:outline-none transition-all"
                />
                
                {replyInput.trim() && (
                  <button 
                    type="submit"
                    className="absolute left-2 top-1.5 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
              </div>
            </form>

            {/* Re-post / Share cycle arrow icon at far-right of bottom track */}
            <button 
              onClick={() => {
                setIsPaused(true);
                setToast({
                  message: "تمت المشاركة كنبضة تابعه بنجاح! / Story shared safely as secondary pulse!",
                  type: "success"
                });
                triggerCelebrationEmoji('❤️');
              }}
              className="w-11 h-11 rounded-full bg-black/45 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/85 transition-all active:scale-95 cursor-pointer flex-shrink-0"
              title="Share as Post"
            >
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Display live reactions count indicators as active state meta */}
        <div className="absolute top-16 left-3.5 flex gap-2 font-mono text-[9px] text-white/30 z-20">
          {activeStory.likesCount && activeStory.likesCount > 0 ? <span>👍 {activeStory.likesCount}</span> : null}
          {activeStory.loveCount && activeStory.loveCount > 0 ? <span>❤️ {activeStory.loveCount}</span> : null}
          {activeStory.hahaCount && activeStory.hahaCount > 0 ? <span>😂 {activeStory.hahaCount}</span> : null}
        </div>
      </div>

      {/* Visual Navigation Buttons on Desktop right side */}
      <button 
        onClick={handleNext}
        className="absolute right-8 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hidden md:flex transition-all cursor-pointer"
        title="Next Story"
      >
        <ArrowRight className="w-6 h-6" />
      </button>

      {/* Inner modal overlay tracking responses list if of high administrative interest */}
      <AnimatePresence>
        {showRepliesModal && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:absolute md:top-1/4 md:left-1/2 md:-translate-x-1/2 z-[600] w-full max-w-md bg-[#110E1C] border-t md:border border-white/10 md:rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[50vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <span className="text-xs font-black uppercase text-purple-400 tracking-wider">سجل الردود والرسائل الورودة</span>
              <button onClick={() => setShowRepliesModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {activeStory.replies?.map(r => (
                <div key={r.id} className="p-3 bg-white/5 rounded-xl border border-white/5 text-right">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] text-white/30 font-mono">{r.timestamp}</span>
                    <span className="text-xs font-bold text-white">{r.sender}</span>
                  </div>
                  <p className="text-xs font-sans text-white/80">{r.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beautiful Glassmorphic Toast/Confirm Alert Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[700] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#120f26]/95 border border-purple-500/20 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(168,85,247,0.25)] space-y-5 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/15 flex items-center justify-center mx-auto text-purple-400">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-white/90 leading-relaxed dir-rtl text-center px-2">
                {toast.message}
              </p>
              <div className="flex gap-3 justify-center">
                {toast.type === 'confirm' ? (
                  <>
                    <button 
                      onClick={() => {
                        toast.onConfirm?.();
                        setToast(null);
                        setIsPaused(false);
                      }}
                      className="px-5 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      حذف للأبد / Delete
                    </button>
                    <button 
                      onClick={() => {
                        setToast(null);
                        setIsPaused(false);
                      }}
                      className="px-5 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      إلغاء / Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setToast(null);
                      setIsPaused(false);
                    }}
                    className="px-6 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    موافق / OK
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
