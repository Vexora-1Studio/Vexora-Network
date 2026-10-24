import { useState } from "react";
import {
  Activity,
  Award,
  Gamepad2,
  Sparkles,
  Trophy,
  Flame,
  Swords,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { UserProfile } from "../types";

export interface GamingActivityItem {
  id: string;
  userName: string;
  userAvatar: string;
  game: string;
  mode: string;
  status: "playing" | "achievement" | "tournament_win";
  detail: string;
  timestamp: string;
  achievementIcon?: string;
}

const INITIAL_ACTIVITIES: GamingActivityItem[] = [
  {
    id: "act-1",
    userName: "Flux Studio",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    game: "Valorant",
    mode: "Competitive 5v5",
    status: "playing",
    detail: "Currently playing Ascent (Score: 11 - 9) • Ascendant II",
    timestamp: "Live Now",
  },
  {
    id: "act-2",
    userName: "ShadowSniper",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    game: "Vexora Chess Arena",
    mode: "Ranked Blitz 5:00",
    status: "achievement",
    detail: "Unlocked 'Cyber Grandmaster' Badge (1,600+ MMR reached)",
    timestamp: "8m ago",
    achievementIcon: "🏆",
  },
  {
    id: "act-3",
    userName: "AstraGamer",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    game: "Counter-Strike 2",
    mode: "Premier Mode",
    status: "playing",
    detail: "Playing Mirage • 15,200 ELO Stack",
    timestamp: "Live Now",
  },
  {
    id: "act-4",
    userName: "Cyber Vortex Clan",
    userAvatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80",
    game: "Vexora Round Robin League",
    mode: "Official Match",
    status: "tournament_win",
    detail: "Defeated Rogue Titans 2 - 0 (Retains #1 League Standing)",
    timestamp: "45m ago",
    achievementIcon: "🥇",
  },
  {
    id: "act-5",
    userName: "KratosX",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    game: "Rocket League",
    mode: "Ranked 3v3",
    status: "achievement",
    detail: "Achieved 10-Win Streak in Ranked Diamond",
    timestamp: "1h ago",
    achievementIcon: "🔥",
  },
];

export default function LiveActivityFeed({
  currentUser,
  language,
  onChallengePlayer,
}: {
  currentUser: UserProfile | null;
  language: "ar" | "en";
  onChallengePlayer?: (playerName: string) => void;
}) {
  const [activities, setActivities] = useState<GamingActivityItem[]>(INITIAL_ACTIVITIES);
  const [privacyHidden, setPrivacyHidden] = useState(false);
  const [cheeredIds, setCheeredIds] = useState<string[]>([]);

  const handleCheer = (id: string) => {
    if (!cheeredIds.includes(id)) {
      setCheeredIds([...cheeredIds, id]);
    }
  };

  const isAr = language === "ar";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-[#090d18] border border-cyan-500/20 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
              <span>{isAr ? "شريط النشاط الحي والإنجازات" : "Live Gaming & Achievement Pulse"}</span>
            </h2>
          </div>
          <p className="text-xs text-white/40 font-mono">
            {isAr
              ? "متابعة لحظية لجلسات ألعاب الأصدقاء وإنجازات بطولات Vexora"
              : "Real-time feed of friends gaming sessions, tournament matches, and badge unlocks"}
          </p>
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-2xl">
          <button
            onClick={() => setPrivacyHidden(!privacyHidden)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              privacyHidden
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {privacyHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>
              {privacyHidden
                ? isAr ? "نشاطي مخفي (Ghost Mode)" : "Ghost Mode Active"
                : isAr ? "نشاطي مرئي للجميع" : "Broadcast Game Activity"}
            </span>
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((act) => {
          const isCheered = cheeredIds.includes(act.id);
          return (
            <div
              key={act.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#090d18] border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="relative">
                  <img
                    src={act.userAvatar}
                    alt={act.userName}
                    className="w-11 h-11 rounded-2xl object-cover border border-white/10"
                  />
                  {act.status === "playing" && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black animate-pulse" />
                  )}
                  {act.status === "achievement" && (
                    <span className="absolute -bottom-1 -right-1 text-xs">
                      {act.achievementIcon || "🏆"}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-white">{act.userName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-400 font-bold">
                      {act.game}
                    </span>
                    <span className="text-[10px] font-mono text-white/30">• {act.mode}</span>
                  </div>
                  <p className="text-xs text-white/70 font-mono mt-1">{act.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                <span className="text-[10px] font-mono text-white/40">{act.timestamp}</span>
                <button
                  onClick={() => handleCheer(act.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCheered
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isCheered ? (isAr ? "تم التشجيع!" : "Cheered!") : (isAr ? "تشجيع" : "Cheer")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
