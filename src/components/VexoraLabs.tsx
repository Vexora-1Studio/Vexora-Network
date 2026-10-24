import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Tv, MapPin, Compass, Shield, Clock, Flame, Trash2, 
  Heart, Smile, Send, Sparkles, Cpu, Award, Plus, X, Lock, 
  EyeOff, MessageSquare, Play, RefreshCw, Trophy, Target, 
  Languages, Sparkle, Eye, Filter, UserCheck, AlertTriangle, Check
} from 'lucide-react';
import { UserProfile, Post } from '../types';

interface VexoraLabsProps {
  language: 'en' | 'ar';
  currentUser: UserProfile | null;
  onAddPost: (content: string, type: 'public' | 'community', image?: string, isAnonymous?: boolean) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'alert') => void;
}

// Simulated translations for the Vexora Labs
const labTranslations = {
  en: {
    labsTitle: "Vexora Experimental Labs",
    labsSubtitle: "Interconnected Neural Modules & Future Core Features",
    tabGeoWatch: "Virtual Hubs & Watch Parties",
    tabSmartChat: "Smart Chat Playground",
    tabGamification: "Gamification & Rank",
    tabPrivacy: "Privacy & Content Shields",
    
    // Geo-Chat
    geoTitle: "Geo-Chat Rooms (Map-Based)",
    geoDesc: "Enter local quantum nodes based on geographical clusters to chat with nearby peers.",
    selectNode: "Select a Quantum Node to Connect",
    connectedNode: "Connected to Node: ",
    onlinePeers: "Online Peers",
    sendSignal: "Send Signal",
    typeSignalPlaceholder: "Broadcast message to this geographical zone...",
    
    // Watch Party
    watchTitle: "Watch Party Stream",
    watchDesc: "Watch cybernetic visualization patterns with synced peer conversations.",
    selectStream: "Choose Stream Channel",
    liveChat: "Live Audience Stream",
    commentPlaceholder: "Add your voice to the party...",
    
    // Stealth & Destruct
    stealthTitle: "Stealth Chat Session (Conditional Self-Destruction)",
    stealthDesc: "Messages dissolve from existence dynamically based on custom time parameters.",
    destructionRule: "Destruction Rule",
    countdown5: "5 Seconds Countdown",
    countdown10: "10 Seconds Countdown",
    onExit: "On Exit Session",
    stealthInputPlaceholder: "Type a confidential message...",
    dissolved: "Dissolved from local storage and memory.",
    
    // Icebreakers & Game
    iceTitle: "Smart Icebreakers & Tic-Tac-Toe (X-O)",
    iceDesc: "Break the ice with incoming nodes using AI questions or a friendly mini-game.",
    playCpu: "Play against Vexora Core AI",
    resetGame: "Reset Grid",
    yourTurn: "Your Turn (X)",
    cpuTurn: "Vexora AI Processing (O)",
    playerWins: "You bypassed Vexora AI! (X Wins)",
    cpuWins: "Vexora AI outsmarted you! (O Wins)",
    drawGame: "Data Sync: Draw Game",
    askIcebreaker: "Generate Icebreaker Prompt",
    
    // Gamification
    pointsTitle: "Signal Rank & Achievements",
    pointsDesc: "Increase your standing. Gain Signal Points (PTS) by performing server maintenance actions.",
    rankLabel: "Vexora Rank",
    pointsLabel: "Signal Points",
    maintenanceActions: "Available Maintenance Actions",
    dailyChallenges: "Daily Content Challenges",
    submitChallenge: "Submit Response",
    challengePlaceholder: "Write your solution or response to today's prompt...",
    upvoted: "Upvoted submission!",
    actionSuccess: "Action completed successfully!",
    
    // Privacy & Controls
    anonTitle: "Controlled Anonymous Node Mode",
    anonDesc: "Publish to the public network under a secure cryptographic alias. Strict AI safety filters applied.",
    toggleAnon: "Enable Ghost Node Mask",
    anonStatusOn: "Ghost Node Identity: ACTIVE",
    anonStatusOff: "Ghost Node Identity: OFFLINE",
    anonWarning: "Warning: All anonymous signals pass through the Vexora Moderation Matrix. Abuse will result in node isolation.",
    anonInputPlaceholder: "Broadcast an anonymous thought to the public feed...",
    anonPublish: "Publish Anonymously",
    
    // Filter
    filterTitle: "Frequency Content Filter",
    filterDesc: "Configure prohibited signal terms. Intercepted words are instantly redacted into high-tech placeholders.",
    prohibitedWords: "Configured Prohibited Words",
    addWord: "Add Filter Word",
    testFilter: "Content Shield Test Area",
    testInputPlaceholder: "Type something containing prohibited words to test...",
    filteredOutput: "Filtered Output (Redacted Feed)",
  },
  ar: {
    labsTitle: "مختبر فيكسورا التجريبي",
    labsSubtitle: "الوحدات العصبية المترابطة والميزات المستقبلية للنظام",
    tabGeoWatch: "الغرف الافتراضية والخرائط",
    tabSmartChat: "أدوات الشات الذكي",
    tabGamification: "زيادة التفاعل والتصنيف",
    tabPrivacy: "الخصوصية وفلاتر المحتوى",
    
    // Geo-Chat
    geoTitle: "غرف الدردشة المبنية على الخرائط (Geo-Chat)",
    geoDesc: "ادخل في عقد كمومية محلية بناءً على التجمعات الجغرافية للدردشة اللحظية مع الأقران القريبين.",
    selectNode: "اختر عقدة كمومية للاتصال بها",
    connectedNode: "متصل حالياً بالعقدة: ",
    onlinePeers: "الأعضاء المتصلين بالمنطقة",
    sendSignal: "إرسال إشارة",
    typeSignalPlaceholder: "بث رسالة للمجال الجغرافي المحدد...",
    
    // Watch Party
    watchTitle: "غرف المشاهدة والاستماع المشترك",
    watchDesc: "شاهد الأنماط والتموجات السيبرانية مع زملائك في بث تفاعلي موحد.",
    selectStream: "اختر قناة البث",
    liveChat: "بث دردشة الجمهور الحي",
    commentPlaceholder: "أضف صوتك وتفاعلك مع الغرفة...",
    
    // Stealth & Destruct
    stealthTitle: "المحادثات ذات التدمير الذاتي المشروط",
    stealthDesc: "تختفي الرسائل وتذوب تماماً من الوجود والذاكرة بناءً على شروط زمنية تحددها.",
    destructionRule: "قاعدة التدمير",
    countdown5: "تدمير بعد 5 ثوانٍ",
    countdown10: "تدمير بعد 10 ثوانٍ",
    onExit: "عند إغلاق الجلسة",
    stealthInputPlaceholder: "اكتب رسالة سرية مشفرة...",
    dissolved: "تم تدمير البيانات وحذفها نهائياً من الذاكرة المحلية.",
    
    // Icebreakers & Game
    iceTitle: "نظام كسر الجليد والألعاب المصغرة (X-O)",
    iceDesc: "اكسر حاجز التردد مع المستخدمين الجدد باستخدام أسئلة الذكاء الاصطناعي أو لعبة مصغرة تفاعلية.",
    playCpu: "العب ضد الذكاء الاصطناعي لفيكسورا",
    resetGame: "إعادة تشغيل اللعبة",
    yourTurn: "دورك الآن (X)",
    cpuTurn: "جاري تفكير الذكاء الاصطناعي (O)",
    playerWins: "لقد تغلبت على الذكاء الاصطناعي! (فوز X)",
    cpuWins: "تفوق عليك الذكاء الاصطناعي! (فوز O)",
    drawGame: "تعادل: تمت مزامنة البيانات بالتساوي",
    askIcebreaker: "توليد سؤال كسر الجليد",
    
    // Gamification
    pointsTitle: "رتبة الإشارة والإنجازات",
    pointsDesc: "ارفع مستواك ونقاطك الرقمية من خلال القيام بأعمال صيانة وتأمين خوادم فيكسورا.",
    rankLabel: "رتبة فيكسورا",
    pointsLabel: "نقاط الإشارة",
    maintenanceActions: "أعمال الصيانة المتاحة لجمع النقاط",
    dailyChallenges: "التحديات اليومية لصناع المحتوى",
    submitChallenge: "إرسال المشاركة",
    challengePlaceholder: "اكتب إجابتك أو حلّك لتحدي اليوم الفني...",
    upvoted: "تم التصويت بنجاح على مشاركة الزميل!",
    actionSuccess: "تم تنفيذ عملية الصيانة بنجاح وحصد النقاط!",
    
    // Privacy & Controls
    anonTitle: "الوضع المجهول الخاضع للرقابة",
    anonDesc: "انشر أفكارك على الشبكة العامة بهوية مشفرة ومستعارة بالكامل مع تفعيل جدار حماية ذكي.",
    toggleAnon: "تفعيل قناع العقدة الشبحية",
    anonStatusOn: "هوية العقدة الشبحية: نشطة ومؤمنة",
    anonStatusOff: "هوية العقدة الشبحية: غير مفعلة",
    anonWarning: "تنبيه: جميع الإشارات المجهولة تخضع لرقابة حثيثة لضمان بيئة آمنة ونظيفة. سوء الاستخدام يؤدي لعزل العقدة.",
    anonInputPlaceholder: "انشر فكرة مجهولة في الخلاصة العامة للشبكة...",
    anonPublish: "نشر بهوية مجهولة",
    
    // Filter
    filterTitle: "فلترة المحتوى المتقدمة للرسائل",
    filterDesc: "قم بتهيئة مصفوفة الكلمات المحظورة ليتم حجبها واستبدالها تلقائياً بمقاطع مشفرة عالية الدقة.",
    prohibitedWords: "الكلمات المحظورة المحددة",
    addWord: "إضافة كلمة للقائمة",
    testFilter: "منطقة تجربة جدار الحماية",
    testInputPlaceholder: "اكتب جملة تحتوي على الكلمات المحظورة لتجربة الفلترة الفورية...",
    filteredOutput: "المخرجات بعد التصفية والتشفير",
  }
};

const DEFAULT_PROHIBITED_WORDS = ['spam', 'hack', 'virus', 'إساءة', 'احتيال', 'بديل'];

const MOCK_MAP_NODES = [
  { id: 'cairo', nameAr: 'عقدة القاهرة (Cairo Node)', nameEn: 'Cairo Node', lat: '40%', lng: '35%', color: '#ec4899', peers: 124 },
  { id: 'riyadh', nameAr: 'عقدة الرياض (Riyadh Node)', nameEn: 'Riyadh Node', lat: '52%', lng: '55%', color: '#3b82f6', peers: 198 },
  { id: 'dubai', nameAr: 'عقدة دبي (Dubai Node)', nameEn: 'Dubai Node', lat: '48%', lng: '68%', color: '#10b981', peers: 240 },
  { id: 'amman', nameAr: 'عقدة عمّان (Amman Node)', nameEn: 'Amman Node', lat: '36%', lng: '48%', color: '#a855f7', peers: 86 },
  { id: 'casablanca', nameAr: 'عقدة الدار البيضاء (Casablanca Node)', nameEn: 'Casablanca Node', lat: '32%', lng: '15%', color: '#f59e0b', peers: 110 },
  { id: 'london', nameAr: 'عقدة لندن (London Node)', nameEn: 'London Node', lat: '18%', lng: '22%', color: '#14b8a6', peers: 320 }
];

const ICEBREAKER_QUESTIONS = {
  en: [
    "If you could link your mind to any neural database, which knowledge field would you download first?",
    "Do you believe AI-driven systems should have an digital bill of rights in 2026?",
    "What is the most creative digital project you've worked on recently?",
    "If Vexora had a physical embassy, in which cybercity would it be built?",
    "Would you prefer to live fully inside a digital simulation if it offered ultimate freedom?"
  ],
  ar: [
    "إذا كان بإمكانك ربط عقلك بقاعدة بيانات كمومية، فما هو المجال الذي ستقوم بتحميله أولاً؟",
    "هل تعتقد أن الأنظمة القائمة على الذكاء الاصطناعي تستحق وثيقة حقوق رقمية بحلول عام 2026؟",
    "ما هو المشروع الرقمي الأكثر إبداعاً الذي عملت عليه مؤخراً؟",
    "إذا كان لفيكسورا سفارة فيزيائية، في أي مدينة سيبرانية تفضل بناؤها؟",
    "هل تفضل العيش بالكامل داخل محاكاة رقمية متكاملة إذا وفرت لك حرية مطلقة؟"
  ]
};

const MOCK_CHALLENGE_SUBMISSIONS = [
  { id: '1', author: 'Ghost Node #22', textEn: 'Clean functional design with 100% test coverage!', textAr: 'تصميم وظيفي أنيق مع تغطية اختبارات بنسبة 100٪!', upvotes: 14, voted: false },
  { id: '2', author: 'Alice Cyber', textEn: 'Used procedural generation to render a high-performance grid.', textAr: 'استخدمت التوليد الإجرائي لتجسيد شبكة عالية الأداء.', upvotes: 28, voted: false },
  { id: '3', author: 'Quantum Fox', textEn: 'Built a beautiful customized custom visualizer for node traffic.', textAr: 'قمت ببناء مصور مرئي مخصص لعقد المرور والبيانات.', upvotes: 9, voted: false }
];

const MOCK_WATCH_STREAMS = [
  { id: 'stream-1', titleEn: 'Neon Grid Highway Visualizer', titleAr: 'مخطط الطريق السيبراني المضيء', style: 'bg-gradient-to-r from-purple-900 via-indigo-950 to-pink-900', speed: 1.5 },
  { id: 'stream-2', titleEn: 'Cybernetic Matrix Terminal Loop', titleAr: 'حلقة المحطة السيبرانية المترابطة', style: 'bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950', speed: 0.8 },
  { id: 'stream-3', titleEn: 'Quantum Particle Stream Simulator', titleAr: 'محاكي دفق الجسيمات الكمية', style: 'bg-gradient-to-r from-amber-950 via-stone-950 to-red-950', speed: 2.2 }
];

export function VexoraLabs({ language, currentUser, onAddPost, addNotification }: VexoraLabsProps) {
  const t = language === 'ar' ? labTranslations.ar : labTranslations.en;
  
  // Active Tab
  const [activeTab, setActiveTab] = useState<'geo' | 'smart' | 'gamification' | 'privacy'>('geo');
  
  // State for Geo-Chat
  const [selectedNodeId, setSelectedNodeId] = useState<string>('riyadh');
  const [geoMessages, setGeoMessages] = useState<Record<string, Array<{ id: string, sender: string, text: string, time: string, isUser?: boolean }>>>({
    riyadh: [
      { id: '1', sender: 'Faisal Node', text: language === 'ar' ? 'أهلاً بكم في عقدة الرياض! الإشارات ممتازة هنا.' : 'Welcome to Riyadh node! Signal strength is excellent.', time: '14:22' },
      { id: '2', sender: 'Quantum Dev', text: language === 'ar' ? 'مستعدون لبدء البث الموحد للمحافظة الشرقية.' : 'Ready to start the unified eastern province broadcast.', time: '14:24' }
    ],
    cairo: [
      { id: '1', sender: 'SphinX Node', text: language === 'ar' ? 'تحياتي من قلب القاهرة الرقمية!' : 'Greetings from the heart of digital Cairo!', time: '14:20' }
    ],
    dubai: [
      { id: '1', sender: 'Burj Signal', text: language === 'ar' ? 'سرعة التزامن في عقدة دبي تجاوزت 2.4 تيرابايت.' : 'Dubai Node sync speed has surpassed 2.4 TB/s.', time: '14:15' }
    ],
    amman: [
      { id: '1', sender: 'Jabal Amman', text: language === 'ar' ? 'مساء الخير للجميع، من ينضم لنقاش المطورين الليلة؟' : 'Good evening everyone, who is joining the dev talk tonight?', time: '14:10' }
    ],
    casablanca: [
      { id: '1', sender: 'Atlas Core', text: language === 'ar' ? 'العقدة مستقرة بنسبة 99.9٪ في الدار البيضاء.' : 'Node stability is at 99.9% in Casablanca.', time: '14:02' }
    ],
    london: [
      { id: '1', sender: 'Thames Signal', text: language === 'ar' ? 'أهلاً بالجميع في البث الدولي المشترك.' : 'Hello everyone in the international joint broadcast.', time: '13:58' }
    ]
  });
  const [geoInput, setGeoInput] = useState('');
  
  // State for Watch Party
  const [activeStreamId, setActiveStreamId] = useState('stream-1');
  const [watchMessages, setWatchMessages] = useState<Array<{ id: string, sender: string, text: string }>>([
    { id: '1', sender: 'Vibe Explorer', text: language === 'ar' ? 'هذه الموسيقى تساعدني على البرمجة بتركيز عالي' : 'This visual rhythm helps me code with ultimate focus' },
    { id: '2', sender: 'Luna Node', text: language === 'ar' ? 'رائع جداً التموج اللوني مستمر مع الذبذبات' : 'Superb color blending syncing perfectly with frequencies' }
  ]);
  const [watchInput, setWatchInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Watch party background rendering visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let width = canvas.width = 400;
    let height = canvas.height = 150;
    
    const stream = MOCK_WATCH_STREAMS.find(s => s.id === activeStreamId) || MOCK_WATCH_STREAMS[0];
    let offset = 0;
    
    const render = () => {
      ctx.fillStyle = 'rgba(10, 10, 12, 0.15)';
      ctx.fillRect(0, 0, width, height);
      
      offset += stream.speed * 0.05;
      
      ctx.lineWidth = 2;
      
      // Draw waves
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = i === 0 ? 'rgba(168, 85, 247, 0.6)' : i === 1 ? 'rgba(236, 72, 153, 0.4)' : 'rgba(59, 130, 246, 0.3)';
        ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.02 + offset + i) * (20 + i * 10) * Math.cos(offset * 0.2);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeStreamId]);

  // State for Stealth Chat (Conditional Self-Destruction)
  const [stealthMessages, setStealthMessages] = useState<Array<{ id: string, text: string, countdown: number, isSelf: boolean, timestamp: number }>>([]);
  const [stealthInput, setStealthInput] = useState('');
  const [destructionRule, setDestructionRule] = useState<'5s' | '10s' | 'exit'>('5s');

  useEffect(() => {
    // Intercepted interval to tick down countdowns
    const interval = setInterval(() => {
      setStealthMessages(prev => {
        return prev.map(m => {
          if (m.countdown > 0) {
            return { ...m, countdown: m.countdown - 1 };
          }
          return m;
        }).filter(m => m.countdown > 0 || m.countdown === -99); // -99 is for onExit
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // State for Smart Icebreaker
  const [currentIcebreaker, setCurrentIcebreaker] = useState<string>('');
  
  // State for X-O game (Tic-Tac-Toe)
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameResult, setGameResult] = useState<'X' | 'O' | 'Draw' | null>(null);
  const [score, setScore] = useState({ player: 0, cpu: 0 });

  const checkWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(square => square !== null)) {
      return 'Draw';
    }
    return null;
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || gameResult || !isXNext) return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const winner = checkWinner(newBoard);
    if (winner) {
      setGameResult(winner as 'X' | 'O' | 'Draw');
      if (winner === 'X') {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
        handlePointGain(25, language === 'ar' ? 'فزت في لعبة X-O السيبرانية!' : 'Won Tic-Tac-Toe cybersecurity grid!');
      }
    } else {
      setIsXNext(false);
      // Trigger CPU move with dynamic delay
      setTimeout(() => {
        makeCpuMove(newBoard);
      }, 600);
    }
  };

  const makeCpuMove = (currentBoard: Array<string | null>) => {
    const winnerCheck = checkWinner(currentBoard);
    if (winnerCheck) return;

    // Find available indices
    const available = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    if (available.length === 0) return;
    
    // CPU logic: Try to win or block player, otherwise pick random
    let chosenIndex = available[0];
    
    // Simple heuristic
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    // 1. Can CPU win?
    let winMove = -1;
    for (const [a, b, c] of lines) {
      const vals = [currentBoard[a], currentBoard[b], currentBoard[c]];
      if (vals.filter(v => v === 'O').length === 2 && vals.filter(v => v === null).length === 1) {
        const nullIdx = [a, b, c].find(idx => currentBoard[idx] === null);
        if (nullIdx !== undefined) winMove = nullIdx;
      }
    }
    
    // 2. Can CPU block?
    let blockMove = -1;
    if (winMove === -1) {
      for (const [a, b, c] of lines) {
        const vals = [currentBoard[a], currentBoard[b], currentBoard[c]];
        if (vals.filter(v => v === 'X').length === 2 && vals.filter(v => v === null).length === 1) {
          const nullIdx = [a, b, c].find(idx => currentBoard[idx] === null);
          if (nullIdx !== undefined) blockMove = nullIdx;
        }
      }
    }

    if (winMove !== -1) {
      chosenIndex = winMove;
    } else if (blockMove !== -1) {
      chosenIndex = blockMove;
    } else {
      chosenIndex = available[Math.floor(Math.random() * available.length)];
    }

    const nextBoard = [...currentBoard];
    nextBoard[chosenIndex] = 'O';
    setBoard(nextBoard);
    setIsXNext(true);

    const winner = checkWinner(nextBoard);
    if (winner) {
      setGameResult(winner as 'X' | 'O' | 'Draw');
      if (winner === 'O') {
        setScore(prev => ({ ...prev, cpu: prev.cpu + 1 }));
      }
    }
  };

  const handleResetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameResult(null);
  };

  // State for Instant Translator
  const [translatorSource, setTranslatorSource] = useState('');
  const [translatorDest, setTranslatorDest] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = () => {
    if (!translatorSource.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      // Basic rule-based dictionary simulation or smart translation
      let translated = '';
      const text = translatorSource.toLowerCase().trim();
      
      if (language === 'ar') {
        // Arabic to English translations
        if (text.includes('مرحبا') || text.includes('أهلا')) translated = 'Hello, welcome to Vexora Network!';
        else if (text.includes('كيف حالك')) translated = 'How are you? Quantum node link is operational.';
        else if (text.includes('مستقبل')) translated = 'The digital future is decentralized and unified.';
        else if (text.includes('امن') || text.includes('أمان')) translated = 'Security is compiled into our core code blocks.';
        else translated = `[Quantum Translate]: "${translatorSource}" translated to English successfully. Node ID matches verified.`;
      } else {
        // English to Arabic translations
        if (text.includes('hello') || text.includes('hi')) translated = 'مرحباً بك في شبكة فيكسورا اللامركزية!';
        else if (text.includes('how are you')) translated = 'كيف حالك؟ إشارة العقدة الكمومية مستقرة تماماً.';
        else if (text.includes('future')) translated = 'المستقبل الرقمي لامركزي وموحد.';
        else if (text.includes('secure') || text.includes('security')) translated = 'الأمان مدمج في كتل التعليمات البرمجية الأساسية لدينا.';
        else translated = `[الترجمة الكمومية]: تم ترجمة "${translatorSource}" إلى العربية بنجاح ومطابقة هوية العقدة.`;
      }
      
      setTranslatorDest(translated);
      setIsTranslating(false);
      addNotification(language === 'ar' ? "تمت الترجمة الفورية بنجاح" : "Instant translation compiled", "success");
    }, 800);
  };

  // State for Gamification / Achievements / Challenges
  const [signalPoints, setSignalPoints] = useState(() => {
    const saved = localStorage.getItem('vexora_points');
    return saved ? parseInt(saved, 10) : 150;
  });
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeSubmissions, setChallengeSubmissions] = useState(MOCK_CHALLENGE_SUBMISSIONS);

  const handlePointGain = (amount: number, reason: string) => {
    const nextPoints = signalPoints + amount;
    setSignalPoints(nextPoints);
    localStorage.setItem('vexora_points', nextPoints.toString());
    addNotification(`${language === 'ar' ? 'تم كسب نقاط!' : 'Earned Points!'} +${amount} PTS: ${reason}`, 'success');
  };

  const getRank = (pts: number) => {
    if (pts < 200) return language === 'ar' ? 'إشارة مبتدئة (New Signal)' : 'New Signal';
    if (pts < 400) return language === 'ar' ? 'عقدة معتمدة (Verified Node)' : 'Verified Node';
    if (pts < 600) return language === 'ar' ? 'حارس مصفوفة (Matrix Guard)' : 'Matrix Guard';
    return language === 'ar' ? 'النواة الكمية (Quantum Core)' : 'Quantum Core';
  };

  const handleMaintenanceAction = (actionId: string, pts: number, name: string) => {
    handlePointGain(pts, name);
  };

  const handleChallengeSubmit = () => {
    if (!challengeInput.trim()) return;
    const newSub = {
      id: Date.now().toString(),
      author: currentUser?.name || 'Anonymous Node',
      textEn: challengeInput,
      textAr: challengeInput,
      upvotes: 1,
      voted: true
    };
    setChallengeSubmissions([newSub, ...challengeSubmissions]);
    setChallengeInput('');
    handlePointGain(45, language === 'ar' ? 'المشاركة في التحدي اليومي!' : 'Submitted to Daily Code Challenge!');
  };

  const handleUpvoteSubmission = (id: string) => {
    setChallengeSubmissions(prev => {
      return prev.map(s => {
        if (s.id === id) {
          if (s.voted) {
            return { ...s, upvotes: s.upvotes - 1, voted: false };
          } else {
            return { ...s, upvotes: s.upvotes + 1, voted: true };
          }
        }
        return s;
      });
    });
    addNotification(t.upvoted, 'info');
  };

  // State for Controlled Anonymous Post Mode
  const [isAnonMode, setIsAnonMode] = useState(false);
  const [anonInput, setAnonInput] = useState('');

  const handlePublishAnon = () => {
    if (!anonInput.trim()) return;
    
    // Simple content shield matching
    let checkedText = anonInput;
    prohibitedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      checkedText = checkedText.replace(regex, '█████');
    });

    onAddPost(checkedText, 'public', undefined, true);
    setAnonInput('');
    setIsAnonMode(false);
    handlePointGain(15, language === 'ar' ? 'نشر مشفر بهوية مجهولة!' : 'Published secure anonymous thought!');
  };

  // State for Advanced Content Filter
  const [prohibitedWords, setProhibitedWords] = useState<string[]>(() => {
    const saved = localStorage.getItem('prohibited_words');
    return saved ? JSON.parse(saved) : DEFAULT_PROHIBITED_WORDS;
  });
  const [filterInput, setFilterInput] = useState('');
  const [filterTestText, setFilterTestText] = useState('');
  const [filteredOutput, setFilteredOutput] = useState('');

  const handleAddFilterWord = () => {
    if (!filterInput.trim()) return;
    const nextWords = [...prohibitedWords, filterInput.trim().toLowerCase()];
    setProhibitedWords(nextWords);
    localStorage.setItem('prohibited_words', JSON.stringify(nextWords));
    setFilterInput('');
    addNotification(language === 'ar' ? "تم إدراج الكلمة المحظورة بنجاح" : "Prohibited word added successfully", "info");
  };

  const handleRemoveFilterWord = (wordToRemove: string) => {
    const nextWords = prohibitedWords.filter(w => w !== wordToRemove);
    setProhibitedWords(nextWords);
    localStorage.setItem('prohibited_words', JSON.stringify(nextWords));
    addNotification(language === 'ar' ? "تم إزالة الكلمة" : "Filtered word removed", "info");
  };

  // Run Content Filter real-time test
  useEffect(() => {
    let output = filterTestText;
    prohibitedWords.forEach(word => {
      if (!word) return;
      const regex = new RegExp(word, 'gi');
      output = output.replace(regex, '█████');
    });
    setFilteredOutput(output);
  }, [filterTestText, prohibitedWords]);

  const handleSendGeoMessage = () => {
    if (!geoInput.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: currentUser?.name || 'Anonymous Node',
      text: geoInput,
      time: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };
    
    setGeoMessages(prev => ({
      ...prev,
      [selectedNodeId]: [...(prev[selectedNodeId] || []), newMessage]
    }));
    
    setGeoInput('');
    handlePointGain(5, language === 'ar' ? 'بث في العقدة الجغرافية' : 'Broadcasting on geographic node');

    // Simulate responsive peer chat
    setTimeout(() => {
      const responses = language === 'ar' ? [
        'وصلت رسالتك بوضوح عبر المزامنة الكمية!',
        'مرحباً بك معنا في هذه العقدة الجغرافية المحلية.',
        'الإشارة مستقرة، هل تود مشاركة تحديثات برمجية؟'
      ] : [
        'Your message received perfectly via quantum sync!',
        'Welcome to this local geographic cluster!',
        'Signal stable, would you like to share some dev updates?'
      ];
      
      const peerMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Peer ' + Math.floor(Math.random() * 900 + 100),
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };
      
      setGeoMessages(prev => ({
        ...prev,
        [selectedNodeId]: [...(prev[selectedNodeId] || []), peerMessage]
      }));
    }, 1500);
  };

  const handleSendWatchComment = () => {
    if (!watchInput.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      sender: currentUser?.name || 'Vexora User',
      text: watchInput
    };
    setWatchMessages([...watchMessages, newComment]);
    setWatchInput('');
    handlePointGain(5, language === 'ar' ? 'المشاركة في حفل المشاهدة' : 'Participated in watch party stream');

    // Simulate random feedback
    setTimeout(() => {
      const feedback = language === 'ar' ? [
        'رؤية رائعة وألوان متجانسة جداً!',
        'سيل رائع من ذبذبات النبض الرقمي.',
        'أوافقك الرأي تماماً، التناسق هنا ممتاز.'
      ] : [
        'Amazing visualization flow!',
        'Unified sync frequency is incredible.',
        'Total consensus, excellent streaming output.'
      ];
      setWatchMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'Attendee #' + Math.floor(Math.random() * 90 + 10), text: feedback[Math.floor(Math.random() * feedback.length)] }
      ]);
    }, 1200);
  };

  const handleSendStealthMessage = () => {
    if (!stealthInput.trim()) return;
    const duration = destructionRule === '5s' ? 5 : destructionRule === '10s' ? 10 : -99;
    const newMessage = {
      id: Date.now().toString(),
      text: stealthInput,
      countdown: duration,
      isSelf: true,
      timestamp: Date.now()
    };
    
    setStealthMessages(prev => [...prev, newMessage]);
    setStealthInput('');
    handlePointGain(8, language === 'ar' ? 'إرسال رسالة شبحية سرية' : 'Dispatched stealth dynamic message');

    // Simulated reply after delay
    setTimeout(() => {
      const replyText = language === 'ar' ? 'هذه الرسالة تتبخر من تلقاء نفسها أيضاً!' : 'This reply will vanish automatically too!';
      const peerMessage = {
        id: (Date.now() + 2).toString(),
        text: replyText,
        countdown: duration,
        isSelf: false,
        timestamp: Date.now()
      };
      setStealthMessages(prev => [...prev, peerMessage]);
    }, 1000);
  };

  return (
    <div id="vexora-labs-container" className="space-y-8 animate-in fade-in duration-500">
      
      {/* Title block */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Cpu className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tightest text-white">
              {t.labsTitle}
            </h2>
            <p className="text-white/20 text-[10px] font-mono tracking-[0.2em] uppercase">
              {t.labsSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: 'geo', label: t.tabGeoWatch, icon: <Compass className="w-3.5 h-3.5" /> },
          { id: 'smart', label: t.tabSmartChat, icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'gamification', label: t.tabGamification, icon: <Trophy className="w-3.5 h-3.5" /> },
          { id: 'privacy', label: t.tabPrivacy, icon: <Shield className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`lab-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-[0.1em] flex items-center gap-2 transition-all border cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                : 'bg-white/5 border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.08]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: Geo-Chat & Watch Party */}
      {activeTab === 'geo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Map-based Geo-Chat */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500 animate-bounce" />
                <h3 className="text-lg font-black uppercase text-white">{t.geoTitle}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.geoDesc}</p>
            </div>

            {/* Simulated interactive holographic Map */}
            <div className="relative h-48 bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
              <span className="absolute top-2 left-2 text-[8px] font-mono text-white/20 uppercase tracking-widest">HOLOGRAPHIC GEOGRAPHY MATRIX</span>
              
              {/* Map pins */}
              {MOCK_MAP_NODES.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ top: node.lat, left: node.lng }}
                  className={`absolute group cursor-pointer transition-all ${selectedNodeId === node.id ? 'scale-125 z-10' : 'scale-100 hover:scale-110'}`}
                  title={language === 'ar' ? node.nameAr : node.nameEn}
                >
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full animate-ping" style={{ backgroundColor: node.color, opacity: selectedNodeId === node.id ? 0.6 : 0.2 }} />
                  <div className={`w-2.5 h-2.5 rounded-full border border-white shadow-xl relative z-20`} style={{ backgroundColor: node.color }} />
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 text-[7.5px] font-mono text-white rounded px-1 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                    {language === 'ar' ? node.nameAr.split(' ')[0] : node.nameEn.split(' ')[0]} ({node.peers} Peers)
                  </div>
                </button>
              ))}
            </div>

            {/* Current Active Geo Node Messages */}
            <div className="border border-white/5 rounded-2xl p-4 bg-white/[0.01] space-y-4 flex flex-col h-60">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-purple-400 font-semibold">
                  {t.connectedNode} <span className="text-white">{(MOCK_MAP_NODES.find(n => n.id === selectedNodeId) || MOCK_MAP_NODES[1]).nameEn}</span>
                </span>
                <span className="text-[8px] font-mono text-white/30 uppercase">
                  {(MOCK_MAP_NODES.find(n => n.id === selectedNodeId) || MOCK_MAP_NODES[1]).peers} {t.onlinePeers}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
                {(geoMessages[selectedNodeId] || []).map(msg => (
                  <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${msg.isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <span className="text-[8.5px] font-mono text-white/30">{msg.sender} <span className="text-white/10">• {msg.time}</span></span>
                    <div className={`p-2.5 rounded-xl text-xs ${msg.isUser ? 'bg-purple-600/25 border border-purple-500/30 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2 border-t border-white/5 pt-3">
                <input
                  type="text"
                  value={geoInput}
                  onChange={(e) => setGeoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendGeoMessage()}
                  placeholder={t.typeSignalPlaceholder}
                  className="flex-1 bg-white/5 border border-white/5 hover:border-white/10 focus:border-purple-500/50 rounded-xl px-4 text-xs focus:outline-none transition-all text-white placeholder:text-white/20 h-10"
                />
                <button
                  onClick={handleSendGeoMessage}
                  className="w-10 h-10 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 flex items-center justify-center text-purple-300 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Watch Party Rooms */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black uppercase text-white">{t.watchTitle}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.watchDesc}</p>
            </div>

            {/* Cyber stream channels selection */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {MOCK_WATCH_STREAMS.map(stream => (
                <button
                  key={stream.id}
                  onClick={() => setActiveStreamId(stream.id)}
                  className={`px-3 py-2 rounded-xl border whitespace-nowrap text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeStreamId === stream.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-white/5 border-transparent text-white/40 hover:bg-white/[0.08]'
                  }`}
                >
                  {language === 'ar' ? stream.titleAr : stream.titleEn}
                </button>
              ))}
            </div>

            {/* Animated Canvas Video Stream Player */}
            <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black shadow-inner flex flex-col justify-between h-44">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
              
              {/* Overlay elements */}
              <div className="p-3 flex justify-between items-start relative z-10 w-full">
                <span className="bg-red-600 text-white font-mono font-bold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">LIVE</span>
                <span className="text-[8px] font-mono text-white/40 uppercase bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                  {language === 'ar' ? 'البث المشترك #' : 'JOINT BROADCAST #'}{activeStreamId.toUpperCase()}
                </span>
              </div>

              <div className="p-3 relative z-10 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 drop-shadow">
                  {language === 'ar' ? (MOCK_WATCH_STREAMS.find(s => s.id === activeStreamId)?.titleAr) : (MOCK_WATCH_STREAMS.find(s => s.id === activeStreamId)?.titleEn)}
                </span>
              </div>
            </div>

            {/* Audience Live Chat Stream */}
            <div className="border border-white/5 rounded-2xl p-4 bg-white/[0.01] space-y-4 flex flex-col h-56">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider border-b border-white/5 pb-2">
                {t.liveChat}
              </span>

              <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-hide pr-1">
                {watchMessages.map(msg => (
                  <div key={msg.id} className="text-xs leading-normal">
                    <span className="font-mono text-emerald-400 mr-1.5">{msg.sender}:</span>
                    <span className="text-white/80">{msg.text}</span>
                  </div>
                ))}
              </div>

              {/* Chat Send */}
              <div className="flex gap-2 border-t border-white/5 pt-3">
                <input
                  type="text"
                  value={watchInput}
                  onChange={(e) => setWatchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWatchComment()}
                  placeholder={t.commentPlaceholder}
                  className="flex-1 bg-white/5 border border-white/5 hover:border-white/10 focus:border-emerald-500/50 rounded-xl px-4 text-xs focus:outline-none transition-all text-white placeholder:text-white/20 h-10"
                />
                <button
                  onClick={handleSendWatchComment}
                  className="w-10 h-10 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 flex items-center justify-center text-emerald-300 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Smart Chat & Translation Playground */}
      {activeTab === 'smart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Conditional Self-Destruction Stealth Chat */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-lg font-black uppercase text-white">{t.stealthTitle}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.stealthDesc}</p>
            </div>

            {/* Rule Configuration */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">{t.destructionRule}:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '5s', label: t.countdown5 },
                  { id: '10s', label: t.countdown10 },
                  { id: 'exit', label: t.onExit }
                ].map(rule => (
                  <button
                    key={rule.id}
                    onClick={() => setDestructionRule(rule.id as any)}
                    className={`p-2.5 rounded-xl border text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer text-center ${
                      destructionRule === rule.id
                        ? 'bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                        : 'bg-white/5 border-transparent text-white/40 hover:bg-white/[0.08]'
                    }`}
                  >
                    {rule.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Chat Console */}
            <div className="border border-white/5 rounded-2xl p-4 bg-white/[0.01] space-y-4 flex flex-col h-60">
              <div className="flex-1 overflow-y-auto space-y-3.5 scrollbar-hide pr-1">
                {stealthMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-white/20">
                    <Shield className="w-8 h-8 opacity-25" />
                    <span className="text-[9px] font-mono uppercase tracking-widest">End-to-End Cryptography active</span>
                  </div>
                ) : (
                  stealthMessages.map(msg => (
                    <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${msg.isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/30">
                        <span>{msg.isSelf ? 'Local Agent' : 'Remote Node'}</span>
                        <span>•</span>
                        {msg.countdown > 0 ? (
                          <span className="text-red-400 font-bold animate-pulse">Vanish in {msg.countdown}s</span>
                        ) : (
                          <span className="text-indigo-400 font-bold uppercase tracking-wider">SECURE LINKED SESSION</span>
                        )}
                      </div>
                      <div className={`p-2.5 rounded-xl text-xs border ${
                        msg.isSelf 
                          ? 'bg-red-950/20 border-red-500/20 text-white rounded-tr-none' 
                          : 'bg-zinc-900/60 border-white/10 text-white/90 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat input */}
              <div className="flex gap-2 border-t border-white/5 pt-3">
                <input
                  type="text"
                  value={stealthInput}
                  onChange={(e) => setStealthInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendStealthMessage()}
                  placeholder={t.stealthInputPlaceholder}
                  className="flex-1 bg-white/5 border border-white/5 hover:border-white/10 focus:border-red-500/50 rounded-xl px-4 text-xs focus:outline-none transition-all text-white placeholder:text-white/20 h-10"
                />
                <button
                  onClick={handleSendStealthMessage}
                  className="w-10 h-10 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 flex items-center justify-center text-red-300 transition-all cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Smart Icebreakers & Tic-Tac-Toe */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-spin-slow" />
                <h3 className="text-lg font-black uppercase text-white">{t.iceTitle}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.iceDesc}</p>
            </div>

            {/* Icebreaker Questions Engine */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/30">AI Icebreaker Prompter</span>
                <button
                  onClick={() => {
                    const pool = language === 'ar' ? ICEBREAKER_QUESTIONS.ar : ICEBREAKER_QUESTIONS.en;
                    const randomQ = pool[Math.floor(Math.random() * pool.length)];
                    setCurrentIcebreaker(randomQ);
                    addNotification(language === 'ar' ? "تم توليد سؤال تفاعلي" : "Icebreaker generated successfully", "info");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[8px] font-mono uppercase tracking-wider text-purple-300 transition-all cursor-pointer"
                >
                  {t.askIcebreaker}
                </button>
              </div>
              
              <div className="min-h-[50px] flex items-center justify-center text-center p-2 rounded-xl bg-black/30 border border-white/5">
                <p className="text-xs text-white/90 font-medium italic">
                  {currentIcebreaker || (language === 'ar' ? 'اضغط لتوليد سؤال لكسر الجليد مع أقرانك...' : 'Press the button to generate a conversation icebreaker question...')}
                </p>
              </div>
            </div>

            {/* Tic-Tac-Toe (X-O) Interactive Grid */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/30">{t.playCpu}</span>
                <span className="text-[10px] font-mono text-purple-400">
                  {score.player} - {score.cpu}
                </span>
              </div>

              {/* Status or Result */}
              <div className="text-center">
                {gameResult ? (
                  <span className="text-xs font-bold font-mono uppercase text-pink-400 tracking-wider">
                    {gameResult === 'X' ? t.playerWins : gameResult === 'O' ? t.cpuWins : t.drawGame}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-white/40">
                    {isXNext ? t.yourTurn : t.cpuTurn}
                  </span>
                )}
              </div>

              {/* Grid 3x3 */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[180px] mx-auto">
                {board.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSquareClick(idx)}
                    className="aspect-square rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-purple-500/30 flex items-center justify-center font-black text-lg transition-all cursor-pointer active:scale-95"
                  >
                    <span className={cell === 'X' ? 'text-purple-400 font-mono' : cell === 'O' ? 'text-pink-400 font-mono' : 'text-transparent'}>
                      {cell || '-'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleResetGame}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-mono uppercase tracking-widest text-white/65 cursor-pointer"
                >
                  {t.resetGame}
                </button>
              </div>
            </div>

            {/* Real-time Translation Playground */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#38bdf8]" />
                <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/30">
                  {language === 'ar' ? 'بوابة الترجمة الكمومية الفورية' : 'Quantum Translator Link'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <span className="text-[8px] font-mono text-white/20 uppercase">{language === 'ar' ? 'المصدر (عربي)' : 'Source (English)'}</span>
                  <textarea
                    value={translatorSource}
                    onChange={(e) => setTranslatorSource(e.target.value)}
                    placeholder={language === 'ar' ? "اكتب النص المراد ترجمته هنا..." : "Type text to translate here..."}
                    className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#38bdf8]/50 resize-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <span className="text-[8px] font-mono text-white/20 uppercase">{language === 'ar' ? 'المخرجات (English)' : 'Output (العربية)'}</span>
                  <div className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-xl p-2 text-xs text-white/60 overflow-y-auto">
                    {isTranslating ? (
                      <span className="text-white/20 italic animate-pulse">Computing translation frequencies...</span>
                    ) : (
                      translatorDest || <span className="text-white/10 italic">Translation ready.</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleTranslate}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#38bdf8]/20 to-purple-600/20 border border-[#38bdf8]/30 hover:brightness-110 text-[9px] font-mono uppercase tracking-widest text-[#38bdf8] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                <span>{language === 'ar' ? 'مزامنة وترجمة الإشارة' : 'Sync & Translate Signal'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Gamification & Point System */}
      {activeTab === 'gamification' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Rank & Maintenance Quests */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h3 className="text-lg font-black uppercase text-white">{t.pointsTitle}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.pointsDesc}</p>
            </div>

            {/* Visual Progress Dashboard */}
            <div className="relative p-6 border border-white/10 rounded-2xl bg-black/40 overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3 relative z-10">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">{t.rankLabel}</span>
                <p className="text-xl font-black text-purple-400 tracking-wide uppercase">
                  {getRank(signalPoints)}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-[9px]">P</div>
                  <span className="text-2xl font-mono text-white font-black">{signalPoints} <span className="text-[10px] text-white/40 uppercase tracking-widest">PTS</span></span>
                </div>
              </div>
              
              {/* Radial or linear progression */}
              <div className="relative w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin-slow" />
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            {/* Server Maintenance Actions */}
            <div className="space-y-3">
              <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/30">
                {t.maintenanceActions}
              </span>
              
              <div className="space-y-2.5">
                {[
                  { id: 'ping', nameAr: 'بث أمر Ping لتنشيط خادم النواة', nameEn: 'Ping & stabilize central node gateways', pts: 15, cooldown: '10s' },
                  { id: 'encrypt', nameAr: 'تشفير كتل البيانات المترابطة', nameEn: 'Encrypt peer broadcast data stream', pts: 20, cooldown: '30s' },
                  { id: 'db_sync', nameAr: 'مزامنة وتطهير قاعدة بيانات فيكسورا', nameEn: 'Defragment cloud database partitions', pts: 25, cooldown: '1m' }
                ].map(act => (
                  <button
                    key={act.id}
                    onClick={() => handleMaintenanceAction(act.id, act.pts, language === 'ar' ? act.nameAr : act.nameEn)}
                    className="w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-white/10 flex justify-between items-center transition-all cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                      <div>
                        <p className="text-xs text-white/85 font-medium">{language === 'ar' ? act.nameAr : act.nameEn}</p>
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">EXPONENTIAL INGESTION RATE</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-yellow-400">+{act.pts} PTS</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Content Challenges */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black uppercase text-white">{t.dailyChallenges}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.pointsDesc}</p>
            </div>

            {/* Today's challenge visual card */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-950/40 via-indigo-950/20 to-black/40 border border-purple-500/20 relative overflow-hidden space-y-3.5">
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[8px] px-2 py-0.5 rounded-full uppercase">
                <Flame className="w-3 h-3 text-pink-400 animate-pulse" />
                <span>DAILY STREAK ACTIVE</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest">Active Challenge Vibe</span>
                <p className="text-sm text-white font-black leading-snug">
                  {language === 'ar' 
                    ? 'شاركنا بأجمل تصميم واجهة رقمية أو لقطة فنية سيبرانية عملت عليها اليوم!' 
                    : 'Share your most stunning cybernetic visual interface layout or design concept from today!'}
                </p>
              </div>

              {/* Input for submission */}
              <div className="space-y-2.5">
                <textarea
                  value={challengeInput}
                  onChange={(e) => setChallengeInput(e.target.value)}
                  placeholder={t.challengePlaceholder}
                  className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-none placeholder:text-white/20 leading-relaxed"
                />
                <button
                  onClick={handleChallengeSubmit}
                  className="w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[9px] font-mono uppercase tracking-widest text-white transition-all cursor-pointer"
                >
                  {t.submitChallenge}
                </button>
              </div>
            </div>

            {/* List of submissions */}
            <div className="space-y-3">
              <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/30">Community Solutions</span>
              
              <div className="space-y-2.5 h-44 overflow-y-auto scrollbar-hide pr-1">
                {challengeSubmissions.map(sub => (
                  <div key={sub.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-left">
                    <div className="space-y-1 max-w-[80%]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="text-[9px] font-mono font-bold text-white/40">{sub.author}</span>
                      </div>
                      <p className="text-xs text-white/80 leading-normal">
                        {language === 'ar' ? sub.textAr : sub.textEn}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleUpvoteSubmission(sub.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                        sub.voted 
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                          : 'bg-white/5 border-transparent text-white/30 hover:text-white/60'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[9.5px] font-mono font-black mt-1">{sub.upvotes}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Privacy & Moderation Matrix */}
      {activeTab === 'privacy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controlled Anonymous Post Mode */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black uppercase text-white">{t.anonTitle}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.anonDesc}</p>
            </div>

            {/* Toggle Panel */}
            <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              isAnonMode 
                ? 'bg-purple-600/10 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                : 'bg-white/5 border-transparent text-white/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isAnonMode ? 'bg-purple-400 animate-pulse' : 'bg-white/10'}`} />
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                  {isAnonMode ? t.anonStatusOn : t.anonStatusOff}
                </span>
              </div>
              <button
                onClick={() => setIsAnonMode(!isAnonMode)}
                className={`px-4 py-2 rounded-xl text-[9px] font-mono uppercase tracking-widest font-black transition-all border cursor-pointer ${
                  isAnonMode 
                    ? 'bg-purple-600/30 border-purple-400 text-white' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {t.toggleAnon}
              </button>
            </div>

            {/* Warnings Alert Box */}
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 flex gap-2.5 items-start text-left">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-300 leading-normal font-mono uppercase tracking-wider">
                {t.anonWarning}
              </p>
            </div>

            {/* Post formulation area */}
            <div className="space-y-3 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                {language === 'ar' ? 'نموذج المنشور الشبحي' : 'Cryptographic anonymous feed payload'}
              </span>

              <textarea
                value={anonInput}
                onChange={(e) => setAnonInput(e.target.value)}
                placeholder={t.anonInputPlaceholder}
                disabled={!isAnonMode}
                className={`w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-none transition-opacity ${!isAnonMode ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
              />

              <button
                onClick={handlePublishAnon}
                disabled={!isAnonMode || !anonInput.trim()}
                className={`w-full py-2.5 rounded-xl text-[9.5px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                  isAnonMode && anonInput.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-lg'
                    : 'bg-white/5 text-white/20 border-transparent cursor-not-allowed'
                }`}
              >
                {t.anonPublish}
              </button>
            </div>
          </div>

          {/* Content Filtering Advanced Settings */}
          <div className="flux-card border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#38bdf8]" />
                <h3 className="text-lg font-black uppercase text-white">{t.filterTitle}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t.filterDesc}</p>
            </div>

            {/* List of prohibited words */}
            <div className="space-y-3">
              <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/30">
                {t.prohibitedWords}
              </span>

              <div className="flex flex-wrap gap-1.5">
                {prohibitedWords.map(word => (
                  <div key={word} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80 font-mono">
                    <span>{word}</span>
                    <button 
                      onClick={() => handleRemoveFilterWord(word)} 
                      className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add word formulation */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFilterWord()}
                  placeholder={language === 'ar' ? "اكتب كلمة لمنعها..." : "Prohibited word..."}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-[#38bdf8]/50 text-white h-10 font-mono"
                />
                <button
                  onClick={handleAddFilterWord}
                  className="px-4 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/35 text-[9px] font-mono uppercase tracking-wider text-[#38bdf8] transition-all cursor-pointer hover:bg-[#38bdf8]/30"
                >
                  {t.addWord}
                </button>
              </div>
            </div>

            {/* Filter Sandbox Playground */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/30">{t.testFilter}</span>
                <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest">REAL-TIME INTERCEPTION</span>
              </div>

              <div className="space-y-3 text-left">
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-white/20 uppercase">Simulator Input Payload</span>
                  <input
                    type="text"
                    value={filterTestText}
                    onChange={(e) => setFilterTestText(e.target.value)}
                    placeholder={t.testInputPlaceholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 text-xs text-white h-10 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-white/20 uppercase">{t.filteredOutput}</span>
                  <div className="w-full h-10 bg-white/[0.02] border border-white/5 rounded-xl px-3 flex items-center text-xs text-pink-400 font-mono italic">
                    {filteredOutput || <span className="text-white/10">Shield idle. Waiting for content...</span>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
