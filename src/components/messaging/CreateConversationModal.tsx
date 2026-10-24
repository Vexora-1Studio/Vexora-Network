import React, { useState } from 'react';
import {
  X, MessageSquare, Swords, Search, Check, Plus, Gamepad2,
  Crown, Shield, Users, Sparkles
} from 'lucide-react';
import { ConversationItem, ConversationType, TeamMember } from './messagingTypes';

interface CreateConversationModalProps {
  onClose: () => void;
  onCreateConversation: (newConv: ConversationItem) => void;
  existingUsers: Array<{
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isOwner?: boolean;
    isVerified?: boolean;
    role?: string;
  }>;
  language: 'en' | 'ar';
}

const SUPPORTED_GAMES = [
  'Valorant',
  'Counter-Strike 2',
  'Apex Legends',
  'League of Legends',
  'Fortnite',
  'Call of Duty: Warzone',
  'Overwatch 2',
  'Rocket League'
];

export const CreateConversationModal: React.FC<CreateConversationModalProps> = ({
  onClose,
  onCreateConversation,
  existingUsers,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'team'>('direct');
  const [searchPlayer, setSearchPlayer] = useState('');
  
  // Team creation states
  const [teamName, setTeamName] = useState('');
  const [selectedGame, setSelectedGame] = useState('Valorant');
  const [teamRank, setTeamRank] = useState('Competitive Division');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const filteredPlayers = existingUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchPlayer.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchPlayer.toLowerCase())
  );

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleStartDirectChat = (user: typeof existingUsers[0]) => {
    const newConv: ConversationItem = {
      id: `conv-direct-${user.id}`,
      type: 'direct',
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      isOwner: user.isOwner,
      isVerified: user.isVerified,
      unreadCount: 0,
      lastActive: Date.now()
    };
    onCreateConversation(newConv);
    onClose();
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const chosenMembers: TeamMember[] = existingUsers
      .filter((u) => selectedMemberIds.includes(u.id))
      .map((u) => ({
        id: u.id,
        name: u.name,
        handle: u.handle,
        avatar: u.avatar,
        role: 'member',
        isReady: false,
        gameRank: 'Verified Player'
      }));

    const newTeamConv: ConversationItem = {
      id: `conv-team-${Date.now()}`,
      type: 'team',
      name: `⚡ ${teamName.toUpperCase()}`,
      avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
      description: teamDescription || `Official ${selectedGame} roster on VEXORA Network.`,
      teamGame: selectedGame,
      teamRank: teamRank,
      unreadCount: 0,
      isPinned: true,
      lobbyState: {
        isOpen: true,
        countdown: null,
        targetPlayers: 5
      },
      members: [
        {
          id: 'u-current',
          name: 'Squad Leader (You)',
          handle: 'leader',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
          role: 'owner',
          isReady: true,
          gameRank: 'Captain'
        },
        ...chosenMembers
      ],
      lastMessage: {
        text: `Team roster for ${selectedGame} formed! All members ready-up for upcoming scrims.`,
        timestamp: new Date().toISOString(),
        senderId: 'u-current',
        status: 'read'
      }
    };

    onCreateConversation(newTeamConv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#090f1d] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white font-mono">
                {language === 'ar' ? 'بدء محادثة أو إنشاء فريق' : 'Initiate Transmission'}
              </h3>
              <p className="text-[10px] font-mono text-cyan-400/60 uppercase">
                {language === 'ar' ? 'اختر نمط التواصل المطلوب' : 'Select target protocol'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${
              activeTab === 'direct'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'ar' ? 'محادثة خاصة' : 'Direct Message'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${
              activeTab === 'team'
                ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>{language === 'ar' ? 'فريق ألعاب جديد' : 'New Gaming Team'}</span>
          </button>
        </div>

        {/* DIRECT CHAT SELECTION */}
        {activeTab === 'direct' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPlayer}
                onChange={(e) => setSearchPlayer(e.target.value)}
                placeholder={language === 'ar' ? 'بحث عن لاعب أو قائد...' : 'Search player by name or handle...'}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-400 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
              {filteredPlayers.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-white/40">
                  {language === 'ar' ? 'لا يوجد لاعبون مطابقون' : 'No matching players found'}
                </div>
              ) : (
                filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => handleStartDirectChat(player)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-9 h-9 rounded-xl object-cover border border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white group-hover:text-cyan-300">
                            {player.name}
                          </span>
                          {player.isOwner && (
                            <span className="px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 text-[7px] font-mono font-bold">
                              OWNER
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-white/40">@{player.handle}</span>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {language === 'ar' ? 'مراسلة ←' : 'Connect →'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TEAM CHAT FORM */}
        {activeTab === 'team' && (
          <form onSubmit={handleCreateTeam} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                {language === 'ar' ? 'اسم الفريق / الكلان' : 'Squad / Team Name'}
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. PHANTOM CYBER, VEXORA ELITE"
                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-yellow-400 text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                  {language === 'ar' ? 'اللعبة المستهدفة' : 'Target Game'}
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0c1425] border border-white/10 focus:border-yellow-400 text-white text-xs focus:outline-none"
                >
                  {SUPPORTED_GAMES.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                  {language === 'ar' ? 'المستوى / التصنيف' : 'Competitive Tier'}
                </label>
                <input
                  type="text"
                  value={teamRank}
                  onChange={(e) => setTeamRank(e.target.value)}
                  placeholder="e.g. Radiant, FaceIT 10, Predator"
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-yellow-400 text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Invite Teammates */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                {language === 'ar' ? 'دعوة أعضاء للفريق (اختياري)' : 'Invite Initial Roster'}
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-white/[0.02] border border-white/5 scrollbar-thin">
                {existingUsers.slice(0, 6).map((user) => {
                  const isChecked = selectedMemberIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleSelectMember(user.id)}
                      className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-yellow-500/20 text-yellow-300' : 'hover:bg-white/5 text-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-md object-cover" />
                        <span className="text-xs font-bold">{user.name}</span>
                      </div>
                      {isChecked && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!teamName.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4 font-black" />
              <span>{language === 'ar' ? 'إنشاء غرفة الفريق وتفعيل اللوبي ⚔️' : 'Create Squad & Primed Lobby ⚔️'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
