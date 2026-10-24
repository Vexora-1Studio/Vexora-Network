import React, { useState, useEffect } from 'react';
import {
  X, Shield, Crown, Swords, User, Bell, BellOff, Trash2,
  Share2, Image as ImageIcon, FileText, Link as LinkIcon,
  Mic, CheckCircle2, Clock, Play, ExternalLink, Flame,
  AlertTriangle, Check, Copy, UserPlus
} from 'lucide-react';
import { ConversationItem, ChatMessageItem, TeamMember } from './messagingTypes';

interface ChatDetailsPanelProps {
  conversation: ConversationItem;
  messages: ChatMessageItem[];
  currentUserId: string;
  onClose: () => void;
  onToggleMute: () => void;
  onClearHistory: () => void;
  onToggleMemberReady?: (memberId: string) => void;
  language: 'en' | 'ar';
}

type TabType = 'lobby' | 'members' | 'media' | 'files' | 'links' | 'pins';

export const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({
  conversation,
  messages,
  currentUserId,
  onClose,
  onToggleMute,
  onClearHistory,
  onToggleMemberReady,
  language
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(
    conversation.type === 'team' ? 'lobby' : 'media'
  );
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Scrim Match Countdown Timer State for Team Lobby
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleStartMatchCountdown = () => {
    setCountdown(10);
  };

  // Extract shared media from messages
  const sharedMedia = messages.flatMap((m) =>
    (m.attachments || []).filter((a) => a.type === 'image' || a.type === 'video')
  );

  const sharedFiles = messages.flatMap((m) =>
    (m.attachments || []).filter((a) => a.type === 'file')
  );

  const sharedVoice = messages.filter((m) => m.voiceNote);

  const pinnedMessages = messages.filter((m) => m.isPinned);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const members = conversation.members || [];
  const readyMembersCount = members.filter((m) => m.isReady).length;
  const isCurrentUserReady = members.find((m) => m.id === currentUserId)?.isReady ?? false;

  return (
    <div className="w-full lg:w-[320px] xl:w-[360px] h-full flex flex-col bg-[#080d19]/95 border-l border-cyan-500/10 backdrop-blur-2xl z-20 select-none overflow-hidden animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
          {language === 'ar' ? 'معلومات وبيانات المحادثة' : 'Transmission Radar'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {/* Profile / Team Banner Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className={`w-20 h-20 rounded-2xl object-cover border-2 ${
                conversation.type === 'team'
                  ? 'border-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : conversation.type === 'room'
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'border-white/20'
              }`}
            />
            {conversation.isOwner && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-yellow-500 text-black font-black text-[8px] font-mono shadow-md flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" />
                <span>OWNER</span>
              </span>
            )}
          </div>

          <div>
            <h4 className="font-black text-base text-white">{conversation.name}</h4>
            {conversation.handle && (
              <p className="text-xs font-mono text-cyan-400">@{conversation.handle}</p>
            )}
            {conversation.teamGame && (
              <p className="text-xs font-mono text-yellow-400 font-bold mt-1">
                🎮 {conversation.teamGame} • {conversation.teamRank || 'Competitive Roster'}
              </p>
            )}
          </div>

          {conversation.bio && (
            <p className="text-xs text-white/60 font-sans leading-relaxed max-w-xs">
              {conversation.bio}
            </p>
          )}
          {conversation.description && (
            <p className="text-xs text-white/60 font-sans leading-relaxed max-w-xs">
              {conversation.description}
            </p>
          )}
        </div>

        {/* GAMING TEAM READY LOBBY SECTION */}
        {conversation.type === 'team' && (
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-yellow-950/30 via-[#0e1628] to-cyan-950/20 border border-yellow-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400">
                  {language === 'ar' ? 'غرفة الجاهزية (Team Ready)' : 'Team Ready Lobby'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-mono text-[10px] font-bold border border-yellow-500/40">
                {readyMembersCount} / {members.length} {language === 'ar' ? 'جاهزون' : 'Ready'}
              </span>
            </div>

            {/* Match Countdown Notification if Active */}
            {countdown !== null && (
              <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-mono text-white font-bold uppercase">
                    {language === 'ar' ? 'بدء المواجهة خلال:' : 'Match Commencing In:'}
                  </span>
                </div>
                <span className="text-xl font-mono font-black text-cyan-300">
                  00:{countdown.toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Member Ready Roster */}
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{member.name}</span>
                      <span className="text-[9px] font-mono text-white/40 block">{member.gameRank}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-black uppercase flex items-center gap-1 ${
                      member.isReady
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {member.isReady ? (
                      <>
                        <Check className="w-2.5 h-2.5" />
                        <span>READY</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-2.5 h-2.5" />
                        <span>NOT READY</span>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Toggle My Ready Status Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => onToggleMemberReady && onToggleMemberReady(currentUserId)}
                className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  isCurrentUserReady
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                }`}
              >
                <Check className="w-4 h-4 font-black" />
                <span>
                  {isCurrentUserReady
                    ? language === 'ar'
                      ? 'أنا جاهز (اضغط للإلغاء) ✓'
                      : 'I Am Ready (Click to Cancel) ✓'
                    : language === 'ar'
                    ? 'تأكيد الجاهزية للمباراة ⚔️'
                    : 'Declare Ready for Scrim ⚔️'}
                </span>
              </button>

              {/* Start Scrim match button */}
              <button
                onClick={handleStartMatchCountdown}
                disabled={countdown !== null}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-[10px] uppercase font-bold tracking-wider transition-all border border-white/5 cursor-pointer disabled:opacity-50"
              >
                {language === 'ar' ? 'بدء العد التنازلي للمواجهة (30s)' : 'Initiate Match Countdown'}
              </button>
            </div>
          </div>
        )}

        {/* LINKED GAMING ACCOUNTS (FOR DIRECT CHATS) */}
        {conversation.type === 'direct' && (
          <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold block">
              {language === 'ar' ? 'حسابات الألعاب المرتبطة' : 'Linked Gaming Accounts'}
            </span>

            <div className="space-y-2">
              {[
                { platform: 'Steam ID', id: '76561198829402199', icon: '🎮' },
                { platform: 'Riot ID', id: `${conversation.name.replace(/\s+/g, '')}#VEX`, icon: '🎯' },
                { platform: 'Discord', id: `${conversation.handle || 'player'}#0001`, icon: '💬' },
                { platform: 'Battle.net', id: `${conversation.name.replace(/\s+/g, '')}#2490`, icon: '⚡' }
              ].map((acc) => (
                <div
                  key={acc.platform}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{acc.icon}</span>
                    <div className="min-w-0">
                      <span className="text-[9px] text-white/40 block">{acc.platform}</span>
                      <span className="text-white font-bold truncate block">{acc.id}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(acc.id, acc.platform)}
                    className="p-1.5 rounded-lg hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-colors"
                    title="Copy ID"
                  >
                    {copiedAccount === acc.platform ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHARED MEDIA, FILES, LINKS & PINNED TABS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] font-mono uppercase tracking-wider">
            <span className="text-white/40 font-bold">{language === 'ar' ? 'الوسائط المشتركة' : 'Shared Archive'}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('media')}
                className={`transition-colors ${activeTab === 'media' ? 'text-cyan-400 font-bold' : 'text-white/40 hover:text-white'}`}
              >
                Media ({sharedMedia.length})
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('files')}
                className={`transition-colors ${activeTab === 'files' ? 'text-cyan-400 font-bold' : 'text-white/40 hover:text-white'}`}
              >
                Files ({sharedFiles.length})
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('pins')}
                className={`transition-colors ${activeTab === 'pins' ? 'text-cyan-400 font-bold' : 'text-white/40 hover:text-white'}`}
              >
                Pins ({pinnedMessages.length})
              </button>
            </div>
          </div>

          {/* Media Grid */}
          {activeTab === 'media' && (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.length === 0 ? (
                <div className="col-span-3 py-6 text-center text-[10px] font-mono text-white/30">
                  {language === 'ar' ? 'لا توجد صور أو مقاطع فيديو بعد' : 'No shared media detected'}
                </div>
              ) : (
                sharedMedia.map((att) => (
                  <img
                    key={att.id}
                    src={att.url}
                    alt={att.name}
                    className="w-full h-20 rounded-xl object-cover border border-white/10 hover:border-cyan-400 transition-all cursor-pointer"
                  />
                ))
              )}
            </div>
          )}

          {/* Files List */}
          {activeTab === 'files' && (
            <div className="space-y-1.5">
              {sharedFiles.length === 0 ? (
                <div className="py-6 text-center text-[10px] font-mono text-white/30">
                  {language === 'ar' ? 'لا توجد مستندات مرفقة' : 'No tactical files attached'}
                </div>
              ) : (
                sharedFiles.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 rounded-xl bg-white/[0.03] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="truncate text-white font-bold">{att.name}</span>
                    </div>
                    <span className="text-[10px] text-white/40">{att.size}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pinned Messages */}
          {activeTab === 'pins' && (
            <div className="space-y-2">
              {pinnedMessages.length === 0 ? (
                <div className="py-6 text-center text-[10px] font-mono text-white/30">
                  {language === 'ar' ? 'لا توجد رسائل مثبتة' : 'No pinned transmissions'}
                </div>
              ) : (
                pinnedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[9px] text-cyan-400 font-bold">
                      <span>{msg.senderName}</span>
                      <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white/80 font-sans text-xs">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* CONVERSATION PRIVACY & ACTIONS */}
        <div className="pt-4 border-t border-white/5 space-y-2 text-xs font-mono">
          <button
            onClick={onToggleMute}
            className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {conversation.isMuted ? (
                <Bell className="w-4 h-4 text-amber-400" />
              ) : (
                <BellOff className="w-4 h-4 text-white/40" />
              )}
              <span>
                {conversation.isMuted
                  ? language === 'ar' ? 'إلغاء كتم الإشعارات' : 'Unmute Notifications'
                  : language === 'ar' ? 'كتم الإشعارات' : 'Mute Notifications'}
              </span>
            </span>
          </button>

          <button
            onClick={onClearHistory}
            className="w-full p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-between text-red-400 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'مسح سجل الرسائل' : 'Clear Message History'}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
