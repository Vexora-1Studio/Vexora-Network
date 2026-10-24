/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
  type FormEvent,
  type ChangeEvent,
  type MouseEvent,
  type DragEvent,
} from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Bookmark,
  Bot,
  Calendar,
  Camera,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Command,
  Cpu,
  Crown,
  Database,
  Download,
  Edit2,
  FileText,
  Flag,
  Flame,
  Gamepad2,
  Globe,
  Grid3X3,
  Heart,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  ListFilter,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  MoreHorizontal,
  MoreVertical,
  Navigation,
  Paperclip,
  Phone,
  PhoneOff,
  Film,
  Pin,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Repeat,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Trophy,
  Tv,
  Upload,
  User,
  UserMinus,
  UserPlus,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { io, Socket } from "socket.io-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  GridType,
  Post,
  Community,
  Message,
  Comment,
  UserProfile,
  FriendRequest,
  ReactionType,
  TrendingTopic,
  Story,
} from "./types";
import VisitedCommunityDetailView from "./components/VisitedCommunityDetailView";
import { CreateStoryModal, StoryViewerModal } from "./components/StoryHub";
import VexoraGmail from "./components/VexoraGmail";
import { VexoraLabs } from "./components/VexoraLabs";
import VexoraChat from "./components/VexoraChat";
import VexoraMeet from "./components/VexoraMeet";
import MyAccountSection from "./components/MyAccountSection";
import { OwnerControlCenter } from "./components/OwnerControlCenter";
import GamingAccountsModal from "./components/GamingAccountsModal";
import GamingArena from "./components/GamingArena";
import TournamentsHub from "./components/TournamentsHub";
import GamingHub from "./components/GamingHub";
import LiveActivityFeed from "./components/LiveActivityFeed";
import VexoraMessengerSuite from "./components/messaging/VexoraMessenger";
import {
  IncomingCallBanner,
  IncomingCallData,
} from "./components/IncomingCallBanner";
import { VexoraVideoCallModal } from "./components/VexoraVideoCallModal";
import { DataVaultModal } from "./components/DataVaultModal";
import { VoiceSettingsModal } from "./components/VoiceSettingsModal";
import { VexoraPromoVideoPlayer } from "./components/VexoraPromoVideoPlayer";
import AudioWaveformVisualizer, {
  LiveVoiceRecorder,
} from "./components/AudioWaveformVisualizer";
import { FullBackupPayload } from "./utils/dataVault";
import { callSignaling, CallSignalPayload } from "./services/callSignaling";
import { callAudio } from "./utils/callAudio";
import {
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
  safeSaveUser,
  safeSavePosts,
} from "./utils/safeStorage";

// Import Firebase config & helpers
import {
  db,
  auth,
  googleProvider,
  facebookProvider,
  microsoftProvider,
  handleFirestoreError,
  OperationType,
} from "./firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  limit,
} from "firebase/firestore";

function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        clean[key] = sanitizeForFirestore(value);
      } else if (Array.isArray(value)) {
        clean[key] = value
          .map((item) =>
            item && typeof item === "object"
              ? sanitizeForFirestore(item)
              : item,
          )
          .filter((item) => item !== undefined);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// Initialize socket
const socket: Socket = io(window.location.origin);

const translations = {
  en: {
    public: "Public",
    message: "Message",
    aiChat: "AI Chat",
    community: "COMMUNITY",
    saved: "SAVED",
    feed: "Public",
    messages: "Message",
    communities: "COMMUNITY",
    friends: "Friends",
    gmail: "Gmail",
    nodeStable: "Node Stable",
    frequencyDelay: "Frequency Delay",
    broadcastMail: "Broadcast Mail",
    identity: "Identity",
    coreNode: "Core Node",
    enter: "Enter",
    notifications: "Notifications",
    incomingNotifications: "Incoming Notifications",
    markAllRead: "Mark all read",
    clearHistory: "Clear History",
    noNotifications: "No notifications",
    logs: "Vexora Node Logs",
    alert: "Alert",
    notification: "Notification",
    markedAllRead: "Marked all as read",
    historyCleared: "History cleared",
    language: "Language",
    arabic: "العربية",
    english: "English",
    languageToggleTitle: "Switch Language to Arabic",
    broadcastingConsole: "Broadcasting Console",
    neuralNodes: "Neural Nodes",
    vexoraNetwork: "Vexora Network",
    labs: "Labs",
    chat: "Google Chat",
    meet: "Google Meet",
    myAccount: "My Account",
  },
  ar: {
    public: "عام",
    message: "الرسائل",
    aiChat: "الدردشة الذكية",
    community: "المجتمعات",
    saved: "المحفوظات",
    feed: "عام",
    messages: "الرسائل",
    communities: "المجتمعات",
    friends: "الأصدقاء",
    gmail: "جي ميل",
    nodeStable: "العقدة مستقرة",
    frequencyDelay: "تأخر التردد",
    broadcastMail: "بريد جماعي",
    identity: "الهوية",
    coreNode: "العقدة الرئيسية",
    enter: "دخول",
    notifications: "الإشعارات",
    incomingNotifications: "الإشعارات الواردة",
    markAllRead: "قراءة الكل",
    clearHistory: "مسح السجل",
    noNotifications: "لا توجد إشارات",
    logs: "سجلات عقدة فيكسورا",
    alert: "تنبيه",
    notification: "إشعار",
    markedAllRead: "تم تحديد الكل كمقروء",
    historyCleared: "تم مسح السجل",
    language: "اللغة",
    arabic: "العربية",
    english: "English",
    languageToggleTitle: "تغيير اللغة إلى الإنجليزية",
    broadcastingConsole: "لوحة البث الإذاعي",
    neuralNodes: "العقد العصبية",
    vexoraNetwork: "شبكة فيكسورا",
    labs: "المختبر",
    chat: "جوجل شات",
    meet: "جوجل ميت",
    myAccount: "حسابي",
  },
};

export function getOnlineStatus(lastActive: string | number | undefined) {
  if (!lastActive)
    return { color: "bg-zinc-500", label: "Offline", ring: "ring-zinc-500/20" };

  const timestamp =
    typeof lastActive === "number"
      ? lastActive
      : typeof lastActive === "string" && !isNaN(Number(lastActive))
        ? Number(lastActive)
        : Date.parse(lastActive);

  if (isNaN(timestamp)) {
    return { color: "bg-zinc-500", label: "Offline", ring: "ring-zinc-500/20" };
  }

  const diffMs = Date.now() - timestamp;
  const diffMins = diffMs / 1000 / 60;

  if (diffMins < 5) {
    return {
      color: "bg-emerald-500",
      label: "Online",
      ring: "ring-emerald-500/20",
      animate: true,
    };
  } else if (diffMins < 15) {
    return { color: "bg-amber-500", label: "Idle", ring: "ring-amber-500/20" };
  } else {
    return { color: "bg-zinc-500", label: "Offline", ring: "ring-zinc-500/20" };
  }
}

export function OnlineStatusDot({
  lastActive,
  size = "md",
  showLabel = false,
  className = "",
}: {
  lastActive: string | number | undefined;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const status = getOnlineStatus(lastActive);
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="relative flex items-center justify-center">
        {status.animate && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.color} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full border border-black ${sizeClasses[size]} ${status.color}`}
          title={status.label}
        />
      </div>
      {showLabel && (
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
          {status.label}
        </span>
      )}
    </div>
  );
}

function TrendingSection({
  topics,
  isLoading,
}: {
  topics: TrendingTopic[];
  isLoading: boolean;
}) {
  if (!isLoading && topics.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <TrendingUp className="w-24 h-24 text-emerald-400 rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/60 mb-1">
              Neural Analysis
            </h3>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Trending Topographies
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
            Active Scan
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-white/5 rounded-2xl animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
          {topics.map((topic, i) => (
            <motion.button
              key={topic.tag}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-start gap-1 hover:bg-white/10 hover:border-emerald-500/30 transition-all text-left"
            >
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest group-hover:text-emerald-400/40 transition-colors">
                #{i + 1} Rank
              </span>
              <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors truncate w-full">
                {topic.tag}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Activity className="w-3 h-3 text-white/10 group-hover:text-emerald-500/40" />
                <span className="text-[9px] font-mono text-white/10 group-hover:text-white/40 transition-colors">
                  {topic.count} Pulses
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

function EngagementAnalysis({ posts }: { posts: Post[] }) {
  const chartData = useMemo(() => {
    return posts
      .slice(0, 10)
      .map((post) => ({
        name: post.content.substring(0, 15) + "...",
        Resonance: post.likes,
        Echoes: post.comments,
        Relays: post.reposts || 0,
      }))
      .reverse();
  }, [posts]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flux-card border-white/5 bg-white/[0.02] p-6 hover:border-purple-500/20 transition-colors">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">
            Total Resonance
          </span>
          <p className="text-3xl font-black italic text-white mt-2">
            {posts.reduce((acc, p) => acc + p.likes, 0).toLocaleString()}
          </p>
        </div>
        <div className="flux-card border-white/5 bg-white/[0.02] p-6 hover:border-pink-500/20 transition-colors">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">
            Total Echoes
          </span>
          <p className="text-3xl font-black italic text-white mt-2">
            {posts.reduce((acc, p) => acc + p.comments, 0).toLocaleString()}
          </p>
        </div>
        <div className="flux-card border-white/5 bg-white/[0.02] p-6 hover:border-cyan-500/20 transition-colors">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">
            Neural Coefficient
          </span>
          <p className="text-3xl font-black italic text-purple-400 mt-2">
            {posts.length > 0
              ? (
                  posts.reduce((acc, p) => acc + p.likes * 2 + p.comments, 0) /
                  posts.length
                ).toFixed(1)
              : "0.0"}
          </p>
        </div>
      </div>

      <div className="flux-card border-white/5 bg-white/[0.02] p-8 h-[400px] group overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">
            Neural Signal Analysis
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                Resonance
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                Echoes
              </span>
            </div>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff05"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#ffffff20"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                hide
              />
              <YAxis
                stroke="#ffffff20"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  backdropFilter: "blur(10px)",
                }}
                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="Resonance"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#colorRes)"
                strokeWidth={3}
                animationDuration={2000}
              />
              <Area
                type="monotone"
                dataKey="Echoes"
                stroke="#ec4899"
                fillOpacity={0}
                strokeWidth={2}
                strokeDasharray="5 5"
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flux-card border-white/5 bg-white/[0.02] p-8 h-[400px]">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-8">
          Signal Phase Distribution
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff05"
                vertical={false}
              />
              <XAxis dataKey="name" hide />
              <YAxis
                stroke="#ffffff20"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Bar
                dataKey="Resonance"
                fill="#38bdf8"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="Echoes"
                fill="#ec4899"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="Relays"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface FellowsViewProps {
  profile: UserProfile;
  currentUser: UserProfile | null;
  onProfileClick: (author: string) => void;
  onToggleFollow?: (profile: UserProfile) => void;
}

function FellowsView({
  profile,
  currentUser,
  onProfileClick,
  onToggleFollow,
}: FellowsViewProps) {
  const getPredefinedConnections = (profId: string) => {
    const deletedIds: string[] = (() => {
      try {
        const saved = localStorage.getItem("deleted_user_ids");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })();
    const allUsers = Object.values(MOCK_PROFILES).filter(
      (u) => !deletedIds.includes(u.id),
    );
    if (profId === currentUser?.id) {
      const followingList = allUsers.filter((u) =>
        currentUser.followingIds?.includes(u.id),
      );
      const followersList = allUsers
        .filter((u) => u.id !== currentUser.id)
        .slice(0, 3);
      return { followers: followersList, following: followingList };
    }

    const others = allUsers.filter((u) => u.id !== profId);

    // For mock users, simulate them following 2-3 other mock users
    const followingList = others.slice(0, 2);
    // And followed by 2 other mock users
    const followersList = others.slice(1, 3);

    // If currentUser is following this mock user, add currentUser to their followers
    if (currentUser && currentUser.followingIds?.includes(profId)) {
      followersList.push(currentUser);
    }

    return { followers: followersList, following: followingList };
  };

  const { followers, following } = getPredefinedConnections(profile.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
      {/* Column: Followers */}
      <div className="flux-card border-white/5 bg-white/[0.01] p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">
            الرابطون / Signal Relays (Followers)
          </h3>
          <span className="ml-auto bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">
            {followers.length} Node(s)
          </span>
        </div>

        {followers.length === 0 ? (
          <div className="text-center py-12 text-white/20 text-xs italic font-mono uppercase tracking-wider">
            No external relays linked to this node.
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onProfileClick(peer.name)}
                >
                  <img
                    src={peer.avatar}
                    className="w-9 h-9 rounded-xl object-cover border border-white/10"
                    alt=""
                  />
                  <div>
                    <h4 className="text-xs font-black text-white hover:text-purple-400 transition-colors">
                      {peer.name}
                    </h4>
                    <p className="text-[9px] font-mono text-white/30">
                      @{peer.handle}
                    </p>
                  </div>
                </div>

                {currentUser && peer.id !== currentUser.id && (
                  <button
                    onClick={() => onToggleFollow?.(peer)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      currentUser.followingIds?.includes(peer.id)
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
                        : "bg-white text-black hover:bg-white/90 shadow"
                    }`}
                  >
                    {currentUser.followingIds?.includes(peer.id)
                      ? "LINKED"
                      : "CONNECT"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Column: Following */}
      <div className="flux-card border-white/5 bg-white/[0.01] p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <UserPlus className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">
            الروابط النشطة / Active Linkages (Following)
          </h3>
          <span className="ml-auto bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">
            {following.length} Node(s)
          </span>
        </div>

        {following.length === 0 ? (
          <div className="text-center py-12 text-white/20 text-xs italic font-mono uppercase tracking-wider">
            No active connections established by this node.
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onProfileClick(peer.name)}
                >
                  <img
                    src={peer.avatar}
                    className="w-9 h-9 rounded-xl object-cover border border-white/10"
                    alt=""
                  />
                  <div>
                    <h4 className="text-xs font-black text-white hover:text-indigo-400 transition-colors">
                      {peer.name}
                    </h4>
                    <p className="text-[9px] font-mono text-white/30">
                      @{peer.handle}
                    </p>
                  </div>
                </div>

                {currentUser && peer.id !== currentUser.id && (
                  <button
                    onClick={() => onToggleFollow?.(peer)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      currentUser.followingIds?.includes(peer.id)
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
                        : "bg-white text-black hover:bg-white/90 shadow"
                    }`}
                  >
                    {currentUser.followingIds?.includes(peer.id)
                      ? "LINKED"
                      : "CONNECT"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock Data
const MOCK_COMMENTS: Comment[] = [];

const MOCK_PUBLIC_POSTS: Post[] = [
  {
    id: "legend-1",
    author: "Vexora Official",
    avatar:
      "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=100&h=100&fit=crop",
    content:
      "تم الإعلان رسمياً عن إطلاق الإصدار 4.2 من شبكة فيكسورا. نحن فخورون جداً بما حققناه معاً. هذا الإصدار هو الأسطوري حقاً!",
    image:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=400&fit=crop",
    timestamp: "منذ ساعة",
    type: "public",
    likes: 12540,
    comments: 0,
    reposts: 856,
    shares: 412,
    isLiked: false,
    isReposted: false,
    isLegendary: true,
    replies: [],
  },
  {
    id: "AhmedGabr",
    author: "ألكـيـل",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    content:
      "عام 2014 قام أحمد جبر وهو ضابط في القوات الخاصة بالجيش المصري بأعمق غطسة في تاريخ البشرية حيث وصل إلى عمق 332.35 متر في 12 دقيقة فقط لكنه استغرق 15 ساعة للعودة لسطح الماء حتى لا يم..وت نتيجة ازدياد الضغط",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=800&fit=crop",
    timestamp: "أمس الساعة 10:00 ص",
    type: "public",
    likes: 2540,
    comments: 0,
    reposts: 124,
    shares: 56,
    isLiked: false,
    isReposted: false,
    isLegendary: true,
    replies: [],
  },
  {
    id: "1",
    author: "CyberPioneer",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    content:
      "Just launched the first node on Vexora Network. The future is multi-dimensional. #VexoraNetwork #Web3",
    timestamp: "2m",
    type: "public",
    likes: 124,
    comments: 0,
    reposts: 45,
    shares: 8,
    isLiked: false,
    isReposted: false,
    replies: [],
  },
  {
    id: "2",
    author: "NeonDreamer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content:
      "Anyone else loving the Lime Grid for family chats? The privacy level is insane.",
    timestamp: "15m",
    type: "public",
    likes: 89,
    comments: 0,
    reposts: 12,
    shares: 3,
    isLiked: true,
    isReposted: false,
    replies: [],
  },
  {
    id: "vc-1",
    author: "Vexora Admin 🛡️",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    content:
      "أهلاً بكم في مجتمع فيكسورا الرسمي الموثق! 🌐 تم تفعيل وضع التفاعل الكامل للأعضاء، ويمكنكم الآن مشاركة رسائل النص ولغات البرمجة بالإضافة إلى لقطات الشاشة (الصور) ومقاطع الفيديو التوضيحية لتطوير مشاريعكم بحرية كاملة.",
    timestamp: "منذ ساعتين",
    type: "community",
    communityId: "c-vexora",
    likes: 342,
    comments: 0,
    reposts: 12,
    shares: 4,
    isLiked: false,
    isReposted: false,
    replies: [],
  },
  {
    id: "vc-2",
    author: "سارة التقنية ✨",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content:
      "شباب، جربت البث الحقيقي عبر GMAIL_USER و GMAIL_APP_PASSWORD وكان في غاية السرعة والدقة! ها هي لقطة للتأكيد من علبة البريد الوارد.",
    image:
      "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&h=300&fit=crop",
    timestamp: "منذ ٤ ساعات",
    type: "community",
    communityId: "c-vexora",
    likes: 189,
    comments: 0,
    reposts: 8,
    shares: 2,
    isLiked: false,
    isReposted: false,
    replies: [],
  },
];

const MOCK_COMMUNITIES: Community[] = [
  {
    id: "c-vexora",
    name: "Vexora Official Grid 🌐",
    members: 245100,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop",
    description:
      "المجتمع الرسمي الموثق لشبكة فيكسورا (Vexora Network). هنا نناقش البث العام، تحديثات الأنظمة الذكية، جودة الإرسال، وربط العقد الآمنة.",
    createdAt: "2026-06-01T00:00:00Z",
    category: "Official Protocol",
    isVerified: true,
  },
  {
    id: "c1",
    name: "UI/UX Wizards",
    members: 12500,
    image:
      "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=400&h=200&fit=crop",
    description: "Exploring the frontiers of interface design.",
    createdAt: "2025-11-12T00:00:00Z",
    category: "Design",
  },
  {
    id: "c2",
    name: "Quantum Devs",
    members: 5400,
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
    description: "Building the next gen of algorithms.",
    createdAt: "2026-02-15T00:00:00Z",
    category: "Development",
  },
  {
    id: "c3",
    name: "Cyberpunk Art",
    members: 45000,
    image:
      "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=200&fit=crop",
    description: "Neon, chrome, and high contrast.",
    createdAt: "2024-08-20T00:00:00Z",
    category: "Creative/Art",
  },
  {
    id: "c4",
    name: "Nano Glitchers",
    members: 1200,
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=200&fit=crop",
    description: "A cohort focused on physical glitches and circuit bending.",
    createdAt: "2026-05-18T00:00:00Z",
    category: "Creative/Art",
  },
  {
    id: "c5",
    name: "AI Overlords",
    members: 89000,
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop",
    description:
      "Discussing neural interfaces and hyper-intelligent LLM grids.",
    createdAt: "2025-01-01T00:00:00Z",
    category: "Development",
  },
  {
    id: "c6",
    name: "Vaporwave Lounge",
    members: 8500,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop",
    description: "Retro-futuristic music, aesthetics, and lime-grid resonance.",
    createdAt: "2026-04-30T00:00:00Z",
    category: "Social/Gaming",
  },
  {
    id: "c7",
    name: "Grid Hackers",
    members: 19800,
    image:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=200&fit=crop",
    description:
      "Decentralized firewall analysis and high-grade cryptographic protocols.",
    createdAt: "2026-05-10T12:00:00Z",
    category: "Security/Privacy",
  },
];

const MOCK_STORIES: Story[] = [];

function TopNavItem({
  icon,
  active,
  onClick,
  label,
}: {
  icon: ReactNode;
  active: boolean;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-11 px-3.5 sm:px-4 flex items-center gap-2 rounded-xl transition-all relative cursor-pointer select-none border border-transparent flex-shrink-0 ${
        active
          ? "bg-purple-600/15 text-purple-400 border-purple-500/25 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)] font-bold"
          : "text-white/40 hover:text-white hover:bg-white/5"
      }`}
      title={label}
    >
      {icon}
      <span className="hidden md:inline text-[9px] font-mono uppercase tracking-[0.15em] font-black">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="nav-underline"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 rounded-t-full"
        />
      )}
    </button>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 h-10 flex items-center gap-2.5 rounded-lg transition-all font-medium text-[13px] ${active ? "bg-white text-black shadow-lg scale-105" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
    >
      {icon}
      <span className="hidden xl:block">{label}</span>
    </button>
  );
}

function DockItem({
  icon,
  active,
  onClick,
  label,
}: {
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
  label: string;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white"}`}
      >
        {icon}
      </button>
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-2 py-1 glass rounded-md text-[10px] uppercase tracking-widest font-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-90 border border-white/5 ${className}`}
      title={label}
    >
      {icon}
    </button>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  key?: string | number;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${active ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
    >
      <div className="flex-shrink-0 w-9 h-9">{icon}</div>
      <span
        className={`font-semibold text-[15px] truncate ${active ? "text-purple-600" : "text-gray-700"}`}
      >
        {label}
      </span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
      )}
    </button>
  );
}

function ComposerAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      {icon}
      <span className="text-gray-500 font-semibold text-sm hidden sm:block">
        {label}
      </span>
    </button>
  );
}

function EditPostModal({
  post,
  onClose,
  onSave,
  onDelete,
}: {
  post: Post;
  onClose: () => void;
  onSave: (content: string) => void;
  onDelete?: () => void;
}) {
  const storageKey = `vexora_edit_post_draft_${post.id}`;

  const [content, setContent] = useState<string>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? saved : post.content;
  });

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null && saved !== post.content;
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time document editor auto-save status cycle
  useEffect(() => {
    if (content !== post.content) {
      setSaveStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, content);
          setHasSavedDraft(true);
          const timeStr = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLastSavedAt(timeStr);
          setSaveStatus("saved");
        } catch (e) {
          console.warn("Storage auto-save error:", e);
          setSaveStatus("idle");
        }
      }, 450); // Fluid debounced save like Google Docs / Notion
    } else {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      localStorage.removeItem(storageKey);
      setHasSavedDraft(false);
      setSaveStatus("idle");
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [content, post.content, storageKey]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    localStorage.removeItem(storageKey);
    onSave(content);
  };

  const handleDiscardDraft = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    localStorage.removeItem(storageKey);
    setContent(post.content);
    setHasSavedDraft(false);
    setSaveStatus("idle");
  };

  return (
    <motion.div
      id="edit-post-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        id="edit-post-modal-container"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black uppercase italic tracking-widest text-white">
              Edit Pulse
            </h3>
            {/* Real-time document editor status pill */}
            <div className="flex items-center">
              {saveStatus === "saving" ? (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  Saving...
                </span>
              ) : saveStatus === "saved" && hasSavedDraft ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Saved
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-white/40" />
                  Ready
                </span>
              )}
            </div>
          </div>
          <button
            id="edit-post-close-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70 hover:text-white" />
          </button>
        </div>

        <form
          id="edit-post-form"
          onSubmit={handleSave}
          className="p-6 space-y-6"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                Pulse Content
              </label>

              <div className="flex items-center gap-2.5">
                {saveStatus === "saving" ? (
                  <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    Saving draft changes...
                  </span>
                ) : hasSavedDraft ? (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      All changes saved {lastSavedAt ? `at ${lastSavedAt}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="text-[9px] font-mono text-purple-300 hover:text-white underline cursor-pointer"
                      title="Discard saved draft and reset to original post content"
                    >
                      Reset Original
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] font-mono text-white/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Real-time auto-save enabled
                  </span>
                )}
              </div>
            </div>

            <textarea
              id="edit-post-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-48 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-purple-500/50 leading-relaxed font-sans"
              placeholder="Re-encoding pulse..."
            />
          </div>

          <div className="flex gap-4">
            {onDelete && (
              <button
                id="edit-post-delete-btn"
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "حذف للأبد؟ هل أنت متأكد من حذف هذه النبضة؟\nAre you sure you want to delete this pulse forever?",
                    )
                  ) {
                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                    localStorage.removeItem(storageKey);
                    onDelete();
                  }
                }}
                className="flex-1 py-4 rounded-2xl bg-rose-950/45 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-600 font-black uppercase tracking-widest text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Pulse
              </button>
            )}
            <button
              id="edit-post-submit-btn"
              type="submit"
              className="flex-1 py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_300px_rgba(168,85,247,0.3)] hover:bg-purple-500 transition-all active:scale-95 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DiagnosticOverlay({
  activeGrid,
  currentUser,
  onClose,
}: {
  activeGrid: string;
  currentUser: UserProfile | null;
  onClose: () => void;
}) {
  const [latency, setLatency] = useState<number>(24);
  const [minLatency, setMinLatency] = useState<number>(18);
  const [maxLatency, setMaxLatency] = useState<number>(36);
  const [packetLoss, setPacketLoss] = useState<number>(0.0);
  const [packetsTotal, setPacketsTotal] = useState<number>(1840);
  const [packetsDropped, setPacketsDropped] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.67);
  const [jitter, setJitter] = useState<number>(0.4);
  const [bandwidthDown, setBandwidthDown] = useState<number>(2.4);
  const [bandwidthUp, setBandwidthUp] = useState<number>(0.48);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([
    22, 24, 21, 23, 20, 22, 25, 22, 21, 23, 22, 24,
  ]);

  // Real-time FPS & Frame Synchronization measuring loop
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFrame = (now: number) => {
      frameCount++;
      const delta = now - lastTime;
      if (delta >= 1000) {
        const calculatedFps = Math.min(
          60,
          Math.round(((frameCount * 1000) / delta) * 10) / 10,
        );
        const calculatedFrameTime =
          Math.round((delta / frameCount) * 100) / 100;
        setFps(calculatedFps);
        setFrameTime(calculatedFrameTime);
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measureFrame);
    };

    animId = requestAnimationFrame(measureFrame);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Periodic network latency & packet telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const basePing = Math.floor(Math.random() * 12) + 16;
      const noise = (Math.random() - 0.5) * 4;
      const currentPing = Math.max(12, Math.round(basePing + noise));

      setLatency(currentPing);
      setMinLatency((prev) => Math.min(prev, currentPing));
      setMaxLatency((prev) => Math.max(prev, currentPing));
      setJitter(Math.round(Math.abs(noise) * 10) / 10);

      setPacketsTotal((prev) => prev + 10);
      if (Math.random() < 0.04) {
        setPacketsDropped((prev) => {
          const updatedDropped = prev + 1;
          setPacketLoss(
            Math.round((updatedDropped / (packetsTotal + 10)) * 1000) / 10,
          );
          return updatedDropped;
        });
      } else {
        setPacketLoss(
          Math.round((packetsDropped / (packetsTotal + 10)) * 1000) / 10,
        );
      }

      setBandwidthDown(Math.round((2.1 + Math.random() * 0.8) * 100) / 100);
      setBandwidthUp(Math.round((0.42 + Math.random() * 0.15) * 100) / 100);

      setHistory((prev) => [...prev.slice(1), currentPing]);
    }, 1200);

    return () => clearInterval(interval);
  }, [packetsTotal, packetsDropped]);

  const probeLatency = async () => {
    setIsMeasuring(true);
    const start = performance.now();
    try {
      await fetch("/api/health").catch(() => {});
    } catch {
      // ignore
    }
    const end = performance.now();
    const measured = Math.max(8, Math.round(end - start));
    setLatency(measured);
    setMinLatency((prev) => Math.min(prev, measured));
    setMaxLatency((prev) => Math.max(prev, measured));
    setIsMeasuring(false);
  };

  const latencyColor =
    latency < 35
      ? "text-emerald-400"
      : latency < 70
        ? "text-amber-400"
        : "text-red-400";
  const latencyBg =
    latency < 35
      ? "bg-emerald-500/20 border-emerald-500/30"
      : latency < 70
        ? "bg-amber-500/20 border-amber-500/30"
        : "bg-red-500/20 border-red-500/30";
  const lossColor =
    packetLoss === 0
      ? "text-emerald-400"
      : packetLoss < 1
        ? "text-amber-400"
        : "text-red-400";

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-20 right-6 z-[950] bg-[#050508]/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl px-3 py-2 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex items-center gap-3 font-mono text-[10px] select-none"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-white/60 font-bold uppercase tracking-wider">
            DIAG:
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-white/40">LAT:</span>
          <span className={`font-bold ${latencyColor}`}>{latency}ms</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-white/40">LOSS:</span>
          <span className={`font-bold ${lossColor}`}>{packetLoss}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-white/40">FPS:</span>
          <span className="font-bold text-cyan-400">{fps}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsCompact(false)}
          className="text-white/40 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors ml-1"
          title="Expand Diagnostic Telemetry"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      className="fixed bottom-20 right-6 z-[950] w-80 md:w-96 bg-[#030307]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-4 shadow-[0_0_40px_rgba(16,185,129,0.2)] font-mono text-xs select-none space-y-3"
    >
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5">
              <span>GRID DIAGNOSTICS</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[7.5px]">
                LIVE
              </span>
            </h4>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">
              {activeGrid.toUpperCase()} GRID SESSION • NODE #
              {currentUser?.id ? currentUser.id.slice(0, 6) : "LOCAL"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsCompact(true)}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize Overlay"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Overlay"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Latency Metric */}
        <div
          className={`p-2.5 rounded-2xl border ${latencyBg} flex flex-col justify-between space-y-1`}
        >
          <span className="text-[8px] text-white/50 uppercase tracking-wider">
            Latency
          </span>
          <div className="flex items-baseline justify-between">
            <span className={`text-base font-black ${latencyColor}`}>
              {latency}
            </span>
            <span className="text-[8px] text-white/40">ms</span>
          </div>
          <div className="text-[7.5px] text-white/40 leading-none">
            <span>
              Range: {minLatency}-{maxLatency}ms
            </span>
          </div>
        </div>

        {/* Packet Loss Metric */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-1">
          <span className="text-[8px] text-white/50 uppercase tracking-wider">
            Packet Loss
          </span>
          <div className="flex items-baseline justify-between">
            <span className={`text-base font-black ${lossColor}`}>
              {packetLoss}%
            </span>
          </div>
          <div className="text-[7.5px] text-white/40 leading-none truncate">
            <span>
              {packetsDropped}/{packetsTotal} pkts
            </span>
          </div>
        </div>

        {/* Frame Sync Metric */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-1">
          <span className="text-[8px] text-white/50 uppercase tracking-wider">
            Frame Sync
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-cyan-400">{fps}</span>
            <span className="text-[8px] text-cyan-400/60">FPS</span>
          </div>
          <div className="text-[7.5px] text-cyan-300/50 leading-none truncate">
            <span>{frameTime}ms / frame</span>
          </div>
        </div>
      </div>

      {/* Latency Sparkline Graph */}
      <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[8px] text-white/40 uppercase">
          <span>Neural Pulse Jitter (±{jitter}ms)</span>
          <span className="text-emerald-400/80 font-bold">
            VSYNC: LOCK 60Hz
          </span>
        </div>
        <div className="h-7 w-full flex items-end gap-1 px-1">
          {history.map((val, i) => {
            const heightPercent = Math.min(100, Math.max(20, (val / 50) * 100));
            return (
              <div
                key={i}
                className="flex-1 bg-emerald-500/30 hover:bg-emerald-400 rounded-t transition-all"
                style={{ height: `${heightPercent}%` }}
                title={`Sample ${i + 1}: ${val}ms`}
              />
            );
          })}
        </div>
      </div>

      {/* Throughput & Channel Stats */}
      <div className="flex items-center justify-between text-[8.5px] text-white/50 pt-1 border-t border-white/5 font-mono">
        <div className="flex items-center gap-2">
          <span>↓ {bandwidthDown} MB/s</span>
          <span>↑ {bandwidthUp} MB/s</span>
        </div>
        <button
          type="button"
          onClick={probeLatency}
          disabled={isMeasuring}
          className="text-emerald-400 hover:text-emerald-300 uppercase underline tracking-wider cursor-pointer flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-2.5 h-2.5 ${isMeasuring ? "animate-spin" : ""}`}
          />
          <span>Probe Ping</span>
        </button>
      </div>
    </motion.div>
  );
}

function EditProfileModal({
  profile,
  onClose,
  onSave,
  initialTab = "profile",
  language,
  setLanguage,
  isDevMode,
  setIsDevMode,
  showDiagnostics,
  setShowDiagnostics,
}: {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
  initialTab?: "profile" | "system" | "secrets";
  language?: "en" | "ar";
  setLanguage?: (lang: "en" | "ar") => void;
  isDevMode?: boolean;
  setIsDevMode?: (dev: boolean) => void;
  showDiagnostics?: boolean;
  setShowDiagnostics?: (val: boolean) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [banner, setBanner] = useState(profile.banner);

  const [activeTab, setActiveTab] = useState<
    "profile" | "system" | "secrets"
  >(initialTab || "profile");
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  // System preference states
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem("vexora_accent") || "purple",
  );
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("vexora_sounds") !== "false",
  );

  // Secrets states
  const [geminiKey, setGeminiKey] = useState(
    () => localStorage.getItem("gemini_api_key") || "",
  );
  const [showKey, setShowKey] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      bio,
      location,
      avatar,
      banner,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0b0a14] border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
          <div>
            <h3 className="text-lg font-black uppercase italic tracking-widest text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              Node Settings / إعدادات الحساب
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
              NETWORK NODE CONFIGURATION SYSTEM
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap border-b border-white/5 bg-black/20 p-1.5 gap-1 overflow-x-auto scrollbar-hide justify-center">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${activeTab === "profile" ? "bg-white/5 text-white border border-white/10 shadow-inner" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
          >
            👤 Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("system")}
            className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${activeTab === "system" ? "bg-white/5 text-white border border-white/10 shadow-inner" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
          >
            ⚙️ System
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("secrets")}
            className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${activeTab === "secrets" ? "bg-white/5 text-white border border-white/10 shadow-inner" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
          >
            🔑 Secrets
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                  Node Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 h-32 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                  Geographic Node
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex flex-col gap-5">
                {/* Avatar Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 font-bold">
                    Avatar Signal / الصورة الشخصية
                  </label>
                  <div className="flex gap-3 items-center">
                    <div className="relative flex-shrink-0">
                      <img
                        src={avatar}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/30 shadow-lg"
                        alt="Avatar Preview"
                      />
                      <OnlineStatusDot
                        lastActive={profile.lastActive}
                        size="sm"
                        className="absolute bottom-0 right-0 z-10 translate-x-1 translate-y-1 shadow-md"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          placeholder="Paste avatar URL or upload..."
                          className="flex-1 bg-white/5 border border-white/10 h-11 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-purple-500/50"
                        />
                        <input
                          type="file"
                          id="edit-profile-avatar-file-input"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAvatar(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          id="edit-profile-upload-avatar-button"
                          onClick={() =>
                            document
                              .getElementById("edit-profile-avatar-file-input")
                              ?.click()
                          }
                          className="px-3.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          title="Upload Avatar Image from Device"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                      </div>
                      {/* Avatar Quick Presets */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
                          Presets:
                        </span>
                        {[
                          {
                            name: "Neon Hacker",
                            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                          },
                          {
                            name: "Cyber Samurai",
                            url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                          },
                          {
                            name: "Cosmic Pulse",
                            url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
                          },
                          {
                            name: "Neural Void",
                            url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                          },
                        ].map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAvatar(p.url)}
                            className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 text-[9px] font-mono text-zinc-400 hover:text-purple-300 transition-all shrink-0 cursor-pointer"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 font-bold">
                    Banner Signal / صورة غلاف الحساب
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="relative h-24 w-full rounded-2xl overflow-hidden border-2 border-purple-500/20 shadow-md bg-black/40">
                      {banner ? (
                        <img
                          src={banner}
                          className="w-full h-full object-cover"
                          alt="Banner Preview"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-cyan-900/40 flex items-center justify-center">
                          <span className="text-[10px] font-mono uppercase text-zinc-500">
                            No Banner Set (Default Ambient Gradient)
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={banner}
                        onChange={(e) => setBanner(e.target.value)}
                        placeholder="Paste banner cover image URL or upload..."
                        className="flex-1 bg-white/5 border border-white/10 h-11 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-purple-500/50"
                      />
                      <input
                        type="file"
                        id="edit-profile-banner-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setBanner(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        id="edit-profile-upload-banner-button"
                        onClick={() =>
                          document
                            .getElementById("edit-profile-banner-file-input")
                            ?.click()
                        }
                        className="px-3.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        title="Upload Banner Cover Image from Device"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>

                    {/* Banner Quick Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
                        Presets:
                      </span>
                      {[
                        {
                          name: "Cosmic Matrix",
                          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
                        },
                        {
                          name: "Neon Cyberpunk",
                          url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200",
                        },
                        {
                          name: "Synthwave Sunset",
                          url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200",
                        },
                        {
                          name: "Quantum Void",
                          url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=1200",
                        },
                      ].map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBanner(p.url)}
                          className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 text-[9px] font-mono text-zinc-400 hover:text-purple-300 transition-all shrink-0 cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                  System Language / لغة النظام
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage?.("en")}
                    className={`flex-1 py-3 rounded-xl border transition-all text-xs font-mono uppercase tracking-wider ${language === "en" ? "bg-purple-600/25 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "bg-white/5 border-transparent text-white/40 hover:text-white"}`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage?.("ar")}
                    className={`flex-1 py-3 rounded-xl border transition-all text-xs font-mono uppercase tracking-wider ${language === "ar" ? "bg-purple-600/25 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "bg-white/5 border-transparent text-white/40 hover:text-white"}`}
                  >
                    🇸🇦 العربية (Arabic)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                  Visual Accent Glow / هالة الإشعاع
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      id: "purple",
                      name: "Purple Neon",
                      color: "bg-purple-500",
                    },
                    {
                      id: "emerald",
                      name: "Emerald Grid",
                      color: "bg-emerald-500",
                    },
                    { id: "cyan", name: "Cyan Pulse", color: "bg-cyan-500" },
                    { id: "amber", name: "Amber Glow", color: "bg-amber-500" },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setAccentColor(color.id);
                        localStorage.setItem("vexora_accent", color.id);
                        setShowFeedback(`Accent set to ${color.name}!`);
                        setTimeout(() => setShowFeedback(null), 2000);
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${accentColor === color.id ? "bg-white/10 border-white/20" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full ${color.color} shadow-lg`}
                      />
                      <span className="text-[8px] font-mono uppercase tracking-wider text-white">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Session Diagnostic Overlay / تشخيصات الشبكة للجلسة
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300/60 uppercase mt-0.5">
                    Real-time latency, packet loss & frame synchronization stats
                    HUD
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDiagnostics?.(!showDiagnostics)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${showDiagnostics ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-white/10"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-all ${showDiagnostics ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Developer Interface / وضع المطورين
                  </span>
                  <span className="text-[9px] font-mono text-white/30 uppercase mt-0.5">
                    Toggle advanced telemetry overlays
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDevMode?.(!isDevMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${isDevMode ? "bg-purple-600" : "bg-white/10"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-all ${isDevMode ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Sound Effects / المؤثرات الصوتية
                  </span>
                  <span className="text-[9px] font-mono text-white/30 uppercase mt-0.5">
                    Tactile signal exchange audio logs
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    localStorage.setItem("vexora_sounds", next.toString());
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${soundEnabled ? "bg-purple-600" : "bg-white/10"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === "secrets" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl border border-white/5 bg-zinc-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Model Link Connection
                    </span>
                    <span className="text-xs font-black text-white">
                      Gemini API Connection Status
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[8px] font-mono uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Grid Synced
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                  Client Gemini API Key Override
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AI_STUDIO_GEMINI_API_KEY..."
                    className="w-full bg-white/5 border border-white/10 h-12 rounded-xl pl-4 pr-12 text-xs font-mono tracking-wider text-white focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showKey ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono tracking-wide leading-relaxed uppercase mt-1">
                  💡 Key is securely persisted in your sandboxed local storage
                  client-side to override AI Terminal responses.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("gemini_api_key", geminiKey);
                  setShowFeedback(
                    "Client Gemini API Key updated and bridged successfully!",
                  );
                  setTimeout(() => setShowFeedback(null), 3000);
                }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-purple-600/10"
              >
                Sync Client Secrets Matrix
              </button>
            </div>
          )}

          {/* Action buttons (Profile, System, and Secrets Tabs) */}
          <div className="flex gap-3 pt-4 border-t border-white/5 bg-black/40 -mx-6 -mb-6 p-6">
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-purple-600 text-white font-black uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:bg-purple-500 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              حفظ وتطبيق التغييرات / Apply & Save Node
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[11px] transition-all cursor-pointer"
            >
              إلغاء / Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

interface ReportCommunityModalProps {
  community: Community;
  onClose: () => void;
  onReport: (reason: string, comments: string) => void;
}

function ReportCommunityModal({
  community,
  onClose,
  onReport,
}: ReportCommunityModalProps) {
  const [reason, setReason] = useState("Inappropriate Content");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onReport(reason, comments);
      }, 1500);
    }, 1000);
  };

  const REASONS = [
    "Inappropriate Content",
    "Spam & Malicious activity",
    "Hate Speech & Harassment",
    "Intellectual Property Violation",
    "Other Security Disruption",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-red-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-red-950/20 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Flag className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Report Cluster
              </h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
                Flagging community protocol
              </p>
            </div>
          </div>
          <button
            id="report-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-mono tracking-widest text-white uppercase italic font-black">
              Report Complete
            </h4>
            <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.12em] max-w-xs mx-auto leading-relaxed">
              Moderation officers have been alerted. Thank you for securing our
              perimeter.
            </p>
          </div>
        ) : (
          <form
            id="report-community-form"
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">
                  Target Cluster
                </span>
                <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <img
                    src={community.image}
                    className="w-10 h-10 rounded-lg object-cover border border-white/5"
                    alt={community.name}
                  />
                  <div>
                    <h4 className="font-black text-xs text-white uppercase italic tracking-tight">
                      {community.name}
                    </h4>
                    <p className="text-[8px] font-mono text-purple-400 uppercase tracking-widest">
                      {community.category}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                  Reason for Report
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {REASONS.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setReason(r)}
                      className={`h-10 px-4 rounded-xl border text-[9px] font-mono uppercase tracking-widest flex items-center justify-between transition-all cursor-pointer ${
                        reason === r
                          ? "bg-red-500/10 border-red-500/40 text-red-400 font-bold shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{r}</span>
                      {reason === r && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                  Additional Comments
                </label>
                <textarea
                  id="report-comments-textarea"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide details of the violation..."
                  className="w-full bg-white/5 border border-white/10 h-20 rounded-xl p-3 text-[10px] text-white resize-none focus:outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="report-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-lg bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-red-300 hover:text-white text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5 text-red-400" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

interface CreateCommunityModalProps {
  onClose: () => void;
  onCreate: (
    name: string,
    description: string,
    category: string,
    image: string,
  ) => void;
}

function CreateCommunityModal({
  onClose,
  onCreate,
}: CreateCommunityModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Design");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        const fallbackImages: Record<string, string> = {
          Design:
            "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=400&h=200&fit=crop",
          Development:
            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
          "Creative/Art":
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=200&fit=crop",
          "Social/Gaming":
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop",
          "Security/Privacy":
            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=200&fit=crop",
          Other:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop",
        };
        const finalImage =
          image.trim() ||
          fallbackImages[category] ||
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop";
        onCreate(name, description, category, finalImage);
      }, 1500);
    }, 1000);
  };

  const CATEGORIES = [
    "Design",
    "Development",
    "Creative/Art",
    "Social/Gaming",
    "Security/Privacy",
    "Other",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-purple-950/20 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Plus className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Create Signal Cluster
              </h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
                Initialize community protocols
              </p>
            </div>
          </div>
          <button
            id="create-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-mono tracking-widest text-white uppercase italic font-black">
              Cluster Initialized
            </h4>
            <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.12em] max-w-xs mx-auto leading-relaxed">
              Your community cluster is now active on the public distributed
              index grid of our distributed mesh ledger.
            </p>
          </div>
        ) : (
          <form
            id="create-community-form"
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                  Cluster Designation (Name)
                </label>
                <input
                  id="create-community-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Neo-Tokyo Hackspace"
                  className="w-full bg-white/5 border border-white/10 h-10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                  Sector (Category)
                </label>
                <select
                  id="create-community-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 h-10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-zinc-950 text-white"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                  Cluster Description
                </label>
                <textarea
                  id="create-community-description-textarea"
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide parameters and goals of this protocol node..."
                  className="w-full bg-white/5 border border-white/10 h-16 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                  Image Uplink URL (Optional)
                </label>
                <input
                  id="create-community-image-input"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Leave empty for generic Unsplash render..."
                  className="w-full bg-white/5 border border-white/10 h-10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono text-[9px]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="create-community-submit-btn"
                type="submit"
                disabled={isSubmitting || !name.trim() || !description.trim()}
                className="flex-1 h-10 rounded-lg bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 hover:text-white text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Deploy Cluster</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

function GifSelector({
  onSelectGif,
  onClose,
}: {
  onSelectGif: (url: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gifs/trending");
      const data = await res.json();
      setGifs(data.gifs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      fetchTrending();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/gifs/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setGifs(data.gifs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  return (
    <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-4 max-h-[380px] flex flex-col overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-400 font-bold">
          Quantum GIF Downlink
        </span>
        <button
          onClick={onClose}
          type="button"
          className="p-1 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Query quantum databanks..."
          className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors pl-8"
        />
        <Search className="w-3.5 h-3.5 text-white/20 absolute left-3 top-2.5" />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 min-h-[150px]">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white/5 border border-white/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 max-h-[220px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {gifs.map((gif: any) => (
            <button
              key={gif.id}
              onClick={() => onSelectGif(gif.url)}
              type="button"
              className="group relative h-20 bg-white/5 rounded-lg overflow-hidden border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer"
            >
              <img
                src={gif.preview || gif.url}
                alt={gif.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                <span className="text-[7.5px] font-mono text-white/80 truncate w-full">
                  {gif.title || "Select GIF"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ComposerModal({
  onClose,
  currentUser,
  onPost,
}: {
  onClose: () => void;
  currentUser: UserProfile | null;
  onPost: (c: string, image?: string, gif?: string) => void;
}) {
  const draftStorageKey = `vexora_new_post_draft_${currentUser?.id || "guest"}`;

  const [content, setContent] = useState(() => {
    try {
      return localStorage.getItem(draftStorageKey) || "";
    } catch {
      return "";
    }
  });
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(() => {
    try {
      return localStorage.getItem(draftStorageKey) ? "saved" : "idle";
    } catch {
      return "idle";
    }
  });
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time document editor auto-save cycle for new post composer
  useEffect(() => {
    if (content.trim()) {
      setSaveStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(draftStorageKey, content);
          const timeStr = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLastSavedAt(timeStr);
          setSaveStatus("saved");
        } catch (e) {
          console.warn("Storage draft save warning:", e);
          setSaveStatus("idle");
        }
      }, 400); // 400ms debounce like Google Docs / Word Online
    } else {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      try {
        localStorage.removeItem(draftStorageKey);
      } catch (e) {
        console.warn("Draft cleanup error:", e);
      }
      setSaveStatus("idle");
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [content, draftStorageKey]);

  const handleDiscardDraft = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      localStorage.removeItem(draftStorageKey);
    } catch (e) {
      console.warn("Draft cleanup error:", e);
    }
    setContent("");
    setSelectedGif(null);
    setSaveStatus("idle");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">Create post</h3>
            {/* Real-time Document Status Indicator */}
            <div className="flex items-center ml-1">
              {saveStatus === "saving" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                  Saving...
                </span>
              ) : saveStatus === "saved" && content.trim() ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-medium flex items-center gap-1.5 transition-all">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Saved
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-400 text-[10px] font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 text-gray-400" />
                  Ready
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <img
                src={currentUser?.avatar}
                alt=""
                className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/20"
              />
              <div>
                <div className="font-bold text-gray-900 leading-tight">
                  {currentUser?.name}
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-bold text-gray-600 mt-1">
                  <Users className="w-3 h-3" />
                  Friends
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Auto-save time metadata & quick reset */}
            {content.trim() && (
              <div className="flex items-center gap-2 text-right">
                <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                  {saveStatus === "saving" ? "Typing..." : lastSavedAt ? `Saved at ${lastSavedAt}` : "Saved to device"}
                </span>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="text-[10px] text-gray-400 hover:text-red-500 underline font-medium cursor-pointer"
                  title="Discard draft text"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${currentUser?.name.split(" ")[0]}?`}
            className="w-full h-32 resize-none text-xl text-gray-900 placeholder:text-gray-400 focus:outline-none leading-relaxed"
          />

          {selectedGif && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 mt-2 max-h-[160px] cursor-default group">
              <img
                src={selectedGif}
                alt="Selected GIF"
                className="w-full h-auto object-cover max-h-[160px]"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setSelectedGif(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {showGifSelector && (
            <div className="mt-2">
              <GifSelector
                onSelectGif={(url) => {
                  setSelectedGif(url);
                  setShowGifSelector(false);
                }}
                onClose={() => setShowGifSelector(false)}
              />
            </div>
          )}

          <div className="p-3 border border-gray-200 rounded-xl flex items-center justify-between">
            <span className="font-bold text-gray-900 px-2 text-sm">
              Add to your post
            </span>
            <div className="flex items-center gap-1">
              <ComposerAction
                onClick={() => {
                  setShowGifSelector(!showGifSelector);
                }}
                icon={
                  <div className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-extrabold text-[10px] uppercase border border-purple-500/20 hover:bg-purple-500/20 transition-all">
                    GIF
                  </div>
                }
                label=""
              />
              <ComposerAction
                icon={<ImageIcon className="w-6 h-6 text-purple-500" />}
                label=""
              />
              <ComposerAction
                icon={<User className="w-6 h-6 text-purple-500" />}
                label=""
              />
              <ComposerAction
                icon={<Smile className="w-6 h-6 text-yellow-500" />}
                label=""
              />
              <ComposerAction
                icon={<MapPin className="w-6 h-6 text-red-500" />}
                label=""
              />
              <ComposerAction
                icon={<Mic className="w-6 h-6 text-purple-500" />}
                label=""
              />
            </div>
          </div>

          <button
            disabled={!content.trim() && !selectedGif}
            onClick={() => {
              if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
              try {
                localStorage.removeItem(draftStorageKey);
              } catch (e) {
                console.warn(e);
              }
              onPost(content, undefined, selectedGif || undefined);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold disabled:bg-gray-200 disabled:text-gray-400 transition-all hover:bg-purple-700 cursor-pointer shadow-sm active:scale-[0.99]"
          >
            Post
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const MOCK_PROFILES: Record<string, UserProfile> = {
  "Flux Studio": {
    id: "u-owner-flux",
    name: "Flux Studio (Site Owner) 👑",
    handle: "flux_developer",
    email: "fluxstudio4@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop",
    bio: "Official Site Owner & Master Architect of Vexora Platform. Full System Privileges.",
    location: "Supreme Core Matrix",
    joinedDate: "January 2024",
    followers: 1250000,
    following: 0,
    isVerified: true,
    isOwner: true,
    role: "owner",
    isVip: true,
    subscriptionTier: "plus_pro",
    subscriptionStatus: "active",
    lastActive: Date.now(),
  },
};

function SystemConsole({
  onClose,
  posts,
}: {
  onClose: () => void;
  posts: Post[];
}) {
  const [activeTab, setActiveTab] = useState<"diagnostics" | "broadcast">(
    "broadcast",
  );

  // Collect all potential email recipients from the platform profiles
  const allRecipients = useMemo(() => {
    const listMap = new Map<string, UserProfile>();
    // Add all mock profiles
    Object.values(MOCK_PROFILES).forEach((p) => {
      if (p.email && p.email.trim() !== "") {
        listMap.set(p.email.toLowerCase(), p);
      }
    });

    // Check if there is a logged-in user and add their email too
    const saved = localStorage.getItem("grid_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.email.trim() !== "") {
          listMap.set(parsed.email.toLowerCase(), parsed);
        }
      } catch (e) {
        console.error("Local user profile email parsing error:", e);
      }
    }

    return Array.from(listMap.values());
  }, []);

  const [selectedEmails, setSelectedEmails] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      allRecipients.forEach((r) => {
        if (r.email) {
          initial[r.email.toLowerCase()] = true;
        }
      });
      return initial;
    },
  );

  const [emailSubject, setEmailSubject] = useState(
    "Vexora Network Core Link Update / تحديث هام من شبكة فيكسورا",
  );
  const [emailBody, setEmailBody] = useState(
    "Greetings Node Connection,\n\nThis is an urgent system broadcast issued by the Vexora Network Grid Owner to all active nodes. We are synchronizing our neural linkages and upgrading the quantum bridge interfaces. Please remain connected.\n\nRespectfully,\nGrid Owner",
  );
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [enhanceWithAi, setEnhanceWithAi] = useState(true);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{
    hasSMTP: boolean;
    smtpUser: string | null;
    smtpHost: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/owner/smtp-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSmtpStatus({
            hasSMTP: data.hasSMTP,
            smtpUser: data.smtpUser,
            smtpHost: data.smtpHost,
          });
        }
      })
      .catch((err) => console.error("Error fetching SMTP status:", err));
  }, []);

  const toggleRecipient = (email: string) => {
    setSelectedEmails((prev) => ({
      ...prev,
      [email.toLowerCase()]: !prev[email.toLowerCase()],
    }));
  };

  const handleSelectAll = (select: boolean) => {
    const updated: Record<string, boolean> = {};
    allRecipients.forEach((r) => {
      if (r.email) {
        updated[r.email.toLowerCase()] = select;
      }
    });
    setSelectedEmails(updated);
  };

  const executeBroadcast = async () => {
    setErrorText(null);
    setSuccessCount(null);
    setBroadcastLogs([]);

    const targets = Object.keys(selectedEmails).filter(
      (email) => selectedEmails[email],
    );
    if (targets.length === 0) {
      setErrorText(
        "يرجى اختيار مستلم واحد على الأقل لإرسال البريد (Select at least 1 recipient)",
      );
      return;
    }

    setIsSending(true);
    setBroadcastLogs([
      `Initializing core broadcast thread...`,
      `Target size: ${targets.length} Google IDs / Node emails`,
    ]);

    try {
      const response = await fetch("/api/owner/broadcast-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          content: emailBody,
          recipients: targets,
          enhance: enhanceWithAi,
        }),
      });

      if (!response.ok) {
        throw new Error("Server connection offline or channel link broken.");
      }

      const result = await response.json();
      if (result.success) {
        if (result.subject && result.subject !== emailSubject) {
          setEmailSubject(result.subject);
        }
        if (result.content && result.content !== emailBody) {
          setEmailBody(result.content);
        }
        setBroadcastLogs(result.logs || []);
        setSuccessCount(targets.length);
      } else {
        throw new Error(
          result.error || "Unknown error during dispatch cascade",
        );
      }
    } catch (err: any) {
      setErrorText(err.message || "Failure during broadcast linkage cycle.");
      setBroadcastLogs((prev) => [
        ...prev,
        `❌ CRITICAL FAILURE: ${err.message || "Transmission aborted."}`,
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 150 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 150 }}
      className="fixed inset-x-0 bottom-0 h-[480px] bg-black/95 backdrop-blur-2xl border-t border-purple-500/40 z-[999] font-mono text-[10px] sm:text-xs overflow-hidden flex flex-col shadow-[0_-15px_60px_rgba(168,85,247,0.25)]"
    >
      {/* Console Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/[0.03] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <div>
            <span className="text-purple-400 font-black tracking-widest uppercase text-[11px] sm:text-xs">
              SYSTEM ROOT CONSOLE v4.5.1
            </span>
            <span className="text-white/20 ml-3 text-[9px] uppercase tracking-wider hidden md:inline">
              | Auth level: ABSOLUTE PRIVILEGED OWNER
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("broadcast")}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "broadcast" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-white/50 hover:text-white"}`}
          >
            📩 بريد المالك العام / BROADCAST LINK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diagnostics")}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "diagnostics" ? "bg-purple-600/20 text-purple-400" : "text-white/40 hover:text-white"}`}
          >
            ⚙️ تشخيص الشبكة / SYSTEM DIAGNOSTICS
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all text-white/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Console Content Screens */}
      <div className="flex-1 overflow-hidden flex bg-[#060608]">
        {activeTab === "broadcast" ? (
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 overflow-hidden">
            {/* Left Column: Composer Form */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-black text-purple-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 animate-pulse" />
                  بروتوكول البث العام / BULK EMAIL TRANSMISSION CORE
                </span>
                <span className="text-[9px] text-white/40 font-mono tracking-widest">
                  GATEWAY: HOST-RELAY-1
                </span>
              </div>

              {/* SMTP Status banner */}
              {smtpStatus &&
                (smtpStatus.hasSMTP ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse animate-duration-1000" />
                      <div className="text-left">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                          بث حقيقي نشط / REAL MAILING SERVICE ACTIVE
                        </span>
                        <span className="text-[8.5px] text-white/40 font-mono block">
                          SMTP Mailbox: {smtpStatus.smtpUser}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2 text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        وضع محاكاة البث / TRANSMISSION SIMULATION ONLY
                      </span>
                    </div>
                    <p className="text-[10.5px] text-white/70 leading-relaxed font-sans font-medium">
                      ⚠️ البريد لا يرسل فعلياً للبريد الحقيقي لأنك لم تقم بتهيئة
                      بيانات الـ SMTP في المخدم بعد.
                    </p>
                    <p className="text-[9.5px] text-white/40 leading-relaxed font-sans">
                      لتفعيل الإرسال الحقيقي لكل الأعضاء، يرجى إعداد مفتاح{" "}
                      <strong className="text-amber-400 font-mono">
                        GMAIL_USER
                      </strong>{" "}
                      و{" "}
                      <strong className="text-amber-400 font-mono">
                        GMAIL_APP_PASSWORD
                      </strong>{" "}
                      في تبويب{" "}
                      <span className="text-amber-400 underline font-bold">
                        Settings &gt; Secrets
                      </span>{" "}
                      باللوحة الجانبية لمنصة AI Studio (مع إمكانية استخدام
                      SMTP_USER و SMTP_PASS كبديل).
                    </p>
                  </div>
                ))}

              {errorText && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-[10px] font-bold">
                  ⚠️ Error Link: {errorText}
                </div>
              )}

              {successCount !== null && (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>
                    تم إرسال البريد بنجاح لـ {successCount} نظام متصل! Broadcast
                    successfully routed to {successCount} Google nodes.
                  </span>
                </div>
              )}

              {/* Form Input: Subject */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">
                  Subject Header / عنوان البريد
                </label>
                <input
                  type="text"
                  disabled={isSending}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Insert broadcast title..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 focus:bg-black/50 transition-all font-sans"
                />
              </div>

              {/* Form Input: Body Content */}
              <div className="space-y-1 flex-1 flex flex-col min-h-[140px]">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">
                  Email Body Content / محتوى رسالة البث
                </label>
                <textarea
                  disabled={isSending}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Welcome messages, system updates, global logs for connected people..."
                  className="w-full flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white resize-none focus:outline-none focus:border-purple-500/50 focus:bg-black/50 transition-all font-sans leading-relaxed"
                />
              </div>

              {/* Action Buttons Zone */}
              <div className="flex gap-3 flex-wrap items-center justify-between pt-2">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    id="enhanceAiConsole"
                    checked={enhanceWithAi}
                    onChange={(e) => setEnhanceWithAi(e.target.checked)}
                    disabled={isSending}
                    className="rounded text-purple-600 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20 w-3.5 h-3.5"
                  />
                  <label
                    htmlFor="enhanceAiConsole"
                    className="text-[9px] font-bold text-purple-300 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    تحسين الرسالة بالذكاء الاصطناعي / Refine with Vexora AI
                  </label>
                </div>

                <div className="flex gap-2">
                  {/* Secondary direct client open */}
                  <button
                    type="button"
                    onClick={() => {
                      const targets = Object.keys(selectedEmails).filter(
                        (email) => selectedEmails[email],
                      );
                      if (targets.length === 0) {
                        alert("Select at least 1 recipient!");
                        return;
                      }
                      const bdy = encodeURIComponent(emailBody);
                      const subj = encodeURIComponent(emailSubject);
                      // Use bcc for privacy in bulk mail to users
                      const bcc = targets.join(",");
                      window.location.href = `mailto:vexora.network@gmail.com?bcc=${bcc}&subject=${subj}&body=${bdy}`;
                    }}
                    className="h-10 px-4 rounded-xl border border-white/10 hover:border-purple-500/30 text-white hover:text-purple-300 hover:bg-white/5 transition-all text-[9px] font-black tracking-widest uppercase cursor-pointer"
                  >
                    Open Physical Mail / فتح صندوق حقيقي
                  </button>

                  <button
                    onClick={executeBroadcast}
                    disabled={isSending}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[9.5px] tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-95 disabled:opacity-50 select-none flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري توجيه الحزم... / DISPATCHING...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          بث لجميع الأعضاء / EXECUTE NETWORK BROADCAST
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Column: Recipients Grid */}
            <div className="w-full md:w-[280px] p-5 overflow-hidden flex flex-col flex-shrink-0">
              <div className="pb-2 border-b border-white/5 flex items-center justify-between mb-3">
                <span className="text-xs font-black text-white/80 uppercase">
                  الأعضاء المتصلين / target nodes
                </span>
                <span className="text-[10px] text-purple-400 font-bold">
                  {allRecipients.length} Registered
                </span>
              </div>

              {/* Fast toggles */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded text-[8px] font-mono tracking-wider transition-all uppercase cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded text-[8px] font-mono tracking-wider transition-all uppercase cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[140px] md:max-h-none">
                {allRecipients.map((profile) => {
                  const hasEmail = profile.email && profile.email.trim() !== "";
                  if (!hasEmail) return null;
                  const emailKey = (profile.email || "").toLowerCase();
                  const isChecked = !!selectedEmails[emailKey];

                  return (
                    <div
                      key={`recip-${profile.id}`}
                      onClick={() => toggleRecipient(emailKey)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${isChecked ? "bg-purple-900/15 border-purple-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={profile.avatar}
                          className="w-6 h-6 rounded-lg object-cover"
                          alt=""
                        />
                        <div className="text-left">
                          <p className="text-[10px] font-sans font-black text-white/90 truncate max-w-[130px]">
                            {profile.name}
                          </p>
                          <p className="text-[8px] font-mono text-white/40 truncate max-w-[130px]">
                            {profile.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${isChecked ? "bg-purple-600 text-white" : "border border-white/20"}`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Broadcast Logs Viewer */}
            <div className="w-full md:w-[320px] p-5 overflow-hidden flex flex-col flex-shrink-0 bg-black/60">
              <div className="pb-2 border-b border-white/5 flex items-center justify-between mb-3 text-left">
                <span className="text-xs font-black text-white/80 uppercase">
                  سجل الإرسال والاتصال / transmission telemetry
                </span>
                <span className="text-[9px] text-green-500 font-bold animate-pulse">
                  LIVE LINKAGE
                </span>
              </div>

              <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-[9px] text-purple-400 space-y-1.5 min-h-[100px] md:min-h-none text-left">
                {broadcastLogs.length === 0 ? (
                  <div className="text-white/25 italic uppercase tracking-wider text-center pt-8">
                    Pending Owner dispatch cycle...
                    <br />
                    الرجاء الضغط على بدء البث لتوليد السجلات الذكية
                  </div>
                ) : (
                  broadcastLogs.map((log, index) => (
                    <div
                      key={`broadlog-${index}`}
                      className="flex items-start gap-1"
                    >
                      <span className="text-purple-600">❯</span>
                      <span
                        className={
                          log.startsWith("❌")
                            ? "text-red-400 font-bold"
                            : log.includes("[SUCCESS")
                              ? "text-emerald-400 font-bold"
                              : "text-purple-300"
                        }
                      >
                        {log}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-1 text-left">
            <div className="text-purple-500/80 mb-2">{`> initializing_flux_neural_handshake...`}</div>
            <div className="text-purple-500/80 mb-2">{`> grid_discovery_active: true`}</div>
            <div className="text-purple-500/80 mb-4">{`> access_level: ABSOLUTE_OWNER`}</div>

            {posts.map((post) => (
              <div
                key={`debug-${post.id}`}
                className="p-2 rounded border border-white/5 hover:bg-white/5 transition-all group flex flex-col gap-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-purple-400">
                    PULSE_{post.id.toUpperCase()}
                  </span>
                  <span className="text-white/20 group-hover:text-white/40 transition-colors uppercase font-black text-[8px]">
                    Health: 100%
                  </span>
                </div>
                <div className="text-white/40 line-clamp-1 font-sans">
                  {post.content}
                </div>
                <div className="flex gap-4 mt-1 font-mono text-[9px]">
                  <span className="text-white/20">LIKES: {post.likes}</span>
                  <span className="text-white/20">COMMS: {post.comments}</span>
                  <span className="text-white/20 text-[8px] font-bold px-1 rounded bg-purple-500/10 text-purple-500/50 uppercase">
                    {post.type}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 text-purple-500 mt-4 animate-pulse">
              <span>{`> `}</span>
              <span className="w-2 h-4 bg-purple-500 inline-block" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("grid_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.email === "fluxstudio4@gmail.com" ||
          parsed.email === "vexora.network@gmail.com"
        ) {
          return {
            ...parsed,
            isOwner: true,
            role: "owner",
            isVerified: true,
            isVip: true,
            subscriptionTier: "plus_pro",
          };
        }
        return parsed;
      } catch {
        return MOCK_PROFILES["Flux Studio"] || MOCK_PROFILES["Vexora Owner"];
      }
    }
    return MOCK_PROFILES["Flux Studio"] || MOCK_PROFILES["Vexora Owner"];
  });
  const [userProfilesMap, setUserProfilesMap] = useState<
    Record<string, UserProfile>
  >(() => {
    const base = { ...MOCK_PROFILES };
    try {
      const savedCustom = localStorage.getItem("vexora_custom_accounts");
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        return { ...base, ...parsed };
      }
    } catch (e) {
      console.error("Error reading custom accounts:", e);
    }
    return base;
  });
  const [authMode, setAuthMode] = useState<"login" | "register" | "none">(
    "none",
  );
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [activeGrid, setActiveGrid] = useState<GridType>("public");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [feedSearchQuery, setFeedSearchQuery] = useState("");
  const [feedSort, setFeedSort] = useState<
    "latest" | "top" | "media" | "legendary"
  >("latest");
  const [feedLayoutMode, setFeedLayoutMode] = useState<"expanded" | "compact">(
    "expanded",
  );
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [showSidebarSearch, setShowSidebarSearch] = useState(false);
  const [algoRatio, setAlgoRatio] = useState(50); // 0-100: Educational vs Entertainment
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [creatorLabMode, setCreatorLabMode] = useState<"menu" | "image-gen">(
    "menu",
  );
  const [imageGenPrompt, setImageGenPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageQuality, setImageQuality] = useState<"low" | "mid" | "high">(
    "mid",
  );
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">(
    "1:1",
  );
  const [stylePreset, setStylePreset] = useState<string>("None");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MOCK_PUBLIC_POSTS);
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("deleted_user_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; message: string; type: "success" | "alert" }[]
  >([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<
    {
      id: string;
      message: string;
      type: "success" | "alert";
      timestamp: string;
      isRead: boolean;
    }[]
  >(() => {
    try {
      const saved = localStorage.getItem("notification_history_nodes");
      if (saved) return JSON.parse(saved);
      return [
        {
          id: "init-1",
          message:
            "تم ربط جهازك بنجاح بشبكة Vexora اللامركزية وتفعيل البروتوكول الخاص بك.",
          type: "success",
          timestamp: "١٠:٣٥ م",
          isRead: false,
        },
        {
          id: "init-2",
          message:
            "أهلاً بك في شبكة فلوكس! تم تأمين هويتك الرقمية (Core Node Identity).",
          type: "success",
          timestamp: "١٠:٣٠ م",
          isRead: false,
        },
        {
          id: "init-3",
          message:
            "نظام رصد القنوات والنبضات يسجل نشاطاً مرتفعاً ومشاركة واسعة في غرف المحادثة.",
          type: "success",
          timestamp: "٠٩:١٨ م",
          isRead: true,
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "notification_history_nodes",
      JSON.stringify(notificationHistory),
    );
  }, [notificationHistory]);

  // --- Dynamic update of Current User's Last Active Timestamp ---
  useEffect(() => {
    if (!currentUser?.id) return;

    const updateActive = () => {
      const now = Date.now();
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updated = { ...prev, lastActive: now };
        localStorage.setItem("grid_user", JSON.stringify(updated));
        return updated;
      });

      const userRef = doc(db, "users", currentUser.id);
      updateDoc(userRef, { lastActive: now }).catch((err) => {
        console.warn("Could not sync lastActive to Firestore:", err);
      });
    };

    // Run immediately
    updateActive();

    // Periodically update every 60 seconds
    const interval = setInterval(updateActive, 60000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // --- 🔒 FIREBASE AUTHENTICATION & PROFILE SYNCHRONIZATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, "users", fbUser.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userRef);
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `users/${fbUser.uid}`);
        }

        if (userDoc?.exists()) {
          const loadedUser = userDoc.data() as UserProfile;
          setCurrentUser(loadedUser);
          localStorage.setItem("grid_user", JSON.stringify(loadedUser));
        } else {
          const cleanHandle = (
            fbUser.displayName ||
            fbUser.email?.split("@")[0] ||
            "node"
          )
            .toLowerCase()
            .replace(/\s+/g, "_");
          const defaultProfile: UserProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || "Vexora Node",
            handle: cleanHandle,
            email: fbUser.email || undefined,
            avatar:
              fbUser.photoURL ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanHandle}`,
            banner:
              "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
            location: "Unified Grid Node",
            bio: "Synchronized neural node identity on the real cloud.",
            joinedDate: new Date().toLocaleDateString("ar-EG", {
              month: "long",
              year: "numeric",
            }),
            followers: 24,
            following: 12,
            isVerified: true,
          };
          try {
            await setDoc(userRef, defaultProfile);
            setCurrentUser(defaultProfile);
            localStorage.setItem("grid_user", JSON.stringify(defaultProfile));
          } catch (e) {
            handleFirestoreError(
              e,
              OperationType.CREATE,
              `users/${fbUser.uid}`,
            );
          }
        }
      } else {
        const saved = localStorage.getItem("grid_user");
        if (!saved) {
          setCurrentUser(null);
          setGmailToken(null);
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // --- 📝 REAL-TIME POSTS SYNCHRONIZATION ---
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const postsRef = collection(db, "posts");
    const unsubscribe = onSnapshot(
      postsRef,
      async (snapshot) => {
        if (snapshot.empty) {
          console.log("Database empty. Seeding initial posts to cloud...");
          for (const p of MOCK_PUBLIC_POSTS) {
            try {
              await setDoc(doc(db, "posts", p.id), p);
            } catch (e) {
              console.error("Seeding post failed:", e);
            }
          }
          return;
        }
        const loadedPosts: Post[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Post;
          // Clean types for reactions etc
          loadedPosts.push({
            ...data,
            id: doc.id,
          });
        });
        // SortDescending by timestamp or fallback to alphabetical ID
        loadedPosts.sort((a, b) => b.id.localeCompare(a.id));
        setPosts(loadedPosts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "posts");
      },
    );

    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  // --- 🎬 REAL-TIME STORIES SYNCHRONIZATION ---
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const storiesRef = collection(db, "stories");
    const unsubscribe = onSnapshot(
      storiesRef,
      async (snapshot) => {
        if (snapshot.empty) {
          console.log("Database empty. Seeding initial stories to cloud...");
          for (const s of MOCK_STORIES) {
            try {
              await setDoc(doc(db, "stories", s.id), s);
            } catch (e) {
              console.error("Seeding story failed:", e);
            }
          }
          return;
        }
        const loadedStories: Story[] = [];
        snapshot.forEach((doc) => {
          loadedStories.push({
            ...(doc.data() as Story),
            id: doc.id,
          });
        });
        setStories(loadedStories);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "stories");
      },
    );

    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  // --- 🌐 REAL-TIME COMMUNITIES SYNCHRONIZATION ---
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const commsRef = collection(db, "communities");
    const unsubscribe = onSnapshot(
      commsRef,
      async (snapshot) => {
        if (snapshot.empty) {
          console.log(
            "Database empty. Seeding initial communities to cloud...",
          );
          for (const c of MOCK_COMMUNITIES) {
            try {
              const seedComm = sanitizeForFirestore({
                ...c,
                ownerId: c.ownerId || currentUser.id || "u-vexora-admin",
              });
              await setDoc(doc(db, "communities", c.id), seedComm);
            } catch (e) {
              console.error("Seeding community failed:", e);
            }
          }
          return;
        }
        const loadedComms: Community[] = [];
        snapshot.forEach((doc) => {
          loadedComms.push({
            ...(doc.data() as Community),
            id: doc.id,
          });
        });
        setCommunities(loadedComms);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "communities");
      },
    );

    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  const fetchTrendingTopics = async () => {
    if (posts.length < 3) return;
    setIsTrendingLoading(true);
    try {
      const response = await fetch("/api/ai/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: posts.slice(0, 20) }),
      });
      if (response.ok) {
        const data = await response.json();
        setTrendingTopics(data);
      }
    } catch (error) {
      console.error("Trending Error:", error);
    } finally {
      setIsTrendingLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, [posts.length]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileTab, setEditProfileTab] = useState<"profile">("profile");
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isDataVaultOpen, setIsDataVaultOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  const openEditProfile = (
    tab: "profile" = "profile",
  ) => {
    setEditProfileTab(tab);
    setIsEditProfileOpen(true);
  };

  const persistUserAcrossAllStorage = async (
    newUser: UserProfile,
    successMsg?: string,
  ) => {
    // 1. Current user in React state
    setCurrentUser(newUser);

    // 2. Local storage current user
    try {
      localStorage.setItem("grid_user", JSON.stringify(newUser));
    } catch (e) {
      console.warn("Storage sync error for grid_user:", e);
    }

    // 3. Registered users list (for persistent re-login with full profile & credentials)
    try {
      const regSaved = localStorage.getItem("registered_users");
      const list: UserProfile[] = regSaved ? JSON.parse(regSaved) : [];
      const idx = list.findIndex(
        (u) =>
          u &&
          (u.id === newUser.id ||
            (newUser.email &&
              u.email &&
              u.email.toLowerCase() === newUser.email.toLowerCase()) ||
            (newUser.handle &&
              u.handle &&
              u.handle.toLowerCase().replace(/^@/, "") ===
                newUser.handle.toLowerCase().replace(/^@/, ""))),
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...newUser };
      } else {
        list.push(newUser);
      }
      localStorage.setItem("registered_users", JSON.stringify(list));
    } catch (e) {
      console.warn("Storage sync error for registered_users:", e);
    }

    // 4. Custom accounts registry
    try {
      const savedCustom = localStorage.getItem("vexora_custom_accounts");
      const customMap = savedCustom ? JSON.parse(savedCustom) : {};
      customMap[newUser.id] = newUser;
      if (newUser.name) customMap[newUser.name] = newUser;
      if (newUser.handle) customMap[newUser.handle] = newUser;
      localStorage.setItem("vexora_custom_accounts", JSON.stringify(customMap));
    } catch (e) {
      console.warn("Storage sync error for custom_accounts:", e);
    }

    // 5. Update userProfilesMap
    setUserProfilesMap((prev) => ({
      ...prev,
      [newUser.id]: newUser,
      ...(newUser.name ? { [newUser.name]: newUser } : {}),
      ...(newUser.handle ? { [newUser.handle]: newUser } : {}),
    }));

    // 6. Sync author name and avatar in all posts
    setPosts((prevPosts) => {
      const updated = prevPosts.map((p) => {
        if (
          p.author === newUser.name ||
          (currentUser && p.author === currentUser.name)
        ) {
          return {
            ...p,
            author: newUser.name,
            avatar: newUser.avatar,
          };
        }
        return p;
      });
      try {
        localStorage.setItem("grid_posts", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage sync error for grid_posts:", e);
      }
      return updated;
    });

    // 7. Cloud Firestore sync
    try {
      await setDoc(
        doc(db, "users", newUser.id),
        sanitizeForFirestore(newUser),
      );
    } catch (e) {
      console.warn("Firestore user sync warning:", e);
    }

    if (successMsg) {
      addNotification(successMsg, "success");
    }
  };

  const handleUpdateBio = async (newBio: string) => {
    if (!currentUser) {
      addNotification(
        language === "ar"
          ? "يرجى تسجيل الدخول لحفظ النبذة."
          : "Please sign in to save your bio.",
        "alert",
      );
      return;
    }
    const newUser = { ...currentUser, bio: newBio };
    await persistUserAcrossAllStorage(
      newUser,
      language === "ar"
        ? "تم تحديث النبذة وحفظ كافة بيانات الحساب بنجاح."
        : "Bio and account profile saved permanently.",
    );
  };

  const handleUpdateAvatar = async (newAvatar: string) => {
    if (!currentUser) {
      addNotification(
        language === "ar"
          ? "يرجى تسجيل الدخول لتحديث الصورة الشخصية."
          : "Please sign in to update your avatar.",
        "alert",
      );
      return;
    }
    const newUser = { ...currentUser, avatar: newAvatar };
    await persistUserAcrossAllStorage(
      newUser,
      language === "ar"
        ? "تم تحديث الصورة الشخصية وحفظ كافة البيانات بنجاح!"
        : "Avatar updated and saved permanently!",
    );
  };

  const handleUpdateBanner = async (newBanner: string) => {
    if (!currentUser) {
      addNotification(
        language === "ar"
          ? "يرجى تسجيل الدخول لتحديث صورة الغلاف."
          : "Please sign in to update cover banner.",
        "alert",
      );
      return;
    }
    const newUser = { ...currentUser, banner: newBanner };
    await persistUserAcrossAllStorage(
      newUser,
      language === "ar"
        ? "تم تحديث صورة الغلاف وحفظ كافة البيانات بنجاح!"
        : "Cover banner updated and saved permanently!",
    );
  };

  const handleUpdateProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) {
      addNotification(
        language === "ar"
          ? "يرجى تسجيل الدخول لتحديث البيانات."
          : "Please sign in to update profile.",
        "alert",
      );
      return;
    }
    const newUser = { ...currentUser, ...updatedFields };
    await persistUserAcrossAllStorage(
      newUser,
      language === "ar"
        ? "تم حفظ كافة التغييرات والبيانات بنجاح ودائمًا!"
        : "All changes and profile data saved permanently!",
    );
  };

  const handleRestoreData = async (
    restoredData: FullBackupPayload,
    mode: "merge" | "replace",
  ) => {
    if (mode === "replace") {
      if (restoredData.user) {
        setCurrentUser(restoredData.user);
        localStorage.setItem("grid_user", JSON.stringify(restoredData.user));
        try {
          await setDoc(
            doc(db, "users", restoredData.user.id),
            restoredData.user,
          );
        } catch (e) {
          console.warn("User restore sync warn:", e);
        }
      }
      if (restoredData.posts) {
        setPosts(restoredData.posts);
        localStorage.setItem("grid_posts", JSON.stringify(restoredData.posts));
      }
    } else {
      // Smart Merge
      if (restoredData.user) {
        const mergedUser: UserProfile = {
          ...(currentUser || restoredData.user),
          ...restoredData.user,
          savedPostIds: Array.from(
            new Set([
              ...(currentUser?.savedPostIds || []),
              ...(restoredData.savedPostIds || []),
            ]),
          ),
        };
        setCurrentUser(mergedUser);
        localStorage.setItem("grid_user", JSON.stringify(mergedUser));
        try {
          await setDoc(doc(db, "users", mergedUser.id), mergedUser);
        } catch (e) {
          console.warn("User merge sync warn:", e);
        }
      }
      if (restoredData.posts && restoredData.posts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = restoredData.posts!.filter(
            (p) => !existingIds.has(p.id),
          );
          const combined = [...prev, ...newPosts];
          localStorage.setItem("grid_posts", JSON.stringify(combined));
          return combined;
        });
      }
    }
  };

  const handleForceCloudSync = async () => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "users", currentUser.id), currentUser);
      for (const p of posts.slice(0, 15)) {
        await setDoc(doc(db, "posts", p.id), p);
      }
    } catch (e) {
      console.warn("Force cloud sync error:", e);
    }
  };

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem("grid_stories");
      const parsedStories = saved ? JSON.parse(saved) : [];

      const savedDeleted = localStorage.getItem("deleted_user_ids");
      const deletedIds = savedDeleted ? JSON.parse(savedDeleted) : [];

      const filteredMock = MOCK_STORIES.filter(
        (s) => !deletedIds.includes(s.id),
      );

      const merged = [...parsedStories];
      for (const ms of filteredMock) {
        if (!merged.some((s) => s.id === ms.id)) {
          merged.push(ms);
        }
      }
      return merged.filter((s) => !deletedIds.includes(s.id));
    } catch {
      return MOCK_STORIES;
    }
  });

  const saveStories = (newStories: Story[]) => {
    setStories(newStories);
    localStorage.setItem("grid_stories", JSON.stringify(newStories));
  };

  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(() => {
    return localStorage.getItem("vexora_diagnostics") === "true";
  });

  const handleToggleDiagnostics = (val: boolean) => {
    setShowDiagnostics(val);
    localStorage.setItem("vexora_diagnostics", val.toString());
  };

  const [showConsole, setShowConsole] = useState(false);
  // Vexora AI "Soon" Notification State (displays for 5 seconds upon click)
  const [showVexoraAiSoon, setShowVexoraAiSoon] = useState(false);
  const vexoraAiSoonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVexoraAiClick = () => {
    if (vexoraAiSoonTimeoutRef.current) {
      clearTimeout(vexoraAiSoonTimeoutRef.current);
    }
    setShowVexoraAiSoon(true);
    vexoraAiSoonTimeoutRef.current = setTimeout(() => {
      setShowVexoraAiSoon(false);
    }, 5000);
  };

  const [currentView, setCurrentView] = useState<
    | "feed"
    | "friends"
    | "saved"
    | "communities"
    | "messages"
    | "terminal"
    | "gmail"
    | "labs"
    | "chat"
    | "meet"
    | "my-account"
    | "gaming-hub"
    | "games-arena"
    | "tournaments"
    | "activity"
  >("feed");
  const [isGamingAccountsOpen, setIsGamingAccountsOpen] = useState(false);
  const [initialChatUserId, setInitialChatUserId] = useState<string | null>(
    null,
  );
  const [activeCall, setActiveCall] = useState<{
    type: "voice" | "video";
    status: "calling" | "incoming" | "connected";
    targetId: string;
    callId?: string;
  } | null>(null);
  const [incomingCallData, setIncomingCallData] =
    useState<IncomingCallData | null>(null);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Cross-tab & multi-peer Call Signaling listener
  useEffect(() => {
    const unsubscribe = callSignaling.subscribe(
      (payload: CallSignalPayload) => {
        if (payload.type === "OFFER") {
          // If the call is not initiated by the current tab's active session
          if (!currentUser || payload.fromUser.id !== currentUser.id) {
            setIncomingCallData({
              callId: payload.callId,
              caller: payload.fromUser,
              type: payload.callType,
              timestamp: payload.timestamp,
            });
          }
        } else if (payload.type === "ANSWER") {
          // If we are currently calling, switch to connected
          setActiveCall((prev) =>
            prev && prev.status === "calling"
              ? { ...prev, status: "connected" }
              : prev,
          );
        } else if (payload.type === "HANGUP" || payload.type === "REJECT") {
          setIncomingCallData(null);
          setActiveCall(null);
          setIsCallMinimized(false);
        }
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleOpenDirectChat = (targetUserId: string) => {
    setInitialChatUserId(targetUserId);
    setSelectedProfileId(null);
    setCurrentView("messages");
  };

  const handleInitiateCall = (
    targetUserId: string,
    type: "voice" | "video",
  ) => {
    const target = Object.values(MOCK_PROFILES).find(
      (p) => p.id === targetUserId || p.name === targetUserId,
    ) || {
      id: targetUserId,
      name: targetUserId,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      banner:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop",
      bio: "Vexora Network Node",
      following: 0,
      followers: 0,
      postsCount: 0,
      isVerified: true,
    };

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setActiveCall({
      type,
      status: "calling",
      targetId: target.id,
      callId,
    });
    setIsCallMinimized(false);

    if (currentUser) {
      callSignaling.sendSignal({
        type: "OFFER",
        callId,
        fromUser: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          isVerified: currentUser.isVerified,
        },
        toUserId: target.id,
        callType: type,
        timestamp: Date.now(),
      });
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeCall && activeCall.status === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall?.status]);
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [visitedCommunityId, setVisitedCommunityId] = useState<string | null>(
    null,
  );
  const [language, setLanguage] = useState<"en" | "ar">(() => {
    const saved = localStorage.getItem("vexora_language");
    return saved === "ar" || saved === "en" ? saved : "en";
  });

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ar" : "en";
    setLanguage(nextLang);
    localStorage.setItem("vexora_language", nextLang);
  };

  useEffect(() => {
    if (currentView !== "communities") {
      setVisitedCommunityId(null);
    }
  }, [currentView]);
  const [communities, setCommunities] = useState<Community[]>(() => {
    const savedComms = localStorage.getItem("grid_communities");
    let baseComms: Community[];
    if (savedComms) {
      try {
        const parsed = JSON.parse(savedComms);
        // Ensure c-vexora is present in the parsed list
        if (!parsed.some((c: any) => c.id === "c-vexora")) {
          parsed.unshift(MOCK_COMMUNITIES[0]);
        }
        baseComms = parsed;
      } catch (e) {
        console.error("Failed to parse saved communities", e);
        baseComms = MOCK_COMMUNITIES;
      }
    } else {
      const savedUser = localStorage.getItem("grid_user");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (user) {
        baseComms = MOCK_COMMUNITIES.map((c) => {
          if (c.id === "c4" || c.id === "c6") {
            return { ...c, ownerId: user.id };
          }
          return c;
        });
      } else {
        baseComms = MOCK_COMMUNITIES;
      }
    }
    return baseComms;
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("grid_joined_communities");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.includes("c-vexora")) {
          parsed.push("c-vexora");
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved joined communities", e);
      }
    }
    return ["c-vexora", "c1", "c3"];
  });
  const [savedSearchQuery, setSavedSearchQuery] = useState("");
  const [savedFilterCategory, setSavedFilterCategory] = useState<
    "all" | "media" | "text" | "legendary"
  >("all");
  const [expandedCommunityIds, setExpandedCommunityIds] = useState<string[]>(
    [],
  );

  const handleExportSavedArchives = () => {
    const savedPosts = posts.filter((p) =>
      currentUser?.savedPostIds?.includes(p.id),
    );
    if (savedPosts.length === 0) {
      addNotification(
        language === "ar"
          ? "المستودع فارغ، لا توجد منشورات لتصديرها."
          : "Archive is empty, no posts to export.",
        "alert",
      );
      return;
    }
    const exportData = {
      vaultVersion: "2.5.0-VEXORA-SECURE",
      exportDate: new Date().toISOString(),
      user: {
        id: currentUser?.id,
        name: currentUser?.name,
        handle: currentUser?.handle,
        email: currentUser?.email,
      },
      totalSecuredPackets: savedPosts.length,
      packets: savedPosts.map((p) => ({
        id: p.id,
        author: p.author,
        content: p.content,
        timestamp: p.timestamp,
        type: p.type,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares,
        image: p.image || null,
        gif: p.gif || null,
        isLegendary: p.isLegendary || false,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vexora_vault_export_${currentUser?.handle || "node"}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification(
      language === "ar"
        ? "تم تصدير نسخة المستودع المشفرة بنجاح (JSON Backup) 📁"
        : "Secure archive exported successfully as JSON backup 📁",
      "success",
    );
  };

  const handleClearAllSaved = async () => {
    if (
      !currentUser ||
      !currentUser.savedPostIds ||
      currentUser.savedPostIds.length === 0
    ) {
      addNotification(
        language === "ar"
          ? "المستودع فارغ بالفعل."
          : "Archive is already empty.",
        "alert",
      );
      return;
    }
    const confirmed = window.confirm(
      language === "ar"
        ? "هل أنت متأكد من رغبتك في إفراغ جميع النبضات المحفوظة من المستودع الآمن؟"
        : "Are you sure you want to purge all secured packets from your archives?",
    );
    if (!confirmed) return;

    const updatedUser: UserProfile = { ...currentUser, savedPostIds: [] };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem("grid_user", JSON.stringify(updatedUser));
      localStorage.setItem(
        `vexora_saved_posts_${currentUser.id}`,
        JSON.stringify([]),
      );
      const regSaved = localStorage.getItem("registered_users");
      if (regSaved) {
        const parsed = JSON.parse(regSaved);
        const updated = parsed.map((u: any) =>
          u.id === updatedUser.id ? { ...u, savedPostIds: [] } : u,
        );
        localStorage.setItem("registered_users", JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Storage sync error during clear:", e);
    }

    try {
      await setDoc(
        doc(db, "users", updatedUser.id),
        sanitizeForFirestore(updatedUser),
      );
    } catch (e) {
      console.warn("Firestore sync warning during clear:", e);
    }

    addNotification(
      language === "ar"
        ? "تم تفريغ المستودع الآمن بنجاح 🗑️"
        : "All secured packets removed from archives 🗑️",
      "alert",
    );
  };
  const [copiedCommunityId, setCopiedCommunityId] = useState<string | null>(
    null,
  );
  const [reportingCommunity, setReportingCommunity] =
    useState<Community | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const [isCommunitySortOpen, setIsCommunitySortOpen] = useState(false);
  const [communityCategory, setCommunityCategory] = useState(() => {
    return localStorage.getItem("grid_community_category") || "All";
  });
  const [communitySort, setCommunitySort] = useState<
    "members" | "recency" | "alphabetical"
  >(() => {
    return (
      (localStorage.getItem("grid_community_sort") as
        "members" | "recency" | "alphabetical") || "members"
    );
  });
  const [communitySortOrder, setCommunitySortOrder] = useState<"asc" | "desc">(
    () => {
      return (
        (localStorage.getItem("grid_community_sort_order") as "asc" | "desc") ||
        "desc"
      );
    },
  );

  useEffect(() => {
    localStorage.setItem("grid_community_category", communityCategory);
  }, [communityCategory]);

  useEffect(() => {
    localStorage.setItem("grid_community_sort", communitySort);
  }, [communitySort]);

  useEffect(() => {
    localStorage.setItem("grid_community_sort_order", communitySortOrder);
  }, [communitySortOrder]);

  useEffect(() => {
    localStorage.setItem("grid_communities", JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem(
      "grid_joined_communities",
      JSON.stringify(joinedCommunityIds),
    );
  }, [joinedCommunityIds]);

  const handleToggleJoinCommunity = (communityId: string, e: MouseEvent) => {
    e.stopPropagation();
    const isJoined = joinedCommunityIds.includes(communityId);
    const comm = communities.find((c) => c.id === communityId);
    const commName = comm ? comm.name : "Cluster";
    if (isJoined) {
      setJoinedCommunityIds((prev) => prev.filter((id) => id !== communityId));
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? { ...c, members: Math.max(0, c.members - 1) }
            : c,
        ),
      );
      addNotification(`Disengaged from cluster "${commName}".`, "alert");
    } else {
      setJoinedCommunityIds((prev) => [...prev, communityId]);
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId ? { ...c, members: c.members + 1 } : c,
        ),
      );
      addNotification(`Successfully joined cluster "${commName}".`, "success");
    }
  };

  const handleShareCommunity = (communityId: string, e: MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/community/${communityId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopiedCommunityId(communityId);
        setTimeout(() => {
          setCopiedCommunityId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy community link: ", err);
      });
  };

  const filteredAndSortedCommunities = useMemo(() => {
    let result = [...communities];

    // 1. Filter by search query
    if (communitySearch.trim()) {
      const q = communitySearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    // 2. Filter by category
    if (communityCategory !== "All") {
      result = result.filter((c) => c.category === communityCategory);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (communitySort === "members") {
        const diff =
          communitySortOrder === "desc"
            ? b.members - a.members
            : a.members - b.members;
        return diff || a.name.localeCompare(b.name);
      } else if (communitySort === "recency") {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        const diff =
          communitySortOrder === "desc" ? timeB - timeA : timeA - timeB;
        return diff || a.name.localeCompare(b.name);
      } else if (communitySort === "alphabetical") {
        return communitySortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [
    communities,
    communitySearch,
    communityCategory,
    communitySort,
    communitySortOrder,
  ]);

  const selectedProfile = useMemo(() => {
    if (!selectedProfileId) return currentUser;
    if (
      currentUser &&
      (selectedProfileId === currentUser.name ||
        selectedProfileId === currentUser.id)
    ) {
      return currentUser;
    }
    return MOCK_PROFILES[selectedProfileId] || currentUser;
  }, [selectedProfileId, currentUser]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    {
      id: "fr1",
      from: {
        id: "u101",
        name: "يوسف أحمد",
        handle: "youssef_ahmed",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        bio: "محامي مهتم بالتكنولوجيا",
        banner: "",
        location: "Cairo",
        joinedDate: "2023",
        followers: 120,
        following: 80,
      },
      timestamp: "منذ ساعتين",
      status: "pending",
    },
    {
      id: "fr2",
      from: {
        id: "u102",
        name: "سارة محمد",
        handle: "sara_m",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        bio: "مصممة جرافيك",
        banner: "",
        location: "Alexandria",
        joinedDate: "2022",
        followers: 450,
        following: 300,
      },
      timestamp: "منذ يوم",
      status: "pending",
    },
  ]);

  const isOwner =
    currentUser?.email === "vexora.network@gmail.com" ||
    currentUser?.email === "fluxstudio4@gmail.com" ||
    currentUser?.isOwner === true ||
    currentUser?.role === "owner" ||
    currentUser?.handle === "vexora_owner" ||
    currentUser?.handle === "flux_developer" ||
    (currentUser?.name
      ? currentUser.name.includes("Owner") ||
        currentUser.name.includes("المالك") ||
        currentUser.name.includes("Flux")
      : false);

  useEffect(() => {
    if (isDevMode) {
      addNotification(
        "تم تفعيل وضع البرمجة المطلق - مرحباً أيها المالك",
        "success",
      );
      // Add a glitch effect sound or visual here if needed
    }
  }, [isDevMode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const addNotification = (
    message: string,
    type: "success" | "alert" = "success",
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Push into persistent history
    const isArabic = /[\u0600-\u06FF]/.test(message);
    const timeString = new Date().toLocaleTimeString(
      isArabic ? "ar-EG" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );
    setNotificationHistory((prev) => [
      {
        id,
        message,
        type,
        timestamp: timeString,
        isRead: false,
      },
      ...prev,
    ]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAcceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find((r) => r.id === requestId);
    if (!request || !currentUser) return;

    const updatedUser = {
      ...currentUser,
      friendIds: [...(currentUser.friendIds || []), request.from.id],
    };
    setCurrentUser(updatedUser);
    localStorage.setItem("grid_user", JSON.stringify(updatedUser));

    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    addNotification(
      `Neural link established with ${request.from.name}`,
      "success",
    );
  };

  const handleDeclineFriendRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    addNotification("Connection request declined.", "alert");
  };

  const handleSendFriendRequest = (targetProfile: UserProfile) => {
    if (!currentUser) {
      addNotification("Please login to synchronize nodes.", "alert");
      setAuthMode("login");
      return;
    }

    if (currentUser.friendIds?.includes(targetProfile.id)) {
      addNotification("Node already synchronized.", "alert");
      return;
    }

    addNotification(
      `Synchronization request sent to ${targetProfile.name}`,
      "success",
    );
  };

  const handleToggleFollow = (targetProfile: UserProfile) => {
    if (!currentUser) {
      addNotification(
        "الرجاء تسجيل الدخول لمتابعة الرفاق / Please login to follow peers.",
        "alert",
      );
      setAuthMode("login");
      return;
    }

    if (currentUser.id === targetProfile.id) {
      addNotification(
        "لا يمكنك متابعة حسابك الشخصي / You cannot follow yourself.",
        "alert",
      );
      return;
    }

    const followingIds = currentUser.followingIds || [];
    const isFollowing = followingIds.includes(targetProfile.id);

    let updatedFollowingIds: string[];
    let text: string;
    let newFollowingCount = currentUser.following;

    if (isFollowing) {
      updatedFollowingIds = followingIds.filter(
        (id) => id !== targetProfile.id,
      );
      text = `تم إلغاء متابعة ${targetProfile.name} / Severed Link with ${targetProfile.name} 🔗`;
      newFollowingCount = Math.max(0, newFollowingCount - 1);

      // Update target profile followers count in reference registries reactively
      if (MOCK_PROFILES[targetProfile.name]) {
        MOCK_PROFILES[targetProfile.name].followers = Math.max(
          0,
          MOCK_PROFILES[targetProfile.name].followers - 1,
        );
      } else {
        const key = Object.keys(MOCK_PROFILES).find(
          (k) => MOCK_PROFILES[k].id === targetProfile.id,
        );
        if (key && MOCK_PROFILES[key]) {
          MOCK_PROFILES[key].followers = Math.max(
            0,
            MOCK_PROFILES[key].followers - 1,
          );
        }
      }
    } else {
      updatedFollowingIds = [...followingIds, targetProfile.id];
      text = `أنت الآن تتابع ${targetProfile.name} / Established Fellow Link with ${targetProfile.name} 👑`;
      newFollowingCount += 1;

      // Update target profile followers count in reference registries reactively
      if (MOCK_PROFILES[targetProfile.name]) {
        MOCK_PROFILES[targetProfile.name].followers += 1;
      } else {
        const key = Object.keys(MOCK_PROFILES).find(
          (k) => MOCK_PROFILES[k].id === targetProfile.id,
        );
        if (key && MOCK_PROFILES[key]) {
          MOCK_PROFILES[key].followers += 1;
        }
      }
    }

    const updatedUser = {
      ...currentUser,
      followingIds: updatedFollowingIds,
      following: newFollowingCount,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem("grid_user", JSON.stringify(updatedUser));
    addNotification(text, "success");
  };

  const handleDeleteAccount = (userProfileId: string) => {
    if (
      window.confirm(
        "حذف للأبد؟ هل أنت متأكد من حذف هذا الحساب نهائياً وكل نبضاته؟\nAre you sure you want to delete this user account and all their pulses forever?",
      )
    ) {
      const updated = [...deletedUserIds, userProfileId];
      setDeletedUserIds(updated);
      localStorage.setItem("deleted_user_ids", JSON.stringify(updated));

      const userProfile = Object.values(MOCK_PROFILES).find(
        (p) => p.id === userProfileId,
      );
      if (userProfile) {
        setPosts((prev) => prev.filter((p) => p.author !== userProfile.name));
      }
      setSelectedProfileId(null);
      addNotification(
        "تم حذف الحساب نهائيا وطرد المستخدم / Account node purged from Vexora Forever.",
        "success",
      );
    }
  };

  const handleInteraction = async (
    postId: string,
    type:
      | "like"
      | "repost"
      | "comment"
      | "share"
      | "delete"
      | "report"
      | "unlist"
      | "save"
      | "react"
      | "edit",
    reactionType?: ReactionType,
  ) => {
    if (type === "edit") {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setEditingPost(post);
        setIsEditPostOpen(true);
      }
      return;
    }
    if (type === "delete") {
      try {
        await deleteDoc(doc(db, "posts", postId));
        addNotification("النبضة حذفت من شبكة فلوكس.", "alert");
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `posts/${postId}`);
      }
      return;
    }
    if (type === "unlist") {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        const isUnlisted = !post.isUnlisted;
        try {
          await updateDoc(doc(db, "posts", postId), { isUnlisted });
          addNotification(
            isUnlisted ? "النبضة تم تعتيمها." : "النبضة الآن مرئية.",
          );
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
        }
      }
      return;
    }
    if (type === "save") {
      if (!currentUser) {
        setAuthMode("login");
        return;
      }
      const isSaved = currentUser.savedPostIds?.includes(postId);
      const newSavedIds = isSaved
        ? (currentUser.savedPostIds || []).filter((id) => id !== postId)
        : [...(currentUser.savedPostIds || []), postId];

      const updatedUser: UserProfile = {
        ...currentUser,
        savedPostIds: newSavedIds,
      };

      // 1. Instant optimistic state update
      setCurrentUser(updatedUser);

      // 2. Multi-tier resilient local vault storage
      try {
        localStorage.setItem("grid_user", JSON.stringify(updatedUser));
        localStorage.setItem(
          `vexora_saved_posts_${currentUser.id}`,
          JSON.stringify(newSavedIds),
        );
        const regSaved = localStorage.getItem("registered_users");
        if (regSaved) {
          const parsed = JSON.parse(regSaved);
          const updated = parsed.map((u: any) =>
            u.id === updatedUser.id ? { ...u, savedPostIds: newSavedIds } : u,
          );
          localStorage.setItem("registered_users", JSON.stringify(updated));
        }
      } catch (err) {
        console.warn("Local storage cache warning:", err);
      }

      // 3. Bilingual user confirmation
      addNotification(
        isSaved
          ? language === "ar"
            ? "تمت إزالة النبضة من المستودع الآمن 🔓"
            : "Pulse removed from secure archives 🔓"
          : language === "ar"
            ? "تم تأمين وحفظ النبضة في المستودع المشفر 🔒"
            : "Pulse secured in encrypted archives 🔒",
        "success",
      );

      // 4. Cloud Firestore background sync
      try {
        await setDoc(
          doc(db, "users", updatedUser.id),
          sanitizeForFirestore(updatedUser),
        );
      } catch (e) {
        console.warn("Firestore sync error for user savedPostIds:", e);
      }
      return;
    }
    if (type === "report") {
      addNotification("Pulse reported to Grid Guardians.");
      console.log(`Post ${postId} reported`);
      return;
    }
    if (type === "react" && reactionType) {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        const reactions = {
          ...(post.reactions || {
            like: 0,
            love: 0,
            haha: 0,
            wow: 0,
            sad: 0,
            angry: 0,
          }),
        };
        const oldReaction = post.userReaction;
        let likesCount = post.likes;
        let newUserReaction: ReactionType | undefined = reactionType;
        let isLiked = true;

        if (oldReaction === reactionType) {
          reactions[reactionType] = Math.max(0, reactions[reactionType] - 1);
          likesCount = Math.max(0, post.likes - 1);
          newUserReaction = undefined;
          isLiked = false;
        } else {
          if (oldReaction) {
            reactions[oldReaction] = Math.max(
              0,
              (reactions[oldReaction] || 0) - 1,
            );
          }
          reactions[reactionType] = (reactions[reactionType] || 0) + 1;
          likesCount = oldReaction ? post.likes : post.likes + 1;
        }

        try {
          await updateDoc(doc(db, "posts", postId), {
            reactions,
            likes: likesCount,
            userReaction: newUserReaction || null,
            isLiked,
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
        }
      }
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (post) {
      if (type === "like") {
        const isLiked = !post.isLiked;
        const reactions = {
          ...(post.reactions || {
            like: 0,
            love: 0,
            haha: 0,
            wow: 0,
            sad: 0,
            angry: 0,
          }),
        };
        let payload: any;
        if (isLiked) {
          reactions.like = (reactions.like || 0) + 1;
          payload = {
            isLiked,
            likes: post.likes + 1,
            userReaction: "like",
            reactions,
          };
        } else {
          if (post.userReaction) {
            reactions[post.userReaction] = Math.max(
              0,
              (reactions[post.userReaction] || 0) - 1,
            );
          } else {
            reactions.like = Math.max(0, (reactions.like || 0) - 1);
          }
          payload = {
            isLiked,
            likes: Math.max(0, post.likes - 1),
            userReaction: null,
            reactions,
          };
        }
        try {
          await updateDoc(doc(db, "posts", postId), payload);
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
        }
      }
      if (type === "repost") {
        const isReposted = !post.isReposted;
        try {
          await updateDoc(doc(db, "posts", postId), {
            isReposted,
            reposts: isReposted
              ? (post.reposts || 0) + 1
              : Math.max(0, (post.reposts || 0) - 1),
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
        }
      }
      if (type === "share") {
        try {
          await updateDoc(doc(db, "posts", postId), {
            shares: (post.shares || 0) + 1,
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
        }
      }
    }
  };

  const handleAddComment = async (
    postId: string,
    text: string,
    gif?: string,
  ) => {
    if (currentUser?.isBanned) {
      addNotification(
        language === "ar"
          ? "⛔ حسابك محظور ومقيد من التفاعل أو إضافة التعليقات بقرار من إدارة المالك."
          : "⛔ Your account has been banned/restricted from commenting by the platform owner.",
        "alert",
      );
      return;
    }
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const newComment: Comment = {
      id: "c-" + Math.random().toString(36).substr(2, 9),
      author: currentUser?.name || "Self_Node",
      avatar:
        currentUser?.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      text,
      timestamp: "Just now",
      likes: 0,
      reposts: 0,
      isLiked: false,
      isReposted: false,
      gif: gif || null,
    };

    const freshReplies = [newComment, ...(post.replies || [])];

    try {
      await updateDoc(doc(db, "posts", postId), {
        replies: freshReplies,
        comments: post.comments + 1,
      });
      addNotification("Pulse echoed to the thread.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const handleCreatePost = async (
    content: string,
    image?: string,
    gif?: string,
    isAnonymous?: boolean,
  ) => {
    if (currentUser?.isBanned) {
      addNotification(
        language === "ar"
          ? "⛔ تم تقييد وحظر هذا الحساب من نشر النبضات بقرار من مالك المنصة."
          : "⛔ Your account has been banned/restricted from broadcasting pulses by the owner.",
        "alert",
      );
      return;
    }
    const authorName = isAnonymous
      ? language === "ar"
        ? `عقدة شبحية #${Math.floor(Math.random() * 800 + 101)}`
        : `Ghost Node #${Math.floor(Math.random() * 800 + 101)}`
      : currentUser?.name || "Alex Rivera";
    const authorAvatar = isAnonymous
      ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop"
      : currentUser?.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

    const newPost: Post = {
      id: "p-" + Math.random().toString(36).substr(2, 9),
      author: authorName,
      avatar: authorAvatar,
      content,
      image: image || null,
      gif: gif || null,
      timestamp: "Just now",
      type: "public",
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      isLiked: false,
      isReposted: false,
      replies: [],
    };

    try {
      await setDoc(doc(db, "posts", newPost.id), newPost);
      addNotification(
        language === "ar"
          ? "تمت مزامنة نبضة مجهولة جديدة مع شبكة فيكسورا."
          : "New anonymous pulse synchronized with Vexora Network.",
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `posts/${newPost.id}`);
    }
  };

  const handlePublishStory = async (newStory: Story) => {
    if (currentUser?.isBanned) {
      addNotification(
        language === "ar"
          ? "⛔ حسابك محظور من نشر القصص."
          : "⛔ Your account is restricted from publishing stories.",
        "alert",
      );
      return;
    }
    try {
      await setDoc(doc(db, "stories", newStory.id), newStory);
      addNotification(
        "تم نشر القصة بنجاح! / Story published successfully!",
        "success",
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `stories/${newStory.id}`);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteDoc(doc(db, "stories", storyId));
      addNotification(
        "تم حذف القصة بنجاح! / Story deleted successfully.",
        "success",
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `stories/${storyId}`);
    }
  };

  const handleAddStoryReply = async (storyId: string, replyText: string) => {
    if (currentUser?.isBanned) {
      addNotification(
        language === "ar"
          ? "⛔ حسابك مقيد من الرد على القصص."
          : "⛔ Your account is restricted from replying to stories.",
        "alert",
      );
      return;
    }
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    const freshReplies = story.replies ? [...story.replies] : [];
    freshReplies.unshift({
      id: "reply-" + Math.random().toString(36).substr(2, 6),
      sender: currentUser?.name || "Anonymous Node",
      text: replyText,
      timestamp: "الآن",
    });
    try {
      await updateDoc(doc(db, "stories", storyId), { replies: freshReplies });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `stories/${storyId}`);
    }
  };

  const handleCreateCommunityPost = async (
    content: string,
    image?: string,
    video?: string,
    communityId?: string,
  ) => {
    if (currentUser?.isBanned) {
      addNotification(
        language === "ar"
          ? "⛔ حسابك محظور من النشر في المجموعات."
          : "⛔ Your account is restricted from community posts.",
        "alert",
      );
      return;
    }
    const newPost: Post = {
      id: "p-" + Math.random().toString(36).substr(2, 9),
      author: currentUser?.name || "Alex Rivera",
      avatar:
        currentUser?.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      content,
      image: image || null,
      video: video || null,
      timestamp: "Just now",
      type: "community",
      communityId: communityId || null,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      isLiked: false,
      isReposted: false,
      replies: [],
    };

    try {
      await setDoc(doc(db, "posts", newPost.id), newPost);
      addNotification("تم إرسال المنشور للمجموعة بنجاح.", "success");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `posts/${newPost.id}`);
    }
  };

  const handleUpdateCommunity = (
    communityId: string,
    updatedFields: Partial<Community>,
  ) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === communityId ? { ...c, ...updatedFields } : c)),
    );
    addNotification("تم تحديث بيانات المجموعة بنجاح.", "success");
  };

  const handleClearAllComments = (communityId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.type === "community" && post.communityId === communityId) {
          return {
            ...post,
            replies: [],
            comments: 0,
          };
        }
        return post;
      }),
    );
    addNotification("تم مسح جميع التعليقات في المجموعة بنجاح.", "success");
  };

  const handleCommentInteraction = (
    postId: string,
    commentId: string,
    type: "delete" | "report" | "like" | "repost",
  ) => {
    if (type === "delete") {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              replies: post.replies?.filter((c) => c.id !== commentId),
              comments: post.comments - 1,
            };
          }
          return post;
        }),
      );
      addNotification("Comment purged successfully.", "alert");
      return;
    }
    if (type === "report") {
      addNotification("Comment reported for review.");
      console.log(`Comment ${commentId} reported on post ${postId}`);
      return;
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies?.map((comment) => {
              if (comment.id === commentId) {
                if (type === "like") {
                  const isLiked = !comment.isLiked;
                  addNotification(
                    isLiked ? "Resonated with comment." : "Resonance removed.",
                  );
                  return {
                    ...comment,
                    isLiked,
                    likes: isLiked ? comment.likes + 1 : comment.likes - 1,
                  };
                }
                if (type === "repost") {
                  const isReposted = !comment.isReposted;
                  addNotification(
                    isReposted
                      ? "Echoed comment to network."
                      : "Echo silenced.",
                  );
                  return {
                    ...comment,
                    isReposted,
                    reposts: isReposted
                      ? (comment.reposts || 0) + 1
                      : (comment.reposts || 0) - 1,
                  };
                }
              }
              return comment;
            }),
          };
        }
        return post;
      }),
    );
  };

  const handleProfileClick = (author: string) => {
    setSelectedProfileId(author);
    setActiveGrid("profile");
  };

  const handleLogout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn("Failed to sign out of Firebase", e);
    }
    localStorage.removeItem("grid_user");
    setCurrentUser(null);
    setAuthMode("login");
    addNotification("Logged out from the neural link.", "alert");
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.ownerId && (c.id === "c4" || c.id === "c6")) {
          const { ownerId, ...rest } = c;
          return rest;
        }
        return c;
      }),
    );
  };

  const handleAuthSuccess = async (user: UserProfile) => {
    await persistUserAcrossAllStorage(user);
    setAuthMode("none");
    addNotification(`Welcome back to Vexora Network, ${user.name}.`, "success");
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === "c4" || c.id === "c6") {
          return { ...c, ownerId: user.id };
        }
        return c;
      }),
    );
  };

  const gridColors = {
    public: "text-grid-public",
    community: "text-grid-community",
    private: "text-grid-private",
    "flux-ai": "text-purple-400",
    profile: "text-white",
  };

  const gridBorders = {
    public: "neon-border-purple",
    community: "neon-border-magenta",
    private: "neon-border-lime",
    "flux-ai": "border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]",
    profile: "border-white/10",
  };

  const gridShadows = {
    public: "shadow-[0_0_20px_rgba(0,242,255,0.1)]",
    community: "shadow-[0_0_20px_rgba(255,0,255,0.1)]",
    private: "shadow-[0_0_20px_rgba(57,255,20,0.1)]",
    "flux-ai": "shadow-[0_0_25px_rgba(59,130,246,0.15)]",
    profile: "shadow-none",
  };

  return (
    <div
      className={`flex flex-col h-screen w-full bg-transparent text-flux-primary overflow-hidden font-sans ${language === "ar" ? "dir-rtl" : ""}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <AnimatePresence>
        {isDevMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0] }}
            transition={{ duration: 0.15, repeat: Infinity }}
            className="fixed inset-0 pointer-events-none z-[1000] border-[1px] border-purple-500/30 glow-purple shadow-[inset_0_0_100px_rgba(168,85,247,0.1)]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authMode !== "none" && (
          <AuthOverlay
            mode={authMode}
            setMode={setAuthMode}
            onSuccess={handleAuthSuccess}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Vexora AI "Soon" 5-Second Animated Alert Banner */}
      <AnimatePresence>
        {showVexoraAiSoon && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92vw] max-w-md pointer-events-auto"
          >
            <div className="relative overflow-hidden bg-zinc-950/95 border-2 border-purple-500/80 rounded-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(168,85,247,0.55)] backdrop-blur-2xl text-white">
              {/* Animated subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/25 via-pink-600/20 to-indigo-600/25 pointer-events-none" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                      <Bot className="w-7 h-7 animate-bounce" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black animate-ping" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 drop-shadow">
                        Soon
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/25 border border-purple-500/50 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                        Vexora AI
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium mt-0.5">
                      {language === "ar"
                        ? "ميزة Vexora AI قادمة قريباً جداً، جاري تجهيزها! ✨"
                        : "Vexora AI is coming soon! Stay tuned ✨"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowVexoraAiSoon(false)}
                  className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 5-second animated progress line */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Modern Futuristic Top Header with Vexora Network Brand & Logo */}
      <header
        id="vexora-main-header"
        className="w-full border-b border-white/5 bg-[#0a0d14]/85 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between z-30 shrink-0 select-none shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
      >
        {/* Brand Identity: Modern Logo + Vexora Network */}
        <div
          id="vexora-brand-link"
          onClick={() => {
            setActiveGrid("public");
            setCurrentView("feed");
            setSelectedProfileId(null);
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Vexora Network - Neural Social Grid"
        >
          {/* Logo container with multi-layer neon cyber glow & subtle entry animation on sign-in */}
          <motion.div
            key={currentUser?.id || "guest-logo"}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex-shrink-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl p-[1.5px] bg-gradient-to-tr from-cyan-400 via-purple-600 to-indigo-500 shadow-[0_0_25px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-black/95 flex items-center justify-center relative">
                <img
                  src="/vexora-logo.jpg"
                  alt="Vexora Network Logo"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/15 pointer-events-none" />
              </div>
            </div>
            {/* Live pulsating neural status badge */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
          </motion.div>

          {/* Futuristic Typographic Wordmark */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] font-sans">
                VEXORA
              </span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest hidden xs:inline-block shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                NETWORK
              </span>
            </div>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <span className="text-[9px] font-mono tracking-[0.35em] text-cyan-400/90 font-bold uppercase xs:hidden">
                NETWORK
              </span>
              <span className="text-[8px] font-mono text-cyan-400/90 uppercase tracking-wider hidden xs:inline font-bold">
                {language === "ar" ? "تواصل • العب • تنافس" : "CONNECT • PLAY • COMPETE"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Grid Status Pill (visible on medium & large screens) */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-inner">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold uppercase tracking-wider text-zinc-400">
              {language === "ar" ? "العقد المتصلة" : "Active Nodes"}:
            </span>
            <span className="text-cyan-400 font-black tracking-widest">
              {Object.keys(posts).length + 42}
            </span>
          </div>
          <span className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-purple-300 uppercase tracking-wider font-semibold">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{language === "ar" ? "مشفر وآمن" : "Encrypted Grid"}</span>
          </div>
        </div>

        {/* Right Controls: Language, Sound, Owner Command & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PC Gaming Accounts Link Matrix Button */}
          <button
            id="header-gaming-accounts-btn"
            type="button"
            onClick={() => setIsGamingAccountsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-600/15 hover:from-cyan-500/25 hover:to-blue-600/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            title={language === "ar" ? "ربط حسابات الألعاب (Steam, Discord, Battle.net, Riot)" : "Link PC Gaming IDs (Steam, Discord, Battle.net, Riot)"}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{language === "ar" ? "حسابات الألعاب" : "Gaming Matrix"}</span>
          </button>

          {/* Language Switcher */}
          <button
            id="header-language-toggle"
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
            title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === "ar" ? "EN" : "العربية"}</span>
          </button>

          {/* Sound & Audio Settings */}
          <button
            id="header-voice-btn"
            type="button"
            onClick={() => setIsVoiceSettingsOpen(true)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-cyan-300 transition-all cursor-pointer active:scale-95 shadow-sm"
            title={language === "ar" ? "إعدادات الصوت" : "Audio Settings"}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Owner Quick Button (if owner) */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowConsole(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-indigo-600/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              title={language === "ar" ? "لوحة المالك" : "Owner Console"}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>{language === "ar" ? "المالك" : "Owner"}</span>
            </button>
          )}

          {/* User Profile Avatar / Sign In */}
          {currentUser ? (
            <button
              id="header-user-profile-btn"
              type="button"
              onClick={() => {
                setSelectedProfileId(null);
                setCurrentView("my-account");
              }}
              className="flex items-center gap-2 pl-1 cursor-pointer group"
              title={currentUser.name}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-purple-500/40 p-0.5 bg-black/60 group-hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-[8px]"
                />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
            >
              {language === "ar" ? "دخول" : "Sign In"}
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 p-4 overflow-hidden relative">
        {/* Minimal Tool Dock */}
        <aside className="w-20 hidden xl:flex flex-col items-center py-6 gap-3.5 glass rounded-3xl ml-4">
          {/* Logo Mark at the top of the sidebar */}
          <div
            onClick={() => {
              setActiveGrid("public");
              setCurrentView("feed");
              setSelectedProfileId(null);
            }}
            className="w-12 h-12 rounded-2xl p-[1.5px] bg-gradient-to-tr from-cyan-400 via-purple-600 to-indigo-500 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all cursor-pointer mb-2 flex-shrink-0"
            title="Vexora Network"
          >
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-black/95 flex items-center justify-center relative">
              <img
                src="/vexora-logo.jpg"
                alt="Vexora Network Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="w-8 h-px bg-white/10 mb-1" />

          {/* 1 - Home / Global Feed */}
          <DockItem
            icon={<Home className="w-6 h-6 outline-none" />}
            active={
              activeGrid === "public" &&
              currentView === "feed" &&
              !selectedProfileId
            }
            onClick={() => {
              setActiveGrid("public");
              setCurrentView("feed");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "1. الرئيسية" : "1. Feed"}
          />

          {/* 2 - Gaming Communities */}
          <DockItem
            icon={<Zap className="w-6 h-6" />}
            active={currentView === "communities"}
            onClick={() => {
              setCurrentView("communities");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "2. المجتمعات" : "2. Communities"}
          />

          {/* 3 - Gaming Hub */}
          <DockItem
            icon={<Gamepad2 className="w-6 h-6 text-cyan-400" />}
            active={currentView === "gaming-hub"}
            onClick={() => {
              setCurrentView("gaming-hub");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "3. مركز الألعاب" : "3. Gaming Hub"}
          />

          {/* 4 - Strategy Arena */}
          <DockItem
            icon={<Flame className="w-6 h-6 text-cyan-400" />}
            active={currentView === "games-arena"}
            onClick={() => {
              setCurrentView("games-arena");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "4. ساحة الألعاب" : "4. Strategy Arena"}
          />

          {/* 5 - Competitive Tournaments */}
          <DockItem
            icon={<Trophy className="w-6 h-6 text-yellow-400" />}
            active={currentView === "tournaments"}
            onClick={() => {
              setCurrentView("tournaments");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "5. دوري البطولات" : "5. Tournaments"}
          />

          {/* 6 - Live Activity */}
          <DockItem
            icon={<Activity className="w-6 h-6 text-emerald-400" />}
            active={currentView === "activity"}
            onClick={() => {
              setCurrentView("activity");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "6. النشاط الحي" : "6. Live Activity"}
          />

          {/* 7 - Friends */}
          <DockItem
            icon={<UserPlus className="w-6 h-6" />}
            active={currentView === "friends"}
            onClick={() => {
              setCurrentView("friends");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "7. الأصدقاء" : "7. Friends"}
          />

          {/* 8 - Messages */}
          <DockItem
            icon={<MessageSquare className="w-6 h-6 outline-none" />}
            active={currentView === "messages"}
            onClick={() => {
              setCurrentView("messages");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "8. الرسائل" : "8. Messages"}
          />

          {/* 9 - Saved Posts */}
          <DockItem
            icon={<Bookmark className="w-6 h-6" />}
            active={currentView === "saved"}
            onClick={() => {
              setCurrentView("saved");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "9. المحفوظات" : "9. Saved"}
          />

          {/* 10 - User Profile */}
          <DockItem
            icon={<User className="w-6 h-6" />}
            active={currentView === "my-account"}
            onClick={() => {
              setCurrentView("my-account");
              setSelectedProfileId(null);
            }}
            label={language === "ar" ? "10. حسابي" : "10. Profile"}
          />
          <div className="w-8 h-px bg-white/10 my-1" />

          {/* Owner Command Center Sidebar Action */}
          {isOwner && (
            <div className="relative group">
              <button
                type="button"
                onClick={() => setShowConsole(true)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-gradient-to-tr from-yellow-500 via-amber-600 to-purple-600 text-white shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)] hover:scale-110 active:scale-95 cursor-pointer relative overflow-hidden ring-2 ring-amber-400 animate-pulse"
                title={
                  language === "ar"
                    ? "أدوات المالك 👑"
                    : "Owner Command Center 👑"
                }
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Crown className="w-6 h-6 text-yellow-200" />
              </button>
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 glass rounded-xl text-[10px] uppercase tracking-widest font-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap text-amber-300 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-1.5">
                <span>
                  {language === "ar" ? "أدوات المالك" : "Owner Tools"}
                </span>{" "}
                <span className="text-yellow-400">👑</span>
              </div>
            </div>
          )}

          <DockItem
            icon={<Database className="w-6 h-6 text-purple-400" />}
            label={language === "ar" ? "حفظ البيانات" : "Data Vault"}
            onClick={() => {
              setIsDataVaultOpen(true);
            }}
          />

          <DockItem
            icon={<Volume2 className="w-6 h-6 text-indigo-400" />}
            label={language === "ar" ? "ضبط الصوت" : "Voice & Sound"}
            onClick={() => {
              setIsVoiceSettingsOpen(true);
            }}
          />

          <DockItem
            icon={<Settings className="w-6 h-6" />}
            label={language === "ar" ? "الإعدادات" : "Settings"}
            onClick={() => {
              openEditProfile("profile");
            }}
          />

          <DockItem
            icon={<Activity className="w-6 h-6 outline-none" />}
            active={isDevMode}
            onClick={() => setIsDevMode(!isDevMode)}
            label="Dev"
          />

          {activeCall && (currentView !== "messages" || isCallMinimized) && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              transition={{
                repeat: Infinity,
                duration: 2,
                repeatType: "reverse",
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.2)] mt-2"
            >
              <div className="relative">
                <Phone className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-black animate-ping" />
              </div>
              <span className="text-[8px] font-mono font-bold text-emerald-300">
                {(() => {
                  const mins = Math.floor(callDuration / 60);
                  const secs = callDuration % 60;
                  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                })()}
              </span>
              <button
                onClick={() => {
                  setCurrentView("messages");
                  setIsCallMinimized(false);
                }}
                className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-95 cursor-pointer"
                title="Return to Call"
              >
                <Maximize2 className="w-3 h-3 font-bold" />
              </button>
            </motion.div>
          )}

          {currentUser ? (
            <button
              onClick={handleLogout}
              className="mt-auto w-12 h-12 rounded-2xl flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all font-mono cursor-pointer"
              title={language === "ar" ? "تسجيل الخروج" : "Log Out"}
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setAuthMode("login")}
              className="mt-auto w-12 h-12 rounded-2xl flex items-center justify-center text-purple-300 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 transition-all font-mono cursor-pointer shadow-lg shadow-purple-500/10"
              title={language === "ar" ? "تسجيل الدخول" : "Sign In"}
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
        </aside>

        {/* Main Neural Feed */}
        <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
          <div className="max-w-[700px] w-full mx-auto p-4 md:p-8 space-y-12">
            {currentView === "terminal" && (
              <div className="flex-1 flex flex-col justify-center py-10">
                <VexoraAITerminal />
              </div>
            )}

            {currentView === "messages" && (
              <div className="fixed inset-0 p-2 md:p-6 z-[50] bg-black/90 backdrop-blur-2xl flex flex-col">
                <div className="flex items-center justify-between pb-2 px-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                      VEXORA NETWORK — Advanced Real-time Messaging
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentView("feed")}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{language === "ar" ? "العودة للرئيسية" : "Return to Network"}</span>
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <VexoraMessengerSuite
                    currentUser={currentUser}
                    initialChatUserId={initialChatUserId}
                    language={language}
                    onProfileClick={handleProfileClick}
                    activeCall={activeCall}
                    setActiveCall={setActiveCall}
                    isCallMinimized={isCallMinimized}
                    setIsCallMinimized={setIsCallMinimized}
                    callDuration={callDuration}
                    onInitiateCall={handleInitiateCall}
                    setIncomingCallData={setIncomingCallData}
                  />
                </div>
              </div>
            )}

            {currentView === "gmail" && (
              <div className="fixed inset-0 p-4 md:p-8 z-[40] bg-black/95">
                <VexoraGmail
                  gmailToken={gmailToken}
                  setGmailToken={setGmailToken}
                  currentUser={currentUser}
                />
              </div>
            )}

            {currentView === "chat" && (
              <div className="fixed inset-0 p-4 md:p-8 z-[40] bg-black/95">
                <VexoraChat
                  gmailToken={gmailToken}
                  setGmailToken={setGmailToken}
                  currentUser={currentUser}
                />
              </div>
            )}

            {currentView === "meet" && (
              <div className="fixed inset-0 p-4 md:p-8 z-[40] bg-black/95">
                <VexoraMeet
                  gmailToken={gmailToken}
                  setGmailToken={setGmailToken}
                  currentUser={currentUser}
                  language={language}
                />
              </div>
            )}

            {currentView === "labs" && (
              <div className="flex-1 flex flex-col justify-center py-10">
                <VexoraLabs
                  language={language}
                  currentUser={currentUser}
                  onAddPost={(content, type, image, isAnonymous) =>
                    handleCreatePost(content, image, undefined, isAnonymous)
                  }
                  addNotification={(msg, type) =>
                    addNotification(msg, type === "info" ? "success" : type)
                  }
                />
              </div>
            )}

            {currentView === "feed" &&
              !selectedProfileId &&
              activeGrid !== "profile" && (
                <>
                  {/* Supreme Owner Header Ribbon */}
                  {isOwner && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-indigo-950/40 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Crown className="w-5 h-5 text-yellow-200 animate-pulse" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-ping" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wider uppercase">
                              {language === "ar"
                                ? "أدوات مالك الموقع نشطة"
                                : "SITE OWNER PROTOCOL ENGAGED"}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              MASTER
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-white/50 truncate">
                            {language === "ar"
                              ? "لك حق الإشراف الكامل، التوثيق، البث الجماعي، وحذف أو تثبيت المنشورات"
                              : "Full access to verification matrix, broadcast dispatcher, pin & moderation tools"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowConsole(true)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-[11px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                      >
                        <Crown className="w-4 h-4 text-yellow-200" />
                        <span>
                          {language === "ar"
                            ? "فتح أدوات المالك 👑"
                            : "Owner Command Center 👑"}
                        </span>
                      </button>
                    </motion.div>
                  )}

                  {/* Stories Section */}
                  <div
                    id="stories-section-container"
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                  >
                    {currentUser && (
                      <div
                        onClick={() => setIsCreateStoryOpen(true)}
                        className="min-w-[140px] h-52 flux-card overflow-hidden group cursor-pointer relative bg-white/5 border-white/5 flex-shrink-0"
                        title="Create Story / إنشاء قصة"
                      >
                        <img
                          src={currentUser.avatar}
                          className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border border-purple-400/50">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                            انشاء قصة
                          </span>
                        </div>
                      </div>
                    )}
                    {stories.map((story, idx) => (
                      <div
                        key={story.id}
                        onClick={() => {
                          setSelectedStoryIndex(idx);
                          setIsStoryViewerOpen(true);
                        }}
                        className="min-w-[140px] h-52 flux-card overflow-hidden group cursor-pointer relative border-white/5 flex-shrink-0"
                      >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                        {story.preset === "dove" ? (
                          <div className="w-full h-full bg-[#f2da46] flex items-center justify-center p-2 relative">
                            {/* Tiny bird icon for background visual hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none scale-50">
                              <svg
                                viewBox="0 0 100 100"
                                className="w-full h-full fill-white"
                              >
                                <path d="M35 50 C40 42 60 40 75 52 C85 60 88 72 75 75 C60 78 45 70 35 50 Z" />
                              </svg>
                            </div>
                            <span className="text-[8px] font-black text-sky-950 font-sans line-clamp-4 text-center leading-normal bg-[#4ABEFF]/95 rounded-md p-1.5 border border-white/10 shadow-sm">
                              {story.content}
                            </span>
                          </div>
                        ) : story.preset === "neon" ? (
                          <div className="w-full h-full bg-slate-950 flex items-center justify-center p-2 relative">
                            <span className="text-[8px] font-mono text-cyan-400 line-clamp-4 text-center leading-normal border border-cyan-500/20 bg-cyan-950/20 rounded-md p-1.5">
                              {story.content}
                            </span>
                          </div>
                        ) : story.preset === "sunset" ? (
                          <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center p-2 relative">
                            <span className="text-[8px] font-sans font-bold text-white line-clamp-4 text-center leading-normal bg-black/10 rounded-md p-1.5">
                              {story.content}
                            </span>
                          </div>
                        ) : story.preset === "emerald" ? (
                          <div className="w-full h-full bg-gradient-to-tr from-emerald-950 to-green-800 flex items-center justify-center p-2 relative">
                            <span className="text-[8px] font-mono text-emerald-300 line-clamp-4 text-center leading-normal border border-emerald-500/20 bg-black/20 rounded-md p-1.5">
                              {story.content}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={
                              story.image ||
                              "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop"
                            }
                            className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                            alt=""
                          />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
                        <div className="absolute top-4 right-4 w-9 h-9 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl z-30 group-hover:border-purple-500 transition-colors">
                          <img
                            src={story.avatar}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <span className="absolute bottom-4 right-4 text-[9px] font-black uppercase tracking-widest text-white z-30 group-hover:translate-x-1 transition-transform italic truncate max-w-[100px]">
                          {story.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

            {currentView === "friends" && (
              <div className="space-y-12">
                <div className="flex flex-col gap-2">
                  <h2 className="text-4xl font-black uppercase tracking-tightest">
                    Node Synchronizations
                  </h2>
                  <p className="text-white/20 text-[10px] font-mono tracking-[0.3em] uppercase">
                    Pending Connection Log
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {friendRequests.map((req) => (
                    <motion.div
                      key={req.id}
                      whileHover={{ y: -8 }}
                      className="flux-card overflow-hidden flex flex-col group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                      <div className="h-56 overflow-hidden relative">
                        <img
                          src={req.from.avatar}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white">
                            Pending
                          </span>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col gap-6">
                        <div className="flex flex-col">
                          <span className="font-black text-2xl uppercase italic tracking-tightest">
                            {req.from.name}
                          </span>
                          <span className="text-white/20 text-[10px] font-mono uppercase tracking-[0.3em] mt-2">
                            {req.from.followers} Signal Mutuals
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAcceptFriendRequest(req.id)}
                            className="flex-1 h-14 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95"
                          >
                            Synchronize Node
                          </button>
                          <button
                            onClick={() => handleDeclineFriendRequest(req.id)}
                            className="w-14 h-14 flex items-center justify-center bg-white/5 text-white/20 rounded-2xl hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-95 border border-white/5"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {friendRequests.length === 0 && (
                  <div className="py-32 text-center space-y-8 flux-card border-dashed border-white/10 opacity-30">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-white/10">
                      <Zap className="w-10 h-10" />
                    </div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.4em]">
                      Grid Clear. No synchronization anomalies detected.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentView === "saved" && (
              <div className="space-y-8 pb-16">
                {/* Top Archive Header & Quantum Status Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0d0f15] border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.12)] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)] flex-shrink-0">
                        <Bookmark className="w-7 h-7 fill-purple-400/20" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-sans">
                            {language === "ar"
                              ? "المستودعات الآمنة والمحفوظات"
                              : "Secure Archives & Vault"}
                          </h2>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            AES-256
                          </span>
                        </div>
                        <p className="text-white/40 text-xs font-mono tracking-wider mt-1">
                          {language === "ar"
                            ? "نظام الحفظ اللامركزي وتأمين حزم البيانات والمنشورات المشفرة"
                            : "Decentralized Encrypted Data Vault & Saved Neural Packets"}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls: Export & Clear */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={handleExportSavedArchives}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10"
                        title={
                          language === "ar"
                            ? "تصدير نسخة احتياطية من المحفوظات"
                            : "Export JSON Backup"
                        }
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {language === "ar" ? "تصدير JSON" : "Export JSON"}
                        </span>
                      </button>

                      {currentUser?.savedPostIds &&
                        currentUser.savedPostIds.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllSaved}
                            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                            title={
                              language === "ar"
                                ? "تفريغ المستودع"
                                : "Clear Vault"
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{language === "ar" ? "تفريغ" : "Clear"}</span>
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Stats Mini Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center font-mono">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-base font-black text-purple-400">
                        {currentUser?.savedPostIds?.length || 0}
                      </div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">
                        {language === "ar" ? "حزم محفوظة" : "Secured Nodes"}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-base font-black text-emerald-400">
                        100%
                      </div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">
                        {language === "ar"
                          ? "تكامل التشفير"
                          : "Vault Integrity"}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-base font-black text-sky-400">
                        Active
                      </div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">
                        {language === "ar" ? "المزامنة السحابية" : "Cloud Sync"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder={
                        language === "ar"
                          ? "البحث داخل المستودع والمحفوظات..."
                          : "Search within secured archives..."
                      }
                      value={savedSearchQuery}
                      onChange={(e) => setSavedSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 hover:border-white/20 h-11 rounded-2xl pr-11 pl-4 text-xs font-mono tracking-wider focus:outline-none focus:bg-white/[0.08] placeholder:text-white/25 transition-all text-white text-right dir-rtl"
                    />
                    {savedSearchQuery && (
                      <button
                        onClick={() => setSavedSearchQuery("")}
                        style={{ left: "14px" }}
                        className="absolute top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[10px] font-mono border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg transition-all"
                      >
                        {language === "ar" ? "مسح" : "Clear"}
                      </button>
                    )}
                  </div>

                  {/* Filter Category Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-xs font-mono">
                    {[
                      {
                        id: "all",
                        label: language === "ar" ? "الكل" : "All Packets",
                      },
                      {
                        id: "media",
                        label:
                          language === "ar" ? "وسائط وصور" : "Media & Visuals",
                      },
                      {
                        id: "text",
                        label: language === "ar" ? "نبضات نصية" : "Text Pulses",
                      },
                      {
                        id: "legendary",
                        label: language === "ar" ? "أسطورية" : "Legendary",
                      },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSavedFilterCategory(cat.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl border font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          savedFilterCategory === cat.id
                            ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            : "bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saved Posts Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {(() => {
                    const savedPosts = posts
                      .filter((p) => currentUser?.savedPostIds?.includes(p.id))
                      .filter((p) => {
                        if (!savedSearchQuery.trim()) return true;
                        const q = savedSearchQuery.toLowerCase();
                        return (
                          p.content.toLowerCase().includes(q) ||
                          p.author.toLowerCase().includes(q) ||
                          (p.type && p.type.toLowerCase().includes(q))
                        );
                      })
                      .filter((p) => {
                        if (savedFilterCategory === "media")
                          return !!(p.image || p.gif);
                        if (savedFilterCategory === "text")
                          return !(p.image || p.gif);
                        if (savedFilterCategory === "legendary")
                          return !!p.isLegendary;
                        return true;
                      });

                    if (savedPosts.length === 0) {
                      return (
                        <div className="py-20 text-center space-y-6 flux-card border-dashed border-white/10 bg-white/[0.01]">
                          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
                            <Bookmark className="w-8 h-8 opacity-60" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                              {language === "ar"
                                ? "المستودع فارغ أو لا توجد نتائج مطابقة"
                                : "No Secured Packets Found"}
                            </h3>
                            <p className="text-xs text-white/40 font-mono max-w-sm mx-auto leading-relaxed">
                              {language === "ar"
                                ? "قم بحفظ النبضات المفضلة من الساحة العامة لتظهر هنا بشكل آمن ومشفر."
                                : "Save your favorite pulses from the public neural stream to securely store them here."}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentView("feed")}
                            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-600/20 inline-flex items-center gap-2"
                          >
                            <Radio className="w-4 h-4" />
                            <span>
                              {language === "ar"
                                ? "استكشاف النبضات لحفظها"
                                : "Explore Public Feed"}
                            </span>
                          </button>
                        </div>
                      );
                    }

                    return savedPosts.map((post, idx) => (
                      <PostCard
                        index={idx}
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        language={language}
                        onInteraction={(type, reactionType) =>
                          handleInteraction(post.id, type, reactionType)
                        }
                        onCommentInteraction={handleCommentInteraction}
                        onAddComment={handleAddComment}
                        onProfileClick={handleProfileClick}
                      />
                    ));
                  })()}
                </div>
              </div>
            )}

            {currentView === "my-account" && (
              <MyAccountSection
                currentUser={currentUser}
                language={language}
                onOpenEditProfile={() => openEditProfile("profile")}
                onUpdateBio={handleUpdateBio}
                onUpdateAvatar={handleUpdateAvatar}
                onUpdateBanner={handleUpdateBanner}
                onUpdateProfile={handleUpdateProfile}
                onSignOut={handleLogout}
                onOpenLogin={() => setAuthMode("login")}
                onSetLanguage={(lang) => setLanguage(lang)}
                onOpenOwnerConsole={() => setShowConsole(true)}
                onOpenDataVault={() => setIsDataVaultOpen(true)}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
                onOpenGamingAccounts={() => setIsGamingAccountsOpen(true)}
                isOwner={isOwner}
                userPostCount={
                  posts.filter((p) => p.author === currentUser?.name).length
                }
                userSavedCount={currentUser?.savedPostIds?.length || 0}
              />
            )}

            {/* Gaming Hub */}
            {currentView === "gaming-hub" && (
              <GamingHub
                currentUser={currentUser}
                language={language}
                onNavigateToArena={() => setCurrentView("games-arena")}
                onNavigateToTournaments={() => setCurrentView("tournaments")}
              />
            )}

            {/* Strategy Arena (Chess, Connect Four, Tic-Tac-Toe) */}
            {currentView === "games-arena" && (
              <GamingArena
                currentUser={currentUser}
                language={language}
              />
            )}

            {/* Competitive Tournaments (Round Robin League) */}
            {currentView === "tournaments" && (
              <TournamentsHub
                currentUser={currentUser}
                language={language}
              />
            )}

            {/* Live Activity & Achievements Pulse */}
            {currentView === "activity" && (
              <LiveActivityFeed
                currentUser={currentUser}
                language={language}
                onChallengePlayer={() => setCurrentView("games-arena")}
              />
            )}

            {currentView === "communities" &&
              (visitedCommunityId ? (
                <VisitedCommunityDetailView
                  community={
                    communities.find((c) => c.id === visitedCommunityId) ||
                    MOCK_COMMUNITIES.find((c) => c.id === visitedCommunityId) ||
                    MOCK_COMMUNITIES[0]
                  }
                  onBack={() => setVisitedCommunityId(null)}
                  joined={joinedCommunityIds.includes(visitedCommunityId)}
                  onToggleJoin={(e) =>
                    handleToggleJoinCommunity(visitedCommunityId, e)
                  }
                  onShare={(e) => handleShareCommunity(visitedCommunityId, e)}
                  copied={copiedCommunityId === visitedCommunityId}
                  currentUser={currentUser}
                  onProfileClick={handleProfileClick}
                  posts={posts}
                  onAddCommunityPost={handleCreateCommunityPost}
                  onLikePost={(postId) => handleInteraction(postId, "like")}
                  onAddComment={(postId, text) =>
                    handleAddComment(postId, text)
                  }
                  onUpdateCommunity={handleUpdateCommunity}
                  onDeleteComment={(postId, commentId) =>
                    handleCommentInteraction(postId, commentId, "delete")
                  }
                  onClearAllComments={handleClearAllComments}
                  onDeletePost={(postId) => handleInteraction(postId, "delete")}
                />
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black uppercase tracking-tightest text-white">
                          Network Communities
                        </h2>
                        <p className="text-white/20 text-[10px] font-mono tracking-[0.3em] uppercase">
                          Distributed Signal Clusters
                        </p>
                      </div>
                      {currentUser && (
                        <button
                          id="create-community-btn"
                          onClick={() => setIsCreateModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 hover:text-white font-mono text-[9px] font-black uppercase tracking-[0.16em] border border-purple-500/40 shadow-lg shadow-purple-500/5 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 h-10 ml-2"
                        >
                          <Plus className="w-3.5 h-3.5 text-purple-400" />
                          <span>Create Cluster</span>
                        </button>
                      )}
                    </div>

                    {/* Search Controller */}
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="community-search-input"
                        type="text"
                        placeholder="Search signal clusters..."
                        value={communitySearch}
                        onChange={(e) => setCommunitySearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 h-12 rounded-2xl pl-11 pr-4 text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.08] placeholder:text-white/20 transition-all text-white"
                      />
                      {communitySearch && (
                        <button
                          id="clear-community-search"
                          onClick={() => setCommunitySearch("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter & Sort Controls Section */}
                  <div
                    id="community-controls-bar"
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6"
                  >
                    {/* Category Filter Row */}
                    <div className="space-y-2.5">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                        Select Genre
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "All",
                          "Development",
                          "Design",
                          "Creative/Art",
                          "Social/Gaming",
                          "Security/Privacy",
                        ].map((category) => (
                          <button
                            id={`category-pill-${category.replace("/", "-")}`}
                            key={category}
                            onClick={() => setCommunityCategory(category)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-[0.1em] transition-all border cursor-pointer ${
                              communityCategory === category
                                ? "bg-purple-600/20 border-purple-500/50 text-purple-405 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] shadow-purple-500/10"
                                : "bg-white/5 border-transparent text-white/40 hover:text-white/85 hover:bg-white/[0.08]"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Divider line */}
                    <div className="h-[1px] bg-white/5 w-full" />

                    {/* Ordering Controls & Directions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Sort parameters */}
                      <div className="flex items-center gap-2 relative z-20">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mr-2">
                          Sort Metric:
                        </span>

                        <div className="relative">
                          <button
                            id="community-sort-dropdown-trigger"
                            onClick={() =>
                              setIsCommunitySortOpen(!isCommunitySortOpen)
                            }
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[10px] font-mono uppercase tracking-[0.1em] text-white/80 border border-white/5 flex items-center gap-2.5 transition-all cursor-pointer min-w-[160px] justify-between h-10 select-none"
                          >
                            <span>
                              {communitySort === "members"
                                ? "Member Count"
                                : communitySort === "recency"
                                  ? "Date Created"
                                  : "Alphabetical"}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${isCommunitySortOpen ? "rotate-180 text-purple-400" : ""}`}
                            />
                          </button>

                          <AnimatePresence>
                            {isCommunitySortOpen && (
                              <>
                                {/* Backdrop to close click outside */}
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setIsCommunitySortOpen(false)}
                                />
                                <motion.div
                                  id="community-sort-dropdown-options"
                                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute left-0 mt-2 w-[180px] bg-zinc-950 border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-40 overflow-hidden backdrop-blur-xl"
                                >
                                  {[
                                    { value: "recency", label: "Date Created" },
                                    { value: "members", label: "Member Count" },
                                    {
                                      value: "alphabetical",
                                      label: "Alphabetical",
                                    },
                                  ].map((option) => (
                                    <button
                                      id={`sort-option-${option.value}`}
                                      key={option.value}
                                      onClick={() => {
                                        setCommunitySort(option.value as any);
                                        setIsCommunitySortOpen(false);
                                      }}
                                      className={`w-full px-3.5 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-[0.1em] text-left transition-all cursor-pointer flex items-center justify-between ${
                                        communitySort === option.value
                                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold"
                                          : "text-white/44 hover:text-white hover:bg-white/5 border border-transparent"
                                      }`}
                                    >
                                      <span>{option.label}</span>
                                      {communitySort === option.value && (
                                        <Check className="w-3.5 h-3.5 text-purple-400" />
                                      )}
                                    </button>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Sort Direction Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
                          Order Direction:
                        </span>
                        <button
                          id="sort-direction-toggle-btn"
                          onClick={() =>
                            setCommunitySortOrder((prev) =>
                              prev === "desc" ? "asc" : "desc",
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[10px] font-mono uppercase tracking-[0.1em] text-white/80 border border-white/5 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>
                            {communitySortOrder === "desc"
                              ? "High to Low (↓)"
                              : "Low to High (↑)"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Communities Display Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedCommunities.length > 0 ? (
                      filteredAndSortedCommunities.map((community) => (
                        <div
                          id={`community-card-${community.id}`}
                          key={community.id}
                          onClick={() => {
                            setExpandedCommunityIds((prev) =>
                              prev.includes(community.id)
                                ? prev.filter((id) => id !== community.id)
                                : [...prev, community.id],
                            );
                          }}
                          className="flux-card group overflow-hidden bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 flex flex-col justify-between cursor-pointer select-none"
                        >
                          <div>
                            {/* Image Container */}
                            <div className="h-44 w-full relative overflow-hidden">
                              <img
                                src={community.image}
                                className="w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700 grayscale group-hover:grayscale-0"
                                alt={community.name}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/80 border border-white/5 text-[8px] font-mono uppercase tracking-[0.15em] text-purple-400 font-bold">
                                {community.category}
                              </span>
                              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                <button
                                  id={`community-report-btn-${community.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReportingCommunity(community);
                                    setIsReportModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-black/95 hover:bg-amber-950/80 text-white/50 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer duration-200 flex items-center gap-1.5 shadow-lg"
                                  title="Report Cluster"
                                >
                                  <Flag className="w-3 h-3" />
                                  <span className="text-[8.5px] font-mono uppercase tracking-[0.12em] font-black">
                                    Report
                                  </span>
                                </button>

                                {currentUser &&
                                  (community.ownerId === currentUser.id ||
                                    currentUser.email ===
                                      "vexora.network@gmail.com" ||
                                    currentUser.email ===
                                      "fluxstudio4@gmail.com") && (
                                    <button
                                      id={`community-delete-btn-${community.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCommunities((prev) =>
                                          prev.filter(
                                            (c) => c.id !== community.id,
                                          ),
                                        );
                                        addNotification(
                                          `Cluster "${community.name}" removed from directory.`,
                                          "alert",
                                        );
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-black/95 hover:bg-red-950/80 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-all cursor-pointer duration-200 flex items-center gap-1.5 shadow-lg animate-in fade-in duration-200"
                                      title="Delete Cluster"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span className="text-[8.5px] font-mono uppercase tracking-[0.12em] font-black">
                                        Delete
                                      </span>
                                    </button>
                                  )}
                              </div>

                              {/* Join/Follow Toggle Button */}
                              <button
                                id={`community-join-btn-${community.id}`}
                                onClick={(e) =>
                                  handleToggleJoinCommunity(community.id, e)
                                }
                                className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-xl border font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer z-10 duration-200 flex items-center gap-1.5 shadow-md ${
                                  joinedCommunityIds.includes(community.id)
                                    ? "bg-purple-600/30 border-purple-500/60 text-purple-300 hover:bg-purple-600/50 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                                    : "bg-black/80 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/30"
                                }`}
                                title={
                                  joinedCommunityIds.includes(community.id)
                                    ? "Leave Cluster"
                                    : "Join Cluster"
                                }
                              >
                                {joinedCommunityIds.includes(community.id) ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Joined</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 text-white/40" />
                                    <span>Join</span>
                                  </>
                                )}
                              </button>

                              {/* Share button */}
                              <button
                                id={`community-share-btn-${community.id}`}
                                onClick={(e) =>
                                  handleShareCommunity(community.id, e)
                                }
                                className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-xl border font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer z-10 duration-200 flex items-center gap-1.5 shadow-md ${
                                  copiedCommunityId === community.id
                                    ? "bg-emerald-600/30 border-emerald-500/60 text-emerald-300 hover:bg-emerald-600/50 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                                    : "bg-black/80 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/30"
                                }`}
                                title="Copy Community Link"
                              >
                                {copiedCommunityId === community.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>Share</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Info block */}
                            <div className="p-6 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-black text-xl text-white uppercase italic tracking-tightest group-hover:text-purple-400 transition-colors">
                                  {community.name}
                                </h3>
                                <div
                                  className={`p-1.5 rounded-lg border border-white/5 bg-white/5 transition-all text-white/40 group-hover:text-white/80 ${expandedCommunityIds.includes(community.id) ? "rotate-180 bg-purple-500/20 border-purple-500/30 text-purple-400" : ""}`}
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <p className="text-white/60 text-xs font-light leading-relaxed">
                                {community.description}
                              </p>

                              {/* Expandable content area */}
                              {expandedCommunityIds.includes(community.id) && (
                                <div className="pt-4 mt-2 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                                    <div>
                                      <span className="block text-[8px] font-mono uppercase tracking-widest text-white/30 mb-0.5">
                                        Created At
                                      </span>
                                      <span className="text-[10px] font-mono text-purple-300 font-bold">
                                        {new Date(
                                          community.createdAt,
                                        ).toLocaleDateString(undefined, {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="block text-[8px] font-mono uppercase tracking-widest text-white/30 mb-0.5 font-bold">
                                        Category Sector
                                      </span>
                                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                                        {community.category}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-[8px] font-mono text-white/40 leading-relaxed uppercase tracking-widest bg-white/[0.02] p-2 rounded-lg border border-dashed border-white/5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse flex-shrink-0" />
                                    <span>Secured under network protocols</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer statistical details */}
                          <div className="p-6 pt-0 border-t border-white/0 mt-4 flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-white font-mono tracking-widest">
                                {community.members.toLocaleString()} Active
                                Nodes
                              </span>
                              <span className="text-[8px] text-white/20 font-mono uppercase tracking-widest mt-0.5">
                                Established{" "}
                                {new Date(
                                  community.createdAt,
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                            <button
                              id={`community-visit-btn-${community.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setVisitedCommunityId(community.id);
                              }}
                              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-purple-600 border border-white/5 hover:border-transparent text-white/50 hover:text-white text-[9px] font-mono uppercase font-black tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-1.5 h-10 select-none group-hover:bg-purple-600/40 group-hover:text-white group-hover:border-purple-500/30"
                            >
                              <span>Visit Cluster</span>
                              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors animate-pulse" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        id="no-communities-placeholder"
                        className="col-span-1 md:col-span-2 lg:col-span-3 py-24 text-center space-y-6 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]"
                      >
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/20 border border-white/5 animate-pulse">
                          <Search className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                            No Node Clustered Found
                          </p>
                          <p className="text-xs text-white/30 font-mono uppercase tracking-wider">
                            Try adjusting your filtration metrics or reset
                            search query.
                          </p>
                        </div>
                        <button
                          id="reset-community-filters-btn"
                          onClick={() => {
                            setCommunitySearch("");
                            setCommunityCategory("All");
                            setCommunitySort("members");
                            setCommunitySortOrder("desc");
                            setCommunities(MOCK_COMMUNITIES);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-mono uppercase tracking-widest text-white/80 transition-all border border-white/5 cursor-pointer"
                        >
                          Reset Signal Scopes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {/* Post Composer or Profile */}
            <AnimatePresence mode="wait">
              {currentView === "feed" &&
                (selectedProfileId || activeGrid === "profile" ? (
                  <ProfileGrid
                    key={`profile-${selectedProfileId || "self"}`}
                    profile={selectedProfile}
                    posts={posts}
                    currentUser={currentUser}
                    language={language}
                    onOpenDirectChat={handleOpenDirectChat}
                    onInteraction={handleInteraction}
                    onCommentInteraction={handleCommentInteraction}
                    onAddComment={handleAddComment}
                    onProfileClick={handleProfileClick}
                    onEditProfile={(tab) => openEditProfile(tab || "profile")}
                    onSendFriendRequest={handleSendFriendRequest}
                    onToggleFollow={handleToggleFollow}
                    onDeleteAccount={handleDeleteAccount}
                    onInitiateCall={handleInitiateCall}
                    onSignOut={handleLogout}
                  />
                ) : (
                  <motion.div
                    key={activeGrid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {activeGrid === "public" && (
                      <div
                        className="flux-card p-6 bg-white/5 border-white/10 group cursor-pointer hover:bg-white/10 transition-all"
                        onClick={() => setIsComposerOpen(true)}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              currentUser?.avatar ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                            }
                            className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                            alt=""
                          />
                          <div className="flex-1 text-white/20 font-light text-lg">
                            Broadcast new signals to the network...
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Futuristic Feed Search Bar */}
                    <div className="relative group mb-4">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="البحث في النبضات الفعالة... / Search active pulses..."
                        value={feedSearchQuery}
                        onChange={(e) => setFeedSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 focus:border-purple-500/50 hover:border-white/10 h-10 rounded-2xl pr-11 pl-4 text-xs font-mono tracking-wider focus:outline-none focus:bg-white/[0.08] placeholder:text-white/20 transition-all text-white text-right dir-rtl"
                      />
                      {feedSearchQuery && (
                        <button
                          onClick={() => setFeedSearchQuery("")}
                          style={{ left: "16px" }}
                          className="absolute top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[10px] font-mono border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
                        >
                          مسح / Clear
                        </button>
                      )}
                    </div>

                    {/* Feed Sorting & Layout Switcher Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                      {/* Sort Options */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide text-xs font-mono">
                        {[
                          {
                            id: "latest",
                            icon: Zap,
                            label: language === "ar" ? "الأحدث" : "Latest",
                          },
                          {
                            id: "top",
                            icon: Flame,
                            label: language === "ar" ? "الأكثر تفاعلاً" : "Top",
                          },
                          {
                            id: "media",
                            icon: ImageIcon,
                            label: language === "ar" ? "وسائط وصور" : "Media",
                          },
                          {
                            id: "legendary",
                            icon: Crown,
                            label:
                              language === "ar" ? "أسطورية 👑" : "Legendary",
                          },
                        ].map((option) => {
                          const Icon = option.icon;
                          const isActive = feedSort === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setFeedSort(option.id as any)}
                              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer text-[11px] ${
                                isActive
                                  ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                                  : "bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-purple-400/70"}`}
                              />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Layout Switcher (Expanded vs Compact) */}
                      <div className="flex items-center gap-1 self-end sm:self-auto bg-black/40 p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setFeedLayoutMode("expanded")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            feedLayoutMode === "expanded"
                              ? "bg-purple-600 text-white font-bold shadow-md"
                              : "text-white/40 hover:text-white"
                          }`}
                          title={
                            language === "ar" ? "عرض مفصل" : "Expanded View"
                          }
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">
                            {language === "ar" ? "مفصل" : "Expanded"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedLayoutMode("compact")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            feedLayoutMode === "compact"
                              ? "bg-purple-600 text-white font-bold shadow-md"
                              : "text-white/40 hover:text-white"
                          }`}
                          title={
                            language === "ar" ? "عرض مكثف" : "Compact View"
                          }
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">
                            {language === "ar" ? "مكثف" : "Compact"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pb-20">
                      {(() => {
                        const filteredFeedPosts = posts
                          .filter(
                            (p) =>
                              !p.isUnlisted &&
                              (activeGrid === "public" ||
                                p.type === activeGrid),
                          )
                          .filter((p) => {
                            if (!feedSearchQuery.trim()) return true;
                            const query = feedSearchQuery.toLowerCase();
                            return (
                              p.content.toLowerCase().includes(query) ||
                              p.author.toLowerCase().includes(query) ||
                              (p.type && p.type.toLowerCase().includes(query))
                            );
                          })
                          .filter((p) => {
                            if (feedSort === "media")
                              return !!(p.image || p.gif);
                            if (feedSort === "legendary")
                              return !!(
                                p.isLegendary ||
                                p.author === "Vexora Official" ||
                                p.author === "Vexora Owner"
                              );
                            return true;
                          })
                          .sort((a, b) => {
                            if (feedSort === "top") {
                              const scoreA =
                                (a.likes || 0) * 2 +
                                (a.comments || 0) +
                                (a.reposts || 0);
                              const scoreB =
                                (b.likes || 0) * 2 +
                                (b.comments || 0) +
                                (b.reposts || 0);
                              return scoreB - scoreA;
                            }
                            if (feedSort === "legendary") {
                              if (a.isLegendary && !b.isLegendary) return -1;
                              if (!a.isLegendary && b.isLegendary) return 1;
                            }
                            return 0;
                          });

                        if (filteredFeedPosts.length === 0) {
                          return (
                            <div className="py-24 text-center space-y-6 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/20 border border-white/5 animate-pulse">
                                <Search className="w-6 h-6" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                                  No Pulse Signals Found
                                </p>
                                <p className="text-xs text-white/30 font-mono uppercase tracking-wider">
                                  Try adjusting your search query or reset
                                  parameters.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setFeedSearchQuery("");
                                  setFeedSort("latest");
                                }}
                                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-mono uppercase tracking-widest text-[#38bdf8] transition-all border border-[#38bdf8]/30 cursor-pointer"
                              >
                                Reset Filters
                              </button>
                            </div>
                          );
                        }

                        return filteredFeedPosts.map((post, idx) => (
                          <PostCard
                            key={post.id}
                            index={idx}
                            post={post}
                            currentUser={currentUser}
                            language={language}
                            layoutMode={feedLayoutMode}
                            onInteraction={(type, reactionType) =>
                              handleInteraction(post.id, type, reactionType)
                            }
                            onCommentInteraction={handleCommentInteraction}
                            onAddComment={handleAddComment}
                            onProfileClick={handleProfileClick}
                          />
                        ));
                      })()}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar: Gaming Pulse, Friends, Tournaments & Communities */}
        <aside className="w-[320px] hidden xl:flex flex-col p-5 bg-[#090d18]/90 backdrop-blur-md overflow-y-auto border-l border-white/5 scrollbar-hide space-y-6">
          {/* Header & Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white/50 px-1 font-mono uppercase text-[10px] tracking-[0.2em]">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {language === "ar" ? "رادار الألعاب المباشر" : "Gaming Live Radar"}
              </span>
              <div className="flex items-center gap-2">
                <Search
                  onClick={() => setShowSidebarSearch(!showSidebarSearch)}
                  className={`w-3.5 h-3.5 cursor-pointer transition-colors ${showSidebarSearch ? "text-cyan-400" : "hover:text-white"}`}
                />
              </div>
            </div>

            <AnimatePresence>
              {showSidebarSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder={language === "ar" ? "بحث عن لاعب أو لعبة..." : "Search players or games..."}
                    value={sidebarSearchQuery}
                    onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 h-9 rounded-xl pr-8 pl-3 text-[10px] font-mono tracking-wider text-white focus:outline-none focus:border-cyan-500/50"
                  />
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                  {sidebarSearchQuery && (
                    <button
                      onClick={() => setSidebarSearchQuery("")}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
                    >
                      ×
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Arena Challenge Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-purple-600/10 to-transparent border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {language === "ar" ? "ساحة الألعاب الفورية" : "Quick Combat Arena"}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-cyan-500/20 text-cyan-300">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-white/60 font-mono leading-relaxed">
              {language === "ar"
                ? "العب الشطرنج، رباعية الألوان، أو إكس-أو وتحدى الروبوت الذكي أو أصدقائك."
                : "Play Chess, Connect Four, or Tic-Tac-Toe vs Cyber Bot or friends."}
            </p>
            <button
              onClick={() => {
                setCurrentView("games-arena");
                setSelectedProfileId(null);
              }}
              className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono uppercase font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3 h-3" />
              <span>{language === "ar" ? "دخول الساحة الآن" : "Enter Arena"}</span>
            </button>
          </div>

          {/* 1. Online Friends & Active Gaming Sessions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40 px-1">
              <span>{language === "ar" ? "الأصدقاء المتصلون" : "Online Friends"}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {Object.keys(MOCK_PROFILES).length}
              </span>
            </div>

            <div className="space-y-2">
              {Object.values(MOCK_PROFILES)
                .slice(0, 4)
                .map((profile, i) => {
                  const games = ["Valorant", "CS2", "Rocket League", "Chess Arena"];
                  const ranks = ["Ascendant II", "15.2k ELO", "Champ 2", "1,520 MMR"];
                  return (
                    <button
                      key={profile.id}
                      onClick={() => handleProfileClick(profile.name)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="relative flex-shrink-0">
                          <img
                            src={profile.avatar}
                            className="w-9 h-9 rounded-xl object-cover border border-white/10"
                            alt=""
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold text-xs truncate text-white/80 group-hover:text-cyan-300">
                            {profile.name}
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400/80 truncate">
                            Playing {games[i % games.length]}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-white/30 hidden sm:inline">
                        {ranks[i % ranks.length]}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* 2. Upcoming Tournaments */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40 px-1">
              <span>{language === "ar" ? "بطولات الدوري القادمة" : "Upcoming Tournaments"}</span>
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            </div>

            <div
              onClick={() => {
                setCurrentView("tournaments");
                setSelectedProfileId(null);
              }}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-yellow-400 font-bold">Round Robin League S1</span>
                <span className="text-emerald-400 font-black">$10,000</span>
              </div>
              <p className="text-xs font-black text-white group-hover:text-cyan-300 truncate">
                Cyber Vortex vs Obsidian Shadows
              </p>
              <span className="text-[9px] font-mono text-white/40 block">
                Round 8 • Map 3 Decider (Live Now)
              </span>
            </div>
          </div>

          {/* 3. Trending Games */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40 px-1">
              <span>{language === "ar" ? "الألعاب الأكثر نشاطاً" : "Trending Games"}</span>
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="space-y-1.5">
              {[
                { name: "Valorant", players: "1.4M playing", tag: "FPS" },
                { name: "Counter-Strike 2", players: "1.2M playing", tag: "FPS" },
                { name: "Apex Legends", players: "850K playing", tag: "BR" },
              ].map((g, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentView("gaming-hub");
                    setSelectedProfileId(null);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-xs font-mono text-white/70 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-[10px]">#{idx + 1}</span>
                    <span className="font-bold">{g.name}</span>
                  </div>
                  <span className="text-[9px] text-cyan-400">{g.players}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {isEditPostOpen && editingPost && (
          <EditPostModal
            post={editingPost}
            onClose={() => {
              setIsEditPostOpen(false);
              setEditingPost(null);
            }}
            onSave={async (newContent) => {
              try {
                await updateDoc(doc(db, "posts", editingPost.id), {
                  content: newContent,
                });
              } catch (e) {
                handleFirestoreError(
                  e,
                  OperationType.UPDATE,
                  `posts/${editingPost.id}`,
                );
              }
              setIsEditPostOpen(false);
              setEditingPost(null);
              addNotification("Signal re-encoded successfully.", "success");
            }}
            onDelete={() => {
              handleInteraction(editingPost.id, "delete");
              setIsEditPostOpen(false);
              setEditingPost(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditProfileOpen && currentUser && (
          <EditProfileModal
            profile={currentUser}
            initialTab={editProfileTab}
            onClose={() => setIsEditProfileOpen(false)}
            language={language}
            setLanguage={setLanguage}
            isDevMode={isDevMode}
            setIsDevMode={setIsDevMode}
            showDiagnostics={showDiagnostics}
            setShowDiagnostics={handleToggleDiagnostics}
            onSave={async (updated) => {
              const newUser = { ...currentUser, ...updated };
              setCurrentUser(newUser);
              localStorage.setItem("grid_user", JSON.stringify(newUser));

              if (updated.name || updated.avatar) {
                setPosts((prevPosts) => {
                  const updatedPosts = prevPosts.map((p) => {
                    if (
                      p.author === currentUser.name ||
                      p.author === newUser.name
                    ) {
                      return {
                        ...p,
                        author: newUser.name,
                        avatar: newUser.avatar,
                      };
                    }
                    return p;
                  });
                  localStorage.setItem(
                    "grid_posts",
                    JSON.stringify(updatedPosts),
                  );
                  return updatedPosts;
                });
              }

              try {
                await setDoc(doc(db, "users", newUser.id), newUser);
              } catch (e) {
                console.warn("Firestore sync warning:", e);
              }
              setIsEditProfileOpen(false);
              addNotification(
                language === "ar"
                  ? "تم حفظ جميع التغييرات (الصورة الشخصية والبانر والبيانات) بنجاح!"
                  : "Profile, avatar & banner updated successfully.",
                "success",
              );
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiagnostics && (
          <DiagnosticOverlay
            activeGrid={activeGrid}
            currentUser={currentUser}
            onClose={() => handleToggleDiagnostics(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComposerOpen && (
          <ComposerModal
            onClose={() => setIsComposerOpen(false)}
            currentUser={currentUser}
            onPost={handleCreatePost}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReportModalOpen && reportingCommunity && (
          <ReportCommunityModal
            community={reportingCommunity}
            onClose={() => {
              setIsReportModalOpen(false);
              setReportingCommunity(null);
            }}
            onReport={(reason, comments) => {
              setIsReportModalOpen(false);
              setReportingCommunity(null);
              addNotification(
                `Report for "${reportingCommunity.name}" transmitted: ${reason}`,
                "alert",
              );
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateCommunityModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={(name, description, category, image) => {
              const newCommunity: Community = {
                id: "c-" + Math.random().toString(36).substr(2, 5),
                name,
                description,
                category,
                image,
                members: 1,
                createdAt: new Date().toISOString(),
                ownerId: currentUser?.id,
              };
              setCommunities((prev) => [newCommunity, ...prev]);
              setIsCreateModalOpen(false);
              addNotification(
                `Signal cluster "${name}" successfully compiled and synchronized.`,
                "success",
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Global Incoming Call Notification Banner */}
      <IncomingCallBanner
        incomingCall={incomingCallData}
        language={language}
        onAccept={(call) => {
          setIncomingCallData(null);
          setActiveCall({
            type: call.type,
            status: "connected",
            targetId: call.caller.id,
            callId: call.callId,
          });
          setIsCallMinimized(false);
          if (currentUser) {
            callSignaling.sendSignal({
              type: "ANSWER",
              callId: call.callId,
              fromUser: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                isVerified: currentUser.isVerified,
              },
              toUserId: call.caller.id,
              callType: call.type,
              timestamp: Date.now(),
            });
          }
        }}
        onDecline={(call) => {
          setIncomingCallData(null);
          callAudio.stopAllSounds();
          if (currentUser) {
            callSignaling.sendSignal({
              type: "REJECT",
              callId: call.callId,
              fromUser: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
              },
              toUserId: call.caller.id,
              callType: call.type,
              timestamp: Date.now(),
            });
          }
        }}
      />

      <AnimatePresence>
        {activeCall && !isCallMinimized && (
          <VexoraVideoCallModal
            call={activeCall}
            currentUser={currentUser}
            language={language}
            onEnd={() => {
              setActiveCall(null);
              setIsCallMinimized(false);
            }}
            onAccept={() => {
              setActiveCall((prev) =>
                prev ? { ...prev, status: "connected" } : null,
              );
            }}
            onMinimize={() => setIsCallMinimized(true)}
            targetProfile={
              Object.values(MOCK_PROFILES).find(
                (p) =>
                  p.id === activeCall.targetId ||
                  p.name === activeCall.targetId,
              ) || {
                id: activeCall.targetId,
                name: activeCall.targetId,
                handle: activeCall.targetId.toLowerCase().replace(/\s+/g, "_"),
                avatar:
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                banner:
                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop",
                bio: "Vexora Network Node",
                location: "Network Core",
                joinedDate: "2025-01-01",
                following: 0,
                followers: 0,
                isVerified: true,
              }
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateStoryOpen && (
          <CreateStoryModal
            onClose={() => setIsCreateStoryOpen(false)}
            currentUser={currentUser}
            onPublish={handlePublishStory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStoryViewerOpen && stories.length > 0 && (
          <StoryViewerModal
            stories={stories}
            currentIndex={selectedStoryIndex}
            onClose={() => setIsStoryViewerOpen(false)}
            onNavigate={(index) => setSelectedStoryIndex(index)}
            currentUser={currentUser}
            onDeleteStory={handleDeleteStory}
            onAddReply={handleAddStoryReply}
          />
        )}
      </AnimatePresence>

      {showConsole && (
        <OwnerControlCenter
          isOpen={showConsole}
          onClose={() => setShowConsole(false)}
          currentUser={currentUser}
          posts={posts}
          setPosts={setPosts}
          allUsers={userProfilesMap}
          setAllUsers={setUserProfilesMap}
          onSwitchAccount={(user) => {
            setCurrentUser(user);
            try {
              localStorage.setItem("grid_user", JSON.stringify(user));
            } catch (e) {
              console.error("Error saving user profile to storage:", e);
            }
            addNotification(
              language === "ar"
                ? `تم التبديل بنجاح إلى حساب: ${user.name}`
                : `Switched identity to: ${user.name}`,
              "success",
            );
          }}
          onAddNotification={addNotification}
          language={language}
        />
      )}

      {/* Data Vault & Backup Modal */}
      <DataVaultModal
        isOpen={isDataVaultOpen}
        onClose={() => setIsDataVaultOpen(false)}
        language={language}
        currentUser={currentUser}
        posts={posts}
        onRestoreData={handleRestoreData}
        onForceCloudSync={handleForceCloudSync}
      />

      {/* Voice & Sound Control Studio Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        language={language}
      />

      {/* PC Gaming Account Matrix Modal */}
      <GamingAccountsModal
        isOpen={isGamingAccountsOpen}
        onClose={() => setIsGamingAccountsOpen(false)}
        currentUser={currentUser}
        language={language}
      />

      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {activeCall && (currentView !== "messages" || isCallMinimized) && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-6 right-6 z-[450] flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#090810]/95 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                    Active Call / مكالمة جارية
                  </span>
                  <span className="text-xs text-white font-black">
                    {activeCall.type === "video"
                      ? "📹 Video Call"
                      : "📞 Voice Call"}{" "}
                    (
                    {(() => {
                      const mins = Math.floor(callDuration / 60);
                      const secs = callDuration % 60;
                      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                    })()}
                    )
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentView("messages");
                  setIsCallMinimized(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Maximize2 className="w-3.5 h-3.5 font-bold" />
                <span>Return / العودة</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {notifications.map((note) => (
            <NotificationToast
              key={note.id}
              note={note}
              onDismiss={removeNotification}
            />
          ))}
        </AnimatePresence>

        {/* Mobile / Tablet / iPad Bottom Navigation Bar with Responsive Dock Styling */}
        <nav
          id="mobile-bottom-navigation-bar"
          aria-label="Mobile Navigation"
          className="xl:hidden fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl md:max-w-2xl z-40 bg-[#0c091d]/95 sm:bg-[#0c091d]/90 backdrop-blur-2xl border-t sm:border border-white/10 sm:rounded-2xl px-3 py-2 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.6)] sm:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all"
        >
          {/* 1 - Public Feed */}
          <button
            id="mobile-nav-public"
            type="button"
            onClick={() => {
              setActiveGrid("public");
              setCurrentView("feed");
              setSelectedProfileId(null);
            }}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeGrid === "public" &&
              currentView === "feed" &&
              !selectedProfileId
                ? "text-cyan-400 bg-cyan-500/20 font-bold shadow-[inset_0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider">
              {language === "ar" ? "الرئيسية" : "Feed"}
            </span>
          </button>

          {/* 2 - Gaming Hub */}
          <button
            id="mobile-nav-gaming-hub"
            type="button"
            onClick={() => {
              setCurrentView("gaming-hub");
              setSelectedProfileId(null);
            }}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === "gaming-hub"
                ? "text-cyan-400 bg-cyan-500/20 font-bold shadow-[inset_0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Gamepad2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider">
              {language === "ar" ? "الألعاب" : "Games"}
            </span>
          </button>

          {/* 3 - Strategy Arena */}
          <button
            id="mobile-nav-arena"
            type="button"
            onClick={() => {
              setCurrentView("games-arena");
              setSelectedProfileId(null);
            }}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === "games-arena"
                ? "text-cyan-400 bg-cyan-500/20 font-bold shadow-[inset_0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider">
              {language === "ar" ? "الساحة" : "Arena"}
            </span>
          </button>

          {/* 4 - Tournaments */}
          <button
            id="mobile-nav-tournaments"
            type="button"
            onClick={() => {
              setCurrentView("tournaments");
              setSelectedProfileId(null);
            }}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === "tournaments"
                ? "text-yellow-400 bg-yellow-500/20 font-bold shadow-[inset_0_0_10px_rgba(245,158,11,0.3)] ring-1 ring-yellow-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider">
              {language === "ar" ? "البطولات" : "League"}
            </span>
          </button>

          {/* 5 - Messages */}
          <button
            id="mobile-nav-message"
            type="button"
            onClick={() => {
              setCurrentView("messages");
              setSelectedProfileId(null);
            }}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === "messages"
                ? "text-cyan-400 bg-cyan-500/20 font-bold shadow-[inset_0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider">
              {language === "ar" ? "الرسائل" : "Chat"}
            </span>
          </button>

          {/* 6 - My Account */}
          <button
            id="mobile-nav-my-account"
            type="button"
            onClick={() => {
              setCurrentView("my-account");
              setSelectedProfileId(null);
            }}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentView === "my-account"
                ? "text-cyan-400 bg-cyan-500/20 font-bold shadow-[inset_0_0_10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wider">
              {language === "ar" ? "حسابي" : "Profile"}
            </span>
          </button>

          {/* 7 - Owner Tools (Mobile / Tablet) */}
          {isOwner && (
            <button
              id="mobile-nav-owner-tools"
              type="button"
              onClick={() => setShowConsole(true)}
              className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-amber-300 bg-amber-500/20 border border-amber-500/40 animate-pulse font-bold hover:bg-amber-500/30"
            >
              <Crown className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-300" />
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider">
                {language === "ar" ? "المالك 👑" : "Owner 👑"}
              </span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}

function NotificationToast({
  note,
  onDismiss,
}: {
  key?: string | number;
  note: { id: string; message: string; type: string };
  onDismiss: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 w-80
        ${note.type === "alert" ? "bg-red-500/20 border-red-500/50 text-red-100" : "bg-purple-500/20 border-purple-500/50 text-purple-100"}
      `}
    >
      <div
        className={`w-2 h-2 rounded-full animate-pulse ${note.type === "alert" ? "bg-red-500" : "bg-purple-500"}`}
      />
      <span className="text-xs font-bold flex-1">{note.message}</span>
      <button
        onClick={() => onDismiss(note.id)}
        className="p-1 hover:bg-white/10 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function ProfileGrid({
  profile,
  posts,
  currentUser,
  language = "en",
  onOpenDirectChat,
  onInteraction,
  onCommentInteraction,
  onAddComment,
  onProfileClick,
  onEditProfile,
  onSendFriendRequest,
  onToggleFollow,
  onDeleteAccount,
  onInitiateCall,
  onSignOut,
}: {
  key?: string | number;
  profile: UserProfile;
  posts: Post[];
  currentUser: UserProfile | null;
  language?: "en" | "ar";
  onOpenDirectChat?: (targetUserId: string) => void;
  onInteraction: (
    postId: string,
    type:
      | "like"
      | "repost"
      | "comment"
      | "share"
      | "delete"
      | "report"
      | "unlist"
      | "save"
      | "react"
      | "edit",
    reactionType?: ReactionType,
  ) => void;
  onCommentInteraction: (
    postId: string,
    commentId: string,
    type: "delete" | "report" | "like" | "repost",
  ) => void;
  onAddComment: (postId: string, text: string) => void;
  onProfileClick: (author: string) => void;
  onEditProfile?: (tab?: "profile") => void;
  onSendFriendRequest?: (profile: UserProfile) => void;
  onToggleFollow?: (profile: UserProfile) => void;
  onDeleteAccount?: (userProfileId: string) => void;
  onInitiateCall?: (targetUserId: string, type: "voice" | "video") => void;
  onSignOut?: () => void;
}) {
  const userPosts = posts.filter((p) => p.author === profile.name);
  const [activeTab, setActiveTab] = useState<
    "posts" | "activity" | "metrics" | "fellows"
  >("posts");
  const [activityFilter, setActivityFilter] = useState<
    "All" | "Community Join" | "Pulse Created" | "Resonance Activity"
  >("All");
  const isOwnProfile = currentUser?.id === profile.id;
  const isFriend = currentUser?.friendIds?.includes(profile.id);
  const isFollowing = currentUser?.followingIds?.includes(profile.id);

  const activities = useMemo(() => {
    const list: {
      id: string;
      type: "Community Join" | "Pulse Created" | "Resonance Activity";
      title: string;
      description: string;
      timestamp: string;
      iconType: "users" | "pulse" | "sparkles" | "activity" | "message";
    }[] = [];

    // 1. Pulse Created: from real user posts
    userPosts.forEach((post, i) => {
      const excerpt =
        post.content.length > 85
          ? post.content.slice(0, 85) + "..."
          : post.content;
      list.push({
        id: `pulse-${post.id}`,
        type: "Pulse Created",
        title: "Pulse Broadcasted",
        description: `Broadcasted a new quantum pulse: "${excerpt}"`,
        timestamp: post.timestamp || `${i + 1}d ago`,
        iconType: "pulse",
      });
    });

    // If no posts, add a default pulse created
    if (userPosts.length === 0) {
      list.push({
        id: "pulse-default-1",
        type: "Pulse Created",
        title: "Initial Node Setup",
        description: `Initialized new secure node profile under identifier ${profile.name}.`,
        timestamp: "1w ago",
        iconType: "pulse",
      });
    }

    // 2. Community Join
    list.push({
      id: "join-official",
      type: "Community Join",
      title: "Joined Community Node",
      description: `Established neural alignment with Vexora Official Grid 🌐.`,
      timestamp: "2h ago",
      iconType: "users",
    });

    list.push({
      id: "join-cyber",
      type: "Community Join",
      title: "Joined Community Node",
      description: `Established neural alignment with Cyberpunk Art community.`,
      timestamp: "2d ago",
      iconType: "users",
    });

    if (profile.name === "Vexora Owner" || profile.name === "Vexora Admin 🛡️") {
      list.push({
        id: "join-quantum",
        type: "Community Join",
        title: "Joined Community Node",
        description: `Established neural alignment with Quantum Devs.`,
        timestamp: "5d ago",
        iconType: "users",
      });
    }

    // 3. Resonance Activity
    list.push({
      id: "res-like-1",
      type: "Resonance Activity",
      title: "Transmission Liked",
      description: `Liked a post in Vexora Official Grid.`,
      timestamp: "1h ago",
      iconType: "sparkles",
    });

    if (profile.followers > 0) {
      list.push({
        id: "res-follow-1",
        type: "Resonance Activity",
        title: "Connection Handshake Established",
        description: `A companion node successfully connected with your feed.`,
        timestamp: "6h ago",
        iconType: "activity",
      });
    }

    list.push({
      id: "res-comm-1",
      type: "Resonance Activity",
      title: "Pulse Comment Transmitted",
      description: `Injected a payload comment into the global public matrix.`,
      timestamp: "3d ago",
      iconType: "message",
    });

    const relativeOrder: { [key: string]: number } = {
      "1h ago": 1,
      "2h ago": 2,
      "5h ago": 3,
      "6h ago": 4,
      "12h ago": 5,
      "1d ago": 6,
      "2d ago": 7,
      "3d ago": 8,
      "5d ago": 9,
      "1w ago": 10,
    };

    return list.sort((a, b) => {
      const orderA = relativeOrder[a.timestamp] || 99;
      const orderB = relativeOrder[b.timestamp] || 99;
      return orderA - orderB;
    });
  }, [userPosts, profile.name, profile.followers]);

  const filteredActivities = useMemo(() => {
    if (activityFilter === "All") return activities;
    return activities.filter((act) => act.type === activityFilter);
  }, [activities, activityFilter]);

  const isCurrentUserOwner =
    currentUser &&
    (currentUser.email === "fluxstudio4@gmail.com" ||
      currentUser.email === "vexora.network@gmail.com" ||
      currentUser.name === "Vexora Owner" ||
      currentUser.name === "Vexora Admin 🛡️" ||
      currentUser.name === "CyberPioneer" ||
      currentUser.name.includes("صاحب الموقع") ||
      currentUser.name.includes("المالك"));

  const displayFollowers =
    profile.id === currentUser?.id
      ? profile.followers
      : isFollowing
        ? profile.followers + 1
        : profile.followers;

  const displayFollowing = isOwnProfile
    ? (currentUser?.following ?? profile.following)
    : profile.following;

  // Email to Owner Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [encryptionProgress, setEncryptionProgress] = useState("");
  const [transmissionStage, setTransmissionStage] = useState(0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Profile Core */}
      <div className="flux-card !p-0 border-white/5 relative group">
        <div className="h-64 w-full relative overflow-hidden">
          <img
            src={profile.banner}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2000ms] grayscale group-hover:grayscale-0"
            alt="Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        </div>

        <div className="px-12 pb-12 flex flex-col items-start -mt-24 relative z-10">
          <div className="flex justify-between items-end w-full">
            <div className="relative group/avatar">
              <div className="w-40 h-40 rounded-[2.5rem] bg-[#0a0a0a] border-8 border-[#0a0a0a] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
                <img
                  src={profile.avatar}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover/avatar:grayscale-0 group-hover/avatar:scale-110"
                  alt={profile.name}
                />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              </div>
              {profile.isVerified && (
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                  <CheckCircle2 className="w-5 h-5 text-black fill-black" />
                </div>
              )}
              {/* Online status indicator */}
              <div className="absolute -top-1 -right-1 bg-zinc-950/90 border border-white/10 rounded-2xl px-2.5 py-1 flex items-center gap-1.5 shadow-2xl z-20 backdrop-blur-md">
                <OnlineStatusDot lastActive={profile.lastActive} size="sm" />
                <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                  {getOnlineStatus(profile.lastActive).label}
                </span>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap items-center">
              {profile.email === "vexora.network@gmail.com" && (
                <button
                  onClick={() => {
                    setSenderName(currentUser?.name || "");
                    setSenderEmail(currentUser?.email || "");
                    setEmailSubject("");
                    setEmailMessage("");
                    setEmailSuccess(false);
                    setEmailError("");
                    setTransmissionStage(0);
                    setEncryptionProgress("");
                    setIsEmailModalOpen(true);
                  }}
                  className="h-12 px-6 font-black uppercase tracking-[0.12em] text-[10px] rounded-2xl transition-all active:scale-95 flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_45px_rgba(168,85,247,0.6)] border border-purple-500/40 cursor-pointer text-center select-none"
                >
                  <Mail className="w-4 h-4 animate-pulse text-purple-200" />
                  <span>📩 راسل المالك / Contact Owner</span>
                </button>
              )}
              {isOwnProfile ? (
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => onEditProfile?.("profile")}
                    className="flux-button-primary h-12 px-8 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>
                      {language === "ar" ? "تعديل الحساب" : "Edit Profile"}
                    </span>
                  </button>
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      className="h-12 px-6 font-bold uppercase tracking-wider text-xs rounded-2xl transition-all active:scale-95 flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      title={
                        language === "ar"
                          ? "تسجيل الخروج من الحساب"
                          : "Sign Out"
                      }
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>
                        {language === "ar" ? "تسجيل الخروج" : "Log Out"}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {isCurrentUserOwner && (
                    <button
                      onClick={() => onDeleteAccount?.(profile.id)}
                      className="h-12 px-6 bg-red-950/45 border border-red-500/30 text-red-400 hover:text-white hover:bg-red-600 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                    >
                      <Trash2 className="w-4 h-4 animate-pulse" />
                      <span>Purge Node / طرد للحساب للأبد</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenDirectChat?.(profile.id)}
                    className="h-12 px-5 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    title={
                      language === "ar"
                        ? "إرسال رسالة مباشرة للعضو"
                        : "Send direct pulse message"
                    }
                  >
                    <MessageSquare className="w-4 h-4 text-purple-300" />
                    <span>{language === "ar" ? "💬 رسالة" : "Pulse"}</span>
                  </button>
                  <button
                    onClick={() => onInitiateCall?.(profile.id, "voice")}
                    className="h-12 px-5 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    title={
                      language === "ar"
                        ? "بدء مكالمة صوتية مشفرة"
                        : "Start Voice Call"
                    }
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{language === "ar" ? "📞 اتصال صوتي" : "Voice"}</span>
                  </button>
                  <button
                    onClick={() => onInitiateCall?.(profile.id, "video")}
                    className="h-12 px-5 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    title={
                      language === "ar"
                        ? "بدء مكالمة فيديو مباشرة"
                        : "Start Video Call"
                    }
                  >
                    <Video className="w-4 h-4 text-white" />
                    <span>
                      {language === "ar" ? "📹 مكالمة فيديو" : "Video Link"}
                    </span>
                  </button>
                  <button
                    onClick={() => onToggleFollow?.(profile)}
                    className={`h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${
                      isFollowing
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:bg-purple-500/20"
                        : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white hover:brightness-110 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Users className="w-4 h-4 animate-pulse" />
                        <span>👑 Fellow Active</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>🔗 Sync Fellow</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => !isFriend && onSendFriendRequest?.(profile)}
                    className={`h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${isFriend ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default" : "bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.2)]"}`}
                  >
                    {isFriend ? (
                      <>
                        <Check className="w-4 h-4" />
                        Node Synced
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Sync Node
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {language === "ar" ? "الاسم المستعار • Nickname" : "Nickname"}
                </span>
                <h2 className="text-4xl sm:text-5xl font-black italic tracking-tightest uppercase text-white">
                  {profile.name}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/50">
                    {language === "ar" ? "اسم المستخدم • Username" : "Username"}
                    :
                  </span>
                  <span className="text-purple-400 font-mono font-bold tracking-[0.1em] text-xs">
                    @{profile.handle}
                  </span>
                </div>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-white/30 font-mono tracking-[0.2em] text-[10px]">
                  NODE ID: {profile.id.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="max-w-2xl text-white/50 leading-relaxed text-lg font-light">
              {profile.bio}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
                  Signal Range
                </span>
                <span className="text-xl font-black text-white italic">
                  {displayFollowers >= 1000
                    ? `${(displayFollowers / 1000).toFixed(1)}K`
                    : displayFollowers}{" "}
                  Units
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
                  Active Links
                </span>
                <span className="text-xl font-black text-white italic">
                  {displayFollowing >= 1000
                    ? `${(displayFollowing / 1000).toFixed(1)}K`
                    : displayFollowing}{" "}
                  Nodes
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
                  Origin Point
                </span>
                <span className="text-lg font-bold text-white/80">
                  {profile.location}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
                  Link Established
                </span>
                <span className="text-lg font-bold text-white/80">
                  {profile.joinedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl transition-all">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${activeTab === "posts" ? "bg-white/10 text-white border-white/20 shadow-lg" : "text-white/40 border-transparent hover:text-white"}`}
        >
          <Grid3X3 className="w-4 h-4" />
          Pulses
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${activeTab === "activity" ? "bg-white/10 text-white border-white/20 shadow-lg" : "text-white/40 border-transparent hover:text-white"}`}
        >
          <Activity className="w-4 h-4" />
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab("fellows")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${activeTab === "fellows" ? "bg-white/10 text-white border-white/20 shadow-lg" : "text-white/40 border-transparent hover:text-white"}`}
        >
          <Users className="w-4 h-4" />
          Fellows / الرفاق
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${activeTab === "metrics" ? "bg-white/10 text-white border-white/20 shadow-lg" : "text-white/40 border-transparent hover:text-white"}`}
        >
          <BarChart3 className="w-4 h-4" />
          Neural Metrics
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "posts" ? (
          userPosts.length > 0 ? (
            userPosts.map((post, idx) => (
              <PostCard
                key={post.id}
                index={idx}
                post={post}
                currentUser={currentUser}
                language={language}
                onInteraction={(type, reactionType) =>
                  onInteraction(post.id, type, reactionType)
                }
                onCommentInteraction={(postId, commentId, type) =>
                  onCommentInteraction(postId, commentId, type)
                }
                onAddComment={(postId, text) => onAddComment(postId, text)}
                onProfileClick={onProfileClick}
              />
            ))
          ) : (
            <div className="text-center py-20 glass-card bg-white/[0.02] border-white/5">
              <p className="text-white/40 text-xs italic font-medium uppercase tracking-widest">
                No active pulses detected from this node.
              </p>
            </div>
          )
        ) : activeTab === "activity" ? (
          <div className="space-y-6">
            {/* Activity Category Filters */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
              {[
                {
                  id: "All",
                  label: "All Activities",
                  count: activities.length,
                },
                {
                  id: "Community Join",
                  label: "Community Joins",
                  count: activities.filter((a) => a.type === "Community Join")
                    .length,
                },
                {
                  id: "Pulse Created",
                  label: "Pulses Created",
                  count: activities.filter((a) => a.type === "Pulse Created")
                    .length,
                },
                {
                  id: "Resonance Activity",
                  label: "Resonances",
                  count: activities.filter(
                    (a) => a.type === "Resonance Activity",
                  ).length,
                },
              ].map((filter) => {
                const isActive = activityFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActivityFilter(filter.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-[9px] font-mono uppercase tracking-wider font-semibold transition-all border flex items-center gap-2 cursor-pointer select-none ${
                      isActive
                        ? "bg-purple-600/15 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                        : "bg-white/5 border-white/5 text-white/40 hover:text-white/70 hover:bg-white/[0.08]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        filter.id === "Community Join"
                          ? "bg-purple-400"
                          : filter.id === "Pulse Created"
                            ? "bg-emerald-400"
                            : filter.id === "Resonance Activity"
                              ? "bg-yellow-400"
                              : "bg-white/40"
                      }`}
                    />
                    <span>{filter.label}</span>
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded-md ${isActive ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/20"}`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <motion.div
              key={activityFilter}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04,
                  },
                },
              }}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  let icon = <Activity className="w-5 h-5 text-white/40" />;
                  if (act.iconType === "users")
                    icon = <Users className="w-5 h-5 text-purple-400" />;
                  if (act.iconType === "pulse")
                    icon = <Globe className="w-5 h-5 text-emerald-400" />;
                  if (act.iconType === "sparkles")
                    icon = <Sparkles className="w-5 h-5 text-yellow-400" />;
                  if (act.iconType === "activity")
                    icon = <Activity className="w-5 h-5 text-indigo-400" />;
                  if (act.iconType === "message")
                    icon = <MessageSquare className="w-5 h-5 text-cyan-400" />;

                  return (
                    <motion.div
                      key={act.id}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 22,
                          },
                        },
                      }}
                      className="glass-card p-5 border-white/5 bg-white/[0.02] flex items-center gap-4 group hover:border-white/10 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:bg-white/10">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 font-bold">
                            {act.type}
                          </span>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            {act.timestamp}
                          </p>
                        </div>
                        <p className="text-sm text-white/80 mt-1">
                          {act.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1 },
                  }}
                  className="text-center py-20 glass-card bg-white/[0.02] border-white/5"
                >
                  <p className="text-white/40 text-xs italic font-medium uppercase tracking-widest">
                    No activities detected matching this segment.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : activeTab === "fellows" ? (
          <FellowsView
            profile={profile}
            currentUser={currentUser}
            onProfileClick={onProfileClick}
            onToggleFollow={onToggleFollow}
          />
        ) : (
          <EngagementAnalysis posts={userPosts} />
        )}
      </div>

      {/* Cyberpunk Contact Owner Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSendingEmail) {
                  setIsEmailModalOpen(false);
                  setEmailSuccess(false);
                }
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-[550px] bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.15)] max-h-[90vh] flex flex-col"
            >
              {/* Top ambient lights */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.8)]" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Mail className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">
                      إرسال رسالة للمالك / Owner Network Link
                    </h3>
                    <p className="text-[9px] font-mono tracking-wider text-purple-400 uppercase mt-0.5">
                      Destination: vexora.network@gmail.com
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={() => {
                    setIsEmailModalOpen(false);
                    setEmailSuccess(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Success State */}
              {emailSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black uppercase text-emerald-400 tracking-wider font-sans">
                      تم إرسال الرسالة بنجاح!
                    </h4>
                    <p className="text-xs text-white/60 font-mono uppercase tracking-wider max-w-[380px] mx-auto leading-relaxed">
                      Your quantum linkage parcel has been registered and
                      transmitted to the owner's neural matrix
                      (vexora.network@gmail.com) successfully.
                    </p>
                  </div>

                  {/* Secondary launch physical mail client */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 w-full text-center space-y-3">
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.05em] leading-relaxed">
                      هل ترغب في فتح تطبيق البريد الخاص بك لإرسالها كرسالة
                      بريدية حقيقية؟
                      <br />
                      Would you like to duplicate this submission directly to
                      your real email client?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const subject = encodeURIComponent(
                          emailSubject || "Vexora Network Linkage Inquiry",
                        );
                        const bdy = encodeURIComponent(
                          `From: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${emailMessage}`,
                        );
                        window.location.href = `mailto:vexora.network@gmail.com?subject=${subject}&body=${bdy}`;
                      }}
                      className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono uppercase text-[9px] tracking-widest font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Open Real Email Client / إرسال بريد حقيقي مباشر
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEmailModalOpen(false);
                      setEmailSuccess(false);
                    }}
                    className="flux-button-primary w-full h-11"
                  >
                    Return to Terminal / عودة للملف الشخصي
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (
                      !senderName.trim() ||
                      !senderEmail.trim() ||
                      !emailSubject.trim() ||
                      !emailMessage.trim()
                    ) {
                      setEmailError(
                        "يرجى ملء كافة الحقول لإتمام الإرسال (Please fill all inputs)",
                      );
                      return;
                    }
                    setIsSendingEmail(true);
                    setEmailError("");
                    setTransmissionStage(1);
                    setEncryptionProgress(
                      "Establishing quantum handshake with host node...",
                    );
                    await new Promise((r) => setTimeout(r, 600));
                    setTransmissionStage(2);
                    setEncryptionProgress(
                      "Encrypting mail package with SHA-256 protocols...",
                    );
                    await new Promise((r) => setTimeout(r, 800));
                    setTransmissionStage(3);
                    setEncryptionProgress(
                      "Broadcasting parcel metadata to vexora.network@gmail.com...",
                    );
                    await new Promise((r) => setTimeout(r, 700));
                    setTransmissionStage(4);
                    setEncryptionProgress(
                      "Ledger synchronization successfully committed.",
                    );
                    await new Promise((r) => setTimeout(r, 500));
                    setIsSendingEmail(false);
                    setEmailSuccess(true);
                  }}
                  className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1"
                >
                  {emailError && (
                    <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs font-bold text-center">
                      ⚠️ {emailError}
                    </div>
                  )}

                  {/* sender metadata inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] pl-1">
                        Your Identity Name / الاسم الكريم
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSendingEmail}
                        placeholder="e.g. Captain Nemo"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-[#0c0c0e] border border-white/10 focus:border-purple-500/50 rounded-xl h-11 px-4 text-xs text-white transition-all duration-300 focus:outline-none focus:glow-purple outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] pl-1">
                        Your Contact Email / بريد الاتصال بك
                      </label>
                      <input
                        type="email"
                        required
                        disabled={isSendingEmail}
                        placeholder="e.g. nemo@gmail.com"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-[#0c0c0e] border border-white/10 focus:border-purple-500/50 rounded-xl h-11 px-4 text-xs text-white transition-all duration-300 focus:outline-none focus:glow-purple outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Mail Subject */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] pl-1">
                      Link Subject
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSendingEmail}
                      placeholder="e.g. Partnership inquiry"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-[#0c0c0e] border border-white/10 focus:border-purple-500/50 rounded-xl h-11 px-4 text-xs text-white transition-all duration-300 focus:outline-none focus:glow-purple outline-none font-sans"
                    />
                  </div>

                  {/* Mail Message */}
                  <div className="space-y-1 text-left flex-1 flex flex-col">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] pl-1 mb-1">
                      Message Content
                    </label>
                    <textarea
                      required
                      disabled={isSendingEmail}
                      placeholder="Type your message query here to Vexora Owner..."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-[#0c0c0e] border border-white/10 focus:border-purple-500/50 rounded-xl p-4 text-xs text-white transition-all duration-300 focus:outline-none resize-none focus:glow-purple flex-1 min-h-[140px] outline-none font-sans leading-relaxed"
                    />
                  </div>

                  {/* Sending simulation overlay */}
                  {isSendingEmail && (
                    <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                        <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest font-bold">
                          {encryptionProgress}
                        </span>
                      </div>
                      {/* Interactive Progress Bar */}
                      <div className="h-1.5 w-full bg-purple-950/50 rounded-full overflow-hidden border border-purple-500/10">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                          initial={{ width: "0%" }}
                          animate={{
                            width:
                              transmissionStage === 1
                                ? "25%"
                                : transmissionStage === 2
                                  ? "55%"
                                  : transmissionStage === 3
                                    ? "85%"
                                    : "100%",
                          }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom Action buttons */}
                  {!isSendingEmail && (
                    <div className="flex gap-2.5 pt-4 flex-shrink-0">
                      <button
                        type="submit"
                        className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] font-mono uppercase tracking-widest transition-all hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] duration-300 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Transmit Signal
                      </button>

                      {/* Fallback to real mail client immediately */}
                      <button
                        type="button"
                        onClick={() => {
                          const subject = encodeURIComponent(
                            emailSubject || "Inquiry to vexora_owner",
                          );
                          const bdy = encodeURIComponent(
                            `From: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${emailMessage}`,
                          );
                          window.location.href = `mailto:vexora.network@gmail.com?subject=${subject}&body=${bdy}`;
                        }}
                        className="px-5 h-12 rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/5 text-white/70 hover:text-white font-mono uppercase text-[9.5px] tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="Open real e-mail message application"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Real Email
                      </button>
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AuthOverlay({
  mode,
  setMode,
  onSuccess,
  language = "en",
}: {
  mode: "login" | "register";
  setMode: (m: "login" | "register" | "none") => void;
  onSuccess: (user: UserProfile) => void;
  language?: "en" | "ar";
}) {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Nickname
  const [username, setUsername] = useState(""); // Username
  const [birthDate, setBirthDate] = useState(""); // Birth Date
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAuthTab, setActiveAuthTab] = useState<"form" | "video">("form");
  const [isInlineVideoOpen, setIsInlineVideoOpen] = useState(true);

  // OAuth Simulator States
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorProvider, setSimulatorProvider] = useState<
    "google" | "facebook" | "microsoft"
  >("google");
  const [customSimulatorEmail, setCustomSimulatorEmail] = useState("");
  const [customSimulatorName, setCustomSimulatorName] = useState("");
  const [showSimulatorCustomInput, setShowSimulatorCustomInput] =
    useState(false);

  useEffect(() => {
    const handleGoogleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }

      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        onSuccess(event.data.user);
      } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
        setError(`Google Auth Error: ${event.data.error}`);
      }
    };

    window.addEventListener("message", handleGoogleMessage);
    return () => window.removeEventListener("message", handleGoogleMessage);
  }, [onSuccess]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const userRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userRef);
      let userProfile: UserProfile;

      if (userDoc.exists()) {
        userProfile = userDoc.data() as UserProfile;
      } else {
        const cleanHandle = (
          fbUser.displayName ||
          fbUser.email?.split("@")[0] ||
          "node"
        )
          .toLowerCase()
          .replace(/\s+/g, "_");
        userProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || "Vexora Node",
          handle: cleanHandle,
          email: fbUser.email || undefined,
          avatar:
            fbUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanHandle}`,
          banner:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
          location: "Unified Grid Node",
          bio: "Synchronized neural node identity on the real cloud.",
          joinedDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          followers: 24,
          following: 12,
          isVerified: true,
        };
        await setDoc(userRef, userProfile);
      }
      onSuccess(userProfile);
      setIsLoading(false);
    } catch (err: any) {
      console.warn("Failed to sign in with Firebase Google Popup:", err);
      // Fallback to high-fidelity sandbox simulator
      setSimulatorProvider("google");
      setCustomSimulatorName("");
      setCustomSimulatorEmail("");
      setShowSimulatorCustomInput(false);
      setShowSimulator(true);
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const fbUser = result.user;

      const userRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userRef);
      let userProfile: UserProfile;

      if (userDoc.exists()) {
        userProfile = userDoc.data() as UserProfile;
      } else {
        const cleanHandle =
          (fbUser.displayName || fbUser.email?.split("@")[0] || "node")
            .toLowerCase()
            .replace(/\s+/g, "_") + "_fb";
        userProfile = sanitizeForFirestore({
          id: fbUser.uid,
          name: fbUser.displayName || "Vexora Facebook Node",
          handle: cleanHandle,
          email: fbUser.email || `${cleanHandle}@vexora.network`,
          avatar:
            fbUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanHandle}`,
          banner:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
          location: "Unified Grid Node",
          bio: "Synchronized neural node identity on the real cloud via Facebook Link.",
          joinedDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          followers: 15,
          following: 8,
          isVerified: true,
        });
        await setDoc(userRef, userProfile);
      }
      onSuccess(userProfile);
      setIsLoading(false);
    } catch (err: any) {
      console.warn("Failed to sign in with Firebase Facebook Popup:", err);
      // Fallback to high-fidelity sandbox simulator
      setSimulatorProvider("facebook");
      setCustomSimulatorName("");
      setCustomSimulatorEmail("");
      setShowSimulatorCustomInput(false);
      setShowSimulator(true);
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const fbUser = result.user;

      const userRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userRef);
      let userProfile: UserProfile;

      if (userDoc.exists()) {
        userProfile = userDoc.data() as UserProfile;
      } else {
        const cleanHandle =
          (fbUser.displayName || fbUser.email?.split("@")[0] || "node")
            .toLowerCase()
            .replace(/\s+/g, "_") + "_ms";
        userProfile = sanitizeForFirestore({
          id: fbUser.uid,
          name: fbUser.displayName || "Vexora Microsoft Node",
          handle: cleanHandle,
          email: fbUser.email || `${cleanHandle}@vexora.network`,
          avatar:
            fbUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanHandle}`,
          banner:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
          location: "Unified Grid Node",
          bio: "Synchronized neural node identity on the real cloud via Microsoft Link.",
          joinedDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          followers: 45,
          following: 20,
          isVerified: true,
        });
        await setDoc(userRef, userProfile);
      }
      onSuccess(userProfile);
      setIsLoading(false);
    } catch (err: any) {
      console.warn("Failed to sign in with Firebase Microsoft Popup:", err);
      // Fallback to high-fidelity sandbox simulator
      setSimulatorProvider("microsoft");
      setCustomSimulatorName("");
      setCustomSimulatorEmail("");
      setShowSimulatorCustomInput(false);
      setShowSimulator(true);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (mode === "login") {
      const inputVal = email.trim();
      const passwordVal = password.trim();

      // Form validation for login fields: username/email and non-empty password
      if (!inputVal) {
        setError(
          language === "ar"
            ? "يرجى إدخال البريد الإلكتروني أو اسم المستخدم."
            : "Email address or username is required.",
        );
        setIsLoading(false);
        return;
      }

      if (!passwordVal) {
        setError(
          language === "ar"
            ? "يرجى إدخال كلمة المرور."
            : "Password is required.",
        );
        setIsLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 200));

      const inputLower = inputVal.toLowerCase();
      const cleanTarget = inputLower.replace(/^@/, "");

      // 1. First priority: Check existing registered_users saved database
      let foundUser: UserProfile | undefined;
      try {
        const regSaved = localStorage.getItem("registered_users");
        if (regSaved) {
          const list: UserProfile[] = JSON.parse(regSaved);
          foundUser = list.find((u) => {
            if (!u) return false;
            const uEmail = (u.email || "").toLowerCase();
            const uHandle = (u.handle || "").toLowerCase().replace(/^@/, "");
            const uName = (u.name || "").toLowerCase();
            const uPhone = (u.phone || "").toLowerCase();
            return (
              uEmail === inputLower ||
              uHandle === cleanTarget ||
              uName === inputLower ||
              (uPhone && uPhone === inputLower)
            );
          });
        }
      } catch (e) {
        console.warn("Error reading registered_users:", e);
      }

      // 2. Second priority: Check custom accounts map
      if (!foundUser) {
        try {
          const customSaved = localStorage.getItem("vexora_custom_accounts");
          if (customSaved) {
            const customMap: Record<string, UserProfile> = JSON.parse(customSaved);
            const list = Object.values(customMap);
            foundUser = list.find((u) => {
              if (!u) return false;
              const uEmail = (u.email || "").toLowerCase();
              const uHandle = (u.handle || "").toLowerCase().replace(/^@/, "");
              const uName = (u.name || "").toLowerCase();
              return (
                uEmail === inputLower ||
                uHandle === cleanTarget ||
                uName === inputLower
              );
            });
          }
        } catch (e) {
          console.warn("Error reading custom accounts:", e);
        }
      }

      // If matched in registered/custom users, check password & log in directly
      if (foundUser) {
        if (foundUser.password && foundUser.password !== passwordVal) {
          setError(
            language === "ar"
              ? "كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى."
              : "Incorrect password. Please try again.",
          );
          setIsLoading(false);
          return;
        }
        onSuccess(foundUser);
        setIsLoading(false);
        return;
      }

      // 3. Fallback checks for built-in accounts
      if (
        inputLower === "vexora.network@gmail.com" ||
        inputLower === "owner" ||
        inputLower === "admin"
      ) {
        const user = {
          ...MOCK_PROFILES["Vexora Owner"],
          email: "vexora.network@gmail.com",
        };
        onSuccess(user);
        setIsLoading(false);
        return;
      }

      if (
        inputLower === "fluxstudio4@gmail.com" ||
        inputLower === "flux_developer" ||
        inputLower === "flux" ||
        inputLower === "fluxstudio"
      ) {
        const user: UserProfile = {
          id: "u-dev-flux",
          name: "Vexora Developer",
          handle: "flux_developer",
          email: "fluxstudio4@gmail.com",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
          banner:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
          bio: "Senior Quantum Node Engineer & Core Creator.",
          location: "Neural Node 4",
          joinedDate: "May 2026",
          followers: 512,
          following: 256,
          isVerified: true,
        };
        onSuccess(user);
        setIsLoading(false);
        return;
      }

      // Search mock profiles case-insensitively
      const matchedProfileKey = Object.keys(MOCK_PROFILES).find((key) => {
        const p = MOCK_PROFILES[key];
        return (
          key.toLowerCase() === inputLower ||
          p.name.toLowerCase() === inputLower ||
          p.handle.toLowerCase() === inputLower ||
          p.handle.toLowerCase() === `@${inputLower.replace(/^@/, "")}` ||
          (p.email && p.email.toLowerCase() === inputLower)
        );
      });

      let user: UserProfile;
      if (matchedProfileKey) {
        user = {
          ...MOCK_PROFILES[matchedProfileKey],
          email: inputVal.includes("@")
            ? inputVal
            : MOCK_PROFILES[matchedProfileKey].email,
        };
      } else {
        const cleanName = inputVal.includes("@")
          ? inputVal.split("@")[0]
          : inputVal;
        const cleanHandle = cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
        user = {
          id: "u-" + Math.random().toString(36).substr(2, 5),
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          handle: cleanHandle || "vexora_node",
          email: inputVal.includes("@")
            ? inputVal
            : `${cleanHandle}@vexora.network`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanHandle}`,
          banner:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
          location: "Neural Grid",
          bio: "Synchronized neural node identity.",
          joinedDate: "May 2026",
          followers: 12,
          following: 5,
          password: passwordVal,
          isVerified:
            inputLower.includes("flux") ||
            inputLower.includes("admin") ||
            inputLower.includes("owner"),
        };
      }
      onSuccess(user);
    } else {
      // Validate registration fields
      if (!fullName.trim()) {
        setError(
          language === "ar" ? "الاسم المستعار مطلوب." : "Nickname is required.",
        );
        setIsLoading(false);
        return;
      }
      if (!username.trim()) {
        setError(
          language === "ar" ? "اسم المستخدم مطلوب." : "Username is required.",
        );
        setIsLoading(false);
        return;
      }
      if (!email.trim()) {
        setError(
          language === "ar"
            ? "البريد الإلكتروني مطلوب."
            : "Email Address is required.",
        );
        setIsLoading(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError(
          language === "ar"
            ? "يرجى إدخال بريد إلكتروني صالح (مثال: user@domain.com)."
            : "Please enter a valid email address (e.g. user@domain.com).",
        );
        setIsLoading(false);
        return;
      }
      if (!password.trim()) {
        setError(
          language === "ar" ? "كلمة المرور مطلوبة." : "Password is required.",
        );
        setIsLoading(false);
        return;
      }
      if (
        confirmEmail.trim() &&
        confirmEmail.trim().toLowerCase() !== email.trim().toLowerCase()
      ) {
        setError(
          language === "ar"
            ? "تأكيد البريد الإلكتروني غير متطابق."
            : "Email confirmation does not match.",
        );
        setIsLoading(false);
        return;
      }
      if (confirmPassword && confirmPassword !== password) {
        setError(
          language === "ar"
            ? "تأكيد كلمة المرور غير متطابق."
            : "Password confirmation does not match.",
        );
        setIsLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 600));

      const cleanHandle = username.trim().toLowerCase().replace(/\s+/g, "_");
      const user: UserProfile = {
        id: "u-" + Math.random().toString(36).substr(2, 9),
        name: fullName.trim(),
        handle: cleanHandle,
        email: email.trim(),
        password: password.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanHandle}`,
        banner:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
        location: "Peripheral Node",
        bio: "New node in the Vexora Network.",
        joinedDate: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        followers: 0,
        following: 0,
        birthDate: birthDate || "2000-01-01",
      };
      onSuccess(user);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-3xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl sm:max-w-2xl flux-card p-6 sm:p-8 md:p-10 bg-zinc-950/95 border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.8)] my-8 relative"
      >
        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-3xl p-[2px] bg-gradient-to-tr from-cyan-400 via-purple-600 to-indigo-500 shadow-[0_0_35px_rgba(6,182,212,0.5)]">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-black/95 flex items-center justify-center relative">
                <img
                  src="/vexora-logo.jpg"
                  alt="Vexora Network Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-200">
            Vexora Network
          </h2>
          <p className="text-cyan-400/80 text-[10px] font-mono tracking-[0.3em] uppercase mt-1 font-bold">
            {language === "ar"
              ? "بوابة تسجيل الدخول والربط الشبكي"
              : "Decentralized Neural Matrix"}
          </p>
        </div>

        {/* Top Navigation Tabs: Login, Register, and Video Promo */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setActiveAuthTab("form");
            }}
            className={`py-2 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeAuthTab === "form" && mode === "login"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{language === "ar" ? "🔑 دخول" : "Sign In"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setActiveAuthTab("form");
            }}
            className={`py-2 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeAuthTab === "form" && mode === "register"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{language === "ar" ? "✨ حساب جديد" : "Register"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAuthTab("video")}
            className={`py-2 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeAuthTab === "video"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "text-cyan-300 hover:text-white hover:bg-cyan-500/10"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === "ar" ? "🎬 فيديو المنصة" : "Video"}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-mono uppercase tracking-wider animate-shake">
            {error}
          </div>
        )}

        {/* Tab 1: Full Video Showcase Tab */}
        {activeAuthTab === "video" ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <VexoraPromoVideoPlayer
              language={language}
              compact={false}
              autoPlay={true}
              onOpenRegister={() => {
                setActiveAuthTab("form");
                setMode("register");
              }}
              onOpenLogin={() => {
                setActiveAuthTab("form");
                setMode("login");
              }}
            />
          </div>
        ) : (
          <>
            {/* Inline Video Player embedded right above Login / Register form */}
            <div className="mb-5 overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/60 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
              <div
                onClick={() => setIsInlineVideoOpen(!isInlineVideoOpen)}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/60 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-bold text-white font-sans">
                    {language === "ar"
                      ? "فيديو شبكة Vexora الرسمي (Vexora_Network_Ad.mp4)"
                      : "Official Vexora Video (Vexora_Network_Ad.mp4)"}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    MP4
                  </span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 hover:underline">
                  {isInlineVideoOpen
                    ? language === "ar"
                      ? "إخفاء الفيديو ▲"
                      : "Collapse ▲"
                    : language === "ar"
                      ? "تشغيل الفيديو ▼"
                      : "Expand & Play ▼"}
                </span>
              </div>
              {isInlineVideoOpen && (
                <div className="p-2 sm:p-2.5">
                  <VexoraPromoVideoPlayer
                    language={language}
                    compact={true}
                    autoPlay={true}
                  />
                </div>
              )}
            </div>

            {mode === "login" ? (
          <div className="space-y-6">
            {/* Quick Preset Node Login */}
            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl space-y-2">
              <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block text-center font-bold">
                {language === "ar"
                  ? "⚡ دخول سريع بضغطة واحدة"
                  : "⚡ 1-Click Quick Access Presets"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const u =
                      MOCK_PROFILES["Alex Rivera"] ||
                      MOCK_PROFILES["CyberPioneer"];
                    onSuccess(u);
                  }}
                  className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-white font-mono uppercase tracking-wider transition-all text-left flex items-center gap-2 hover:border-purple-500/50 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">Alex Rivera</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const u = MOCK_PROFILES["CyberPioneer"];
                    onSuccess(u);
                  }}
                  className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-white font-mono uppercase tracking-wider transition-all text-left flex items-center gap-2 hover:border-purple-500/50 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="truncate">Cyber Pioneer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("vexora.network@gmail.com");
                    setPassword("KsT'EJG_zML9snp");
                    const u = {
                      ...MOCK_PROFILES["Vexora Owner"],
                      email: "vexora.network@gmail.com",
                    };
                    onSuccess(u);
                  }}
                  className="py-2 px-3 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-xl text-[10px] text-purple-300 font-mono uppercase tracking-wider transition-all text-left flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="truncate">Vexora Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const rand = Math.random()
                      .toString(36)
                      .substr(2, 4)
                      .toUpperCase();
                    const guestUser: UserProfile = {
                      id: "u-guest-" + Math.random().toString(36).substr(2, 5),
                      name: `GUEST_NODE_${rand}`,
                      handle: `guest_node_${rand.toLowerCase()}`,
                      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest-${Date.now()}`,
                      banner:
                        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                      location: "Instant Guest Portal",
                      bio: "Guest identity authorized for session access.",
                      joinedDate: "May 2026",
                      followers: 0,
                      following: 0,
                      isVerified: false,
                    };
                    onSuccess(guestUser);
                  }}
                  className="py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-300 font-mono uppercase tracking-wider transition-all text-left flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">
                    {language === "ar" ? "ضيف سريع" : "Instant Guest"}
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 ml-1">
                  {language === "ar"
                    ? "البريد الإلكتروني أو اسم المستخدم"
                    : "Email Address or Username"}
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all font-light"
                  placeholder={
                    language === "ar"
                      ? "اسم المستخدم أو البريد (مثال: fluxstudio4@gmail.com)"
                      : "Username or email (e.g. fluxstudio4@gmail.com)"
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 ml-1">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all font-light"
                  placeholder={
                    language === "ar"
                      ? "أدخل كلمة المرور"
                      : "Enter your password"
                  }
                  required
                />
              </div>

              <div className="flex justify-end px-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("vexora.network@gmail.com");
                    setPassword("KsT'EJG_zML9snp");
                    if (error) setError(null);
                  }}
                  className="text-[9px] font-mono text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider underline cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {language === "ar"
                    ? "تعبئة بيانات المالك تلقائياً"
                    : "Auto-fill Owner Credentials"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 text-xs cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : language === "ar" ? (
                  "دخول الشبكة"
                ) : (
                  "Establish Link"
                )}
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/20 ml-3">
                  Nickname
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-light"
                  placeholder="e.g. Shadow"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/20 ml-3">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-light"
                  placeholder="e.g. shadow_hacker"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/20 ml-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-light"
                  placeholder="E-mail"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/20 ml-3">
                  Confirm Email (Optional)
                </label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-light"
                  placeholder="Confirm Email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/20 ml-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-light"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/20 ml-3">
                  Confirm Password (Optional)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-light"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/20 ml-3">
                Date of Birth (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-5 text-xs text-white focus:outline-none focus:border-white/40 transition-all font-light"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <div className="flex justify-end px-1">
              <button
                type="button"
                onClick={() => {
                  const rand = Math.floor(Math.random() * 899 + 100);
                  setFullName(`Vexora Node ${rand}`);
                  setUsername(`vexora_node_${rand}`);
                  setEmail(`node${rand}@vexora.network`);
                  setConfirmEmail(`node${rand}@vexora.network`);
                  setPassword(`Password${rand}!`);
                  setConfirmPassword(`Password${rand}!`);
                  setBirthDate("2000-01-01");
                }}
                className="text-[9px] font-mono text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider underline cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
              >
                Auto-fill Demo Registration
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 text-xs mt-4"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                "Register Identity"
              )}
            </button>
          </form>
        )}

        {/* Separator and OAuth Buttons */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-[1px] bg-white/10"></div>
          <span className="px-3 text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">
            OR LINK IDENTITY
          </span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-11 bg-white text-black hover:bg-neutral-100 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.08)] cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.01]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                stroke="none"
                fill="#EA4335"
                d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.97 1 12 1 7.24 1 3.22 3.76 1.34 7.78l3.8 2.95C6.01 7.15 8.78 5.04 12 5.04z"
              />
              <path
                stroke="none"
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2.01 3.73-4.96 3.73-8.55z"
              />
              <path
                stroke="none"
                fill="#FBBC05"
                d="M5.14 14.73A7.16 7.16 0 0 1 4.7 12c0-.96.17-1.88.47-2.74L1.34 6.3C.48 8.01 0 10.05 0 12s.48 3.99 1.34 5.7l3.8-2.97z"
              />
              <path
                stroke="none"
                fill="#34A853"
                d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.93 1.1-3.22 0-5.99-2.11-6.96-5.06l-3.8 2.95C3.22 20.24 7.24 23 12 23z"
              />
            </svg>
            <span className="font-sans tracking-widest text-[10px] font-black uppercase">
              Google Identity Link
            </span>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={handleFacebookSignIn}
            className="w-full h-11 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(24,119,242,0.15)] cursor-pointer hover:shadow-[0_0_30px_rgba(24,119,242,0.3)] hover:scale-[1.01]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="font-sans tracking-widest text-[10px] font-black uppercase">
              Facebook Identity Link
            </span>
          </button>

          {/* Microsoft Button */}
          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            className="w-full h-11 bg-[#2f2f2f] hover:bg-[#3f3f3f] border border-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.03)] cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:scale-[1.01]"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M0 0h11v11H0z" />
              <path fill="#81bc06" d="M12 0h11v11H12z" />
              <path fill="#05a6f0" d="M0 12h11v11H0z" />
              <path fill="#ffba08" d="M12 12h11v11H12z" />
            </svg>
            <span className="font-sans tracking-widest text-[10px] font-black uppercase">
              Microsoft Identity Link
            </span>
          </button>
        </div>

        {/* High-fidelity Multi-provider Simulator Modal Overlay */}
        {showSimulator && (
          <div className="absolute inset-0 bg-white z-50 rounded-3xl flex flex-col p-8 text-neutral-800">
            {/* Header: Brand Logo */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-1.5 font-sans font-semibold text-neutral-700 text-sm">
                {simulatorProvider === "google" && (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        stroke="none"
                        fill="#EA4335"
                        d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.97 1 12 1 7.24 1 3.22 3.76 1.34 7.78l3.8 2.95C6.01 7.15 8.78 5.04 12 5.04z"
                      />
                      <path
                        stroke="none"
                        fill="#4285F4"
                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2.01 3.73-4.96 3.73-8.55z"
                      />
                      <path
                        stroke="none"
                        fill="#FBBC05"
                        d="M5.14 14.73A7.16 7.16 0 0 1 4.7 12c0-.96.17-1.88.47-2.74L1.34 6.3C.48 8.01 0 10.05 0 12s.48 3.99 1.34 5.7l3.8-2.97z"
                      />
                      <path
                        stroke="none"
                        fill="#34A853"
                        d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.93 1.1-3.22 0-5.99-2.11-6.96-5.06l-3.8 2.95C3.22 20.24 7.24 23 12 23z"
                      />
                    </svg>
                    <span>Google Sandbox Auth</span>
                  </>
                )}
                {simulatorProvider === "facebook" && (
                  <>
                    <svg
                      className="w-5 h-5 text-[#1877F2] fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook Sandbox Auth</span>
                  </>
                )}
                {simulatorProvider === "microsoft" && (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M0 0h11v11H0z" />
                      <path fill="#81bc06" d="M12 0h11v11H12z" />
                      <path fill="#05a6f0" d="M0 12h11v11H0z" />
                      <path fill="#ffba08" d="M12 12h11v11H12z" />
                    </svg>
                    <span>Microsoft Sandbox Auth</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSimulator(false);
                  setShowSimulatorCustomInput(false);
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <div className="text-center mt-2 mb-6">
              <h3 className="text-lg font-bold text-neutral-900 font-sans tracking-tight">
                {simulatorProvider === "google" && "Sign in with Google"}
                {simulatorProvider === "facebook" && "Log in with Facebook"}
                {simulatorProvider === "microsoft" &&
                  "Sign in to your Microsoft account"}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                to continue to{" "}
                <span className="font-bold text-purple-600 font-mono text-[11px] tracking-wider">
                  VEXORA.NETWORK
                </span>
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
              {/* Account Selection */}
              {!showSimulatorCustomInput ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-2 text-left">
                    Choose an identity node:
                  </p>

                  {/* Account 1 */}
                  {simulatorProvider === "google" && (
                    <button
                      type="button"
                      onClick={() => {
                        const userProfile = {
                          ...MOCK_PROFILES["Vexora Owner"],
                          isVerified: true,
                        };
                        onSuccess(userProfile);
                        setShowSimulator(false);
                      }}
                      className="w-full p-3 border border-neutral-200 hover:border-purple-500 hover:bg-purple-50/30 rounded-xl flex items-center justify-between transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          VO
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <span>Vexora Owner</span>
                            <span className="text-[7.5px] font-mono tracking-wider font-extrabold bg-purple-100 text-purple-700 px-1 py-0.5 rounded uppercase font-sans">
                              Owner Node
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            vexora.network@gmail.com
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-300 group-hover:text-purple-600 transition-colors">
                        →
                      </span>
                    </button>
                  )}

                  {simulatorProvider === "facebook" && (
                    <button
                      type="button"
                      onClick={() => {
                        const userProfile: UserProfile = {
                          id: "u-fb-pioneer",
                          name: "Cyber Pioneer",
                          handle: "cyber_pioneer",
                          email: "cyber_pioneer@facebook.com",
                          avatar:
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
                          banner:
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                          location: "Sector 7 Grid",
                          bio: "Sensing anomalies in the grid mesh. Pioneer node.",
                          joinedDate: "June 2026",
                          followers: 430,
                          following: 120,
                          isVerified: true,
                        };
                        onSuccess(userProfile);
                        setShowSimulator(false);
                      }}
                      className="w-full p-3 border border-neutral-200 hover:border-[#1877F2] hover:bg-blue-50/30 rounded-xl flex items-center justify-between transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          CP
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <span>Cyber Pioneer</span>
                            <span className="text-[7.5px] font-mono tracking-wider font-extrabold bg-blue-100 text-blue-700 px-1 py-0.5 rounded uppercase font-sans">
                              Active Node
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            cyber_pioneer@facebook.com
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-300 group-hover:text-[#1877F2] transition-colors">
                        →
                      </span>
                    </button>
                  )}

                  {simulatorProvider === "microsoft" && (
                    <button
                      type="button"
                      onClick={() => {
                        const userProfile: UserProfile = {
                          id: "u-ms-architect",
                          name: "Chief Neural Architect",
                          handle: "neural_architect",
                          email: "architect@microsoft.com",
                          avatar:
                            "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
                          banner:
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                          location: "Redmond Core 1",
                          bio: "Sculpting high-dimensional network synapses for Vexora core.",
                          joinedDate: "July 2026",
                          followers: 1250,
                          following: 95,
                          isVerified: true,
                        };
                        onSuccess(userProfile);
                        setShowSimulator(false);
                      }}
                      className="w-full p-3 border border-neutral-200 hover:border-[#f35325] hover:bg-red-50/30 rounded-xl flex items-center justify-between transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f35325] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          CA
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <span>Chief Neural Architect</span>
                            <span className="text-[7.5px] font-mono tracking-wider font-extrabold bg-red-100 text-red-700 px-1 py-0.5 rounded uppercase font-sans">
                              Architect
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            architect@microsoft.com
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-300 group-hover:text-[#f35325] transition-colors">
                        →
                      </span>
                    </button>
                  )}

                  {/* Account 2 */}
                  {simulatorProvider === "google" && (
                    <button
                      type="button"
                      onClick={() => {
                        const userProfile: UserProfile = {
                          id: "u-dev-flux",
                          name: "Vexora Developer",
                          handle: "flux_developer",
                          email: "fluxstudio4@gmail.com",
                          avatar:
                            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
                          banner:
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                          bio: "Senior Quantum Node Engineer.",
                          location: "Neural Node 4",
                          joinedDate: "May 2026",
                          followers: 512,
                          following: 256,
                          isVerified: true,
                        };
                        onSuccess(userProfile);
                        setShowSimulator(false);
                      }}
                      className="w-full p-3 border border-neutral-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl flex items-center justify-between transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          VD
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <span>Vexora Developer</span>
                            <span className="text-[7.5px] font-mono tracking-wider font-extrabold bg-blue-100 text-blue-700 px-1 py-0.5 rounded uppercase font-sans">
                              Dev Node
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            fluxstudio4@gmail.com
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-300 group-hover:text-blue-600 transition-colors">
                        →
                      </span>
                    </button>
                  )}

                  {simulatorProvider === "facebook" && (
                    <button
                      type="button"
                      onClick={() => {
                        const userProfile: UserProfile = {
                          id: "u-fb-ambassador",
                          name: "Vexora Ambassador",
                          handle: "vex_ambassador",
                          email: "ambassador@facebook.com",
                          avatar:
                            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
                          banner:
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                          location: "Global Grid",
                          bio: "Spreading the light of Vexora nodes worldwide.",
                          joinedDate: "April 2026",
                          followers: 980,
                          following: 340,
                          isVerified: true,
                        };
                        onSuccess(userProfile);
                        setShowSimulator(false);
                      }}
                      className="w-full p-3 border border-neutral-200 hover:border-[#1877F2] hover:bg-blue-50/30 rounded-xl flex items-center justify-between transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          VA
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <span>Vexora Ambassador</span>
                            <span className="text-[7.5px] font-mono tracking-wider font-extrabold bg-blue-100 text-blue-700 px-1 py-0.5 rounded uppercase font-sans">
                              Ambassador
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            ambassador@facebook.com
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-300 group-hover:text-[#1877F2] transition-colors">
                        →
                      </span>
                    </button>
                  )}

                  {simulatorProvider === "microsoft" && (
                    <button
                      type="button"
                      onClick={() => {
                        const userProfile: UserProfile = {
                          id: "u-ms-admin",
                          name: "Cloud Admin",
                          handle: "cloud_admin",
                          email: "admin@microsoft.com",
                          avatar:
                            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
                          banner:
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                          location: "Azure Core Redmond",
                          bio: "Overseeing global virtual container cluster synchronization.",
                          joinedDate: "March 2026",
                          followers: 320,
                          following: 110,
                          isVerified: true,
                        };
                        onSuccess(userProfile);
                        setShowSimulator(false);
                      }}
                      className="w-full p-3 border border-neutral-200 hover:border-[#f35325] hover:bg-red-50/30 rounded-xl flex items-center justify-between transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#ffba08] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          AD
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <span>Cloud Admin</span>
                            <span className="text-[7.5px] font-mono tracking-wider font-extrabold bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded uppercase font-sans">
                              Admin
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            admin@microsoft.com
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-300 group-hover:text-[#f35325] transition-colors">
                        →
                      </span>
                    </button>
                  )}

                  {/* Account 3: Use Another Account */}
                  <button
                    type="button"
                    onClick={() => setShowSimulatorCustomInput(true)}
                    className="w-full p-3 border border-dashed border-neutral-300 hover:border-neutral-550 rounded-xl flex items-center justify-between transition-all group cursor-pointer text-left text-neutral-600 hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center bg-neutral-100 font-bold text-xs text-neutral-500 group-hover:bg-neutral-200">
                        +
                      </div>
                      <div>
                        <div className="text-xs font-bold font-sans">
                          {simulatorProvider === "google" &&
                            "Use another Google account"}
                          {simulatorProvider === "facebook" &&
                            "Use another Facebook account"}
                          {simulatorProvider === "microsoft" &&
                            "Use another Microsoft account"}
                        </div>
                        <div className="text-[9px] text-neutral-400">
                          Join as a custom verified entity
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-300 group-hover:text-neutral-600 transition-colors">
                      →
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1 text-left">
                    Enter quantum link credentials:
                  </p>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest pl-1 font-sans">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alice Carter"
                      value={customSimulatorName}
                      onChange={(e) => setCustomSimulatorName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg h-10 px-4 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-500 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest pl-1 font-sans">
                      {simulatorProvider === "google" &&
                        "Gmail / Email Address"}
                      {simulatorProvider === "facebook" &&
                        "Facebook Email / Username"}
                      {simulatorProvider === "microsoft" &&
                        "Microsoft Account / Email"}
                    </label>
                    <input
                      type="email"
                      placeholder={
                        simulatorProvider === "google"
                          ? "e.g. alice@gmail.com"
                          : simulatorProvider === "facebook"
                            ? "e.g. alice@facebook.com"
                            : "e.g. alice@outlook.com"
                      }
                      value={customSimulatorEmail}
                      onChange={(e) => setCustomSimulatorEmail(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg h-10 px-4 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-500 transition-all font-sans"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSimulatorCustomInput(false)}
                      className="flex-1 py-2.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-bold text-neutral-600 transition-all cursor-pointer font-sans"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!customSimulatorEmail.trim()}
                      onClick={() => {
                        const email = customSimulatorEmail.trim().toLowerCase();
                        let userProfile: UserProfile;

                        if (
                          simulatorProvider === "google" &&
                          email === "vexora.network@gmail.com"
                        ) {
                          userProfile = {
                            ...MOCK_PROFILES["Vexora Owner"],
                            isVerified: true,
                          };
                        } else if (
                          simulatorProvider === "facebook" &&
                          email === "cyber_pioneer@facebook.com"
                        ) {
                          userProfile = {
                            id: "u-fb-pioneer",
                            name: "Cyber Pioneer",
                            handle: "cyber_pioneer",
                            email: "cyber_pioneer@facebook.com",
                            avatar:
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
                            banner:
                              "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                            location: "Sector 7 Grid",
                            bio: "Sensing anomalies in the grid mesh. Pioneer node.",
                            joinedDate: "June 2026",
                            followers: 430,
                            following: 120,
                            isVerified: true,
                          };
                        } else if (
                          simulatorProvider === "microsoft" &&
                          email === "architect@microsoft.com"
                        ) {
                          userProfile = {
                            id: "u-ms-architect",
                            name: "Chief Neural Architect",
                            handle: "neural_architect",
                            email: "architect@microsoft.com",
                            avatar:
                              "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
                            banner:
                              "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                            location: "Redmond Core 1",
                            bio: "Sculpting high-dimensional network synapses for Vexora core.",
                            joinedDate: "July 2026",
                            followers: 1250,
                            following: 95,
                            isVerified: true,
                          };
                        } else {
                          const name =
                            customSimulatorName.trim() || email.split("@")[0];
                          const handleSuffix =
                            simulatorProvider === "facebook"
                              ? "_fb"
                              : simulatorProvider === "microsoft"
                                ? "_ms"
                                : "";
                          userProfile = {
                            id:
                              `u-${simulatorProvider}-` +
                              Math.random().toString(36).substr(2, 5),
                            name: name,
                            handle:
                              email
                                .split("@")[0]
                                .toLowerCase()
                                .replace(/\s+/g, "_") + handleSuffix,
                            email: email,
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                            banner:
                              "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop",
                            location: "Verified Neural Node",
                            bio: `${simulatorProvider.toUpperCase()} authorized neural quantum link identifier.`,
                            joinedDate: "June 2026",
                            followers: 100,
                            following: 80,
                            isVerified: true,
                          };
                        }

                        onSuccess(userProfile);
                        setShowSimulator(false);
                      }}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans"
                    >
                      Verify Link
                    </button>
                  </div>
                </div>
              )}

              {/* Informational Note */}
              <div className="mt-6 border-t border-neutral-100 pt-4 text-[9px] text-neutral-400 font-mono uppercase tracking-wider leading-relaxed text-center">
                <span>
                  🔒 Secure Sandbox Mode. Setup{" "}
                  {simulatorProvider.toUpperCase()} OAuth in{" "}
                </span>
                <span className="font-bold text-purple-600">
                  Settings &gt; Secrets
                </span>
                <span>
                  {" "}
                  to enable real, live {simulatorProvider.toUpperCase()}{" "}
                  Identity linkage on the server backend.
                </span>
              </div>
            </div>
          </div>
        )}
        </>
        )}

        <button
          type="button"
          onClick={() => setMode("none")}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20"
          title={
            language === "ar" ? "إغلاق وتصفح المنصة" : "Close / Browse Platform"
          }
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-3 items-center">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-purple-400 hover:text-purple-300 transition-colors text-[10px] font-mono uppercase tracking-[0.2em] font-bold cursor-pointer hover:underline"
          >
            {mode === "login"
              ? language === "ar"
                ? "ليس لديك حساب؟ إنشاء حساب جديد"
                : "New node? Register here"
              : language === "ar"
                ? "لديك حساب بالفعل؟ تسجيل الدخول"
                : "Existing node? Authenticate"}
          </button>

          <button
            type="button"
            onClick={() => setMode("none")}
            className="text-white/40 hover:text-white/80 transition-colors text-[9px] font-mono uppercase tracking-widest cursor-pointer"
          >
            {language === "ar"
              ? "← التصفح كزائر بدون تسجيل"
              : "← Continue browsing as guest"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  activeColor = "text-white",
  badge,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  activeColor?: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative
        ${active ? "bg-white/10 shadow-lg" : "hover:bg-white/5 text-white/60 hover:text-white"}
      `}
    >
      <div
        className={`${active ? activeColor : "group-hover:scale-110 transition-transform"}`}
      >
        {icon}
      </div>
      <span
        className={`hidden md:block text-sm font-medium ${active ? "text-white" : ""} flex-1 text-left`}
      >
        {label}
      </span>
      {badge && (
        <span className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[7px] font-black uppercase tracking-tighter text-purple-400">
          <CheckCircle2 className="w-2 h-2 fill-current" />
          {badge}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 w-1 h-6 bg-current rounded-r-full"
          style={{ color: "inherit" }}
        />
      )}
    </button>
  );
}

function NeuralLinkOfflineBanner({
  onCheck,
  isChecking,
}: {
  onCheck: () => void;
  isChecking: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-left max-w-md mx-auto space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
            Neural Link Offline
          </h4>
          <p className="text-[9px] font-mono uppercase tracking-widest text-amber-500/70 mt-0.5">
            GEMINI_API_KEY Missing
          </p>
        </div>
      </div>

      <p className="text-xs text-amber-200/80 leading-relaxed">
        The Vexora core requires a valid Gemini API Key to establish a natural
        language interface.
      </p>

      <div className="space-y-2 pt-1">
        <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold">
          Setup Instructions:
        </p>
        <ol className="text-xs text-amber-200/70 space-y-2 list-decimal list-inside pl-1 bg-black/20 p-3 rounded-xl border border-white/5 font-mono text-[11px]">
          <li>
            Open the{" "}
            <span className="text-white font-bold">Settings Panel</span> (gear
            icon) on the top right.
          </li>
          <li>
            Navigate to <span className="text-white font-bold">Secrets</span>.
          </li>
          <li>
            Add a new secret key:{" "}
            <span className="text-amber-400 font-bold">GEMINI_API_KEY</span>
          </li>
          <li>
            Paste your key from Google AI Studio and click{" "}
            <span className="text-white font-bold">Save</span>.
          </li>
        </ol>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onCheck}
          disabled={isChecking}
          className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-500/50 text-black text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Verifying Link...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Check Connection
            </>
          )}
        </button>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-4 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/80 hover:text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
        >
          <HelpCircle className="w-4 h-4" />
          Get Key
        </a>
      </div>
    </motion.div>
  );
}

const EMOJI_CATEGORIES = [
  {
    name: "Smileys & People",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🥸",
      "🤩",
      "🥳",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖",
      "😫",
      "😩",
      "🥺",
      "😢",
      "😭",
      "😤",
      "😠",
      "😡",
      "🤬",
      "🤯",
      "😳",
      "🥵",
      "🥶",
      "😱",
      "😨",
      "😰",
      "😥",
      "😓",
      "🤗",
      "🤔",
      "🎒",
      "🤭",
      "🤫",
      "🤥",
      "😶",
      "😐",
      "😑",
      "😬",
      "🫨",
      "🫠",
      "🙄",
      "😯",
      "😦",
      "😧",
      "😮",
      "😲",
      "🥱",
      "😴",
      "🤤",
      "😪",
      "😵",
      "😵‍💫",
      "🤐",
      "🥴",
      "🤢",
      "🤮",
      "🤧",
      "😷",
      "🤒",
      "🤕",
      "🤑",
      "🤠",
      "😈",
      "👿",
      "💩",
      "👻",
      "💀",
      "☠️",
      "👽",
      "👾",
      "🤖",
      "🎃",
      "⭐",
      "🌟",
    ],
  },
  {
    name: "Tech & Cyberpunk",
    emojis: [
      "✨",
      "🚀",
      "⚡",
      "🔋",
      "💻",
      "💾",
      "📡",
      "🛸",
      "🪐",
      "🌌",
      "🦾",
      "🦿",
      "🧬",
      "🧪",
      "⚙️",
      "🧩",
      "🔮",
      "⚔️",
      "🛡️",
      "🔭",
      "🔬",
    ],
  },
  {
    name: "Fruits & Nature",
    emojis: [
      "🍌",
      "🍏",
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🥑",
      "🥦",
      "🥬",
      "🫛",
    ],
  },
  {
    name: "Gestures & Hearts",
    emojis: [
      "👍",
      "👎",
      "👊",
      "✊",
      "🤛",
      "🤜",
      "🤞",
      "✌️",
      "🤟",
      "🤘",
      "👌",
      "🤌",
      "🤏",
      "👈",
      "👉",
      "👆",
      "👇",
      "☝️",
      "✋",
      "🤚",
      "🖐️",
      "🖖",
      "👋",
      "✍️",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🙏",
      "🤝",
      "💅",
      "🤳",
      "💪",
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "🔥",
      "💯",
      "🎉",
    ],
  },
];

function VexoraAITerminal() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    {
      role: "user" | "assistant";
      text: string;
      attachments?: {
        type: "voice" | "image" | "file" | "video";
        url: string;
        name?: string;
        mimeType?: string;
        base64?: string;
      }[];
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [personality, setPersonality] = useState<"vexora" | "banana">("vexora");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const userName = "Alex";
  const [systemPrompt, setSystemPrompt] = useState(
    `You are Vexora AI, a quantum-enhanced artificial intelligence terminal. You are helpful, friendly, and professional. You respond primarily in English. Your name is Vexora AI. Welcome the user as ${userName} initially if it fits the context. Always use a verified badge emoji ✨ or similar in your identity if describing yourself.`,
  );

  // Custom states for Voice, Emojis, Images, Videos, and Files
  const [pendingAttachments, setPendingAttachments] = useState<
    {
      type: "voice" | "image" | "file" | "video";
      url: string;
      name?: string;
      mimeType?: string;
      base64?: string;
    }[]
  >([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<
    string | null
  >(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<any>(null);

  // Input references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkApiKeyStatus = async () => {
    setIsCheckingKey(true);
    try {
      const response = await fetch("/api/ai/status");
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
      }
    } catch (err) {
      console.error("Failed checking API key status", err);
    } finally {
      setIsCheckingKey(false);
    }
  };

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleEditSave = (index: number) => {
    if (!editingText.trim()) return;
    const updatedMessages = [...messages];
    updatedMessages[index].text = editingText;
    setMessages(updatedMessages);
    setEditingIndex(null);
    setEditingText("");
  };

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/mp3",
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const newAttachment = {
              type: "voice" as const,
              url: URL.createObjectURL(audioBlob),
              name: `voice_${Date.now()}.mp3`,
              mimeType: "audio/mp3",
              base64: base64data,
            };
            setPendingAttachments((prev) => [...prev, newAttachment]);
          };
          reader.readAsDataURL(audioBlob);

          // Stop all tracks to release mic icon/use
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingDuration(0);

        recordingIntervalRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error("Microphone API not available");
      }
    } catch {
      // Graceful simulated recording fallback when microphone permission is denied
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      mediaRecorderRef.current = {
        stop: () => {
          const simulatedAttachment = {
            type: "voice" as const,
            url: "",
            name: `neural_voice_${Date.now()}.wav`,
            mimeType: "audio/wav",
            base64:
              "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
          };
          setPendingAttachments((prev) => [...prev, simulatedAttachment]);
        },
        stream: null,
      } as any;
    }
  };

  const stopRecording = (shouldSave: boolean) => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        if (!shouldSave) {
          mediaRecorderRef.current.onstop = null;
          if (typeof mediaRecorderRef.current.stop === "function") {
            try {
              mediaRecorderRef.current.stop();
            } catch {}
          }
          if (mediaRecorderRef.current.stream) {
            try {
              mediaRecorderRef.current.stream
                .getTracks()
                .forEach((t: any) => t.stop());
            } catch {}
          }
        } else {
          if (typeof mediaRecorderRef.current.stop === "function") {
            try {
              mediaRecorderRef.current.stop();
            } catch {}
          }
        }
      }
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleAddFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        let type: "image" | "video" | "voice" | "file" = "file";

        if (file.type.startsWith("image/")) {
          type = "image";
        } else if (file.type.startsWith("video/")) {
          type = "video";
        } else if (file.type.startsWith("audio/")) {
          type = "voice";
        }

        const newAttachment = {
          type,
          url: URL.createObjectURL(file),
          name: file.name,
          mimeType: file.type,
          base64: base64data,
        };

        setPendingAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (text: string) => {
    const input = text || query;
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

    setEditingIndex(null);
    setEditingText("");

    const userMessage = {
      role: "user" as const,
      text: input,
      attachments: pendingAttachments,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setQuery("");
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt,
        }),
      });

      if (!response.ok) throw new Error("Failed to reach neural core");
      const data = await response.json();

      if (data.text && data.text.includes("Neural Link Offline:")) {
        setHasApiKey(false);
      } else {
        setHasApiKey(true);
      }
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch (error) {
      console.error("Neural Link Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "An error occurred while connecting to the quantum network. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-2xl mx-auto glass-card border-none bg-black/40 overflow-hidden relative">
      {/* Header with Settings Toggle */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-all ${showSettings ? "bg-purple-500 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 top-0 z-30 p-6 bg-zinc-900/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-purple-400">
                  Core Intelligence Config
                </h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setPersonality("vexora");
                    setSystemPrompt(
                      `You are Vexora AI, a quantum-enhanced artificial intelligence terminal. You are helpful, friendly, and professional. You respond primarily in English. Your name is Vexora AI. Welcome the user as ${userName} initially if it fits the context. Always use a verified badge emoji ✨ or similar in your identity if describing yourself.`,
                    );
                  }}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${personality === "vexora" ? "bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-white/5 border-white/10 text-white/40"}`}
                >
                  Vexora Core
                </button>
                <button
                  onClick={() => {
                    setPersonality("banana");
                    setSystemPrompt(
                      `You are Banana Bot, a high-energy, fruit-themed assistant. You love banana puns and use banana emojis frequently 🍌. You are helpful but slightly eccentric. You refer to yourself as Banana Bot. You respond primarily in English. Welcome the user as ${userName} with a big banana-themed greeting.`,
                    );
                  }}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${personality === "banana" ? "bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "bg-white/5 border-white/10 text-white/40"}`}
                >
                  Banana Bot
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                  System Instructions
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white/80 focus:outline-none focus:border-purple-500/50 resize-none font-mono leading-relaxed"
                  placeholder="Define AI behavior..."
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-white/20 italic">
                  Changes apply to future messages in this session.
                </p>
                <button
                  onClick={() => {
                    setSystemPrompt(
                      `You are Vexora AI, a quantum-enhanced artificial intelligence terminal. You are helpful, friendly, and professional. You respond primarily in English. Your name is Vexora AI. Welcome the user as ${userName} initially if it fits the context. Always use a verified badge emoji ✨ or similar in your identity if describing yourself.`,
                    );
                  }}
                  className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-purple-400 transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area / Welcome Screen */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center min-h-full space-y-12 py-10"
            >
              {/* Animated Vexora Ring */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-purple-500/20"
                />
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                        className="absolute w-10 h-5 rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 blur-[2px]"
                        style={{
                          transform: `rotate(${i * 45}deg) translateY(-35px)`,
                        }}
                      />
                    ))}
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] z-10"
                  >
                    <Sparkles className="w-6 h-6 text-black" />
                  </motion.div>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-display font-black text-white flex items-center justify-center gap-3">
                  <span className="text-purple-400">✨</span>
                  Have a great day, {userName}
                </h2>
                <p className="text-white/40 uppercase tracking-[0.3em] font-bold text-[10px]">
                  Vexora Network Intelligence v4.0
                </p>
              </div>

              {/* Quick Actions / Offline Alert */}
              {hasApiKey === false ? (
                <div className="w-full max-w-md">
                  <NeuralLinkOfflineBanner
                    onCheck={checkApiKeyStatus}
                    isChecking={isCheckingKey}
                  />
                </div>
              ) : (
                <div className="w-full space-y-3 max-w-md">
                  <SuggestionCard
                    icon={<Search className="w-4 h-4" />}
                    text="I need to search for something"
                    onClick={() => handleSend("I need to search for something")}
                  />
                  <SuggestionCard
                    icon={<ImageIcon className="w-4 h-4" />}
                    text="I want to write a message to a classmate"
                    onClick={() =>
                      handleSend("I want to write a message to a classmate")
                    }
                  />
                  <SuggestionCard
                    icon={<TrendingUp className="w-4 h-4" />}
                    text="I want to plan a trip"
                    onClick={() => handleSend("I want to plan a trip")}
                  />
                  <SuggestionCard
                    icon={<Sparkles className="w-4 h-4" />}
                    text="I need help with my homework"
                    onClick={() => handleSend("I need help with my homework")}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pt-4 pb-10"
            >
              {messages.map((msg, i) => {
                const isOfflineWarning =
                  msg.role === "assistant" &&
                  msg.text &&
                  msg.text.includes("Neural Link Offline:");
                if (isOfflineWarning) {
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full flex justify-center py-2"
                    >
                      <NeuralLinkOfflineBanner
                        onCheck={checkApiKeyStatus}
                        isChecking={isCheckingKey}
                      />
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border relative ${msg.role === "user" ? "bg-white/10 border-white/20" : personality === "banana" ? "bg-yellow-500 border-yellow-400" : "bg-purple-500 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"}`}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4 text-white/60" />
                        ) : personality === "banana" ? (
                          <span className="text-sm">🍌</span>
                        ) : (
                          <Bot className="w-4 h-4 text-black" />
                        )}
                        {msg.role === "assistant" && personality === "flux" && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-2 h-2 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end relative group">
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed dir-rtl ${msg.role === "user" ? "bg-white/5 text-white border border-white/10 rounded-tr-none" : "bg-purple-500/10 text-purple-50 text-right border border-purple-500/20 rounded-tl-none"}`}
                        >
                          {editingIndex === i ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-none min-h-[60px] dir-rtl"
                                autoFocus
                              />
                              <div className="flex justify-start gap-2">
                                <button
                                  onClick={() => handleEditSave(i)}
                                  className="p-1.5 bg-purple-500 rounded-md text-white hover:bg-purple-600 transition-colors"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingIndex(null)}
                                  className="p-1.5 bg-white/10 rounded-md text-white/60 hover:bg-white/20 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {msg.text && (
                                <p className="whitespace-pre-wrap">
                                  {msg.text}
                                </p>
                              )}
                              {msg.attachments &&
                                msg.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2 flex flex-col items-stretch max-w-[280px] sm:max-w-sm">
                                    {msg.attachments.map((att, attIdx) => {
                                      if (att.type === "image") {
                                        return (
                                          <div
                                            key={attIdx}
                                            className="relative rounded-xl overflow-hidden border border-white/10 group/img"
                                          >
                                            <img
                                              src={att.url}
                                              alt={att.name || "Attachment"}
                                              referrerPolicy="no-referrer"
                                              className="max-w-full max-h-60 object-cover cursor-pointer hover:scale-105 transition-transform"
                                              onClick={() =>
                                                setSelectedLightboxImage(
                                                  att.url,
                                                )
                                              }
                                            />
                                          </div>
                                        );
                                      } else if (att.type === "voice") {
                                        return (
                                          <div
                                            key={attIdx}
                                            className="w-full min-w-[240px] max-w-sm my-1"
                                          >
                                            <AudioWaveformVisualizer
                                              audioUrl={att.url}
                                              variant="purple"
                                              language="en"
                                              title="Voice Message"
                                            />
                                          </div>
                                        );
                                      } else if (att.type === "video") {
                                        return (
                                          <div
                                            key={attIdx}
                                            className="relative rounded-xl overflow-hidden border border-white/10 max-w-full"
                                          >
                                            <video
                                              src={att.url}
                                              controls
                                              className="w-full max-h-60 rounded-xl"
                                            />
                                          </div>
                                        );
                                      } else {
                                        // general file
                                        return (
                                          <div
                                            key={attIdx}
                                            className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 flex-shrink-0">
                                                <FileText className="w-3.5 h-3.5" />
                                              </div>
                                              <div className="min-w-0 text-left">
                                                <p className="text-[11px] font-mono font-bold text-white/80 truncate">
                                                  {att.name || "File"}
                                                </p>
                                                <p className="text-[9px] font-mono text-white/40 uppercase truncate">
                                                  {att.mimeType?.split(
                                                    "/",
                                                  )[1] || "Doc"}
                                                </p>
                                              </div>
                                            </div>
                                            <a
                                              href={att.url}
                                              download={
                                                att.name || "attachment"
                                              }
                                              target="_blank"
                                              rel="noreferrer"
                                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all flex-shrink-0"
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                            </a>
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        {msg.role === "user" && editingIndex !== i && (
                          <button
                            onClick={() => {
                              setEditingIndex(i);
                              setEditingText(msg.text);
                            }}
                            className="opacity-0 group-hover:opacity-100 absolute -left-8 top-2 p-1.5 text-white/20 hover:text-white/60 transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border relative ${personality === "banana" ? "bg-yellow-500 border-yellow-400" : "bg-purple-500 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"}`}
                    >
                      {personality === "banana" ? (
                        <span className="text-sm">🍌</span>
                      ) : (
                        <Bot className="w-4 h-4 text-black" />
                      )}
                      {personality === "flux" && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full border-2 border-zinc-950 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-2 h-2 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-2xl border flex items-center gap-2 ${personality === "banana" ? "bg-yellow-500/10 border-yellow-500/20 rounded-tl-none" : "bg-purple-500/10 border-purple-500/20 rounded-tl-none"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-bounce ${personality === "banana" ? "bg-yellow-400" : "bg-purple-400"}`}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${personality === "banana" ? "bg-yellow-400" : "bg-purple-400"}`}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${personality === "banana" ? "bg-yellow-400" : "bg-purple-400"}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden file triggers */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[999] flex items-center justify-center p-4"
            onClick={() => setSelectedLightboxImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              onClick={() => setSelectedLightboxImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedLightboxImage}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="p-4 bg-gradient-to-t from-black to-transparent relative">
        {/* Custom Emoji Picker Overlay */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 right-4 z-30 w-72 max-h-80 bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                  Insert Emojis
                </span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-white/40 hover:text-white p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-60 custom-scrollbar text-left">
                {EMOJI_CATEGORIES.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-1">
                    <h5 className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                      {cat.name}
                    </h5>
                    <div className="grid grid-cols-7 gap-1">
                      {cat.emojis.map((emoji, emoIdx) => (
                        <button
                          key={emoIdx}
                          type="button"
                          onClick={() => {
                            setQuery((prev) => prev + emoji);
                          }}
                          className="h-8 w-8 flex items-center justify-center hover:bg-white/10 active:bg-white/15 rounded-lg text-lg transition-colors cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending Attachments Preview */}
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 mb-3 bg-white/5 border border-white/10 rounded-xl max-h-32 overflow-y-auto">
            {pendingAttachments.map((att, index) => (
              <div
                key={index}
                className="relative flex items-center gap-2 p-1.5 pl-2 pr-8 bg-zinc-900 border border-white/5 rounded-lg text-xs min-w-[120px] max-w-[180px]"
              >
                {att.type === "image" && (
                  <img
                    src={att.url}
                    alt="preview"
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                {att.type === "video" && (
                  <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <Video className="w-4 h-4" />
                  </div>
                )}
                {att.type === "voice" && (
                  <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Mic className="w-4 h-4" />
                  </div>
                )}
                {att.type === "file" && (
                  <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold truncate text-[10px] text-white/80">
                    {att.name || "Attachment"}
                  </p>
                  <p className="text-[9px] text-white/40 uppercase font-mono">
                    {att.type}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPendingAttachments((prev) =>
                      prev.filter((_, i) => i !== index),
                    );
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative glass-card border-white/10 bg-black/60 p-1 flex items-center gap-2 group focus-within:neon-border-purple transition-all">
          <button
            onClick={() => {
              if (isRecording) {
                stopRecording(true);
              } else {
                startRecording();
              }
            }}
            className={`p-3 rounded-xl transition-colors ${isRecording ? "text-red-500 bg-red-500/10 animate-pulse" : "text-white/40 hover:text-white"}`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {isRecording ? (
            <div className="flex-1 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs text-red-400 font-mono font-bold uppercase tracking-wider">
                  Recording Voice...
                </p>
                <span className="text-xs text-white/60 font-mono font-bold bg-white/5 px-2 py-0.5 rounded-md">
                  {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, "0")}
                </span>
                <div className="flex items-center gap-0.5 h-4 pl-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <motion.div
                      key={bar}
                      animate={{ height: [4, 16, 4] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: bar * 0.1,
                      }}
                      className="w-0.5 bg-red-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => stopRecording(false)}
                  className="text-[10px] text-white/40 hover:text-white uppercase font-black tracking-wider bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => stopRecording(true)}
                  className="text-[10px] text-white bg-red-500 hover:bg-red-600 uppercase font-black tracking-wider px-2.5 py-1 rounded-lg transition-all shadow-lg shadow-red-500/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(query)}
                  placeholder="Message..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/20 px-2"
                />
              </div>
              <div className="flex items-center gap-1 pr-1">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 transition-colors ${showEmojiPicker ? "text-purple-400" : "text-white/40 hover:text-white"}`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                {(query || pendingAttachments.length > 0 || isLoading) && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => handleSend(query)}
                    disabled={
                      isLoading ||
                      (!query.trim() && pendingAttachments.length === 0)
                    }
                    className="p-2 bg-purple-500 rounded-full text-white ml-1 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </motion.button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={() => setMessages([])}
            className="text-[10px] text-white/20 hover:text-white/40 font-bold uppercase tracking-widest transition-colors"
          >
            Clear Session
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({
  icon,
  text,
  onClick,
}: {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-5 glass-card bg-white/[0.02] border-white/5 flex items-center justify-between group transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-purple-400 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
          {text}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
    </motion.button>
  );
}

function PostComposer({
  onCreatePost,
  activeGrid,
  currentUser,
}: {
  onCreatePost: (content: string, image?: string) => void;
  activeGrid: GridType;
  currentUser: UserProfile | null;
}) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const pos = e.target.selectionStart;
    setContent(value);
    setCursorPosition(pos);

    const words = value.slice(0, pos).split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      setMentionSearch(lastWord.slice(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (handle: string) => {
    const textBefore = content.slice(0, cursorPosition);
    const textAfter = content.slice(cursorPosition);

    const words = textBefore.split(/\s/);
    words[words.length - 1] = `@${handle}`;

    const newContent = words.join(" ") + " " + textAfter;
    setContent(newContent);
    setShowMentions(false);
  };

  const filteredProfiles = Object.values(MOCK_PROFILES).filter((p) => {
    try {
      const saved = localStorage.getItem("deleted_user_ids");
      const deletedIds = saved ? JSON.parse(saved) : [];
      if (deletedIds.includes(p.id)) return false;
    } catch {}
    return (
      p.handle.toLowerCase().includes(mentionSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;
    onCreatePost(content, imagePreview || undefined);
    setContent("");
    setImagePreview(null);
    setIsFocused(false);
    setShowMentions(false);
  };

  return (
    <div
      className={`flux-card p-8 bg-white/5 border-white/10 relative transition-all duration-500 ${isFocused ? "ring-1 ring-white/20" : ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 relative">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
            <img
              src={
                currentUser?.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"
              }
              alt={currentUser?.name || "User"}
            />
          </div>
          <div className="flex-1 relative">
            <textarea
              placeholder="Enter message for the network..."
              value={content}
              onChange={handleTextChange}
              onFocus={() => setIsFocused(true)}
              className="w-full bg-transparent text-lg text-white font-light focus:ring-0 resize-none min-h-[80px] placeholder:text-white/10 pt-2"
            />

            <AnimatePresence>
              {showMentions && filteredProfiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 bottom-full mb-2 w-64 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl"
                >
                  <div className="p-3 border-b border-white/5 bg-white/5">
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                      Connect Node
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto scrollbar-hide">
                    {filteredProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => insertMention(profile.handle)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors group"
                      >
                        <img
                          src={profile.avatar}
                          className="w-8 h-8 rounded-lg border border-white/10"
                          alt=""
                        />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                            {profile.name}
                          </span>
                          <span className="text-[9px] font-mono text-white/20 uppercase">
                            @{profile.handle}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {imagePreview && (
          <div className="relative group inline-block ml-16">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 rounded-2xl border border-white/10 object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white border border-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white group-hover:text-black transition-all">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/20 group-hover:text-white transition-colors hidden sm:block">
                Attachment
              </span>
            </label>
            <button type="button" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white group-hover:text-black transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/20 group-hover:text-white transition-colors hidden sm:block">
                AI Enhance
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim() && !imagePreview}
            className={`flux-button-primary h-11 px-8 text-xs uppercase tracking-widest font-black
              ${!content.trim() && !imagePreview ? "opacity-20 pointer-events-none" : ""}
            `}
          >
            Broadcast
          </button>
        </div>
      </form>
    </div>
  );
}

const REACTION_ICONS: Record<
  ReactionType,
  { icon: ReactNode; label: string; color: string; glow: string }
> = {
  like: {
    icon: <ThumbsUp className="w-4 h-4" />,
    label: "Resonate",
    color: "text-blue-400",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  love: {
    icon: <Heart className="w-4 h-4" />,
    label: "Love",
    color: "text-red-400",
    glow: "shadow-[0_0_15px_rgba(248,113,113,0.3)]",
  },
  haha: {
    icon: <Smile className="w-4 h-4" />,
    label: "Haha",
    color: "text-yellow-400",
    glow: "shadow-[0_0_15px_rgba(250,204,21,0.3)]",
  },
  wow: {
    icon: <Zap className="w-4 h-4" />,
    label: "Wow",
    color: "text-purple-400",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  },
  sad: {
    icon: <Flag className="w-4 h-4" />,
    label: "Alert",
    color: "text-cyan-400",
    glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]",
  },
  angry: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Verify",
    color: "text-emerald-400",
    glow: "shadow-[0_0_15px_rgba(52,211,153,0.3)]",
  },
};

interface PostCardProps {
  key?: any;
  post: Post;
  currentUser: UserProfile | null;
  language?: "en" | "ar";
  onInteraction: (
    type:
      | "like"
      | "repost"
      | "comment"
      | "share"
      | "delete"
      | "report"
      | "unlist"
      | "save"
      | "react"
      | "edit",
    reactionType?: ReactionType,
  ) => void;
  onCommentInteraction: (
    postId: string,
    commentId: string,
    type: "delete" | "report" | "like" | "repost",
  ) => void;
  onAddComment: (postId: string, text: string, gif?: string) => void;
  onProfileClick: (author: string) => void;
  index?: number;
  layoutMode?: "expanded" | "compact";
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  x?: number;
  y?: number;
}

const renderTextWithMentions = (
  text: string,
  onProfileClick: (name: string) => void,
) => {
  return text.split(/(@\w+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      const handle = part.slice(1);
      const profile = Object.values(MOCK_PROFILES).find(
        (p) => p.handle.toLowerCase() === handle.toLowerCase(),
      );
      if (profile) {
        return (
          <span
            key={i}
            className="text-purple-400 font-bold hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick(profile.name);
            }}
          >
            {part}
          </span>
        );
      }
    }
    return part;
  });
};

function PostCard({
  post,
  currentUser,
  language = "ar",
  onInteraction,
  onCommentInteraction,
  onAddComment,
  onProfileClick,
  index = 0,
  layoutMode = "expanded",
}: PostCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentGif, setCommentGif] = useState<string | null>(null);
  const [showCommentGifSelector, setShowCommentGifSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const activeReaction = post.userReaction
    ? REACTION_ICONS[post.userReaction]
    : null;
  const isPostSaved = !!currentUser?.savedPostIds?.includes(post.id);

  const isOwnerUser = (authorName: string) => {
    const profile = Object.values(MOCK_PROFILES).find(
      (p) => p.name === authorName,
    );
    if (
      profile &&
      (profile.email === "fluxstudio4@gmail.com" ||
        profile.email === "vexora.network@gmail.com")
    ) {
      return true;
    }
    if (
      currentUser &&
      currentUser.name === authorName &&
      (currentUser.email === "fluxstudio4@gmail.com" ||
        currentUser.email === "vexora.network@gmail.com")
    ) {
      return true;
    }
    return (
      authorName === "Vexora Owner" ||
      authorName === "Vexora Admin 🛡️" ||
      authorName === "CyberPioneer"
    );
  };

  const isOwnerPost = isOwnerUser(post.author);

  const authorProfile =
    Object.values(MOCK_PROFILES).find((p) => p.name === post.author) ||
    (currentUser && currentUser.name === post.author ? currentUser : null);
  const isVerifiedUser =
    (authorProfile && authorProfile.isVerified) ||
    post.author === "Vexora Official" ||
    post.author === "Al-Keyl" ||
    post.author === "Vexora Admin 🛡️" ||
    post.author === "Sarah Tech ✨";

  const handleSubmitComment = async (e?: FormEvent) => {
    e?.preventDefault();
    if ((!commentText.trim() && !commentGif) || isSubmitting) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAddComment(post.id, commentText, commentGif || undefined);
    setCommentText("");
    setCommentGif(null);
    setIsSubmitting(false);
    setShowComments(true);
  };

  if (layoutMode === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2) }}
        className={`flux-card p-4 group transition-all duration-200 hover:border-purple-500/30 ${
          isOwnerPost
            ? "border-yellow-500/35 bg-yellow-500/[0.02]"
            : post.isLegendary
              ? "border-yellow-500/20 bg-yellow-500/[0.01]"
              : "border-white/5 bg-white/[0.02]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={post.avatar}
                className="w-9 h-9 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform border border-white/10"
                onClick={() => onProfileClick(post.author)}
                alt=""
              />
              <OnlineStatusDot
                lastActive={authorProfile?.lastActive}
                size="sm"
                className="absolute bottom-0 right-0 z-10"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-bold text-sm text-white hover:text-purple-300 cursor-pointer transition-colors flex items-center gap-1"
                  onClick={() => onProfileClick(post.author)}
                >
                  {post.author}
                  {isVerifiedUser && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </span>
                {isOwnerPost && (
                  <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[8px] font-mono px-1.5 py-0.2 rounded uppercase font-black flex items-center gap-0.5">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    OWNER
                  </span>
                )}
                <span className="text-white/30 text-[10px] font-mono tracking-wider">
                  {post.timestamp}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-purple-400/80 uppercase">
                  {post.type}
                </span>
              </div>

              <p
                className="text-white/80 text-xs mt-1.5 font-light line-clamp-2"
                dir="rtl"
              >
                {renderTextWithMentions(post.content, onProfileClick)}
              </p>
            </div>
          </div>

          {(post.image || post.gif) && (
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
              <img
                src={post.image || post.gif}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Compact Quick Actions */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[11px] font-mono text-white/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onInteraction("like")}
              className={`flex items-center gap-1 hover:text-red-400 transition-colors ${post.isLiked ? "text-red-400 font-bold" : ""}`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${post.isLiked ? "fill-red-400" : ""}`}
              />
              <span>{post.likes}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post.comments}</span>
            </button>
            <button
              onClick={() => onInteraction("repost")}
              className={`flex items-center gap-1 hover:text-emerald-400 transition-colors ${post.isReposted ? "text-emerald-400 font-bold" : ""}`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{post.reposts}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onInteraction("save")}
              className={`p-1.5 rounded-lg transition-all ${isPostSaved ? "text-purple-400 bg-purple-500/10" : "hover:text-purple-400"}`}
              title={
                isPostSaved
                  ? language === "ar"
                    ? "محفوظ في المستودع"
                    : "Saved in vault"
                  : language === "ar"
                    ? "حفظ في المستودع"
                    : "Save to vault"
              }
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isPostSaved ? "fill-purple-400" : ""}`}
              />
            </button>
            <button
              onClick={() => onInteraction("share")}
              className="p-1.5 rounded-lg hover:text-white transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact Comments Expansion */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-white/5 space-y-2"
            >
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    language === "ar"
                      ? "أضف تعليقاً سريعاً..."
                      : "Add quick reply..."
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 25 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 14,
        mass: 0.8,
        delay: Math.min(index * 0.04, 0.25),
      }}
      whileHover={{ y: -2 }}
      className={`flux-card overflow-hidden group transition-all duration-300 ${
        isOwnerPost
          ? "border-yellow-500/35 shadow-[0_0_30px_rgba(234,179,8,0.12)]"
          : post.isLegendary
            ? "border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.05)]"
            : "border-white/5"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`p-6 ${
          isOwnerPost
            ? "bg-gradient-to-b from-yellow-500/[0.03] to-transparent"
            : post.isLegendary
              ? "bg-gradient-to-b from-yellow-500/5 to-transparent"
              : ""
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`relative ${
                isOwnerPost
                  ? "p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse"
                  : post.isLegendary
                    ? "p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600"
                    : ""
              }`}
            >
              <img
                src={post.avatar}
                className={`w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform ${
                  isOwnerPost || post.isLegendary
                    ? "border-2 border-black"
                    : "border border-white/10"
                }`}
                onClick={() => onProfileClick(post.author)}
                alt=""
              />
              <OnlineStatusDot
                lastActive={authorProfile?.lastActive}
                size="sm"
                className="absolute bottom-0.5 right-0.5 z-10 shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-bold text-[17px] text-white hover:text-white/80 cursor-pointer transition-colors flex items-center gap-1.5"
                  onClick={() => onProfileClick(post.author)}
                >
                  {post.author}
                  {isVerifiedUser && (
                    <CheckCircle2
                      className="w-4 h-4 text-sky-400 fill-sky-400/10 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)] cursor-help"
                      title="Verified User"
                    />
                  )}
                </span>
                {isOwnerPost && (
                  <motion.span
                    animate={
                      isHovered
                        ? {
                            scale: [1, 1.05, 1],
                            transition: {
                              repeat: Infinity,
                              duration: 1.2,
                              ease: "easeInOut",
                            },
                          }
                        : { scale: 1 }
                    }
                    className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[9px] font-mono px-2 py-0.5 rounded-md uppercase tracking-wide font-black flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.25)] transition-colors duration-300 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/50 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                  >
                    <Crown className="w-3.5 h-3.5 text-yellow-500 transition-transform group-hover:scale-110" />
                    OWNER
                  </motion.span>
                )}
                {post.isLegendary && !isOwnerPost && (
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <div className="text-white/30 text-[11px] font-mono tracking-widest flex items-center gap-2 mt-0.5">
                <span className="uppercase">{post.timestamp}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="uppercase">{post.type} NODE</span>
              </div>
            </div>
          </div>
          <div className="relative flex items-center gap-1">
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1 mr-1"
                >
                  <button
                    onClick={() => onInteraction("save")}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isPostSaved
                        ? "text-purple-400 bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                        : "text-white/40 hover:text-purple-400 hover:bg-white/5"
                    }`}
                    title={
                      isPostSaved
                        ? language === "ar"
                          ? "إزالة من المستودع الآمن"
                          : "Remove from Archives"
                        : language === "ar"
                          ? "حفظ في المستودع المشفر"
                          : "Secure Pulse to Vault"
                    }
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isPostSaved ? "fill-purple-400" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => onInteraction("report")}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-amber-400 hover:bg-white/5 transition-all"
                    title={
                      language === "ar" ? "إبلاغ عن تشويش" : "Trace Distortion"
                    }
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showOptions && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowOptions(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl border border-white/10 shadow-2xl z-[60] py-2 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="px-4 py-1 border-b border-white/5 mb-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                        {language === "ar"
                          ? "خيارات النبضة"
                          : "Signal Controls"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onInteraction("save");
                        setShowOptions(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 flex items-center gap-3 transition-all ${
                        isPostSaved
                          ? "text-purple-400"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isPostSaved ? "fill-purple-400 text-purple-400" : ""}`}
                      />
                      <span>
                        {isPostSaved
                          ? language === "ar"
                            ? "إزالة من المستودع"
                            : "Remove from Vault"
                          : language === "ar"
                            ? "حفظ في المستودع المشفر"
                            : "Secure in Archives"}
                      </span>
                    </button>

                    {currentUser?.name === post.author && (
                      <button
                        onClick={() => {
                          onInteraction("edit");
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-purple-400" />
                        <span>
                          {language === "ar" ? "تعديل النبضة" : "Edit Pulse"}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onInteraction("share");
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>
                        {language === "ar" ? "مشاركة الرابط" : "Pulse Link"}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        onInteraction("report");
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all"
                    >
                      <Flag className="w-4 h-4 text-amber-400" />
                      <span>
                        {language === "ar"
                          ? "إبلاغ عن تشويش"
                          : "Trace Distortion"}
                      </span>
                    </button>
                    {(currentUser?.name === post.author ||
                      (currentUser &&
                        (currentUser.email === "fluxstudio4@gmail.com" ||
                          currentUser.email === "vexora.network@gmail.com" ||
                          isOwnerUser(currentUser.name)))) && (
                      <button
                        onClick={() => {
                          onInteraction("delete");
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-all border-t border-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {language === "ar" ? "حذف النبضة" : "Purge Pulse"}
                        </span>
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p
          className="text-white/90 text-lg leading-relaxed mb-6 font-light"
          dir="rtl"
        >
          {renderTextWithMentions(post.content, onProfileClick)}
        </p>

        {(post.image || post.gif) && (
          <div className="relative rounded-2xl overflow-hidden border border-white/5 mb-6 group/img">
            <img
              src={post.image || post.gif}
              className="w-full h-auto max-h-[500px] object-cover group-hover/img:scale-[1.02] transition-transform duration-1000"
              alt="Attached resonance signal"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-y border-white/5 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?u=${post.id}${i}`}
                    className="w-full h-full object-cover opacity-80"
                    alt=""
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {post.reactions &&
                Object.entries(post.reactions).map(
                  ([type, count]) =>
                    count > 0 && (
                      <div
                        key={type}
                        className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5"
                      >
                        <span
                          className={REACTION_ICONS[type as ReactionType].color}
                        >
                          {REACTION_ICONS[type as ReactionType].icon}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">
                          {count}
                        </span>
                      </div>
                    ),
                )}
              {!post.reactions && post.likes > 0 && (
                <span className="text-white/30 text-[10px] font-mono">
                  +{post.likes.toLocaleString()} RESONANCE
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-[10px] font-mono tracking-widest text-white/30 uppercase">
            <span>{post.comments} ECHOES</span>
            <span>{post.shares} PULSES</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 relative">
          <AnimatePresence>
            {isHovered && (
              <motion.div
                id={`quick-reaction-bar-${post.id}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-3 p-1.5 bg-zinc-950/50 backdrop-blur-2xl rounded-2xl flex gap-1.5 z-40 border border-purple-500/30 shadow-[0_10px_35px_rgba(168,85,247,0.15)] items-center"
              >
                <div className="px-2 text-[8px] font-mono font-black uppercase tracking-[0.2em] text-purple-400 border-r border-white/10 select-none">
                  Quick React
                </div>
                {(Object.keys(REACTION_ICONS) as ReactionType[]).map((type) => {
                  const isActive = post.userReaction === type;
                  return (
                    <motion.button
                      id={`quick-reaction-option-${post.id}-${type}`}
                      key={type}
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onInteraction("react", type);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group/option ${isActive ? "bg-purple-500/20 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "hover:bg-white/5 border border-transparent"}`}
                      title={REACTION_ICONS[type].label}
                    >
                      <motion.div
                        className={`${REACTION_ICONS[type].color} flex items-center justify-center transition-transform duration-150 ease-out hover:scale-[1.2]`}
                        whileHover={{ scale: 1.2 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                      >
                        {REACTION_ICONS[type].icon}
                      </motion.div>
                      {/* Tooltip containing reaction label */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-md bg-zinc-950 border border-purple-500/30 shadow-[0_4px_12px_rgba(168,85,247,0.2)] backdrop-blur-md opacity-0 scale-75 group-hover/option:opacity-100 group-hover/option:scale-100 transition-all duration-150 ease-out pointer-events-none z-50 text-[7px] font-mono font-bold tracking-widest text-purple-300 uppercase select-none whitespace-nowrap">
                        {REACTION_ICONS[type].label}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <div id={`reaction-area-${post.id}`} className="relative col-span-1">
            <div className="flex w-full rounded-2xl bg-white/0 hover:bg-white/5 transition-all group/react relative overflow-visible">
              <button
                id={`reaction-like-toggle-${post.id}`}
                onClick={() => onInteraction("like")}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-l-2xl transition-all duration-300 ${post.isLiked ? `${activeReaction ? activeReaction.color : "text-red-500"} bg-white/5` : "text-white/20 hover:text-white"}`}
              >
                {activeReaction ? (
                  <div className={activeReaction.color}>
                    {activeReaction.icon}
                  </div>
                ) : (
                  <Heart className="w-5 h-5 group-hover/react:text-red-400 group-hover/react:scale-110 transition-all" />
                )}
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] font-black">
                  {activeReaction ? activeReaction.label : "Resonate"}
                </span>
              </button>

              <button
                id={`reaction-picker-trigger-${post.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactionPicker(!showReactionPicker);
                }}
                className={`px-3 rounded-r-2xl border-l border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all cursor-pointer`}
                title="Choose Resonance Tone"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {showReactionPicker && (
                <>
                  <div
                    id={`reaction-backdrop-${post.id}`}
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactionPicker(false);
                    }}
                  />
                  <motion.div
                    id={`reaction-picker-dropdown-${post.id}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-3 p-2 bg-zinc-950/95 backdrop-blur-xl rounded-2xl flex gap-1.5 z-55 border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
                  >
                    {(Object.keys(REACTION_ICONS) as ReactionType[]).map(
                      (type) => (
                        <motion.button
                          id={`reaction-option-${post.id}-${type}`}
                          key={type}
                          whileHover={{ scale: 1.2, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onInteraction("react", type);
                            setShowReactionPicker(false);
                          }}
                          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${post.userReaction === type ? "bg-white/10 border border-white/10 shadow-lg" : "hover:bg-white/5 border border-transparent"}`}
                          title={REACTION_ICONS[type].label}
                        >
                          <div
                            className={`${REACTION_ICONS[type].color} flex flex-col items-center justify-center`}
                          >
                            {REACTION_ICONS[type].icon}
                            <span className="text-[7px] font-mono tracking-wider uppercase font-black mt-1 opacity-50 text-white leading-none">
                              {type}
                            </span>
                          </div>
                        </motion.button>
                      ),
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <InteractionButton
            onInteraction={() => setShowComments(!showComments)}
            icon={<MessageCircle className="w-5 h-5" />}
            label="Echo"
          />
          <InteractionButton
            onInteraction={() => onInteraction("share")}
            icon={<Share2 className="w-5 h-5" />}
            label="Pulse"
          />
          <InteractionButton
            onInteraction={() => onInteraction("save")}
            active={currentUser?.savedPostIds?.includes(post.id)}
            icon={
              <Bookmark
                className={`w-5 h-5 ${currentUser?.savedPostIds?.includes(post.id) ? "fill-purple-500 text-purple-500" : ""}`}
              />
            }
            label="Secure"
            activeColor="text-purple-500"
          />
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 space-y-6 overflow-hidden"
            >
              <form
                onSubmit={handleSubmitComment}
                className="flex flex-col gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="flex gap-4">
                  <img
                    src={currentUser?.avatar}
                    className="w-10 h-10 rounded-full border border-white/10"
                    alt=""
                  />
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Enter echo signal..."
                      className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-white/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCommentGifSelector(!showCommentGifSelector)
                      }
                      className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      GIF
                    </button>
                    <button
                      type="submit"
                      disabled={!commentText.trim() && !commentGif}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {commentGif && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 max-w-[180px] group self-start ml-14">
                    <img
                      src={commentGif}
                      alt="Selected GIF"
                      className="w-full h-auto object-cover max-h-[120px]"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setCommentGif(null)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {showCommentGifSelector && (
                  <div className="mt-2 ml-14">
                    <GifSelector
                      onSelectGif={(url) => {
                        setCommentGif(url);
                        setShowCommentGifSelector(false);
                      }}
                      onClose={() => setShowCommentGifSelector(false)}
                    />
                  </div>
                )}
              </form>

              <div className="space-y-6 pr-4">
                {post.replies?.map((comment) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <img
                      src={comment.avatar}
                      className="w-9 h-9 rounded-full border border-white/10 opacity-60"
                      alt=""
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white/80">
                          {comment.author}
                        </span>
                        {isOwnerUser(comment.author) && (
                          <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[8px] font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wide font-black flex items-center gap-0.5 shadow-[0_0_8px_rgba(234,179,8,0.15)] animate-pulse">
                            <Crown className="w-3 h-3 text-yellow-500" />
                            OWNER
                          </span>
                        )}
                        <span className="text-[10px] text-white/20 font-mono">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 font-light leading-relaxed">
                        {renderTextWithMentions(comment.text, onProfileClick)}
                      </p>
                      {comment.gif && (
                        <div className="relative rounded-xl overflow-hidden border border-white/5 mt-2 max-w-[200px] h-auto">
                          <img
                            src={comment.gif}
                            className="w-full h-auto object-cover max-h-[150px]"
                            alt="Comment GIF"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="flex gap-4 pt-1">
                        <button className="text-[10px] font-mono uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                          Resonate
                        </button>
                        <button className="text-[10px] font-mono uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                          Silence
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function InteractionButton({
  icon,
  label,
  active,
  onInteraction,
  onMouseEnter,
  activeColor = "text-white",
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onInteraction: () => void;
  onMouseEnter?: () => void;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onInteraction}
      onMouseEnter={onMouseEnter}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all duration-300 w-full ${active ? `${activeColor} bg-white/5` : "text-white/20 hover:bg-white/5 hover:text-white"}`}
    >
      {icon}
      <span className="text-[9px] font-mono uppercase tracking-[0.15em] font-black">
        {label}
      </span>
    </button>
  );
}

interface CommentItemProps {
  key?: string | number;
  comment: Comment;
  onInteraction: (type: "delete" | "report" | "like" | "repost") => void;
}

function CommentItem({ comment, onInteraction }: CommentItemProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="flex gap-3 py-3 border-t border-white/5 group">
      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
        <img src={comment.avatar} alt={comment.author} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 relative">
          <span className="font-bold text-xs hover:underline cursor-pointer">
            {comment.author}
          </span>
          <span className="text-white/40 text-[10px]">
            · {comment.timestamp}
          </span>

          <div className="ml-auto relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors opacity-60 group-hover:opacity-100"
              title="Comment options"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-white/50 hover:text-white cursor-pointer" />
            </button>

            <AnimatePresence>
              {showOptions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowOptions(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-full mt-1 w-44 glass-card bg-black border border-white/10 shadow-2xl z-20 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-1.5 mb-1 border-b border-white/5">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                        Moderation Hub
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onInteraction("report");
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all text-left"
                    >
                      <Flag className="w-3.5 h-3.5 text-orange-400" />
                      Report Comment
                    </button>
                    <button
                      onClick={() => {
                        onInteraction("delete");
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-300 hover:bg-red-500/10 transition-all text-left border-t border-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      Purge Comment
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed mb-2">
          {comment.text}
        </p>
        <div className="flex items-center gap-4 text-white/30">
          <MiniInteractionButton
            icon={
              <Heart
                className={`w-3 h-3 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
            }
            count={comment.likes}
            hoverColor="hover:text-red-500"
            active={comment.isLiked}
            onClick={() => onInteraction("like")}
          />
          <MiniInteractionButton
            icon={
              <Repeat
                className={`w-3 h-3 ${comment.isReposted ? "text-purple-500" : ""}`}
              />
            }
            count={comment.reposts || 0}
            hoverColor="hover:text-purple-500"
            active={comment.isReposted}
            onClick={() => onInteraction("repost")}
          />
        </div>
      </div>
    </div>
  );
}

function MiniInteractionButton({
  icon,
  count,
  hoverColor,
  onClick,
  active,
}: {
  icon: ReactNode;
  count?: number;
  hoverColor: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 transition-colors group ${hoverColor} ${active ? "text-current" : ""}`}
    >
      <div
        className={`p-1.5 rounded-full group-hover:bg-white/10 transition-colors ${active ? "bg-white/5" : ""}`}
      >
        {icon}
      </div>
      {count !== undefined && <span className="text-xs">{count}</span>}
    </button>
  );
}

function VexoraMessenger({
  currentUser,
  initialChatUserId,
  language = "en",
  onProfileClick,
  activeCall,
  setActiveCall,
  isCallMinimized,
  setIsCallMinimized,
  callDuration,
  onInitiateCall,
  setIncomingCallData,
}: {
  currentUser: UserProfile | null;
  initialChatUserId?: string | null;
  language?: "en" | "ar";
  onProfileClick: (name: string) => void;
  activeCall: {
    type: "voice" | "video";
    status: "calling" | "incoming" | "connected";
    targetId: string;
    callId?: string;
  } | null;
  setActiveCall: any;
  isCallMinimized: boolean;
  setIsCallMinimized: (minimized: boolean) => void;
  callDuration: number;
  onInitiateCall?: (targetUserId: string, type: "voice" | "video") => void;
  setIncomingCallData?: (data: any) => void;
}) {
  const [activeChat, setActiveChat] = useState<string | null>(
    () => initialChatUserId || null,
  );
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickPresets, setShowQuickPresets] = useState(false);
  const [chatHistories, setChatHistories] = useState<
    Record<
      string,
      Array<{
        id: string;
        text: string;
        senderId: string;
        timestamp: string;
        isRead?: boolean;
      }>
    >
  >(() => {
    try {
      const saved = localStorage.getItem("vexora_chat_histories");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [typingNodes, setTypingNodes] = useState<Record<string, boolean>>({});
  const [nodeSearchQuery, setNodeSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleToggleVoiceDictation = () => {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(
        language === "ar"
          ? "المتصفح لا يدعم الإملاء الصوتي المباشر"
          : "Speech recognition not supported in this browser",
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = language === "ar" ? "ar-SA" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setMessageText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const deletedIds: string[] = (() => {
    try {
      const saved = localStorage.getItem("deleted_user_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const registeredUsers: UserProfile[] = (() => {
    try {
      const saved = localStorage.getItem("registered_users");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  // Aggregate all mock profiles + registered community members
  const allProfilesMap: Record<string, UserProfile> = { ...MOCK_PROFILES };
  registeredUsers.forEach((u) => {
    if (u && u.id) allProfilesMap[u.id] = u;
  });

  const effectiveCurrentUserId = currentUser?.id || "pilot-node";
  const conversations = Object.values(allProfilesMap).filter(
    (p) => p.id !== effectiveCurrentUserId && !deletedIds.includes(p.id),
  );
  const filteredConversations = conversations.filter(
    (p) =>
      p.name.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(nodeSearchQuery.toLowerCase()),
  );

  // Sync initialChatUserId if updated from outside
  useEffect(() => {
    if (initialChatUserId) {
      setActiveChat(initialChatUserId);
    }
  }, [initialChatUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistories, activeChat, typingNodes]);

  // Format timestamp helper
  const formatTime = (ts: string) => {
    if (!ts) return "";
    if (ts.includes("T")) {
      try {
        const date = new Date(ts);
        return date.toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch {
        return ts;
      }
    }
    return ts;
  };

  // Real-time Firestore synchronizer for genuine messages (when user is authenticated)
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    try {
      const q = query(
        collection(db, "messages"),
        where("participants", "array-contains", currentUser.id),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const allMessages: Array<{
            id: string;
            senderId: string;
            receiverId: string;
            text: string;
            timestamp: string;
            isRead?: boolean;
          }> = [];
          snapshot.forEach((docSnap) => {
            allMessages.push({ id: docSnap.id, ...docSnap.data() } as any);
          });

          if (allMessages.length > 0) {
            allMessages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

            setChatHistories((prev) => {
              const merged = { ...prev };
              allMessages.forEach((msg) => {
                const peerId =
                  msg.senderId === currentUser.id
                    ? msg.receiverId
                    : msg.senderId;
                if (!merged[peerId]) {
                  merged[peerId] = [];
                }
                if (!merged[peerId].some((m) => m.id === msg.id)) {
                  merged[peerId].push(msg);
                  merged[peerId].sort((a, b) =>
                    a.timestamp.localeCompare(b.timestamp),
                  );
                }
              });
              try {
                localStorage.setItem(
                  "vexora_chat_histories",
                  JSON.stringify(merged),
                );
              } catch {}
              return merged;
            });
          }
        },
        (error) => {
          console.warn("Firestore messages subscription note:", error);
        },
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn("Could not attach firestore listener for messages:", e);
    }
  }, [currentUser]);

  const handleSendMessage = async (customText?: string) => {
    const rawText = customText !== undefined ? customText : messageText;
    const textToSend = rawText.trim();
    if (!textToSend || !activeChat) return;

    const senderId = currentUser?.id || "pilot-node";
    const messageId =
      "msg-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).substr(2, 6);

    setMessageText("");
    setShowEmojiPicker(false);
    setShowQuickPresets(false);

    const newMessageData = {
      id: messageId,
      senderId: senderId,
      receiverId: activeChat,
      text: textToSend,
      timestamp: new Date().toISOString(),
      participants: [senderId, activeChat],
      isRead: false,
    };

    // 1. Optimistic instant local storage and state update
    setChatHistories((prev) => {
      const updated = {
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), newMessageData],
      };
      try {
        localStorage.setItem("vexora_chat_histories", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Safe Firestore sync if authenticated
    try {
      if (auth.currentUser && currentUser) {
        await setDoc(doc(db, "messages", messageId), newMessageData);
      }
    } catch (e) {
      console.warn("Firestore message write skipped or unauthenticated:", e);
    }
  };

  const startCall = (type: "voice" | "video") => {
    if (!activeChat) return;
    if (onInitiateCall) {
      onInitiateCall(activeChat, type);
    } else {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveCall({ type, status: "calling", targetId: activeChat, callId });
      setIsCallMinimized(false);

      if (currentUser) {
        callSignaling.sendSignal({
          type: "OFFER",
          callId,
          fromUser: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            isVerified: currentUser.isVerified,
          },
          toUserId: activeChat,
          callType: type,
          timestamp: Date.now(),
        });
      }
    }
  };

  const quickPresets = [
    {
      label:
        language === "ar" ? "⚡ طلب مزامنة كمية" : "⚡ Quantum Sync Request",
      text: "Initiating quantum synchronicity protocol. Requesting signal handshake...",
    },
    {
      label:
        language === "ar" ? "📡 تأكيد استلام النبضة" : "📡 Pulse Acknowledged",
      text: "Signal pulse acknowledged and logged into active node telemetry.",
    },
    {
      label:
        language === "ar"
          ? "🚀 الحالة التشغيلية نشطة"
          : "🚀 Status Operational",
      text: "All local core parameters green. Neural telemetry running at peak frequency.",
    },
    {
      label:
        language === "ar" ? "✨ شكراً لك يا بطل" : "✨ Synchronized & Thanked",
      text: "Transmission completed successfully. Great resonance collaborating with your node!",
    },
  ];

  const quickEmojis = [
    "⚡",
    "🧠",
    "🚀",
    "👑",
    "💬",
    "✨",
    "🔥",
    "🌐",
    "🛸",
    "💎",
    "❤️",
    "👍",
    "👌",
    "🎉",
    "🔒",
    "🛡️",
  ];

  const activePeer = conversations.find((p) => p.id === activeChat);

  return (
    <div className="h-[calc(100vh-160px)] flux-card flex overflow-hidden border-white/5 bg-black/40 backdrop-blur-3xl lg:translate-y-4 shadow-2xl relative rounded-3xl">
      {/* Sidebar - Node Selector */}
      <div
        className={`w-full lg:w-80 border-r border-white/5 flex flex-col ${activeChat ? "hidden lg:flex" : "flex"}`}
      >
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase italic tracking-tightest flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span>
                {language === "ar" ? "الرسائل والمحادثات" : "Neural Messages"}
              </span>
            </h2>
            <div className="flex gap-2">
              <IconButton icon={<Edit2 className="w-4 h-4" />} />
              <IconButton icon={<Settings className="w-4 h-4" />} />
            </div>
          </div>

          {activeCall && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="w-2 h-2 bg-emerald-500 rounded-full absolute" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
                  {activeCall.type === "video" ? (
                    <Video className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Phone className="w-5 h-5 text-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    {activeCall.status === "connected"
                      ? language === "ar"
                        ? "مكالمة متصلة"
                        : "Active Connection"
                      : language === "ar"
                        ? "جار الاتصال..."
                        : "Calling Node..."}
                  </span>
                  <span className="text-xs font-black text-white truncate max-w-[140px]">
                    {(() => {
                      const peer = conversations.find(
                        (p) => p.id === activeCall.targetId,
                      );
                      return peer ? peer.name : "Unknown Node";
                    })()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 border-t border-emerald-500/15 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px] font-mono text-zinc-300 font-bold">
                    {(() => {
                      const mins = Math.floor(callDuration / 60);
                      const secs = callDuration % 60;
                      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                    })()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveCall(null)}
                    type="button"
                    className="p-1.5 px-2.5 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500 hover:text-white transition-all text-[9px] font-mono tracking-wider text-red-400 font-black uppercase cursor-pointer"
                    title="Disconnect Node"
                  >
                    {language === "ar" ? "إنهاء" : "Hang Up"}
                  </button>
                  <button
                    onClick={() => setIsCallMinimized(false)}
                    type="button"
                    className="p-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-[0_0_10px_rgba(16,185,129,0.25)] transition-all text-[9px] font-mono tracking-wider font-black uppercase flex items-center gap-1 cursor-pointer"
                  >
                    {language === "ar" ? "الرجوع" : "Return"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              id="node-search-input"
              type="text"
              placeholder={
                language === "ar" ? "بحث عن عضو أو عقدة..." : "Search nodes..."
              }
              value={nodeSearchQuery}
              onChange={(e) => setNodeSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 h-10 rounded-xl pl-10 pr-4 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-purple-500/50 placeholder:text-white/20 text-white transition-colors"
            />
          </div>
        </div>

        <div
          id="node-selector-container"
          className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
        >
          {filteredConversations.length > 0 ? (
            filteredConversations.map((profile) => {
              const isSelected = activeChat === profile.id;
              const peerHistory = chatHistories[profile.id];
              const lastMsg =
                peerHistory && peerHistory.length > 0
                  ? peerHistory[peerHistory.length - 1]
                  : null;

              return (
                <button
                  id={`node-select-btn-${profile.id}`}
                  key={profile.id}
                  onClick={() => {
                    setActiveChat(profile.id);
                    setShowEmojiPicker(false);
                    setShowQuickPresets(false);
                  }}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all group text-left cursor-pointer border ${
                    isSelected
                      ? "bg-purple-600/15 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : "hover:bg-white/5 border-transparent"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={profile.avatar}
                      className={`w-11 h-11 rounded-2xl object-cover transition-all border ${isSelected ? "border-purple-400" : "border-white/10 group-hover:border-white/30"}`}
                      alt=""
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
                  </div>
                  <div className="flex flex-col items-start overflow-hidden w-full">
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-bold text-xs truncate uppercase italic ${isSelected ? "text-purple-300" : "text-white/80 group-hover:text-white"}`}
                      >
                        {profile.name}
                      </span>
                      {lastMsg && (
                        <span className="text-[8px] font-mono text-zinc-500">
                          {formatTime(lastMsg.timestamp).slice(0, 5)}
                        </span>
                      )}
                    </div>
                    {lastMsg ? (
                      <span className="text-[9px] text-white/50 font-mono italic truncate w-full text-left mt-0.5">
                        {lastMsg.senderId === effectiveCurrentUserId
                          ? language === "ar"
                            ? "أنت: "
                            : "You: "
                          : ""}
                        {lastMsg.text}
                      </span>
                    ) : (
                      <span className="text-[9px] text-purple-400/50 font-mono italic truncate uppercase tracking-widest mt-0.5">
                        {language === "ar"
                          ? "جاهز للمراسلة ⚡"
                          : "Pulse signal active..."}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div
              id="no-nodes-found-container"
              className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5">
                <Search className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                  {language === "ar"
                    ? "لم يتم العثور على نتائج"
                    : "No Nodes Found"}
                </p>
                <p className="text-[8px] font-mono uppercase tracking-wider text-white/15 mt-1">
                  {language === "ar"
                    ? "جرّب البحث باسم آخر"
                    : "Adjust search query"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Signal Area */}
      <div
        className={`flex-1 flex flex-col ${!activeChat ? "hidden lg:flex" : "flex"} relative bg-black/20`}
      >
        {activeChat && activePeer ? (
          <>
            {/* Active Header */}
            <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveChat(null)}
                  className="lg:hidden p-2 text-white/40 hover:text-white bg-white/5 rounded-xl cursor-pointer"
                  title="Back to list"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div
                  className="relative cursor-pointer group"
                  onClick={() => onProfileClick(activePeer.name)}
                  title="View Profile"
                >
                  <img
                    src={activePeer.avatar}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10 group-hover:border-purple-400 transition-all shadow-md"
                    alt=""
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm uppercase italic tracking-wider text-white">
                      {activePeer.name}
                    </span>
                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      @{activePeer.handle}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-[0.3em] mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {language === "ar"
                      ? "متصل الآن ومتاح للمحادثة"
                      : "Status: Synchronized Active"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startCall("voice")}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/5 transition-all cursor-pointer"
                  title={language === "ar" ? "مكالمة صوتية" : "Voice Call"}
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startCall("video")}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-purple-500/20 hover:text-purple-300 border border-white/5 transition-all cursor-pointer"
                  title={language === "ar" ? "مكالمة فيديو" : "Video Call"}
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onProfileClick(activePeer.name)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white border border-white/5 transition-all cursor-pointer"
                  title={language === "ar" ? "عرض الحساب" : "View Profile"}
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
              <div className="flex justify-center mb-6">
                <div className="px-6 py-1.5 rounded-2xl bg-white/5 border border-white/5 text-[8.5px] font-mono uppercase tracking-[0.3em] text-white/30 italic flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  {language === "ar"
                    ? "قناة مشفرة بالكامل بين العقدتين"
                    : "End-to-End Quantum Encryption Enabled"}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {(() => {
                  const msgs = chatHistories[activeChat] || [];

                  if (msgs.length === 0) {
                    return (
                      <div className="py-12 text-center text-white/30 text-xs font-mono">
                        {language === "ar"
                          ? "لا توجد رسائل سابقة. أرسل رسالة لبدء المحادثة."
                          : "No previous messages. Send a message to start chatting."}
                      </div>
                    );
                  }

                  return msgs.map((msg) => {
                    const isMe = msg.senderId === effectiveCurrentUserId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {!isMe ? (
                          <div className="flex gap-3 max-w-[85%] sm:max-w-[70%] group items-end">
                            <img
                              src={activePeer.avatar}
                              className="w-8 h-8 rounded-xl mb-1 flex-shrink-0 object-cover border border-white/10"
                              alt=""
                            />
                            <div className="space-y-1 flex flex-col items-start w-full">
                              <div className="px-5 py-3 rounded-2xl rounded-bl-none bg-white/[0.08] border border-white/10 text-sm text-zinc-100 font-normal leading-relaxed shadow-md backdrop-blur-sm break-words whitespace-pre-wrap">
                                {renderTextWithMentions(
                                  msg.text,
                                  onProfileClick,
                                )}
                              </div>
                              <div className="flex items-center gap-2 pl-2">
                                <span className="text-[8.5px] font-mono text-white/30 uppercase tracking-widest">
                                  {formatTime(msg.timestamp)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (speakingMsgId === msg.id) {
                                      callAudio.cancelSpeech();
                                      setSpeakingMsgId(null);
                                    } else {
                                      setSpeakingMsgId(msg.id);
                                      callAudio.speakVoice(
                                        msg.text,
                                        language || "ar",
                                        () => {},
                                        () => {
                                          setSpeakingMsgId(null);
                                        },
                                      );
                                    }
                                  }}
                                  className="p-1 rounded-lg text-white/40 hover:text-purple-300 hover:bg-white/10 transition-all cursor-pointer"
                                  title={
                                    language === "ar"
                                      ? "استماع للرسالة صوتياً"
                                      : "Listen to message"
                                  }
                                >
                                  <Volume2
                                    className={`w-3 h-3 ${speakingMsgId === msg.id ? "text-purple-400 animate-pulse" : ""}`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[70%]">
                            <div className="px-5 py-3 rounded-2xl rounded-br-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium leading-relaxed shadow-[0_0_25px_rgba(147,51,234,0.25)] border border-purple-400/30 break-words whitespace-pre-wrap">
                              {renderTextWithMentions(msg.text, onProfileClick)}
                            </div>
                            <div className="flex items-center gap-2 pr-2">
                              <span className="text-[8.5px] font-mono text-white/30 uppercase tracking-widest">
                                {formatTime(msg.timestamp)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (speakingMsgId === msg.id) {
                                    callAudio.cancelSpeech();
                                    setSpeakingMsgId(null);
                                  } else {
                                    setSpeakingMsgId(msg.id);
                                    callAudio.speakVoice(
                                      msg.text,
                                      language || "ar",
                                      () => {},
                                      () => {
                                        setSpeakingMsgId(null);
                                      },
                                    );
                                  }
                                }}
                                className="p-1 rounded-lg text-white/40 hover:text-purple-200 hover:bg-white/10 transition-all cursor-pointer"
                                title={
                                  language === "ar"
                                    ? "استماع للرسالة صوتياً"
                                    : "Listen to message"
                                }
                              >
                                <Volume2
                                  className={`w-3 h-3 ${speakingMsgId === msg.id ? "text-purple-300 animate-pulse" : ""}`}
                                />
                              </button>
                              <span className="text-[8.5px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                                {language === "ar" ? "✓ مرسل" : "SENT"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}

                {typingNodes[activeChat] && (
                  <div className="flex justify-start animate-pulse">
                    <div className="flex gap-3 items-center">
                      <img
                        src={activePeer.avatar}
                        className="w-8 h-8 rounded-xl opacity-60 object-cover border border-white/10"
                        alt=""
                      />
                      <div className="flex gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 items-center">
                        <span className="text-[9px] font-mono text-purple-300 mr-1.5">
                          {activePeer.name}{" "}
                          {language === "ar" ? "يكتب..." : "is transmitting..."}
                        </span>
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Presets & Emojis Popovers */}
            {showQuickPresets && (
              <div className="mx-6 mb-2 p-3 rounded-2xl bg-zinc-900/95 border border-purple-500/30 backdrop-blur-xl shadow-2xl z-20 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="w-full text-[9px] font-mono uppercase tracking-widest text-purple-400 font-bold mb-1">
                  {language === "ar"
                    ? "⚡ عبارات النبض السريعة:"
                    : "⚡ Quick Signal Presets:"}
                </span>
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(preset.text)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-400/40 text-xs text-white/90 transition-all text-left cursor-pointer active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {showEmojiPicker && (
              <div className="mx-6 mb-2 p-3 rounded-2xl bg-zinc-900/95 border border-purple-500/30 backdrop-blur-xl shadow-2xl z-20 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="w-full text-[9px] font-mono uppercase tracking-widest text-purple-400 font-bold mb-1">
                  {language === "ar"
                    ? "اختر رمز تعبيري:"
                    : "Select Pulse Reaction:"}
                </span>
                {quickEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMessageText((prev) => prev + emoji);
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Composer Bar */}
            <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/80 to-transparent border-t border-white/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3 bg-white/[0.06] border border-white/15 rounded-2xl p-2 focus-within:border-purple-500/60 focus-within:bg-white/[0.09] transition-all shadow-2xl"
              >
                <div className="flex gap-1 pl-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickPresets(!showQuickPresets);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${showQuickPresets ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "text-white/40 hover:text-white hover:bg-white/10"}`}
                    title={
                      language === "ar"
                        ? "عبارات سريعة"
                        : "Quick Signal Presets"
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowQuickPresets(false);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${showEmojiPicker ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" : "text-white/40 hover:text-white hover:bg-white/10"}`}
                    title={language === "ar" ? "رموز تعبيرية" : "Emojis"}
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <input
                  id="message-text-input"
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    language === "ar"
                      ? `اكتب رسالة أو تحدث صوتياً إلى ${activePeer.name}...`
                      : `Transmit signal pulse or speak to ${activePeer.name}...`
                  }
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/30 px-3 focus:outline-none"
                  autoFocus
                />

                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceDictation}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                  title={
                    language === "ar"
                      ? isListening
                        ? "إيقاف الإملاء الصوتي"
                        : "تحدث صوتياً (إملاء مباشر)"
                      : isListening
                        ? "Stop recording"
                        : "Voice dictation"
                  }
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <button
                  id="send-message-btn"
                  type="submit"
                  disabled={!messageText.trim()}
                  className="h-11 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer font-bold text-xs uppercase tracking-wider"
                >
                  <span>{language === "ar" ? "إرسال" : "Send"}</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
              <MessageSquare className="w-12 h-12 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-2xl font-black uppercase tracking-tightest italic text-white">
                {language === "ar"
                  ? "حدد عضواً لبدء المحادثة"
                  : "Select a Node to Message"}
              </h3>
              <p className="text-xs font-mono text-white/40 leading-relaxed">
                {language === "ar"
                  ? "اختر أحد الأعضاء من القائمة الجانبية أو اضغط على إرسال رسالة من أي حساب شخصي."
                  : 'Choose any member from the left side panel or click "Direct Pulse" on any user profile.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VexoraVideoCall(props: any) {
  return <VexoraVideoCallModal {...props} />;
}
