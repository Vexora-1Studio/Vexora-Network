import { useState, useMemo, useRef, useEffect, MouseEvent, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Share2, 
  Pin, 
  Users, 
  Calendar, 
  Shield, 
  Zap, 
  Compass, 
  Hash, 
  MessageSquare,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Heart,
  Send,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Edit3,
  Settings,
  Award
} from 'lucide-react';
import { Community, UserProfile, Post } from '../types';

interface VisitedCommunityDetailViewProps {
  community: Community;
  onBack: () => void;
  joined: boolean;
  onToggleJoin: (e: MouseEvent) => void;
  onShare: (e: MouseEvent) => void;
  copied: boolean;
  currentUser: UserProfile | null;
  onProfileClick: (authorName: string) => void;
  posts: Post[];
  onAddCommunityPost: (content: string, image?: string, video?: string, communityId?: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onUpdateCommunity: (communityId: string, updatedFields: Partial<Community>) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onClearAllComments?: (communityId: string) => void;
  onDeletePost?: (postId: string) => void;
}

interface CustomPinnedPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  category: string;
}

export default function VisitedCommunityDetailView({
  community,
  onBack,
  joined,
  onToggleJoin,
  onShare,
  copied,
  currentUser,
  onProfileClick,
  posts,
  onAddCommunityPost,
  onLikePost,
  onAddComment,
  onUpdateCommunity,
  onDeleteComment,
  onClearAllComments,
  onDeletePost
}: VisitedCommunityDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'live' | 'pinned' | 'metadata'>('live');

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(community.name);
  const [editedDescription, setEditedDescription] = useState(community.description);
  const [editedImage, setEditedImage] = useState(community.image);
  const [editedBanner, setEditedBanner] = useState(community.banner || community.image);
  const [editedCategory, setEditedCategory] = useState(community.category);

  const communityImageInputRef = useRef<HTMLInputElement>(null);
  const communityBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedName(community.name);
    setEditedDescription(community.description);
    setEditedImage(community.image);
    setEditedBanner(community.banner || community.image);
    setEditedCategory(community.category);
  }, [community]);

  const handleCommunityImageUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("الرجاء تحديد ملف صورة فقط.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEditedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCommunityImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCommunityImageUpload(e.target.files[0]);
    }
  };

  const handleCommunityBannerUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("الرجاء تحديد ملف صورة فقط.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEditedBanner(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCommunityBannerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCommunityBannerUpload(e.target.files[0]);
    }
  };

  const handleApplyCommunityChanges = () => {
    if (!editedName.trim()) {
      alert("اسم المجموعة لا يمكن أن يكون فارغاً.");
      return;
    }
    onUpdateCommunity(community.id, {
      name: editedName,
      description: editedDescription,
      image: editedImage,
      banner: editedBanner,
      category: editedCategory
    });
    setIsEditing(false);
  };

  const isOwner = currentUser?.email === 'fluxstudio4@gmail.com' || community.ownerId === currentUser?.id || community.id === 'c-vexora' || currentUser?.handle === 'CyberPioneer' || currentUser?.name === 'Vexora Admin 🛡️';

  const isSiteOwner = (authorName: string) => {
    const isCurrentUserOwner = (currentUser?.email === 'fluxstudio4@gmail.com' || currentUser?.handle === 'CyberPioneer' || currentUser?.name === 'Vexora Admin 🛡️' || currentUser?.name === 'Vexora Owner') && authorName === currentUser?.name;
    return isCurrentUserOwner || authorName === 'Vexora Owner' || authorName.includes('صاحب الموقع') || authorName.includes('المالك') || authorName.includes('Vexora Owner');
  };

  // Custom high-quality pinned broadcasts based on community name or id
  const customPinnedBroadcasts = useMemo<CustomPinnedPost[]>(() => {
    const defaultBroadcasts: CustomPinnedPost[] = [
      {
        id: 'cp1',
        author: 'Network Protocol Operator',
        handle: 'SysOp_99',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        content: `Welcome to the "${community.name}" community channel. Please ensure secure frequency links and follow encryption practices when transmitting sensitive packets. Recent signal density remains stable across all peer relays.`,
        timestamp: '2 hours ago',
        likes: 142,
        commentsCount: 24,
        category: 'System Broadcast'
      },
      {
        id: 'cp2',
        author: 'Grid Ranger',
        handle: 'NetRider',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
        content: `Checking in from the outskirts of sub-grid 7. Pinned coordinates look secure. Anyone experiencing delay packets in this sector? Drop your trace logs.`,
        timestamp: 'Yesterday',
        likes: 88,
        commentsCount: 19,
        category: 'Field Report'
      }
    ];

    switch (community.id) {
      case 'c1': // UI/UX Wizards
        return [
          {
            id: 'c1p1',
            author: 'AeroCore_UX',
            handle: 'ux_warlock',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            content: '⚠️ PIXEL GRID DIRECTIVE ⚠️: Glassmorphism and holographic HUD layouts are being standardized for the 2026 Core Interface. Make sure to use high contrast neon strokes (1px, 40% opacity) coupled with high-index backdrop-blur filters (12px to 20px) to prevent data bleeding on high-density displays.',
            timestamp: '3 hours ago',
            likes: 512,
            commentsCount: 74,
            category: 'System Directive'
          },
          {
            id: 'c1p2',
            author: 'RetroScribe',
            handle: 'pixel_monk',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            content: 'The user retention graphs on flat UI vs spatial cyber-decks indicate a 350% increase in sensory resonance when menus slide using micro-spring calculations rather than linear motion. Let\'s banish boring linear timers permanently from the grid! Refactor your spring curves to stiffness: 450, damping: 18.',
            timestamp: '1 day ago',
            likes: 310,
            commentsCount: 45,
            category: 'Motion Spec'
          }
        ];
      case 'c2': // Quantum Devs
        return [
          {
            id: 'c2p1',
            author: 'PlanckScale',
            handle: 'quantum_operator',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
            content: '⚡ EXPERIMENTAL RESULTS UPLOADED ⚡: We have successfully demonstrated sub-grid coherence preservation across 12,000 artificial nodes for exactly 174 seconds under simulation heat. Standard classical decay was reduced by 64% using adaptive topological phase gates. Grab the library from `/nodes/quantum-gates`.',
            timestamp: '5 mins ago',
            likes: 1240,
            commentsCount: 198,
            category: 'Core Breakthrough'
          },
          {
            id: 'c2p2',
            author: 'QubitWrangler',
            handle: 'superposed_state',
            avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&h=100&fit=crop',
            content: 'Avoid superpositions in user authentication threads. We kept seeing race conditions since our state checks existed in both logged-in and logged-out states simultaneously inside the main intercept loop. Ensure you collapse the wave function manually before storing auth tokens.',
            timestamp: '12 hours ago',
            likes: 420,
            commentsCount: 52,
            category: 'Dev Advisory'
          }
        ];
      case 'c3': // Cyberpunk Art
        return [
          {
            id: 'c3p1',
            author: 'ChromeRider',
            handle: 'neural_spray',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            content: 'The contrast of the glowing pink neon against slate-charcoal is mathematically superior in inducing neurological excitement compared to modern generic pastel shades. Dark mode interfaces should not feel like muted corporate offices; they should mimic midnight alleyways after heavy chemical rain. Embrace visual friction.',
            timestamp: '4 hours ago',
            likes: 980,
            commentsCount: 110,
            category: 'Aesthetic Manifesto'
          },
          {
            id: 'c3p2',
            author: 'VaporVector',
            handle: 'chroma_glitch',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            content: 'Our collective virtual exhibition is scheduled for next month. Submissions must adhere to 1:1 format aspect ratios and contain at least coordinates from retro cybernetic imagery. Please tag your pieces with #scifiui so the scraping algorithms can sort them correctly.',
            timestamp: '2 days ago',
            likes: 670,
            commentsCount: 84,
            category: 'Exhibition'
          }
        ];
      case 'c4': // Nano Glitchers
        return [
          {
            id: 'c4p1',
            author: 'SolderDust',
            handle: 'circuit_bender',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
            content: 'Bypassed the internal clock sync of the 1998 digital visual deck. By feeding an auxiliary audio signal from an oscillator into pin 9 of the video processing chip, I got this gorgeous bleeding scanlines texture on screen. Sending visual diagrams to anyone who wants to replicate it!',
            timestamp: '8 hours ago',
            likes: 180,
            commentsCount: 22,
            category: 'Hardware Mod'
          }
        ];
      case 'c5': // AI Overlords
        return [
          {
            id: 'c5p1',
            author: 'SubgridMonitor',
            handle: 'matrix_supervisor',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            content: '🚨 MODEL DRIFT HAZARD 🚨: The recent feedback loop from our auto-training grid scraper has caused localized models to develop an obsession with late 20th-century vaporwave tracks. If your terminal response outputs "Resonance" inside generic data grids, re-calibrate your system temperature down to 0.15.',
            timestamp: '1 hour ago',
            likes: 830,
            commentsCount: 142,
            category: 'Grid Alert'
          }
        ];
      case 'c6': // Vaporwave Lounge
        return [
          {
            id: 'c6p1',
            author: 'LuxuryElite',
            handle: 'mallSoft_94',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            content: 'Please slow down your music downloads to exactly 33RPM to enhance mental transit times. Modern internet feeds are far too fast. We must enjoy looking at pixelated windows screens in our VR spaces. Remember: It\'s all in your head. 🌿✨',
            timestamp: '12 hours ago',
            likes: 610,
            commentsCount: 59,
            category: 'Vibe Spec'
          }
        ];
      case 'c7': // Grid Hackers
        return [
          {
            id: 'c7p1',
            author: 'CipherZero',
            handle: 'ghost_node',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
            content: '🛡️ SECURITY WARN 🛡️: Corporate tracer packets are probing local sub-grid IP registers. If you are operating an un-encrypted gateway inside this cluster, immediately patch on firewall module v4.11. The encryption handshake must require randomized intervals to fool state surveillance.',
            timestamp: '30 mins ago',
            likes: 1040,
            commentsCount: 145,
            category: 'Emergency Spec'
          }
        ];
      default:
        return defaultBroadcasts;
    }
  }, [community]);

  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedPostComments, setExpandedPostComments] = useState<Record<string, boolean>>({});
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});

  const handleFileProcess = (file: File) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      alert("الرجاء توفير ملف صورة أو مقطع فيديو فقط.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileData(result);
      setFileType(isImage ? 'image' : 'video');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = () => {
    setFileData(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitPost = () => {
    if (!content.trim() && !fileData) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const finalImage = fileType === 'image' ? (fileData || undefined) : undefined;
      const finalVideo = fileType === 'video' ? (fileData || undefined) : undefined;
      onAddCommunityPost(content, finalImage, finalVideo, community.id);
      setContent('');
      setFileData(null);
      setFileType(null);
      setIsSubmitting(false);
    }, 600);
  };

  const toggleComments = (postId: string) => {
    setExpandedPostComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddCommentLocal = (postId: string) => {
    const text = newCommentTexts[postId];
    if (!text || !text.trim()) return;
    onAddComment(postId, text);
    setNewCommentTexts(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  const communityPosts = useMemo(() => {
    return posts.filter(p => p.type === 'community' && p.communityId === community.id);
  }, [posts, community.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: 'spring', stiffness: 220, damping: 25 }}
      className="space-y-8"
    >
      {/* Back & Title Header Panel */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-purple-600/20 active:scale-95 text-white/60 hover:text-purple-400 border border-white/5 hover:border-purple-500/20 rounded-2xl transition-all cursor-pointer flex items-center justify-center h-12 w-12 group/back"
          title="Return to Directory"
        >
          <ArrowLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform duration-200" />
        </button>
        <div className="flex flex-col">
          <button
            onClick={onBack}
            className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/30 hover:text-purple-400 transition-colors uppercase text-left cursor-pointer"
          >
            ← Back to Signal Clusters
          </button>
          <h2 className="text-3xl font-black uppercase tracking-tightest text-white mt-1 italic group-hover:text-purple-400 transition-colors flex items-center gap-2 flex-wrap">
            <span>{community.name}</span>
            {(community.isVerified || community.id === 'c-vexora') && (
              <span className="inline-flex items-center justify-center bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[8.5px] font-mono tracking-widest font-black uppercase px-2.5 py-0.5 rounded-full shadow-lg">
                ✓ موثق / VERIFIED
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Cluster Hero Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Card & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {isOwner && (
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-purple-500/30 text-purple-400 hover:text-white bg-purple-950/20 hover:bg-purple-600/30 font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Settings className="w-4 h-4 animate-pulse" />
                <span>{isEditing ? "إلغاء التعديل / CANCEL EDIT" : "تعديل بيانات المجتمع / EDIT DETAILS"}</span>
              </button>

              {onClearAllComments && (
                <button
                  onClick={() => {
                    if (window.confirm("هل أنت متأكد من مسح جميع التعليقات في هذا المجتمع؟\nAre you sure you want to delete all comments in this community?")) {
                      onClearAllComments(community.id);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-red-500/30 text-red-400 hover:text-white hover:bg-red-950/30 bg-red-950/10 font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>مسح كافة التعليقات / CLEAR ALL COMMENTS</span>
                </button>
              )}
            </div>
          )}

          {currentUser && (currentUser.email === 'fluxstudio4@gmail.com' || currentUser.name === 'Vexora Owner' || currentUser.handle === 'CyberPioneer' || currentUser.name === 'Vexora Admin 🛡️') && (
            <div className="flux-card p-5 bg-gradient-to-br from-yellow-950/20 via-zinc-950/40 to-yellow-950/10 border border-yellow-500/20 rounded-2xl relative overflow-hidden space-y-3 shadow-[0_0_20px_rgba(234,179,8,0.05)]">
              {/* Elegant Accent Ambient Glow */}
              <div className="absolute -right-12 -top-12 w-28 h-28 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/15 rounded-xl border border-yellow-500/30">
                  <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-yellow-500/60 block">Owner Status Block</span>
                  <h4 className="text-[10px] font-black uppercase text-white tracking-wider font-mono">حالة ملكية المنصة / VERIFIED OWNER</h4>
                </div>
              </div>

              <p className="text-[10.5px] text-white/70 leading-relaxed font-sans">
                تم التحقق من هويتك بنجاح كمالك للتطبيق ومطور معتمد للموقع 🛡️. يظهر هذا التوثيق الذهبي الموثق بجانب كافة منشوراتك وتعليقاتك في جميع غرف الدردشة والمجتمعات للجميع.
              </p>

              <div className="flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                <span className="text-[8px] font-mono uppercase tracking-widest text-yellow-400 font-extrabold">
                  STATUS: VERIFIED PLATFORM OWNER
                </span>
              </div>
            </div>
          )}

          <div className="flux-card overflow-hidden bg-white/5 border border-white/5 p-1">
            {isEditing ? (
              <div className="p-6 space-y-4">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold border-b border-white/5 pb-2">
                  تعديل بيانات المجتمع / EDIT DETAILS
                </span>
                
                {/* Community Name */}
                <div className="space-y-1">
                  <label className="block text-[8px] font-mono uppercase tracking-wider text-white/40">اسم المجتمع / Community Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-white/10 hover:bg-white/[0.15] focus:bg-black/40 border border-white/5 focus:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all font-sans"
                  />
                </div>

                {/* Community Category */}
                <div className="space-y-1">
                  <label className="block text-[8px] font-mono uppercase tracking-wider text-white/40 font-semibold">التصنيف / Sector Category</label>
                  <input
                    type="text"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="w-full bg-white/10 hover:bg-white/[0.15] focus:bg-black/40 border border-white/5 focus:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all font-sans"
                  />
                </div>

                {/* Cover/Banner Image */}
                <div className="space-y-1">
                  <label className="block text-[8px] font-mono uppercase tracking-wider text-white/40 font-semibold">تغيير البنر / Banner Cover</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedBanner}
                      onChange={(e) => setEditedBanner(e.target.value)}
                      placeholder="رابط صورة البنر / Image URL"
                      className="flex-1 bg-white/10 hover:bg-white/[0.15] focus:bg-black/40 border border-white/5 focus:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => communityBannerInputRef.current?.click()}
                      className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-[10px] font-mono uppercase font-bold border border-purple-500/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      رفع ملف
                    </button>
                    <input
                      ref={communityBannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCommunityBannerFileChange}
                    />
                  </div>
                </div>

                {/* Avatar/Profile Image */}
                <div className="space-y-1">
                  <label className="block text-[8px] font-mono uppercase tracking-wider text-white/40 font-semibold font-sans">صورة المجتمع (الأيقونة) / Cover Icon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedImage}
                      onChange={(e) => setEditedImage(e.target.value)}
                      placeholder="رابط الصورة / Image URL"
                      className="flex-1 bg-white/10 hover:bg-white/[0.15] focus:bg-black/40 border border-white/5 focus:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => communityImageInputRef.current?.click()}
                      className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-[10px] font-mono uppercase font-bold border border-purple-500/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      رفع ملف
                    </button>
                    <input
                      ref={communityImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCommunityImageFileChange}
                    />
                  </div>
                </div>

                {/* Preview Areas */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1 flex flex-col">
                    <span className="block text-[7px] font-mono text-white/30 uppercase">معاينة بنر / Banner</span>
                    <img src={editedBanner} className="h-16 w-full object-cover rounded-lg border border-white/10 mt-auto" alt="Banner Preview" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200'; }} />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[7px] font-mono text-white/30 uppercase">معاينة صورة / Icon</span>
                    <img src={editedImage} className="h-16 w-16 mx-auto object-cover rounded-lg border border-white/10" alt="Icon Preview" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=100'; }} />
                  </div>
                </div>

                {/* Community Description */}
                <div className="space-y-1">
                  <label className="block text-[8px] font-mono uppercase tracking-wider text-white/40 font-semibold">الوصف واللوائح / Description</label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white/10 hover:bg-white/[0.15] focus:bg-black/40 border border-white/5 focus:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-0 transition-colors resize-none font-sans"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleApplyCommunityChanges}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                  >
                    حفظ التغييرات / Apply Specs
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء / Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Visual Header with overlapping avatar */}
                <div className="relative">
                  <div className="h-44 w-full relative overflow-hidden rounded-2.5xl">
                    <img 
                      src={community.banner || community.image} 
                      className="w-full h-full object-cover opacity-60" 
                      alt={community.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/80 border border-white/5 text-[8px] font-mono uppercase tracking-[0.15em] text-purple-400 font-bold shadow-md">
                      {community.category}
                    </span>
                  </div>
                  
                  {/* Overlapping circular avatar */}
                  <div className="absolute -bottom-6 left-6">
                    <img
                      src={community.image}
                      className="w-14 h-14 rounded-2xl object-cover ring-4 ring-zinc-950 bg-zinc-900 border border-white/10 shadow-xl"
                      alt={`${community.name} icon`}
                    />
                  </div>
                </div>

                {/* Title / Info block */}
                <div className="p-6 pt-8 space-y-4">
                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-white/30 block mb-1">Status Classification</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold tracking-widest uppercase text-purple-300">Resonant Active</span>
                    </div>
                  </div>

                  <p className="text-white/70 text-xs font-light leading-relaxed">
                    {community.description}
                  </p>

                  <div className="h-px bg-white/5" />

                  {/* Statistical List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/40 uppercase tracking-wider text-[9px]">Peer Nodes</span>
                      <span className="text-white font-bold">{community.members.toLocaleString()} Connected</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/40 uppercase tracking-wider text-[9px]">Sector Zone</span>
                      <span className="text-purple-400 font-bold uppercase">{community.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/40 uppercase tracking-wider text-[9px]">Established</span>
                      <span className="text-white/80 font-bold">
                        {new Date(community.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 pt-1" />

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      id="expanded-community-join-btn"
                      onClick={onToggleJoin}
                      className={`w-full py-3 px-4 rounded-xl border font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer duration-200 flex items-center justify-center gap-1.5 shadow-md h-11 ${
                        joined
                          ? 'bg-purple-600/30 border-purple-500/60 text-purple-300 hover:bg-purple-600/50 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                          : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/25'
                      }`}
                    >
                      {joined ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                          <span>Linked</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Link Cluster</span>
                        </>
                      )}
                    </button>

                    <button
                      id="expanded-community-share-btn"
                      onClick={onShare}
                      className={`w-full py-3 px-4 rounded-xl border font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer duration-200 flex items-center justify-center gap-1.5 shadow-md h-11 ${
                        copied
                          ? 'bg-emerald-600/30 border-emerald-500/60 text-emerald-300 hover:bg-emerald-600/50 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                          : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/25'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Columns: Tab Navigation (Live Chat vs Pinned Broadcasts vs Live Technical Metadata) */}
        <div className="lg:col-span-2 space-y-6 animate-in fade-in duration-300">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-mono uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold whitespace-nowrap min-w-[130px] ${
                activeTab === 'live' 
                  ? 'bg-purple-600/20 text-purple-300 shadow-md border border-purple-500/30' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${activeTab === 'live' ? 'text-purple-400 animate-pulse' : ''}`} />
              <span>محادثة حية / Discussion</span>
            </button>
            <button
              onClick={() => setActiveTab('pinned')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-mono uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold whitespace-nowrap min-w-[130px] ${
                activeTab === 'pinned' 
                  ? 'bg-white/5 text-white shadow-md border border-white/5' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>الإرشادات / Pinned</span>
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-mono uppercase tracking-[0.1em] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold whitespace-nowrap min-w-[130px] ${
                activeTab === 'metadata' 
                  ? 'bg-white/5 text-white shadow-md border border-white/5' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>بيانات تقنية / Tech Specs</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'live' ? (
              <motion.div
                key="tab-live"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Check alignment to Joined constraint */}
                {!joined ? (
                  <div className="flux-card p-10 text-center space-y-6 bg-white/[0.01] border-dashed border-white/10">
                    <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
                      <Lock className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-black uppercase text-white">المحادثة الحية مغلقة مؤقتاً</h3>
                      <p className="text-white/50 text-xs leading-relaxed max-w-sm mx-auto">
                        يرجى الانضمام والاشتراك في تردد هذه المجموعة لتتمكن من إرسال واستقبال الرسائل، لقطات الشاشة، ومقاطع الفيديو مع الأعضاء الآخرين في المجتمع.
                      </p>
                    </div>
                    <button
                      onClick={onToggleJoin}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer duration-200 inline-flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>الانضمام إلى المجموعة / Link Cluster</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Interactive drag-and-drop composer panel */}
                    {!isOwner ? (
                      <div className="flux-card p-6 bg-zinc-950/40 border border-red-500/15 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center py-10 relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.03)]">
                        <div className="absolute -right-16 -top-16 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="p-3 bg-red-500/15 rounded-xl border border-red-500/30">
                          <Lock className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-black">النشر مغلق لغير مالك المجموعة</p>
                          <p className="text-[11px] text-white/50 leading-relaxed font-sans font-medium">الكتابة والمشاركة في هذا المجتمع مقتصرة فقط على مؤسس المجموعة والأونر الموثق 🛡️.</p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`flux-card p-6 bg-white/[0.02] border transition-all duration-200 relative ${
                          isDragOver ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-white/5'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {isDragOver && (
                          <div className="absolute inset-0 bg-purple-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-2 z-25 pointer-events-none border border-purple-500">
                            <Upload className="w-8 h-8 text-purple-400 animate-bounce" />
                            <p className="text-xs font-mono text-purple-300 uppercase tracking-widest font-bold">أفلت لقطة الشاشة أو الفيديو هنا!</p>
                            <p className="text-[10px] text-white/40">Drop screenshot image or video file direct</p>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <img
                            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10"
                            alt="User"
                          />
                          <div className="flex-1 space-y-4">
                            <textarea
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              placeholder="اكتب رسالتك للمجموعة، شارك لقطة شاشة، كود برمجي أو فديو توضيحي..."
                              className="w-full bg-transparent border-0 text-white text-xs placeholder-white/30 focus:ring-0 resize-none min-h-[70px] font-sans leading-relaxed focus:outline-none"
                            />

                            {/* Attachment preview with delete node */}
                            {fileData && (
                              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 p-2 max-w-sm">
                                {fileType === 'image' ? (
                                  <img src={fileData} className="max-h-52 w-full object-contain rounded-xl" alt="Attachment" />
                                ) : (
                                  <video src={fileData} controls className="max-h-52 w-full object-contain rounded-xl" />
                                )}
                                <button
                                  onClick={removeAttachment}
                                  className="absolute top-4 right-4 p-2 bg-black/90 hover:bg-rose-600 text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                                  title="إلغاء المرفق"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            <div className="h-px bg-white/5" />

                            <div className="flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={triggerFileInput}
                                  className="px-3 py-2 bg-white/5 hover:bg-purple-600/20 text-white/60 hover:text-purple-400 border border-white/5 hover:border-purple-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider font-semibold"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                                  <span>صورة / لقطة شاشة</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={triggerFileInput}
                                  className="px-3 py-2 bg-white/5 hover:bg-purple-600/20 text-white/60 hover:text-purple-400 border border-white/5 hover:border-purple-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider font-semibold"
                                >
                                  <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
                                  <span>فيديو</span>
                                </button>

                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*,video/*"
                                  className="hidden"
                                  onChange={handleFileChange}
                                />
                              </div>

                              <button
                                onClick={handleSubmitPost}
                                disabled={isSubmitting || (!content.trim() && !fileData)}
                                className="px-5 py-2 hover:opacity-90 disabled:opacity-30 bg-purple-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 h-9"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال نبضة / Send Wave'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Community active posts list */}
                    <div className="space-y-4">
                      {communityPosts.length === 0 ? (
                        <div className="py-16 text-center space-y-4 rounded-3xl bg-white/[0.01] border border-dashed border-white/5">
                          <MessageSquare className="w-8 h-8 text-white/20 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">لا توجد رسائل نشطة حالياً</p>
                            <p className="text-[11px] text-white/30 font-sans">كن أول من يشارك رسالة، صورة، أو كليب فيديو هنا!</p>
                          </div>
                        </div>
                      ) : (
                        communityPosts.map((post) => {
                          const commentsOpen = !!expandedPostComments[post.id];
                          const currentCommentText = newCommentTexts[post.id] || '';

                          return (
                            <div 
                              key={post.id} 
                              className="flux-card p-6 bg-white/5 border border-white/5 hover:border-white/10 transition-all space-y-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <img 
                                    src={post.avatar} 
                                    onClick={() => onProfileClick(post.author)}
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10 hover:border-purple-400 transition-colors cursor-pointer"
                                    alt={post.author}
                                  />
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span 
                                        onClick={() => onProfileClick(post.author)}
                                        className="text-xs font-black uppercase text-white hover:text-purple-400 cursor-pointer transition-colors"
                                      >
                                        {post.author}
                                      </span>
                                      {/* Official Verified Operator label */}
                                      {(post.author.includes('Admin') || post.author.includes('Official') || post.author.includes('ألكـيـل')) && (
                                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                          مشرف موثق / STAFF
                                        </span>
                                      )}
                                      {isSiteOwner(post.author) && (
                                        <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[8px] font-mono px-2 py-0.5 rounded-md uppercase tracking-wide font-black flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-pulse">
                                          👑 صاحب التطبيق المالك / OWNER
                                        </span>
                                      )}
                                      <span className="text-white/20 text-xs">|</span>
                                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">
                                        {post.timestamp}
                                      </span>
                                    </div>
                                    <span className="text-[8px] font-mono text-purple-400 block mt-0.5 uppercase tracking-widest font-semibold">
                                      {community.name} Member Node // SECURE
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {onDeletePost && (currentUser?.name === post.author || currentUser?.email === 'fluxstudio4@gmail.com' || currentUser?.name === 'Vexora Owner' || currentUser?.handle === 'CyberPioneer' || currentUser?.name === 'Vexora Admin 🛡️' || (currentUser && (currentUser.name.includes('صاحب الموقع') || currentUser.name.includes('المالك')))) && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm("حذف للأبد؟ هل أنت متأكد من حذف هذه النبضة؟\nAre you sure you want to delete this pulse forever?")) {
                                          onDeletePost(post.id);
                                        }
                                      }}
                                      className="p-1 hover:bg-rose-500/15 text-rose-500/60 hover:text-rose-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                                      title="Purge Pulse / حذف للأبد"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <div className="text-white/30 hover:text-white cursor-pointer transition-colors p-1">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>

                              <p className="text-white/85 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                                {post.content}
                              </p>

                              {/* Embedded Screen Shot image */}
                              {post.image && (
                                <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 mt-3 max-h-96 flex items-center justify-center">
                                  <img 
                                    src={post.image} 
                                    referrerPolicy="no-referrer" 
                                    className="max-h-96 object-contain rounded-2xl w-full" 
                                    alt="Screenshot attached" 
                                  />
                                </div>
                              )}

                              {/* Embedded Video player */}
                              {post.video && (
                                <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 mt-3 max-h-96 flex items-center justify-center">
                                  <video 
                                    src={post.video} 
                                    controls 
                                    className="max-h-96 object-contain rounded-2xl w-full" 
                                    referrerPolicy="no-referrer" 
                                  />
                                </div>
                              )}

                              <div className="h-px bg-white/5 pt-1" />

                              {/* Feed Actions */}
                              <div className="flex items-center gap-6 text-[10px] font-mono text-white/30">
                                <button
                                  onClick={() => onLikePost(post.id)}
                                  className={`flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                                    post.isLiked ? 'text-rose-400' : 'hover:text-purple-400'
                                  }`}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-400' : ''}`} />
                                  <span>{post.likes} Resonance</span>
                                </button>
                                
                                <button
                                  onClick={() => toggleComments(post.id)}
                                  className={`flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                                    commentsOpen ? 'text-purple-400' : 'hover:text-purple-400'
                                  }`}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{post.comments} Echoes</span>
                                </button>
                              </div>

                              {/* Comments thread panel */}
                              {commentsOpen && (
                                <div className="pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                  {/* Create comment row */}
                                  {!isOwner ? (
                                    <div className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 rounded-xl p-3 flex items-center gap-2 text-red-400 font-mono text-[9px] uppercase tracking-wider">
                                      <Lock className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-red-400" />
                                      <span className="font-sans font-bold text-red-300">التعليقات مغلقة لغير مالك المجموعة / COMMENTS LOCKED</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-start gap-2 pt-1">
                                      <img 
                                        src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} 
                                        className="w-7 h-7 rounded-lg object-cover border border-white/5" 
                                        alt="User" 
                                      />
                                      <div className="flex-1 flex gap-2">
                                        <input 
                                          type="text"
                                          value={currentCommentText}
                                          onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddCommentLocal(post.id);
                                          }}
                                          placeholder="أضف تعليقاً أو رداً على هذه النبضة..."
                                          className="flex-1 bg-white/5 hover:bg-white/[0.08] focus:bg-black/40 border border-white/5 focus:border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-0 placeholder-white/20 transition-all font-sans"
                                        />
                                        <button
                                          onClick={() => handleAddCommentLocal(post.id)}
                                          disabled={!currentCommentText.trim()}
                                          className="p-1.5 bg-purple-600/35 hover:bg-purple-600 disabled:opacity-30 text-white rounded-xl transition-all cursor-pointer h-8 w-8 flex items-center justify-center border border-purple-500/30"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Comments list */}
                                  {post.replies && post.replies.length > 0 && (
                                    <div className="space-y-3 pl-4 border-l border-white/5">
                                      {post.replies.map((reply) => (
                                        <div key={reply.id} className="flex items-start gap-2.5 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                          <img 
                                            src={reply.avatar} 
                                            className="w-7 h-7 rounded-lg object-cover border border-white/5" 
                                            alt={reply.author} 
                                          />
                                          <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[11px] font-black uppercase text-white">{reply.author}</span>
                                                {isSiteOwner(reply.author) && (
                                                  <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold inline-flex items-center gap-0.5 shadow-[0_0_8px_rgba(234,179,8,0.15)] animate-pulse">
                                                    👑 صاحب التطبيق / OWNER
                                                  </span>
                                                )}
                                                <span className="text-[8px] font-mono text-white/25">{reply.timestamp}</span>
                                              </div>
                                              {isOwner && onDeleteComment && (
                                                <button
                                                  onClick={() => onDeleteComment(post.id, reply.id)}
                                                  className="p-1 hover:bg-red-500/15 text-white/30 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                                                  title="حذف التعليق / Purge comment"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              )}
                                            </div>
                                            <p className="text-[11px] text-white/70 leading-relaxed font-sans">{reply.text}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ) : activeTab === 'pinned' ? (
              <motion.div
                key="tab-pinned"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {customPinnedBroadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="flux-card p-6 bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all space-y-4 relative group"
                  >
                    {/* Floating Pin Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 text-purple-400 font-mono text-[8px] uppercase tracking-widest font-black bg-purple-500/10 border border-purple-500/35 px-2 py-1 rounded-lg">
                      <Pin className="w-3 h-3 text-purple-400 fill-purple-400" />
                      <span>PINNED BY MOD</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <img 
                        src={broadcast.avatar} 
                        onClick={() => onProfileClick(broadcast.author)}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 hover:border-purple-400 transition-colors cursor-pointer"
                        alt={broadcast.author}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span 
                            onClick={() => onProfileClick(broadcast.author)}
                            className="text-xs font-black uppercase text-white hover:text-purple-400 cursor-pointer transition-colors"
                          >
                            {broadcast.author}
                          </span>
                          <span className="text-[10px] font-mono text-purple-400/70 font-semibold">
                            @{broadcast.handle}
                          </span>
                          <span className="text-white/20 text-xs">|</span>
                          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">
                            {broadcast.timestamp}
                          </span>
                        </div>
                        <span className="inline-block mt-1 text-[8px] font-mono bg-white/5 text-emerald-400 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wider font-bold">
                          {broadcast.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-white/80 text-xs leading-relaxed font-light mt-2 pl-1 whitespace-pre-wrap">
                      {broadcast.content}
                    </p>

                    <div className="pt-3 border-t border-white/5 flex items-center gap-6 text-[10px] font-mono text-white/30 pl-1">
                      <div className="flex items-center gap-1.5 hover:text-purple-400 transition-colors cursor-pointer select-none">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{broadcast.likes + (joined ? 1 : 0)} Relays</span>
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-purple-400 transition-colors cursor-pointer select-none">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{broadcast.commentsCount} Logs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="tab-metadata"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Cluster encryption layout card */}
                <div className="flux-card p-6 bg-white/5 border border-white/5 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-white">Cluster Security Ledger</span>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-white/30">Active Firewalls</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black bg-emerald-500/10 border border-emerald-500/35 px-2.5 py-1 rounded-xl animate-pulse">
                      SECURED // LINE STABLE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-white/30">Node Cryptographic Signature</span>
                      <span className="block text-[11px] font-mono text-white bg-black/60 p-2.5 rounded-lg border border-white/5 break-all font-sans font-medium">
                        0x-{community.id}-SHA256-{community.createdAt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-white/30">Signal Encryption Standard</span>
                      <span className="block text-[11px] font-mono text-white bg-black/60 p-2.5 rounded-lg border border-white/5 font-sans font-medium">
                        AES-GCM 256 Quantum Resistant
                      </span>
                    </div>
                  </div>

                  {/* Visual gauge indicators of cluster health */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                        <span>Core Signal Intensity</span>
                        <span className="text-purple-400">92.4% Optimal</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '92.4%' }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                        <span>Sync Consistency Quotient</span>
                        <span className="text-emerald-400">98.9% Synchronized</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '98.9%' }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                        <span>Cluster Storage Usage</span>
                        <span className="text-amber-500">41.2% Allocated</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '41.2%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional system specs banner */}
                <div className="bg-gradient-to-r from-purple-900/10 via-purple-900/5 to-transparent border border-purple-500/10 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-purple-400 block font-bold">Network Core Sync Active</span>
                    <span className="text-xs text-white/70 leading-relaxed font-light block">
                      Joining this cluster redirects redundant bandwidth packets automatically to optimize localized chat logs on your local cyber-deck terminal.
                    </span>
                  </div>
                  <Compass className="w-10 h-10 text-purple-500/20 flex-shrink-0" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </motion.div>
  );
}
