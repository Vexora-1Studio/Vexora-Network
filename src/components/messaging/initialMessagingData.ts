import { ConversationItem, ChatMessageItem } from './messagingTypes';

export const INITIAL_CONVERSATIONS: ConversationItem[] = [
  // 1. Owner & VIP direct messages
  {
    id: 'conv-owner',
    type: 'direct',
    name: 'Vexora Owner',
    handle: 'vexora_owner',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    bio: 'Founder & Supreme Architect of Vexora Network. Overseeing all neural nodes and competitive arenas.',
    isVerified: true,
    isOwner: true,
    role: 'owner',
    lastActive: Date.now() - 60000,
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    lastMessage: {
      text: 'Neural messaging channels are now operational at 100% capacity. Prepare the tournament rosters!',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      senderId: 'conv-owner',
      senderName: 'Vexora Owner',
      status: 'delivered'
    }
  },
  // 2. Gaming Team with "Team Ready" Lobby
  {
    id: 'conv-team-valorant',
    type: 'team',
    name: '⚡ VEXORA RADIANT — VALORANT SQUAD',
    avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
    description: 'Tier-1 Competitive Valorant division for VEXORA Network. Practice scrims, strats, and tournament qualifiers.',
    teamGame: 'Valorant',
    teamRank: 'Radiant / Immortal 3',
    unreadCount: 5,
    isPinned: true,
    isMuted: false,
    lobbyState: {
      isOpen: true,
      countdown: null,
      targetPlayers: 5
    },
    members: [
      {
        id: 'u-owner',
        name: 'Vexora Owner',
        handle: 'vexora_owner',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
        role: 'owner',
        isReady: true,
        gameRank: 'Radiant #14'
      },
      {
        id: 'u-phantom',
        name: 'Phantom Hunter',
        handle: 'phantom_hunt',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop',
        role: 'admin',
        isReady: true,
        gameRank: 'Radiant #89'
      },
      {
        id: 'u-valk',
        name: 'Nova Valkyrie',
        handle: 'nova_valk',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        role: 'member',
        isReady: false,
        gameRank: 'Immortal 3'
      },
      {
        id: 'u-glitch',
        name: 'Glitch Master',
        handle: 'glitch_zero',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        role: 'member',
        isReady: true,
        gameRank: 'Immortal 3'
      },
      {
        id: 'u-viper',
        name: 'Viper Protocol',
        handle: 'viper_main',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop',
        role: 'member',
        isReady: false,
        gameRank: 'Immortal 2'
      }
    ],
    lastMessage: {
      text: 'Match scrimmage starting in 15 mins against Team Eclipse. Everyone check into Team Ready!',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      senderId: 'u-phantom',
      senderName: 'Phantom Hunter',
      status: 'read'
    }
  },
  // 3. Gaming Team CS2
  {
    id: 'conv-team-cs2',
    type: 'team',
    name: '🎯 APEX PREDATORS — CS2 ROSTER',
    avatar: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop',
    description: 'Premier CS2 squad aiming for FaceIT Level 10 and regional qualifiers. Mirage & Inferno defaults.',
    teamGame: 'Counter-Strike 2',
    teamRank: 'FaceIT Lvl 10',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lobbyState: {
      isOpen: false,
      countdown: null,
      targetPlayers: 5
    },
    members: [
      {
        id: 'u-cs-captain',
        name: 'AWP Sovereign',
        handle: 'awp_god',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
        role: 'admin',
        isReady: true,
        gameRank: 'Level 10 (2450 ELO)'
      },
      {
        id: 'u-cs-rifler',
        name: 'Entry Fragger',
        handle: 'rush_b',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
        role: 'member',
        isReady: true,
        gameRank: 'Level 9'
      }
    ],
    lastMessage: {
      text: 'Smokes lineup drill tonight at 21:00 UTC. Check video attachment in shared media.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      senderId: 'u-cs-captain',
      senderName: 'AWP Sovereign',
      status: 'read'
    }
  },
  // 4. Public Regional Gaming Room
  {
    id: 'conv-room-valorant-mena',
    type: 'room',
    name: '🌐 Valorant MENA & GCC Competitive LFG',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop',
    description: 'Official open regional room for Arabic & Middle East Valorant players. Looking For Group (LFG), custom 10-mans, and rank climb.',
    roomTag: 'VALORANT-MENA',
    region: 'Middle East (Bahrain / Dubai)',
    onlineCount: 428,
    unreadCount: 12,
    isPinned: false,
    isMuted: true,
    lastMessage: {
      text: 'Need +1 Controller for Ascendant 3 / Immortal 1 trio lobby. Mic required, drop your Riot ID!',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      senderId: 'u-mena-pilot',
      senderName: 'Desert Eagle',
      status: 'read'
    }
  },
  // 5. Public Regional Gaming Room CS2
  {
    id: 'conv-room-cs2-global',
    type: 'room',
    name: '💥 CS2 Global Premier & Scrims Hub',
    avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&h=200&fit=crop',
    description: 'Worldwide matchmaking & scrims channel for CS2 Premier 15k+ rating. Share clutches, utility lineups, and trade skins.',
    roomTag: 'CS2-WORLD',
    region: 'Global / Multi-region',
    onlineCount: 890,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessage: {
      text: 'Anyone down for a 5-stack Premier grind right now? We are EU/MENA ping ~25ms.',
      timestamp: new Date(Date.now() - 720000).toISOString(),
      senderId: 'u-cs-player',
      senderName: 'StrikeLeader',
      status: 'read'
    }
  },
  // 6. Direct chat: Nova Valkyrie
  {
    id: 'conv-nova-valk',
    type: 'direct',
    name: 'Nova Valkyrie',
    handle: 'nova_valk',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    bio: 'Professional Duelist & Streamer on Vexora. Jett & Reyna main. Radiant Peak.',
    isVerified: true,
    isOwner: false,
    role: 'moderator',
    lastActive: Date.now() - 120000,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessage: {
      text: 'Sent you the highlight clip from our last overtime win! That 1v4 clutch was insane.',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      senderId: 'conv-nova-valk',
      senderName: 'Nova Valkyrie',
      status: 'read'
    }
  },
  // 7. Direct chat: Chief Neural Architect
  {
    id: 'conv-architect',
    type: 'direct',
    name: 'Chief Neural Architect',
    handle: 'neural_architect',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
    bio: 'Sculpting high-dimensional network synapses & WebRTC low-latency audio tunnels for Vexora core.',
    isVerified: true,
    isOwner: false,
    role: 'admin',
    lastActive: Date.now() - 300000,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessage: {
      text: 'Voice codec bitrate has been enhanced to 64kbps Opus with active background noise suppression.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      senderId: 'conv-architect',
      senderName: 'Chief Neural Architect',
      status: 'read'
    }
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessageItem[]> = {
  'conv-owner': [
    {
      id: 'm-owner-1',
      conversationId: 'conv-owner',
      senderId: 'conv-owner',
      senderName: 'Vexora Owner',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
      senderRole: 'owner',
      senderHandle: 'vexora_owner',
      text: 'Welcome to VEXORA NETWORK Command Center. Our mission is to build the greatest unified gaming social grid.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'read',
      reactions: {
        '👑': { count: 3, users: ['conv-owner', 'u-phantom'] },
        '⚡': { count: 5, users: ['conv-owner', 'u-glitch'] }
      }
    },
    {
      id: 'm-owner-2',
      conversationId: 'conv-owner',
      senderId: 'conv-owner',
      senderName: 'Vexora Owner',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
      senderRole: 'owner',
      senderHandle: 'vexora_owner',
      text: 'Check out the tournament brackets and make sure your team lobby is synced with the official league schedule.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
      isPinned: true
    },
    {
      id: 'm-owner-3',
      conversationId: 'conv-owner',
      senderId: 'conv-owner',
      senderName: 'Vexora Owner',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
      senderRole: 'owner',
      senderHandle: 'vexora_owner',
      text: 'Neural messaging channels are now operational at 100% capacity. Prepare the tournament rosters!',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: 'delivered',
      reactions: {
        '🔥': { count: 4, users: ['conv-owner', 'u-valk'] }
      }
    }
  ],

  'conv-team-valorant': [
    {
      id: 'm-team-1',
      conversationId: 'conv-team-valorant',
      senderId: 'u-phantom',
      senderName: 'Phantom Hunter',
      senderAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop',
      senderRole: 'admin',
      senderHandle: 'phantom_hunt',
      text: 'Team, here is our tactical map breakdown for Ascent A-Site execution:',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'read',
      attachments: [
        {
          id: 'att-1',
          type: 'image',
          name: 'Ascent_A_Site_Strat.png',
          url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=500&fit=crop',
          size: '1.8 MB'
        }
      ],
      reactions: {
        '🎯': { count: 4, users: ['u-phantom', 'u-glitch'] }
      }
    },
    {
      id: 'm-team-2',
      conversationId: 'conv-team-valorant',
      senderId: 'u-glitch',
      senderName: 'Glitch Master',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      senderRole: 'member',
      senderHandle: 'glitch_zero',
      text: 'I locked in Sova recon darts for B-main retake. Voice briefing below:',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
      voiceNote: {
        url: 'https://actions.google.com/sounds/v1/science_fiction/teleport_arrival.ogg',
        duration: 14,
        waveform: [15, 30, 45, 80, 65, 90, 70, 40, 25, 55, 85, 95, 60, 40, 20]
      }
    },
    {
      id: 'm-team-3',
      conversationId: 'conv-team-valorant',
      senderId: 'u-phantom',
      senderName: 'Phantom Hunter',
      senderAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop',
      senderRole: 'admin',
      senderHandle: 'phantom_hunt',
      text: 'Match scrimmage starting in 15 mins against Team Eclipse. Everyone check into Team Ready!',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'read',
      isPinned: true,
      reactions: {
        '⚡': { count: 3, users: ['u-phantom', 'u-glitch'] },
        '👍': { count: 4, users: ['u-valk', 'u-owner'] }
      }
    }
  ],

  'conv-nova-valk': [
    {
      id: 'm-valk-1',
      conversationId: 'conv-nova-valk',
      senderId: 'conv-nova-valk',
      senderName: 'Nova Valkyrie',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      senderRole: 'moderator',
      senderHandle: 'nova_valk',
      text: 'Hey! Are you jumping into the Strategy Arena for the speed chess challenge tonight?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read'
    },
    {
      id: 'm-valk-2',
      conversationId: 'conv-nova-valk',
      senderId: 'conv-nova-valk',
      senderName: 'Nova Valkyrie',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      senderRole: 'moderator',
      senderHandle: 'nova_valk',
      text: 'Sent you the highlight clip from our last overtime win! That 1v4 clutch was insane.',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'read',
      attachments: [
        {
          id: 'att-valk-1',
          type: 'image',
          name: 'Valkyrie_1v4_Ace.jpg',
          url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=500&fit=crop',
          size: '2.4 MB'
        }
      ],
      reactions: {
        '🔥': { count: 5, users: ['conv-nova-valk'] }
      }
    }
  ]
};
