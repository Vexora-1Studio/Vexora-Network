import React, { useState } from "react";
import {
  Gamepad2,
  Search,
  Filter,
  Users,
  Plus,
  Play,
  Trophy,
  MessageSquare,
  Sparkles,
  Flame,
  Globe,
  Radio,
  Clock,
  Shield,
  Volume2,
  ChevronRight,
  UserPlus,
  Check,
  X,
  Share2,
  Video,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

export interface GameInfo {
  id: string;
  name: string;
  category: "Battle Royale" | "FPS" | "Racing" | "Sports" | "RPG" | "MOBA" | "Survival" | "Strategy";
  platforms: ("PC" | "PS5" | "Xbox" | "Switch")[];
  image: string;
  banner: string;
  activePlayers: string;
  activeRooms: number;
  description: string;
  rating: number;
}

export interface LfgPost {
  id: string;
  gameId: string;
  gameName: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  mode: string;
  region: "MENA" | "EU" | "NA" | "ASIA";
  language: "Arabic" | "English" | "Both";
  rankRequired: string;
  micRequired: boolean;
  slotsCurrent: number;
  slotsMax: number;
  createdAt: string;
  members: string[];
}

export interface GameGuide {
  id: string;
  title: string;
  author: string;
  readTime: string;
  category: string;
  likes: number;
}

const SUPPORTED_GAMES: GameInfo[] = [
  {
    id: "g1",
    name: "Valorant",
    category: "FPS",
    platforms: ["PC"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "1.4M",
    activeRooms: 342,
    description: "A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.",
    rating: 4.9,
  },
  {
    id: "g2",
    name: "Counter-Strike 2",
    category: "FPS",
    platforms: ["PC"],
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "1.2M",
    activeRooms: 289,
    description: "The next era of legendary tactical FPS with sub-tick architecture and responsive smoke.",
    rating: 4.8,
  },
  {
    id: "g3",
    name: "Apex Legends",
    category: "Battle Royale",
    platforms: ["PC", "PS5", "Xbox"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "850K",
    activeRooms: 194,
    description: "Conquer with character in Apex Legends, a free-to-play Battle Royale hero shooter.",
    rating: 4.7,
  },
  {
    id: "g4",
    name: "Rocket League",
    category: "Sports",
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "620K",
    activeRooms: 156,
    description: "High-octane physics-powered soccer with rocket-propelled acrobatic battlecars.",
    rating: 4.8,
  },
  {
    id: "g5",
    name: "League of Legends",
    category: "MOBA",
    platforms: ["PC"],
    image: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "2.1M",
    activeRooms: 512,
    description: "Team-based strategy game where two teams of five powerful champions face off to destroy the Nexus.",
    rating: 4.8,
  },
  {
    id: "g6",
    name: "Forza Horizon 5",
    category: "Racing",
    platforms: ["PC", "Xbox"],
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "340K",
    activeRooms: 88,
    description: "Lead breathtaking expeditions across vibrant, ever-evolving landscapes of Mexico in world-class cars.",
    rating: 4.9,
  },
  {
    id: "g7",
    name: "Cyberpunk 2077",
    category: "RPG",
    platforms: ["PC", "PS5", "Xbox"],
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "410K",
    activeRooms: 94,
    description: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power and glam.",
    rating: 4.9,
  },
  {
    id: "g8",
    name: "Rust",
    category: "Survival",
    platforms: ["PC", "PS5", "Xbox"],
    image: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=400&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=1200&auto=format&fit=crop&q=80",
    activePlayers: "290K",
    activeRooms: 72,
    description: "The only aim in Rust is to survive. Overcome hunger, thirst and cold. Build a base and protect yourself.",
    rating: 4.7,
  },
];

const INITIAL_LFG: LfgPost[] = [
  {
    id: "lfg-1",
    gameId: "g1",
    gameName: "Valorant",
    hostName: "VexoraPhantom",
    hostAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80",
    title: "Ascendant / Immortal push tonight (Need Controller + Initiator)",
    mode: "Competitive 5v5",
    region: "MENA",
    language: "Arabic",
    rankRequired: "Ascendant 1+",
    micRequired: true,
    slotsCurrent: 3,
    slotsMax: 5,
    createdAt: "5m ago",
    members: ["VexoraPhantom", "ShadowSniper", "AstraGamer"],
  },
  {
    id: "lfg-2",
    gameId: "g2",
    gameName: "Counter-Strike 2",
    hostName: "KratosX",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    title: "Premier 15,000+ ELO Grinding (Chill & Comm)",
    mode: "Premier Mode",
    region: "EU",
    language: "English",
    rankRequired: "14,000+ ELO",
    micRequired: true,
    slotsCurrent: 4,
    slotsMax: 5,
    createdAt: "12m ago",
    members: ["KratosX", "ByteStorm", "WraithGhost", "NeonDrifter"],
  },
  {
    id: "lfg-3",
    gameId: "g4",
    gameName: "Rocket League",
    hostName: "BlazeMaster",
    hostAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    title: "Champ 2 / Grand Champ 3s Ranked Grind",
    mode: "Ranked 3v3",
    region: "MENA",
    language: "Both",
    rankRequired: "Champion 2+",
    micRequired: false,
    slotsCurrent: 2,
    slotsMax: 3,
    createdAt: "22m ago",
    members: ["BlazeMaster", "SpeedRacer"],
  },
];

export default function GamingHub({
  currentUser,
  language,
  onNavigateToArena,
  onNavigateToTournaments,
}: {
  currentUser: UserProfile | null;
  language: "ar" | "en";
  onNavigateToArena?: () => void;
  onNavigateToTournaments?: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [lfgPosts, setLfgPosts] = useState<LfgPost[]>(INITIAL_LFG);
  const [activeTab, setActiveTab] = useState<"catalog" | "lfg" | "rooms">("catalog");

  // Create LFG modal state
  const [isCreateLfgOpen, setIsCreateLfgOpen] = useState(false);
  const [newLfgGame, setNewLfgGame] = useState("Valorant");
  const [newLfgTitle, setNewLfgTitle] = useState("");
  const [newLfgMode, setNewLfgMode] = useState("Competitive 5v5");
  const [newLfgRegion, setNewLfgRegion] = useState<"MENA" | "EU" | "NA" | "ASIA">("MENA");
  const [newLfgLang, setNewLfgLang] = useState<"Arabic" | "English" | "Both">("Arabic");
  const [newLfgRank, setNewLfgRank] = useState("Platinum 2+");
  const [newLfgMic, setNewLfgMic] = useState(true);
  const [newLfgSlots, setNewLfgSlots] = useState(5);
  const [createNotice, setCreateNotice] = useState(false);

  const categories = [
    "All",
    "FPS",
    "Battle Royale",
    "Sports",
    "MOBA",
    "Racing",
    "RPG",
    "Survival",
    "Strategy",
  ];

  const filteredGames = SUPPORTED_GAMES.filter((game) => {
    const matchesCat = activeCategory === "All" || game.category === activeCategory;
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleJoinLfg = (lfgId: string) => {
    if (!currentUser) return;
    setLfgPosts((prev) =>
      prev.map((post) => {
        if (post.id === lfgId && post.slotsCurrent < post.slotsMax) {
          const userName = currentUser.name;
          if (!post.members.includes(userName)) {
            return {
              ...post,
              slotsCurrent: post.slotsCurrent + 1,
              members: [...post.members, userName],
            };
          }
        }
        return post;
      })
    );
  };

  const handleLeaveLfg = (lfgId: string) => {
    if (!currentUser) return;
    setLfgPosts((prev) =>
      prev.map((post) => {
        if (post.id === lfgId) {
          return {
            ...post,
            slotsCurrent: Math.max(1, post.slotsCurrent - 1),
            members: post.members.filter((m) => m !== currentUser.name),
          };
        }
        return post;
      })
    );
  };

  const handleCreateLfgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: LfgPost = {
      id: `lfg-${Date.now()}`,
      gameId: "g1",
      gameName: newLfgGame,
      hostName: currentUser?.name || "VexoraGamer",
      hostAvatar: currentUser?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80",
      title: newLfgTitle || "Looking for teammates",
      mode: newLfgMode,
      region: newLfgRegion,
      language: newLfgLang,
      rankRequired: newLfgRank,
      micRequired: newLfgMic,
      slotsCurrent: 1,
      slotsMax: newLfgSlots,
      createdAt: "Just now",
      members: [currentUser?.name || "VexoraGamer"],
    };

    setLfgPosts([newPost, ...lfgPosts]);
    setCreateNotice(true);
    setTimeout(() => {
      setCreateNotice(false);
      setIsCreateLfgOpen(false);
      setActiveTab("lfg");
    }, 1000);
  };

  const isAr = language === "ar";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#060a14] via-[#0b1326] to-[#070b16] border border-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.12)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                {isAr ? "مركز الألعاب الرئيسي" : "VEXORA GAMING HUB"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono uppercase font-bold">
                Online & Synced
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              {isAr ? "مجمع الألعاب وفرق البحث LFG" : "Gaming Hub & LFG Squads"}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl font-mono leading-relaxed">
              {isAr
                ? "تصفح ألعابك المفضلة، ابحث عن زملاء فريق بنظام LFG المخصص للرتب والمناطق، وانضم إلى مجتمعات وغرف الألعاب الحية."
                : "Browse supported competitive titles, find squad mates with filterable rank/region LFG posts, and jump into active game hubs."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateLfgOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>{isAr ? "إنشاء فريق LFG" : "Create LFG Squad"}</span>
            </button>
            {onNavigateToArena && (
              <button
                onClick={onNavigateToArena}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? "ساحة الألعاب التفاعلية" : "Strategy Arena"}</span>
              </button>
            )}
            {onNavigateToTournaments && (
              <button
                onClick={onNavigateToTournaments}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>{isAr ? "دوري البطولات" : "Tournaments"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Hub Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "catalog"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{isAr ? "دليل الألعاب (Game Catalog)" : "Games Catalog"}</span>
          </button>
          <button
            onClick={() => setActiveTab("lfg")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "lfg"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? "فرق البحث LFG (Looking For Group)" : "LFG Team Finder"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px]">
              {lfgPosts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "rooms"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isAr ? "غرف الألعاب الحية (Active Rooms)" : "Active Game Rooms"}</span>
          </button>
        </div>
      </div>

      {/* 1. CATALOG VIEW */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder={isAr ? "بحث عن لعبة..." : "Search games..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedGame(game)}
                className="group relative rounded-3xl overflow-hidden bg-[#090d18] border border-white/5 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg flex flex-col"
              >
                {/* Image cover */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d18] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-cyan-300 border border-cyan-500/30 uppercase font-bold">
                    {game.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {game.activePlayers}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors uppercase">
                      {game.name}
                    </h3>
                    <p className="text-[11px] text-white/40 line-clamp-2 mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-white/40">
                    <div className="flex gap-1.5">
                      {game.platforms.map((p) => (
                        <span key={p} className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-white/60">
                          {p}
                        </span>
                      ))}
                    </div>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <span>{game.activeRooms} Rooms</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LFG SQUAD FINDER */}
      {activeTab === "lfg" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? "قائمة فرق البحث المفتوحة (LFG Lobbies)" : "Active LFG Squad Posts"}</span>
              </h2>
              <p className="text-xs text-white/40 font-mono">
                {isAr ? "انضم فوراً إلى فريق للعب الجماعي والتواصل الصوتي" : "Join a pre-made lobby or create your own squad to conquer competitive matches"}
              </p>
            </div>

            <button
              onClick={() => setIsCreateLfgOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "نشر إعلان LFG" : "Post LFG"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lfgPosts.map((post) => {
              const isFull = post.slotsCurrent >= post.slotsMax;
              const isJoined = currentUser && post.members.includes(currentUser.name);

              return (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl bg-[#090d18] border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between gap-4"
                >
                  {/* Host & Game */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.hostAvatar}
                        alt={post.hostName}
                        className="w-9 h-9 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block">{post.hostName}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{post.gameName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-white/30">{post.createdAt}</span>
                  </div>

                  {/* Title & Mode */}
                  <div>
                    <h4 className="font-black text-xs text-white leading-snug">{post.title}</h4>
                    <span className="text-[10px] font-mono text-white/40 block mt-1">
                      Mode: <strong className="text-white/70">{post.mode}</strong>
                    </span>
                  </div>

                  {/* Badges: Region, Mic, Rank */}
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60">
                      🌍 {post.region}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60">
                      🗣️ {post.language}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                      🏆 {post.rankRequired}
                    </span>
                    {post.micRequired && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                        <Volume2 className="w-2.5 h-2.5" />
                        Mic ON
                      </span>
                    )}
                  </div>

                  {/* Slots & Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {post.members.map((m, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[9px] font-mono flex items-center justify-center text-cyan-300 font-bold"
                            title={m}
                          >
                            {m[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-white/50">
                        {post.slotsCurrent}/{post.slotsMax} {isAr ? "لاعبين" : "Slots"}
                      </span>
                    </div>

                    {isJoined ? (
                      <button
                        onClick={() => handleLeaveLfg(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-mono uppercase font-bold transition-all cursor-pointer"
                      >
                        {isAr ? "مغادرة الفريق" : "Leave Squad"}
                      </button>
                    ) : isFull ? (
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 text-white/30 text-[10px] font-mono uppercase">
                        {isAr ? "مكتمل" : "Squad Full"}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinLfg(post.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-[10px] font-mono uppercase font-black transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        {isAr ? "انضمام للفريق" : "Join Squad"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ACTIVE GAME ROOMS */}
      {activeTab === "rooms" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black uppercase text-white">
            {isAr ? "غرف الصوت واللعب النشطة حالياً" : "Active Voice & Gaming Rooms"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Vexora Radiant Scrims #1",
                game: "Valorant",
                membersCount: 8,
                host: "VexoraPhantom",
                status: "Live Match",
              },
              {
                title: "CS2 Premier 15k+ Stack",
                game: "Counter-Strike 2",
                membersCount: 5,
                host: "ShadowSniper",
                status: "In Lobby",
              },
              {
                title: "Apex Ranked Predator Grind",
                game: "Apex Legends",
                membersCount: 3,
                host: "WraithGhost",
                status: "Drop Zone",
              },
              {
                title: "Rocket League Grand Champ Tourney",
                game: "Rocket League",
                membersCount: 6,
                host: "BlazeMaster",
                status: "Semifinals",
              },
            ].map((room, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-[#090d18] border border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white">{room.title}</h4>
                    <span className="text-[10px] font-mono text-cyan-400">{room.game}</span>
                    <span className="text-[9px] font-mono text-white/30 block">
                      Hosted by {room.host} • {room.membersCount} connected
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono uppercase font-bold transition-all cursor-pointer">
                  {isAr ? "دخول الغرفة" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAME DETAIL MODAL */}
      <AnimatePresence>
        {selectedGame && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-[#080d18] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.2)] max-h-[90vh] flex flex-col"
            >
              {/* Header Image Banner */}
              <div className="relative h-56 w-full">
                <img
                  src={selectedGame.banner}
                  alt={selectedGame.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d18] via-[#080d18]/40 to-black/60" />

                <button
                  onClick={() => setSelectedGame(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/60 text-white/60 hover:text-white flex items-center justify-center cursor-pointer border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono uppercase font-bold">
                      {selectedGame.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">
                      {selectedGame.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGame(null);
                      setIsCreateLfgOpen(true);
                      setNewLfgGame(selectedGame.name);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                  >
                    {isAr ? "بحث عن فريق LFG" : "Find Squad"}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase text-white/50 tracking-wider mb-1">
                    About Game
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed font-mono">
                    {selectedGame.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-mono uppercase text-white/40 block">
                      Active Players
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      {selectedGame.activePlayers}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-mono uppercase text-white/40 block">
                      Active Rooms
                    </span>
                    <span className="text-sm font-black text-cyan-300">
                      {selectedGame.activeRooms}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-mono uppercase text-white/40 block">
                      Community Rating
                    </span>
                    <span className="text-sm font-black text-yellow-400">
                      ★ {selectedGame.rating} / 5.0
                    </span>
                  </div>
                </div>

                {/* Game specific guides preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-white/50 tracking-wider">
                    Community Tactical Guides & Strats
                  </h4>
                  <div className="space-y-2">
                    {[
                      { title: "Mastering Viper Smokes & Lineups on Breeze", author: "VexoraPhantom", reads: "14.2k reads" },
                      { title: "Crosshair Placement & Micro-corrections Guide", author: "ShadowSniper", reads: "9.8k reads" },
                    ].map((g, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-bold text-white/90">{g.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/30">{g.reads}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE LFG MODAL */}
      <AnimatePresence>
        {isCreateLfgOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#090e1a] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase text-white">
                      {isAr ? "إنشاء إعلان بحث عن فريق (LFG)" : "Create LFG Squad Post"}
                    </h3>
                    <p className="text-[10px] font-mono text-white/40">
                      {isAr ? "حدد متطلبات الرتبة والمنطقة واللغة" : "Specify rank requirement, region, and team slots"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsCreateLfgOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLfgSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/50">Game</label>
                  <select
                    value={newLfgGame}
                    onChange={(e) => setNewLfgGame(e.target.value)}
                    className="w-full bg-[#101524] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    {SUPPORTED_GAMES.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} ({g.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/50">Post Title / Objective</label>
                  <input
                    type="text"
                    required
                    value={newLfgTitle}
                    onChange={(e) => setNewLfgTitle(e.target.value)}
                    placeholder="e.g. Ascendant grind - Need smokes & comms"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/50">Region</label>
                    <select
                      value={newLfgRegion}
                      onChange={(e) => setNewLfgRegion(e.target.value as any)}
                      className="w-full bg-[#101524] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white"
                    >
                      <option value="MENA">MENA / الشرق الأوسط</option>
                      <option value="EU">Europe (EU)</option>
                      <option value="NA">North America (NA)</option>
                      <option value="ASIA">Asia</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/50">Required Rank</label>
                    <input
                      type="text"
                      value={newLfgRank}
                      onChange={(e) => setNewLfgRank(e.target.value)}
                      placeholder="e.g. Diamond 2+"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-mono text-white/70">
                    {isAr ? "مطلوب مايكروفون وتواصل صوتي" : "Microphone Required"}
                  </span>
                  <input
                    type="checkbox"
                    checked={newLfgMic}
                    onChange={(e) => setNewLfgMic(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  {createNotice
                    ? isAr ? "تم إنشاء الفريق ونشره بنجاح!" : "Squad Published!"
                    : isAr ? "نشر إعلان الفريق الآن" : "Publish LFG Squad"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
