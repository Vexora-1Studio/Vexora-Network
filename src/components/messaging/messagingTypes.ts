export type ConversationType = 'direct' | 'group' | 'team' | 'room';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio';
  name: string;
  url: string;
  size?: string;
  mimeType?: string;
}

export interface VoiceNoteData {
  url: string;
  duration: number; // in seconds
  waveform?: number[];
}

export interface MessageReactionMap {
  [emoji: string]: {
    count: number;
    users: string[]; // user IDs
  };
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: 'owner' | 'admin' | 'moderator' | 'member';
  senderHandle?: string;
  text: string;
  timestamp: string; // ISO string
  status: MessageStatus;
  reactions?: MessageReactionMap;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  attachments?: ChatAttachment[];
  voiceNote?: VoiceNoteData;
  isPinned?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  isUnsent?: boolean;
  deletedFor?: string[];
  seenAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  isReady?: boolean;
  lastActive?: string | number;
  gameRank?: string;
}

export interface ConversationItem {
  id: string;
  type: ConversationType;
  name: string;
  handle?: string;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  isOwner?: boolean;
  role?: 'owner' | 'admin' | 'moderator' | 'member';
  lastActive?: string | number;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
    senderName?: string;
    status?: MessageStatus;
  };
  // For group and gaming team chats
  description?: string;
  memberIds?: string[];
  members?: TeamMember[];
  teamGame?: string; // e.g. "Valorant", "Counter-Strike 2", "League of Legends"
  teamRank?: string;
  lobbyState?: {
    isOpen: boolean;
    countdown?: number | null;
    targetPlayers?: number;
  };
  // For public regional game rooms
  roomTag?: string;
  region?: string;
  onlineCount?: number;
}
