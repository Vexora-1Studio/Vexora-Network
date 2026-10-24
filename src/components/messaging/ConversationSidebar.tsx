import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Pin, BellOff, CheckCheck, Users, Gamepad2, 
  Globe, MessageSquare, Flame, Crown, Shield, Swords, MoreVertical,
  Archive, Trash2, Filter, Sparkles, Check
} from 'lucide-react';
import { ConversationItem, ConversationType } from './messagingTypes';

interface ConversationSidebarProps {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenCreateModal: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onToggleMute: (id: string, e: React.MouseEvent) => void;
  onToggleArchive: (id: string, e: React.MouseEvent) => void;
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  language: 'en' | 'ar';
}

type FilterTab = 'all' | 'direct' | 'team' | 'room' | 'unread';

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenCreateModal,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onMarkAsRead,
  onDeleteConversation,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((c) => !c.isArchived)
      .filter((c) => {
        if (activeFilter === 'direct') return c.type === 'direct';
        if (activeFilter === 'team') return c.type === 'team';
        if (activeFilter === 'room') return c.type === 'room';
        if (activeFilter === 'unread') return c.unreadCount > 0;
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.handle && c.handle.toLowerCase().includes(q)) ||
          (c.teamGame && c.teamGame.toLowerCase().includes(q)) ||
          (c.lastMessage?.text && c.lastMessage.text.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Pinned conversations always stay on top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return timeB - timeA;
      });
  }, [conversations, activeFilter, searchQuery]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return language === 'ar' ? 'الآن' : 'Now';
      if (diffMins < 60) return `${diffMins}m`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const isUserOnline = (lastActive?: string | number) => {
    if (!lastActive) return false;
    const time = typeof lastActive === 'number' ? lastActive : new Date(lastActive).getTime();
    if (isNaN(time)) return false;
    return Date.now() - time < 3 * 60 * 1000;
  };

  return (
    <div className="w-full lg:w-[340px] xl:w-[380px] h-full flex flex-col bg-[#080d19]/95 border-r border-cyan-500/10 backdrop-blur-2xl select-none relative z-20">
      {/* Top Header */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm uppercase tracking-wider text-white font-mono">
                  {language === 'ar' ? 'غرفة الرسائل العصبية' : 'Neural Messages'}
                </span>
                {totalUnreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-black font-black text-[9px] font-mono shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                    {totalUnreadCount}
                  </span>
                )}
              </div>
              <p className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest">
                {language === 'ar' ? 'تشفير فوري وسرعة كمية' : 'Real-time Encrypted Grid'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 flex items-center gap-1 group"
            title={language === 'ar' ? 'محادثة أو فريق جديد' : 'New Chat or Team'}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[10px] font-mono uppercase font-bold hidden sm:inline">
              {language === 'ar' ? 'جديد' : 'New'}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'بحث في الرسائل، اللاعبين، أو الفرق...'
                : 'Search messages, players, teams...'
            }
            className="w-full h-9 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 focus:border-cyan-400 focus:bg-white/[0.07] px-8 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Navigation Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide text-[10px] font-mono">
          {[
            { id: 'all', label: language === 'ar' ? 'الكل' : 'All', icon: Sparkles },
            { id: 'direct', label: language === 'ar' ? 'خاص' : 'Direct', icon: MessageSquare },
            { id: 'team', label: language === 'ar' ? 'فرق الألعاب' : 'Teams', icon: Swords },
            { id: 'room', label: language === 'ar' ? 'غرف عامة' : 'Rooms', icon: Globe },
            { id: 'unread', label: language === 'ar' ? 'غير مقروء' : 'Unread', icon: Filter }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterTab)}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.08] border border-transparent'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-white/20">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-white/50 uppercase tracking-wider">
              {language === 'ar' ? 'لا توجد محادثات مطابقة' : 'No transmissions found'}
            </p>
            <p className="text-[10px] font-mono text-white/30">
              {language === 'ar'
                ? 'ابدأ رسالة جديدة أو انضم إلى إحدى غرف الألعاب'
                : 'Start a direct chat or join a public gaming room.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id;
            const isMenuOpen = activeMenuId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative p-2.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.15)] text-white'
                    : 'bg-white/[0.015] hover:bg-white/[0.05] border-white/5 hover:border-white/10 text-white/70'
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}

                {/* Avatar with Badges */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className={`w-11 h-11 rounded-xl object-cover border transition-transform duration-300 ${
                      conv.type === 'team'
                        ? 'border-yellow-500/40 rounded-2xl'
                        : conv.type === 'room'
                        ? 'border-cyan-500/40'
                        : 'border-white/10'
                    } ${isSelected ? 'scale-105 border-cyan-400' : ''}`}
                  />

                  {/* Genuine presence indicator */}
                  {conv.type === 'direct' && (
                    isUserOnline(conv.lastActive) ? (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#080d19] shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                        title={language === 'ar' ? 'متصل الآن' : 'Active Now'}
                      />
                    ) : (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zinc-600/80 border border-[#080d19]"
                        title={language === 'ar' ? 'غير متصل' : 'Offline'}
                      />
                    )
                  )}

                  {/* Team / Room Type Overlay icon */}
                  {conv.type === 'team' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-md bg-yellow-500/90 text-black flex items-center justify-center font-bold text-[8px] border border-black shadow-sm">
                      ⚡
                    </span>
                  )}
                  {conv.type === 'room' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-md bg-cyan-500 text-black flex items-center justify-center text-[8px] font-bold border border-black shadow-sm">
                      <Globe className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-bold text-xs truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {conv.name}
                      </span>
                      {conv.isOwner && (
                        <span className="flex-shrink-0 px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[7.5px] font-mono font-black uppercase flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-yellow-300" />
                          <span>Owner</span>
                        </span>
                      )}
                      {conv.isVerified && !conv.isOwner && (
                        <span className="flex-shrink-0 w-3 h-3 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[7px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <span className="text-[9px] font-mono text-white/40 flex-shrink-0">
                      {formatMessageTime(conv.lastMessage?.timestamp)}
                    </span>
                  </div>

                  {/* Subtext: last message & status badges */}
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <p className="truncate text-white/50 text-[10.5px] leading-tight font-sans">
                      {conv.lastMessage ? (
                        <>
                          {conv.type !== 'direct' && conv.lastMessage.senderName && (
                            <span className="text-cyan-400 font-mono font-medium mr-1">
                              {conv.lastMessage.senderName.split(' ')[0]}:
                            </span>
                          )}
                          {conv.lastMessage.text}
                        </>
                      ) : (
                        <span className="text-white/30 italic font-mono text-[9.5px]">
                          {language === 'ar' ? 'بدء محادثة جديدة...' : 'No transmissions yet'}
                        </span>
                      )}
                    </p>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {conv.isMuted && <BellOff className="w-3 h-3 text-white/30" />}
                      {conv.isPinned && <Pin className="w-3 h-3 text-cyan-400 fill-cyan-400/30" />}
                      {conv.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-black font-black text-[9px] font-mono shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick 3-Dots Action Menu Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                  title="Actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Popover Action Menu */}
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
                      }}
                    />
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-10 w-44 rounded-xl bg-[#0e1628] border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-1 z-50 backdrop-blur-xl text-xs font-mono space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        onClick={(e) => {
                          onTogglePin(conv.id, e);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center justify-between text-white/80 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <Pin className="w-3 h-3 text-cyan-400" />
                          <span>{conv.isPinned ? (language === 'ar' ? 'إلغاء التثبيت' : 'Unpin') : (language === 'ar' ? 'تثبيت' : 'Pin')}</span>
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          onToggleMute(conv.id, e);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center justify-between text-white/80 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <BellOff className="w-3 h-3 text-amber-400" />
                          <span>{conv.isMuted ? (language === 'ar' ? 'إلغاء الكتم' : 'Unmute') : (language === 'ar' ? 'كتم الإشعارات' : 'Mute')}</span>
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          onMarkAsRead(conv.id, e);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center justify-between text-white/80 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span>{language === 'ar' ? 'تحديد كمقروء' : 'Mark as Read'}</span>
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          onToggleArchive(conv.id, e);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center justify-between text-white/80 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <Archive className="w-3 h-3 text-purple-400" />
                          <span>{language === 'ar' ? 'أرشفة المحادثة' : 'Archive'}</span>
                        </span>
                      </button>

                      <div className="h-[1px] bg-white/5 my-0.5" />

                      <button
                        onClick={(e) => {
                          onDeleteConversation(conv.id, e);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-left flex items-center justify-between text-red-400"
                      >
                        <span className="flex items-center gap-2">
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'ar' ? 'حذف من البريد' : 'Delete'}</span>
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
