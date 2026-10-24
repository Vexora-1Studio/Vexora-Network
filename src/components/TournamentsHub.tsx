import { useState } from "react";
import {
  Trophy,
  Shield,
  Calendar,
  Users,
  Award,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Check,
  X,
  FileText,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

export interface TeamStanding {
  id: string;
  rank: number;
  teamName: string;
  tag: string;
  avatar: string;
  captain: string;
  mp: number; // Matches Played
  w: number;  // Wins
  d: number;  // Draws
  l: number;  // Losses
  gf: number; // Goals / Rounds For
  ga: number; // Goals / Rounds Against
  gd: number; // Difference
  pts: number; // Points
  form: ("W" | "D" | "L")[];
}

export interface FixtureMatch {
  id: string;
  round: number;
  teamAId: string;
  teamAName: string;
  teamAAvatar: string;
  teamBId: string;
  teamBName: string;
  teamBAvatar: string;
  scoreA?: number;
  scoreB?: number;
  status: "upcoming" | "live" | "completed" | "disputed";
  scheduledTime: string;
  screenshotUrl?: string;
  disputeReason?: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  gameIcon: string;
  banner: string;
  prizePool: string;
  status: "active" | "registration" | "completed";
  format: "Round Robin League";
  teamsCount: number;
  maxTeams: number;
  startDate: string;
  organizer: string;
  isVerified: boolean;
}

const INITIAL_TEAMS: TeamStanding[] = [
  {
    id: "t1",
    rank: 1,
    teamName: "Cyber Vortex Clan",
    tag: "VTX",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80",
    captain: "VexoraPhantom",
    mp: 7,
    w: 6,
    d: 1,
    l: 0,
    gf: 18,
    ga: 4,
    gd: 14,
    pts: 19,
    form: ["W", "W", "W", "D", "W"],
  },
  {
    id: "t2",
    rank: 2,
    teamName: "Obsidian Shadows",
    tag: "OBS",
    avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&auto=format&fit=crop&q=80",
    captain: "ShadowSniper",
    mp: 7,
    w: 5,
    d: 1,
    l: 1,
    gf: 16,
    ga: 7,
    gd: 9,
    pts: 16,
    form: ["W", "L", "W", "W", "W"],
  },
  {
    id: "t3",
    rank: 3,
    teamName: "Nova Valkyries",
    tag: "NVA",
    avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80",
    captain: "AstraGamer",
    mp: 7,
    w: 4,
    d: 2,
    l: 1,
    gf: 14,
    ga: 8,
    gd: 6,
    pts: 14,
    form: ["D", "W", "W", "D", "W"],
  },
  {
    id: "t4",
    rank: 4,
    teamName: "Rogue Titans",
    tag: "RGT",
    avatar: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=100&auto=format&fit=crop&q=80",
    captain: "KratosX",
    mp: 7,
    w: 3,
    d: 2,
    l: 2,
    gf: 11,
    ga: 10,
    gd: 1,
    pts: 11,
    form: ["L", "W", "D", "W", "D"],
  },
  {
    id: "t5",
    rank: 5,
    teamName: "Phoenix Legion",
    tag: "PHX",
    avatar: "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    captain: "BlazeMaster",
    mp: 7,
    w: 2,
    d: 2,
    l: 3,
    gf: 9,
    ga: 12,
    gd: -3,
    pts: 8,
    form: ["L", "D", "L", "W", "L"],
  },
  {
    id: "t6",
    rank: 6,
    teamName: "Apex Predators",
    tag: "APX",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    captain: "WraithGhost",
    mp: 7,
    w: 2,
    d: 0,
    l: 5,
    gf: 8,
    ga: 15,
    gd: -7,
    pts: 6,
    form: ["W", "L", "L", "L", "L"],
  },
  {
    id: "t7",
    rank: 7,
    teamName: "Zero Matrix",
    tag: "ZRO",
    avatar: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=100&auto=format&fit=crop&q=80",
    captain: "NeonDrifter",
    mp: 7,
    w: 1,
    d: 1,
    l: 5,
    gf: 6,
    ga: 16,
    gd: -10,
    pts: 4,
    form: ["L", "L", "D", "L", "W"],
  },
  {
    id: "t8",
    rank: 8,
    teamName: "Glitch Esports",
    tag: "GLT",
    avatar: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80",
    captain: "ByteStorm",
    mp: 7,
    w: 0,
    d: 1,
    l: 6,
    gf: 4,
    ga: 14,
    gd: -10,
    pts: 1,
    form: ["L", "L", "L", "L", "D"],
  },
];

const INITIAL_FIXTURES: FixtureMatch[] = [
  {
    id: "f1",
    round: 8,
    teamAId: "t1",
    teamAName: "Cyber Vortex Clan",
    teamAAvatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80",
    teamBId: "t2",
    teamBName: "Obsidian Shadows",
    teamBAvatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&auto=format&fit=crop&q=80",
    status: "live",
    scoreA: 1,
    scoreB: 1,
    scheduledTime: "Live Now (Map 3 - Decider)",
  },
  {
    id: "f2",
    round: 8,
    teamAId: "t3",
    teamAName: "Nova Valkyries",
    teamAAvatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80",
    teamBId: "t4",
    teamBName: "Rogue Titans",
    teamBAvatar: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=100&auto=format&fit=crop&q=80",
    status: "upcoming",
    scheduledTime: "Today at 20:00 GMT+3",
  },
  {
    id: "f3",
    round: 8,
    teamAId: "t5",
    teamAName: "Phoenix Legion",
    teamAAvatar: "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    teamBId: "t6",
    teamBName: "Apex Predators",
    teamBAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    status: "upcoming",
    scheduledTime: "Tomorrow at 18:30 GMT+3",
  },
  {
    id: "f4",
    round: 7,
    teamAId: "t1",
    teamAName: "Cyber Vortex Clan",
    teamAAvatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=80",
    teamBId: "t3",
    teamBName: "Nova Valkyries",
    teamBAvatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80",
    status: "completed",
    scoreA: 2,
    scoreB: 0,
    scheduledTime: "Yesterday",
    screenshotUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
  },
];

export default function TournamentsHub({
  currentUser,
  language,
}: {
  currentUser: UserProfile | null;
  language: "ar" | "en";
}) {
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "submit" | "create">("standings");
  const [teams, setTeams] = useState<TeamStanding[]>(INITIAL_TEAMS);
  const [fixtures, setFixtures] = useState<FixtureMatch[]>(INITIAL_FIXTURES);

  // Score submission state
  const [selectedMatchId, setSelectedMatchId] = useState<string>(fixtures[0].id);
  const [scoreAInput, setScoreAInput] = useState<number>(2);
  const [scoreBInput, setScoreBInput] = useState<number>(1);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Dispute state
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeMatchId, setDisputeMatchId] = useState<string>(fixtures[0].id);
  const [disputeReason, setDisputeReason] = useState("Rule violation / Ineligible player");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputeNotice, setDisputeNotice] = useState(false);

  // Create tournament state
  const [newTourneyTitle, setNewTourneyTitle] = useState("");
  const [newTourneyGame, setNewTourneyGame] = useState("Valorant");
  const [newTourneyPrize, setNewTourneyPrize] = useState("$10,000 USD");
  const [createNotice, setCreateNotice] = useState(false);

  const isAr = language === "ar";

  // Handle Score Submission
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = fixtures.map((f) => {
      if (f.id === selectedMatchId) {
        return {
          ...f,
          scoreA: scoreAInput,
          scoreB: scoreBInput,
          status: "completed" as const,
          screenshotUrl:
            screenshotPreview ||
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
        };
      }
      return f;
    });

    setFixtures(updated);

    // Update standings table based on result
    const targetMatch = fixtures.find((f) => f.id === selectedMatchId);
    if (targetMatch) {
      setTeams((prevTeams) => {
        const teamAWin = scoreAInput > scoreBInput;
        const teamBWin = scoreBInput > scoreAInput;
        const isDraw = scoreAInput === scoreBInput;

        return prevTeams
          .map((team) => {
            if (team.id === targetMatch.teamAId) {
              const ptsGain = teamAWin ? 3 : isDraw ? 1 : 0;
              const newW = team.w + (teamAWin ? 1 : 0);
              const newD = team.d + (isDraw ? 1 : 0);
              const newL = team.l + (teamBWin ? 1 : 0);
              const newGf = team.gf + scoreAInput;
              const newGa = team.ga + scoreBInput;
              const formTag: "W" | "D" | "L" = teamAWin ? "W" : isDraw ? "D" : "L";
              return {
                ...team,
                mp: team.mp + 1,
                w: newW,
                d: newD,
                l: newL,
                gf: newGf,
                ga: newGa,
                gd: newGf - newGa,
                pts: team.pts + ptsGain,
                form: [...team.form.slice(1), formTag],
              };
            }
            if (team.id === targetMatch.teamBId) {
              const ptsGain = teamBWin ? 3 : isDraw ? 1 : 0;
              const newW = team.w + (teamBWin ? 1 : 0);
              const newD = team.d + (isDraw ? 1 : 0);
              const newL = team.l + (teamAWin ? 1 : 0);
              const newGf = team.gf + scoreBInput;
              const newGa = team.ga + scoreAInput;
              const formTag: "W" | "D" | "L" = teamBWin ? "W" : isDraw ? "D" : "L";
              return {
                ...team,
                mp: team.mp + 1,
                w: newW,
                d: newD,
                l: newL,
                gf: newGf,
                ga: newGa,
                gd: newGf - newGa,
                pts: team.pts + ptsGain,
                form: [...team.form.slice(1), formTag],
              };
            }
            return team;
          })
          .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
          .map((t, idx) => ({ ...t, rank: idx + 1 }));
      });
    }

    setIsSubmitSuccess(true);
    setTimeout(() => {
      setIsSubmitSuccess(false);
      setActiveTab("standings");
    }, 1500);
  };

  // Handle Dispute Submission
  const handleDisputeSubmit = () => {
    setFixtures((prev) =>
      prev.map((f) =>
        f.id === disputeMatchId
          ? { ...f, status: "disputed" as const, disputeReason: `${disputeReason}: ${disputeNotes}` }
          : f
      )
    );
    setDisputeNotice(true);
    setTimeout(() => {
      setDisputeNotice(false);
      setIsDisputeOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#0a0f1d] via-[#10172e] to-[#0a0e1c] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                {isAr ? "دوري فاكسورا الإلكتروني المحترف" : "VEXORA PREMIER PRO LEAGUE"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono uppercase font-bold">
                Round Robin Official
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              {isAr ? "نظام الدوري والبطولات التنافسية" : "Competitive Esports Tournaments"}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl font-mono leading-relaxed">
              {isAr
                ? "جدول الترتيب المباشر (Round Robin) مع النقاط وفارق الجولات، وجدول المباريات، ورفع سكرين شوت النتيجة، وإدارة النزاعات الرسمية."
                : "Official Round Robin League standings table (MP, W, D, L, PTS, GD), fixture match schedule, score submission with screenshot verification, and referee dispute resolution."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("submit")}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <Upload className="w-4 h-4" />
              <span>{isAr ? "رفع نتيجة مباراة" : "Submit Match Result"}</span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-mono font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إنشاء بطولة" : "Create League"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => setActiveTab("standings")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "standings"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{isAr ? "جدول الترتيب (Standings)" : "League Table"}</span>
          </button>

          <button
            onClick={() => setActiveTab("fixtures")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "fixtures"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isAr ? "جدول المباريات (Fixtures)" : "Match Schedule"}</span>
          </button>

          <button
            onClick={() => setActiveTab("submit")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "submit"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isAr ? "رفع نتيجة وسكرين شوت" : "Submit Score"}</span>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? "إنشاء بطولة دوري" : "Create Tournament"}</span>
          </button>
        </div>
      </div>

      {/* 1. ROUND ROBIN LEAGUE STANDINGS TABLE */}
      {activeTab === "standings" && (
        <div className="bg-[#090d18] border border-white/5 rounded-3xl p-6 overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
            <div>
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>{isAr ? "جدول ترتيب دوري المحترفين (Round Robin Table)" : "Championship League Table"}</span>
              </h2>
              <p className="text-xs text-white/40 font-mono mt-0.5">
                {isAr ? "الفوز = 3 نقاط | التعادل = نقطة واحدة | الخسارة = 0" : "3 PTS for Win | 1 PT for Draw | 0 for Loss"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                1st - 4th: Playoffs
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30">
                7th - 8th: Relegation
              </span>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px]">
                  <th className="py-3 px-3 text-center">#</th>
                  <th className="py-3 px-4">{isAr ? "الفريق" : "Team"}</th>
                  <th className="py-3 px-3 text-center font-bold text-white/70" title="Matches Played">MP</th>
                  <th className="py-3 px-3 text-center text-emerald-400" title="Wins">W</th>
                  <th className="py-3 px-3 text-center text-amber-400" title="Draws">D</th>
                  <th className="py-3 px-3 text-center text-red-400" title="Losses">L</th>
                  <th className="py-3 px-3 text-center hidden md:table-cell" title="Goals / Rounds For">GF</th>
                  <th className="py-3 px-3 text-center hidden md:table-cell" title="Goals / Rounds Against">GA</th>
                  <th className="py-3 px-3 text-center" title="Goal Difference">GD</th>
                  <th className="py-3 px-4 text-center font-black text-cyan-300 text-sm" title="Total Points">PTS</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">{isAr ? "آخر 5 نتائج" : "Form"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                          team.rank === 1
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            : team.rank <= 4
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                            : "text-white/40"
                        }`}
                      >
                        {team.rank}
                      </span>
                    </td>

                    {/* Team info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={team.avatar}
                          alt={team.teamName}
                          className="w-9 h-9 rounded-xl object-cover border border-white/10 group-hover:border-cyan-500/40"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-xs tracking-wide">
                              {team.teamName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[8px] bg-white/5 border border-white/10 text-white/50 font-bold">
                              {team.tag}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/30 font-mono">
                            {isAr ? "كابتن الفريق:" : "Captain:"} {team.captain}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-3 text-center font-bold text-white/80">{team.mp}</td>
                    <td className="py-3.5 px-3 text-center text-emerald-400 font-bold">{team.w}</td>
                    <td className="py-3.5 px-3 text-center text-amber-400">{team.d}</td>
                    <td className="py-3.5 px-3 text-center text-red-400">{team.l}</td>
                    <td className="py-3.5 px-3 text-center text-white/40 hidden md:table-cell">{team.gf}</td>
                    <td className="py-3.5 px-3 text-center text-white/40 hidden md:table-cell">{team.ga}</td>
                    <td className="py-3.5 px-3 text-center font-bold">
                      <span className={team.gd > 0 ? "text-emerald-400" : team.gd < 0 ? "text-red-400" : "text-white/40"}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-cyan-300 text-sm">
                      {team.pts}
                    </td>

                    {/* Form indicator */}
                    <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        {team.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-md text-[9px] font-black flex items-center justify-center ${
                              res === "W"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : res === "D"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. MATCH FIXTURES & RESULTS */}
      {activeTab === "fixtures" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase text-white">
              {isAr ? "جدول مواجهات الدوري الرسمية" : "Official League Fixtures"}
            </h2>
            <button
              onClick={() => setIsDisputeOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAr ? "تقديم بلاغ نزاع تحكيمي" : "File Match Dispute"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixtures.map((f) => (
              <div
                key={f.id}
                className="p-5 rounded-3xl bg-[#0a0e1a] border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/5 pb-3">
                  <span className="text-white/40 uppercase">Round {f.round}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      f.status === "live"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                        : f.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : f.status === "disputed"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>

                {/* Teams VS */}
                <div className="flex items-center justify-between py-2">
                  {/* Team A */}
                  <div className="flex items-center gap-3 w-5/12">
                    <img
                      src={f.teamAAvatar}
                      alt={f.teamAName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10"
                    />
                    <span className="font-black text-xs text-white truncate">{f.teamAName}</span>
                  </div>

                  {/* Score / VS */}
                  <div className="flex flex-col items-center justify-center w-2/12 font-mono">
                    {f.scoreA !== undefined && f.scoreB !== undefined ? (
                      <div className="flex items-center gap-2 text-lg font-black text-cyan-300 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                        <span>{f.scoreA}</span>
                        <span className="text-white/30 text-xs">-</span>
                        <span>{f.scoreB}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-bold text-white/30">VS</span>
                    )}
                  </div>

                  {/* Team B */}
                  <div className="flex items-center justify-end gap-3 w-5/12 text-right">
                    <span className="font-black text-xs text-white truncate">{f.teamBName}</span>
                    <img
                      src={f.teamBAvatar}
                      alt={f.teamBName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-white/40">
                  <span>{f.scheduledTime}</span>
                  {f.screenshotUrl && (
                    <a
                      href={f.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{isAr ? "معاينة السكرين شوت" : "Proof Screenshot"}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUBMIT MATCH SCORE & SCREENSHOT PROOF */}
      {activeTab === "submit" && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-cyan-500/20 shadow-2xl">
          <div className="flex items-center gap-3 pb-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-white">
                {isAr ? "رفع نتيجة المباراة واعتماد السكرين شوت" : "Submit Match Result & Screenshot"}
              </h2>
              <p className="text-xs text-white/40 font-mono">
                {isAr ? "يتطلب نظام الدوري رفع لقطة شاشة للتحقق الرسمي من النتيجة" : "Requires screenshot proof for official league points verification"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitScore} className="space-y-6 mt-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                {isAr ? "اختر المباراة" : "Select Fixture Match"}
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              >
                {fixtures.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#0b101c]">
                    Round {f.round}: {f.teamAName} vs {f.teamBName} ({f.scheduledTime})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  {isAr ? "نقاط الفريق الأول (Team A)" : "Team A Rounds"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={scoreAInput}
                  onChange={(e) => setScoreAInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-purple-400">
                  {isAr ? "نقاط الفريق الثاني (Team B)" : "Team B Rounds"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={scoreBInput}
                  onChange={(e) => setScoreBInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Screenshot upload simulation */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                {isAr ? "سكرين شوت النتيجة النهائية (Proof Screenshot)" : "Proof Screenshot"}
              </label>
              <div
                onClick={() =>
                  setScreenshotPreview(
                    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
                  )
                }
                className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/[0.01]"
              >
                {screenshotPreview ? (
                  <div className="relative">
                    <img
                      src={screenshotPreview}
                      alt="Match proof"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                      Proof Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <Upload className="w-8 h-8 text-cyan-400/60" />
                    <span className="text-xs font-mono uppercase">
                      {isAr ? "اضغط لرفع لقطة الشاشة للتحقق" : "Click to attach match screenshot"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>{isAr ? "تم اعتماد النتيجة وتحديث جدول الدوري!" : "Score Approved & Table Updated!"}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>{isAr ? "إرسال النتيجة واعتماد النقاط" : "Submit & Update Standings"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 4. CREATE TOURNAMENT WIZARD */}
      {activeTab === "create" && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-cyan-500/20 shadow-2xl">
          <div className="flex items-center gap-3 pb-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-white">
                {isAr ? "إنشاء بطولة دوري جديدة (Round Robin League)" : "Create New Esports League"}
              </h2>
              <p className="text-xs text-white/40 font-mono">
                {isAr ? "أنشئ دوري محترف بنظام النقاط وجداول المواجهات المعتمدة" : "Setup an official tournament with automatic table standings and schedules"}
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCreateNotice(true);
              setTimeout(() => {
                setCreateNotice(false);
                setActiveTab("standings");
              }, 1200);
            }}
            className="space-y-5 mt-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                {isAr ? "اسم البطولة / الدوري" : "League Title"}
              </label>
              <input
                type="text"
                required
                value={newTourneyTitle}
                onChange={(e) => setNewTourneyTitle(e.target.value)}
                placeholder="e.g. Vexora Valorant Masters Cup Season 1"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  {isAr ? "اللعبة" : "Game"}
                </label>
                <select
                  value={newTourneyGame}
                  onChange={(e) => setNewTourneyGame(e.target.value)}
                  className="w-full bg-[#101422] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Valorant">Valorant</option>
                  <option value="CS2">Counter-Strike 2</option>
                  <option value="Rocket League">Rocket League</option>
                  <option value="League of Legends">League of Legends</option>
                  <option value="Overwatch 2">Overwatch 2</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                  {isAr ? "الجوائز المالية" : "Prize Pool"}
                </label>
                <input
                  type="text"
                  value={newTourneyPrize}
                  onChange={(e) => setNewTourneyPrize(e.target.value)}
                  placeholder="$10,000 USD"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? "هيكل البطولة: دوري كامل (Round Robin)" : "Format: Round Robin League"}</span>
              </div>
              <p className="text-[10px] text-white/50">
                {isAr
                  ? "كل فريق يواجه جميع الفرق الأخرى ذهاباً وإياباً، مع جدول ترتيب تلقائي."
                  : "All teams play against each other with automated points tallying."}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              {createNotice
                ? isAr ? "جاري تدشين الدوري بنجاح!" : "Launching League..."
                : isAr ? "تدشين البطولة والجدول الرسمي" : "Publish League & Generate Fixtures"}
            </button>
          </form>
        </div>
      )}

      {/* DISPUTE MODAL */}
      <AnimatePresence>
        {isDisputeOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0b101c] border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{isAr ? "تقديم تظلم / نزاع في المباراة" : "File Official Match Dispute"}</span>
                </div>
                <button
                  onClick={() => setIsDisputeOpen(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-white/50">
                  {isAr ? "سبب النزاع" : "Dispute Category"}
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white"
                >
                  <option value="Rule violation">Rule violation / Ineligible player</option>
                  <option value="No show / Walkover">No show / Forfeit</option>
                  <option value="Cheating / Unapproved software">Cheating / Unapproved software</option>
                  <option value="Wrong score submitted">Wrong score submitted</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-white/50">
                  {isAr ? "تفاصيل الشكوى والأدلة" : "Dispute Details & Evidence"}
                </label>
                <textarea
                  rows={3}
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Describe what occurred, round number, timestamp..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => setIsDisputeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-mono text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisputeSubmit}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs font-mono uppercase tracking-wider"
                >
                  {disputeNotice ? "Dispute Filed!" : "Submit to Referees"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
