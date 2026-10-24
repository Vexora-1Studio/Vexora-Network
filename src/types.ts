export type GridType = 'public' | 'community' | 'private' | 'flux-ai' | 'profile';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email?: string;
  phone?: string;
  avatar: string;
  bio: string;
  banner: string;
  location: string;
  joinedDate: string;
  followers: number;
  following: number;
  isVerified?: boolean;
  isOwner?: boolean;
  role?: 'owner' | 'admin' | 'moderator' | 'member';
  isVip?: boolean;
  isBanned?: boolean;
  isMuted?: boolean;
  subscriptionTier?: 'free' | 'plus' | 'plus_pro';
  billingCycle?: 'monthly' | 'annual';
  subscriptionStatus?: 'active' | 'canceled';
  gender?: string;
  birthDate?: string;
  savedPostIds?: string[];
  friendRequestIds?: string[];
  friendIds?: string[];
  followingIds?: string[];
  lastActive?: string | number;
  password?: string;
}

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  type: GridType;
  likes: number;
  comments: number;
  reposts?: number;
  shares?: number;
  image?: string;
  gif?: string;
  isLiked?: boolean;
  isReposted?: boolean;
  isUnlisted?: boolean;
  isLegendary?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  replies?: Comment[];
  reactions?: Record<ReactionType, number>;
  userReaction?: ReactionType;
  communityId?: string;
  video?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  reposts?: number;
  isLiked?: boolean;
  isReposted?: boolean;
  gif?: string;
  video?: string;
}

export interface FriendRequest {
  id: string;
  from: UserProfile;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface TrendingTopic {
  tag: string;
  count: number;
}

export interface Community {
  id: string;
  name: string;
  members: number;
  image: string;
  banner?: string;
  description: string;
  createdAt: string; // ISO timestamp for recency
  category: string;  // For filtering options
  ownerId?: string;  // ID of the user who owns this community
  isVerified?: boolean;
}

export interface Message {
  id: string;
  sender?: string;
  senderId?: string;
  receiverId?: string;
  text: string;
  timestamp: string;
  category?: 'friend' | 'request' | 'interest';
  audioUrl?: string;
  audioDuration?: number;
  audioAmplitudes?: number[];
  type?: 'text' | 'voice' | 'image' | 'file';
  participants?: string[];
  isRead?: boolean;
}

export interface Story {
  id: string;
  name: string;
  avatar: string;
  content: string;
  timestamp: string;
  preset: 'dove' | 'neon' | 'sunset' | 'cobalt' | 'emerald';
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  customImage?: string;
  views?: number;
  fontStyle?: 'standard' | 'cyber' | 'poetic' | 'heavy' | 'vintage';
  effectStyle?: 'none' | 'matrix' | 'neon' | 'stars' | 'scanlines';
  musicVibe?: 'none' | 'cosmic' | 'ambient' | 'glitch' | 'peace';
  replies?: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: string;
  }>;
  likesCount?: number;
  loveCount?: number;
  hahaCount?: number;
  isLiked?: boolean;
}

