import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, Video, Search, Info, Pin, ChevronLeft, Check,
  CheckCheck, Clock, Smile, CornerUpLeft, MoreVertical,
  Play, Pause, Download, Volume2, Shield, Crown, Swords,
  Edit2, Trash2, X, ExternalLink, Flame
} from 'lucide-react';
import { ConversationItem, ChatMessageItem } from './messagingTypes';

interface ActiveChatAreaProps {
  conversation: ConversationItem;
  messages: ChatMessageItem[];
  currentUserId: string;
  onInitiateCall: (type: 'voice' | 'video') => void;
  onToggleInfoPanel: () => void;
  isInfoPanelOpen: boolean;
  onBackToList: () => void;
  onReplyToMessage: (msg: ChatMessageItem) => void;
  onEditMessage: (msg: ChatMessageItem) => void;
  onDeleteMessage: (msgId: string) => void;
  onUnsendMessage?: (msgId: string) => void;
  onDeleteForMe?: (msgId: string) => void;
  onToggleReaction: (msgId: string, emoji: string) => void;
  onTogglePinMessage: (msgId: string) => void;
  onJumpToMessage?: (msgId: string) => void;
  typingText?: string | null;
  language: 'en' | 'ar';
}

export const ActiveChatArea: React.FC<ActiveChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onInitiateCall,
  onToggleInfoPanel,
  isInfoPanelOpen,
  onBackToList,
  onReplyToMessage,
  onEditMessage,
  onDeleteMessage,
  onUnsendMessage,
  onDeleteForMe,
  onToggleReaction,
  onTogglePinMessage,
  typingText,
  language
}) => {
  const [inChatSearch, setInChatSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState<string | null>(null);
  const [deleteMenuMsgId, setDeleteMenuMsgId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState<number>(1);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  // Handle voice note audio playback
  const togglePlayVoice = (msgId: string, audioUrl: string) => {
    if (playingVoiceId === msgId) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setPlayingVoiceId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audio.playbackRate = voicePlaybackSpeed;
      audio.onended = () => setPlayingVoiceId(null);
      audioElementRef.current = audio;
      audio.play().catch((err) => console.warn('Audio play blocked:', err));
      setPlayingVoiceId(msgId);
    }
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(voicePlaybackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setVoicePlaybackSpeed(nextSpeed);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextSpeed;
    }
  };

  // Find pinned message if any
  const pinnedMessage = messages.find((m) => m.isPinned);

  // Helper for human-readable last active timestamp
  const formatLastSeen = (lastActive?: string | number) => {
    if (!lastActive) return language === 'ar' ? 'غير متصل' : 'Offline';
    const time = typeof lastActive === 'number' ? lastActive : new Date(lastActive).getTime();
    if (isNaN(time)) return language === 'ar' ? 'غير متصل' : 'Offline';
    const diffMins = Math.floor((Date.now() - time) / 60000);
    if (diffMins < 3) return language === 'ar' ? 'متصل الآن' : 'Active now';
    if (diffMins < 60) return language === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    const days = Math.floor(diffHours / 24);
    return language === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const isPeerOnline = () => {
    if (conversation.type !== 'direct' || !conversation.lastActive) return false;
    const time = typeof conversation.lastActive === 'number' ? conversation.lastActive : new Date(conversation.lastActive).getTime();
    if (isNaN(time)) return false;
    return Date.now() - time < 3 * 60 * 1000;
  };

  // Filter messages based on in-chat search and delete-for-me
  const visibleMessages = messages
    .filter((m) => !(m.deletedFor && m.deletedFor.includes(currentUserId)))
    .filter((m) => {
      if (!inChatSearch.trim()) return true;
      return (
        (m.text && m.text.toLowerCase().includes(inChatSearch.toLowerCase())) ||
        (m.senderName && m.senderName.toLowerCase().includes(inChatSearch.toLowerCase()))
      );
    });

  const renderStatusTick = (status: string, seenAt?: string) => {
    switch (status) {
      case 'sending':
        return (
          <span className="flex items-center gap-1 text-[8.5px] font-mono text-white/40" title="Sending...">
            <Clock className="w-2.5 h-2.5 animate-spin text-cyan-400" />
            <span className="hidden sm:inline">{language === 'ar' ? 'جارِ الإرسال' : 'Sending'}</span>
          </span>
        );
      case 'sent':
        return (
          <span className="flex items-center gap-1 text-[8.5px] font-mono text-white/50" title="Sent to server">
            <Check className="w-3 h-3 text-white/50" />
            <span className="hidden sm:inline">{language === 'ar' ? 'مرسل' : 'Sent'}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1 text-[8.5px] font-mono text-white/60" title="Delivered to recipient">
            <CheckCheck className="w-3.5 h-3.5 text-white/60" />
            <span className="hidden sm:inline">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</span>
          </span>
        );
      case 'read':
      case 'seen':
        return (
          <span
            className="flex items-center gap-1 text-[8.5px] font-mono text-cyan-400 font-bold"
            title={seenAt ? `Seen ${new Date(seenAt).toLocaleTimeString()}` : 'Seen by recipient'}
          >
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]" />
            <span className="hidden sm:inline">{language === 'ar' ? 'تمت الرؤية' : 'Seen'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#060a14] relative overflow-hidden select-text">
      {/* Top Header Bar */}
      <div className="h-16 px-4 md:px-6 border-b border-cyan-500/10 bg-[#080d19]/80 backdrop-blur-2xl flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={onBackToList}
            className="lg:hidden p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Conversation Avatar & Title */}
          <div className="relative flex-shrink-0 cursor-pointer" onClick={onToggleInfoPanel}>
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className={`w-10 h-10 rounded-xl object-cover border ${
                conversation.type === 'team'
                  ? 'border-yellow-500/50'
                  : conversation.type === 'room'
                  ? 'border-cyan-500/50'
                  : 'border-white/10'
              }`}
            />
            {conversation.type === 'direct' && (
              isPeerOnline() ? (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              ) : (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-zinc-600 border border-black" />
              )
            )}
          </div>

          <div className="min-w-0 cursor-pointer" onClick={onToggleInfoPanel}>
            <div className="flex items-center gap-1.5">
              <h2 className="font-black text-sm md:text-base text-white truncate font-sans tracking-tight">
                {conversation.name}
              </h2>
              {conversation.isOwner && (
                <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[8px] font-mono font-black flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 text-yellow-300" />
                  <span>OWNER</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              {conversation.type === 'direct' && (
                isPeerOnline() ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span>{language === 'ar' ? 'متصل الآن' : 'Active now'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-white/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <span>{formatLastSeen(conversation.lastActive)}</span>
                  </span>
                )
              )}
              {conversation.type === 'team' && (
                <span className="text-yellow-400 font-bold flex items-center gap-1">
                  <Swords className="w-3 h-3" />
                  <span>{conversation.teamGame} • {conversation.teamRank || 'Roster'}</span>
                </span>
              )}
              {conversation.type === 'room' && (
                <span className="text-cyan-400 font-bold">
                  {conversation.onlineCount?.toLocaleString()} {language === 'ar' ? 'لاعب متصل' : 'Gamers Online'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search in chat toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isSearchOpen ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-white/50 hover:text-white'
            }`}
            title="Search in conversation"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Voice & Video Call Buttons */}
          <button
            onClick={() => onInitiateCall('voice')}
            className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)] active:scale-95"
            title="Start Encrypted Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => onInitiateCall('video')}
            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.15)] active:scale-95"
            title="Start Holographic Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Info Panel toggle button */}
          <button
            onClick={onToggleInfoPanel}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isInfoPanelOpen
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'hover:bg-white/10 text-white/50 hover:text-white'
            }`}
            title="Conversation Details & Team Lobby"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-chat search bar */}
      {isSearchOpen && (
        <div className="p-2.5 px-4 bg-[#0a101f] border-b border-cyan-500/20 flex items-center justify-between gap-2 text-xs font-mono animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={inChatSearch}
              onChange={(e) => setInChatSearch(e.target.value)}
              placeholder={language === 'ar' ? 'بحث في رسائل هذه المحادثة...' : 'Search within this transmission...'}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          {inChatSearch && (
            <span className="text-[10px] text-cyan-400 font-mono whitespace-nowrap">
              {visibleMessages.length} {language === 'ar' ? 'نتائج' : 'found'}
            </span>
          )}
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setInChatSearch('');
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pinned Message Ribbon */}
      {pinnedMessage && (
        <div
          onClick={() => {
            const el = document.getElementById(`msg-${pinnedMessage.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/20 border-b border-cyan-500/20 flex items-center justify-between gap-3 text-xs font-mono cursor-pointer hover:bg-white/[0.03] transition-colors z-10"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40 flex-shrink-0" />
            <span className="text-cyan-400 font-bold text-[10px] uppercase flex-shrink-0">
              {language === 'ar' ? 'رسالة مثبتة:' : 'Pinned Signal:'}
            </span>
            <p className="text-white/70 truncate text-[11px] font-sans">{pinnedMessage.text}</p>
          </div>
          <span className="text-[9px] text-cyan-400 hover:underline uppercase tracking-wider flex-shrink-0">
            {language === 'ar' ? 'انتقال ←' : 'Jump →'}
          </span>
        </div>
      )}

      {/* Message Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Swords className="w-8 h-8" />
            </div>
            <p className="text-sm font-mono text-white/70 font-bold uppercase tracking-wider">
              {language === 'ar' ? 'بداية مسار المحادثة' : 'Encrypted Frequency Primed'}
            </p>
            <p className="text-xs font-mono text-white/40 max-w-sm">
              {language === 'ar'
                ? 'لا توجد رسائل سابقة هنا. اكتب رسالة لبدء التواصل أو التنسيق للألعاب.'
                : 'Transmit a message below to establish connection with this node.'}
            </p>
          </div>
        ) : (
          visibleMessages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const isReactionPickerOpen = activeReactionPickerMsgId === msg.id;

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`group relative flex gap-3 transition-colors ${
                  isMe ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Sender Avatar */}
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0 self-start mt-1"
                />

                {/* Message Bubble & Content */}
                <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name & Role */}
                  <div className={`flex items-center gap-2 text-[10px] font-mono ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-bold text-white/80">{msg.senderName}</span>
                    {msg.senderRole === 'owner' && (
                      <span className="px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[7px] font-bold">
                        OWNER
                      </span>
                    )}
                    {msg.senderRole === 'admin' && (
                      <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[7px] font-bold">
                        ADMIN
                      </span>
                    )}
                    <span className="text-white/30 text-[9px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.isPinned && (
                      <Pin className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400/30" />
                    )}
                  </div>

                  {/* Reply Reference Preview */}
                  {msg.replyTo && (
                    <div
                      className={`p-1.5 px-2.5 rounded-lg text-[10px] font-mono border-l-2 mb-1 ${
                        isMe
                          ? 'bg-blue-950/40 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-purple-400 text-purple-300'
                      }`}
                    >
                      <span className="font-bold block text-[9px] opacity-75">
                        ↪ {msg.replyTo.senderName}
                      </span>
                      <p className="truncate text-white/60">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {/* Main Bubble Body */}
                  <div
                    className={`p-3 rounded-2xl relative shadow-md ${
                      msg.isUnsent
                        ? 'bg-white/[0.03] border border-white/5 text-white/40 italic'
                        : isMe
                        ? 'bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-purple-600/20 border border-cyan-500/40 text-white rounded-tr-none'
                        : 'bg-[#0f172a]/90 border border-white/10 text-white/90 rounded-tl-none hover:border-white/20'
                    }`}
                  >
                    {msg.isUnsent ? (
                      <div className="py-0.5 flex items-center gap-2 text-white/40 text-xs font-sans">
                        <Trash2 className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                        <span>{language === 'ar' ? 'تم إلغاء إرسال هذه الرسالة' : 'This message was unsent'}</span>
                      </div>
                    ) : (
                      <>
                        {/* Text Message Content */}
                        {msg.text && (
                          <p className="text-xs md:text-sm font-sans leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        )}

                        {/* Voice Note Player */}
                        {msg.voiceNote && (
                          <div className="mt-2 p-2 rounded-xl bg-black/40 border border-cyan-500/30 flex items-center gap-3 min-w-[220px]">
                            <button
                              onClick={() => togglePlayVoice(msg.id, msg.voiceNote!.url)}
                              className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.6)] flex-shrink-0"
                            >
                              {playingVoiceId === msg.id ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>

                            {/* Animated / Synthetic Waveform */}
                            <div className="flex-1 flex items-center gap-1 h-6">
                              {(msg.voiceNote.waveform || [20, 40, 60, 80, 40, 70, 90, 50, 30, 80, 60, 40]).map((h, wi) => (
                                <span
                                  key={wi}
                                  style={{ height: `${h}%` }}
                                  className={`w-1 rounded-full transition-all duration-200 ${
                                    playingVoiceId === msg.id
                                      ? 'bg-cyan-400 animate-pulse'
                                      : 'bg-white/30'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Speed & duration controls */}
                            <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300">
                              <button
                                onClick={cyclePlaybackSpeed}
                                className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                              >
                                {voicePlaybackSpeed}x
                              </button>
                              <span>{msg.voiceNote.duration}s</span>
                            </div>
                          </div>
                        )}

                        {/* Image / Video / File Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((att) => (
                              <div key={att.id} className="rounded-xl overflow-hidden border border-white/10">
                                {att.type === 'image' && (
                                  <img
                                    src={att.url}
                                    alt={att.name}
                                    onClick={() => setSelectedLightboxImage(att.url)}
                                    className="w-full max-h-60 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                                  />
                                )}
                                {att.type === 'file' && (
                                  <div className="p-3 bg-black/40 flex items-center justify-between gap-3 font-mono text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                      <Download className="w-4 h-4 text-cyan-400" />
                                      <span className="truncate text-white font-bold">{att.name}</span>
                                    </div>
                                    <span className="text-[10px] text-white/40">{att.size}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Bottom Status / Edited indicator */}
                    <div className="flex items-center justify-end gap-1.5 mt-1 pt-0.5 text-[9px] font-mono text-white/40">
                      {msg.editedAt && !msg.isUnsent && <span>(edited)</span>}
                      {isMe && !msg.isUnsent && renderStatusTick(msg.status, msg.seenAt)}
                    </div>
                  </div>

                  {/* Reaction Badges Below Bubble */}
                  {!msg.isUnsent && msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, rawData]) => {
                        const data = rawData as { count: number; users: string[] };
                        const hasReacted = data.users?.includes(currentUserId);
                        return (
                          <button
                            key={emoji}
                            onClick={() => onToggleReaction(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border transition-all cursor-pointer ${
                              hasReacted
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-mono font-bold">{data.count || 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Quick Action Toolbar on Hover */}
                {!msg.isUnsent && (
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 ${
                      isMe ? 'left-2' : 'right-2'
                    } -translate-y-2 flex items-center gap-0.5 p-1 rounded-xl bg-[#0e1628] border border-cyan-500/30 shadow-xl backdrop-blur-md z-10 text-white/60`}
                  >
                    {/* Quick Reactions */}
                    <button
                      onClick={() => setActiveReactionPickerMsgId(isReactionPickerOpen ? null : msg.id)}
                      className="p-1 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition-colors"
                      title="Add Reaction"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>

                    {/* Reply */}
                    <button
                      onClick={() => onReplyToMessage(msg)}
                      className="p-1 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition-colors"
                      title="Reply"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Pin */}
                    <button
                      onClick={() => onTogglePinMessage(msg.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        msg.isPinned ? 'text-cyan-400' : 'hover:bg-white/10 hover:text-cyan-400'
                      }`}
                      title={msg.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit (if own) */}
                    {isMe && (
                      <button
                        onClick={() => onEditMessage(msg)}
                        className="p-1 rounded-lg hover:bg-white/10 hover:text-yellow-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete / Unsend Popup */}
                    <div className="relative">
                      <button
                        onClick={() => setDeleteMenuMsgId(deleteMenuMsgId === msg.id ? null : msg.id)}
                        className="p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title={language === 'ar' ? 'خيارات الحذف' : 'Delete options'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {deleteMenuMsgId === msg.id && (
                        <div
                          className={`absolute z-40 bottom-full ${
                            isMe ? 'right-0' : 'left-0'
                          } mb-2 w-48 p-1.5 rounded-xl bg-[#090e1a] border border-cyan-500/30 shadow-2xl backdrop-blur-xl flex flex-col gap-1 text-[11px] font-mono`}
                        >
                          {isMe && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onUnsendMessage) onUnsendMessage(msg.id);
                                else onDeleteMessage(msg.id);
                                setDeleteMenuMsgId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-300 hover:text-white transition-all text-left flex items-center gap-2 cursor-pointer"
                            >
                              <CornerUpLeft className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{language === 'ar' ? 'إلغاء الإرسال للجميع' : 'Unsend for everyone'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (onDeleteForMe) onDeleteForMe(msg.id);
                              else onDeleteMessage(msg.id);
                              setDeleteMenuMsgId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-all text-left flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>{language === 'ar' ? 'حذف من جانبي فقط' : 'Remove for you'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteMenuMsgId(null)}
                            className="px-2.5 py-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all text-left text-[10px]"
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reaction Picker Popover for this Message */}
                {isReactionPickerOpen && (
                  <div
                    className={`absolute z-30 top-6 ${
                      isMe ? 'left-2' : 'right-2'
                    } p-2 rounded-2xl bg-[#0c1322] border border-cyan-500/40 shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100`}
                  >
                    {['⚡', '🔥', '👑', '🎯', '💀', '👍', '❤️', '⚔️'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onToggleReaction(msg.id, emoji);
                          setActiveReactionPickerMsgId(null);
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingText && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/80 animate-pulse pl-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{typingText}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Lightbox Modal */}
      {selectedLightboxImage && (
        <div
          onClick={() => setSelectedLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedLightboxImage}
              alt="Enlarged"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-cyan-500/30 shadow-2xl"
            />
            <button
              onClick={() => setSelectedLightboxImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
