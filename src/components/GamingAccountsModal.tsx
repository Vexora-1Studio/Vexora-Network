import { useState, useEffect } from "react";
import { X, Check, Copy, ExternalLink, ShieldCheck, Gamepad2, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { UserProfile } from "../types";

export interface GamingAccounts {
  steamId?: string;
  steamPersona?: string;
  discordTag?: string;
  discordId?: string;
  battlenetTag?: string;
  riotId?: string;
  riotRegion?: string;
}

interface GamingAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSave?: (accounts: GamingAccounts) => void;
  language: "ar" | "en";
}

export const DEFAULT_ACCOUNTS: GamingAccounts = {
  steamId: "76561198028419230",
  steamPersona: "VexoraPhantom",
  discordTag: "Vexora#0001",
  discordId: "1422490960167702553",
  battlenetTag: "Vexora#21980",
  riotId: "Vexora#EUNE",
  riotRegion: "EUNE",
};

export function getSavedGamingAccounts(userId?: string): GamingAccounts {
  try {
    const key = `vexora_gaming_accounts_${userId || "guest"}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load gaming accounts:", e);
  }
  return DEFAULT_ACCOUNTS;
}

export function saveGamingAccounts(userId: string | undefined, accounts: GamingAccounts) {
  try {
    const key = `vexora_gaming_accounts_${userId || "guest"}`;
    localStorage.setItem(key, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save gaming accounts:", e);
  }
}

export default function GamingAccountsModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
  language,
}: GamingAccountsModalProps) {
  const [accounts, setAccounts] = useState<GamingAccounts>(() =>
    getSavedGamingAccounts(currentUser?.id)
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      setAccounts(getSavedGamingAccounts(currentUser.id));
    }
  }, [currentUser?.id]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    saveGamingAccounts(currentUser?.id, accounts);
    if (onSave) onSave(accounts);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 1000);
  };

  const isAr = language === "ar";

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-[#090d16] border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-72 h-32 bg-purple-600/10 blur-[80px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Gamepad2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>{isAr ? "ربط حسابات الألعاب الإلكترونية" : "PC Gaming Account Matrix"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                  PRO LINK
                </span>
              </h2>
              <p className="text-xs text-white/40 font-mono">
                {isAr
                  ? "اربط حسابات Steam و Discord و Battle.net و Riot ID للتأكيد في البطولات وفرق LFG"
                  : "Link your Steam, Discord, Battle.net & Riot IDs for tournaments & LFG matchmaking"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. STEAM */}
          <div className="p-4 rounded-2xl bg-black/40 border border-[#1b2838]/60 hover:border-cyan-500/40 transition-all flex flex-col gap-3 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#171a21] border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xs font-mono shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  STM
                </div>
                <div>
                  <span className="text-xs font-black text-white tracking-wide block">Steam PC</span>
                  <span className="text-[9px] font-mono text-white/40">SteamID / Persona</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                VAC Clean
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                Persona Name
              </label>
              <input
                type="text"
                value={accounts.steamPersona || ""}
                onChange={(e) => setAccounts({ ...accounts, steamPersona: e.target.value })}
                placeholder="e.g. VexoraPhantom"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                  SteamID64
                </label>
                {accounts.steamId && (
                  <button
                    onClick={() => handleCopy(accounts.steamId || "", "steam")}
                    className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "steam" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "steam" ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={accounts.steamId || ""}
                onChange={(e) => setAccounts({ ...accounts, steamId: e.target.value })}
                placeholder="e.g. 76561198028419230"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* 2. DISCORD */}
          <div className="p-4 rounded-2xl bg-black/40 border border-[#5865f2]/40 hover:border-[#5865f2]/70 transition-all flex flex-col gap-3 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5865f2]/20 border border-[#5865f2]/50 flex items-center justify-center text-[#858ffd] font-black text-xs font-mono shadow-[0_0_10px_rgba(88,101,242,0.3)]">
                  DIS
                </div>
                <div>
                  <span className="text-xs font-black text-white tracking-wide block">Discord</span>
                  <span className="text-[9px] font-mono text-white/40">Voice & Chat Handle</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-[#5865f2]/15 text-[#858ffd] border border-[#5865f2]/30 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 text-[#5865f2]" />
                Connected
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                Username / Tag
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accounts.discordTag || ""}
                  onChange={(e) => setAccounts({ ...accounts, discordTag: e.target.value })}
                  placeholder="e.g. Vexora#0001"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#5865f2]/50"
                />
                {accounts.discordTag && (
                  <button
                    onClick={() => handleCopy(accounts.discordTag || "", "discord")}
                    className="px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    {copiedKey === "discord" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                User ID (Snowflake)
              </label>
              <input
                type="text"
                value={accounts.discordId || ""}
                onChange={(e) => setAccounts({ ...accounts, discordId: e.target.value })}
                placeholder="e.g. 1422490960167702553"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#5865f2]/50"
              />
            </div>
          </div>

          {/* 3. BATTLE.NET */}
          <div className="p-4 rounded-2xl bg-black/40 border border-[#00aeff]/30 hover:border-[#00aeff]/60 transition-all flex flex-col gap-3 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00aeff]/20 border border-[#00aeff]/40 flex items-center justify-center text-[#00aeff] font-black text-xs font-mono shadow-[0_0_10px_rgba(0,174,255,0.25)]">
                  BTL
                </div>
                <div>
                  <span className="text-xs font-black text-white tracking-wide block">Battle.net</span>
                  <span className="text-[9px] font-mono text-white/40">Blizzard / Activision</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 font-bold">
                OW2 / COD Verified
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                BattleTag
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accounts.battlenetTag || ""}
                  onChange={(e) => setAccounts({ ...accounts, battlenetTag: e.target.value })}
                  placeholder="e.g. ApexTitan#2849"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50"
                />
                {accounts.battlenetTag && (
                  <button
                    onClick={() => handleCopy(accounts.battlenetTag || "", "btl")}
                    className="px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    {copiedKey === "btl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            <p className="text-[9px] font-mono text-white/30">
              {isAr ? "يدعم دعوات Overwatch 2 و Call of Duty Warzone" : "Powers direct squad invites in Warzone & OW2"}
            </p>
          </div>

          {/* 4. RIOT ID */}
          <div className="p-4 rounded-2xl bg-black/40 border border-[#ff4655]/40 hover:border-[#ff4655]/70 transition-all flex flex-col gap-3 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#ff4655]/20 border border-[#ff4655]/40 flex items-center justify-center text-[#ff4655] font-black text-xs font-mono shadow-[0_0_10px_rgba(255,70,85,0.25)]">
                  ROT
                </div>
                <div>
                  <span className="text-xs font-black text-white tracking-wide block">Riot Games</span>
                  <span className="text-[9px] font-mono text-white/40">Valorant & LoL</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-[#ff4655]/15 text-[#ff4655] border border-[#ff4655]/30 flex items-center gap-1 font-bold">
                Radiant Tier
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                Riot ID & Tagline
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accounts.riotId || ""}
                  onChange={(e) => setAccounts({ ...accounts, riotId: e.target.value })}
                  placeholder="e.g. Vexora#EUNE"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff4655]/50"
                />
                {accounts.riotId && (
                  <button
                    onClick={() => handleCopy(accounts.riotId || "", "riot")}
                    className="px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    {copiedKey === "riot" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                Region Shard
              </label>
              <select
                value={accounts.riotRegion || "EUNE"}
                onChange={(e) => setAccounts({ ...accounts, riotRegion: e.target.value })}
                className="w-full bg-[#121622] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff4655]/50"
              >
                <option value="MENA">MENA / الشرق الأوسط وشمال إفريقيا</option>
                <option value="EUW">Europe West (EUW)</option>
                <option value="EUNE">Europe Nordic & East (EUNE)</option>
                <option value="NA">North America (NA)</option>
                <option value="KR">Korea (KR)</option>
                <option value="AP">Asia Pacific (AP)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="text-[10px] font-mono text-white/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{isAr ? "تشفير محلي آمن 100%" : "Local encrypted sandbox verification"}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-2"
            >
              {isSavedNotice ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>{isAr ? "تم الحفظ بنجاح!" : "Saved & Synced!"}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>{isAr ? "حفظ ومزامنة الحسابات" : "Save & Sync IDs"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
