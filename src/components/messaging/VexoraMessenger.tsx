import React, { useState, useEffect, useRef } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ActiveChatArea } from './ActiveChatArea';
import { MessageInputComposer } from './MessageInputComposer';
import { ChatDetailsPanel } from './ChatDetailsPanel';
import { CreateConversationModal } from './CreateConversationModal';
import { ConversationItem, ChatMessageItem } from './messagingTypes';
import { INITIAL_CONVERSATIONS, INITIAL_CHAT_MESSAGES } from './initialMessagingData';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';

interface VexoraMessengerProps {
  currentUser: any;
  initialChatUserId?: string | null;
  language?: 'en' | 'ar';
  onProfileClick?: (name: string) => void;
  activeCall?: any;
  setActiveCall?: any;
  isCallMinimized?: boolean;
  setIsCallMinimized?: (minimized: boolean) => void;
  callDuration?: number;
  onInitiateCall?: (targetUserId: string, type: 'voice' | 'video') => void;
  setIncomingCallData?: (data: any) => void;
}

export default function VexoraMessenger({
  currentUser,
  initialChatUserId,
  language = 'en',
  onProfileClick,
  activeCall,
  setActiveCall,
  isCallMinimized,
  setIsCallMinimized,
  callDuration = 0,
  onInitiateCall,
  setIncomingCallData
}: VexoraMessengerProps) {
  // 1. Conversations state
  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    try {
      const saved = localStorage.getItem('vexora_conversations_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CONVERSATIONS;
  });

  // 2. Active conversation id
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    if (initialChatUserId) {
      const match = INITIAL_CONVERSATIONS.find((c) => c.id === initialChatUserId || c.id === `conv-${initialChatUserId}`);
      if (match) return match.id;
    }
    return INITIAL_CONVERSATIONS[0].id;
  });

  // 3. Messages state per conversation
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessageItem[]>>(() => {
    try {
      const saved = localStorage.getItem('vexora_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CHAT_MESSAGES;
  });

  // 4. Replying & Editing states
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessageItem | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessageItem | null>(null);

  // 5. Right Details Panel Toggle
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

  // 6. Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 7. Real human typing status indicator
  const [realTypingUser, setRealTypingUser] = useState<string | null>(null);

  // 8. Registered platform users for genuine human-to-human chats
  const [platformUsers, setPlatformUsers] = useState<Array<{
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isOwner?: boolean;
    isVerified?: boolean;
    role?: string;
  }>>([]);

  useEffect(() => {
    // 1. Load from localStorage if present
    try {
      const cached = localStorage.getItem('registered_users');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setPlatformUsers(
            parsed
              .filter((u: any) => u.id !== currentUser?.id)
              .map((u: any) => ({
                id: u.id || u.username || `user-${Math.random().toString(36).substring(2, 6)}`,
                name: u.name || u.displayName || u.username || 'Registered Pilot',
                handle: u.handle || u.username || 'pilot',
                avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
                isOwner: u.isOwner,
                isVerified: u.isVerified,
                role: u.role || 'member'
              }))
          );
        }
      }
    } catch {}

    // 2. Real-time sync with Firestore registered users collection
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersList: any[] = [];
        snapshot.forEach((docSnap) => {
          const u = docSnap.data();
          if (docSnap.id !== currentUser?.id) {
            usersList.push({
              id: docSnap.id,
              name: u.name || u.displayName || 'Vexora User',
              handle: u.handle || u.username || docSnap.id.substring(0, 8),
              avatar: u.avatar || u.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
              isOwner: u.isOwner || false,
              isVerified: u.isVerified || false,
              role: u.role || 'member'
            });
          }
        });
        if (usersList.length > 0) {
          setPlatformUsers((prev) => {
            const map = new Map<string, any>();
            prev.forEach((item) => map.set(item.id, item));
            usersList.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      });
      return () => unsub();
    } catch {}
  }, [currentUser]);

  // Sync initialChatUserId if changed externally
  useEffect(() => {
    if (initialChatUserId) {
      const found = conversations.find((c) => c.id === initialChatUserId || c.id === `conv-${initialChatUserId}`);
      if (found) {
        setActiveConversationId(found.id);
      } else {
        // Create quick DM with genuine initial state (no fake messages)
        const newDm: ConversationItem = {
          id: `conv-${initialChatUserId}`,
          type: 'direct',
          name: initialChatUserId,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
          unreadCount: 0,
          lastActive: Date.now()
        };
        setConversations((prev) => [newDm, ...prev]);
        setActiveConversationId(newDm.id);
      }
    }
  }, [initialChatUserId]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem('vexora_conversations_v2', JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('vexora_messages_v2', JSON.stringify(messagesMap));
    } catch {}
  }, [messagesMap]);

  // 8. Firestore Real-Time Message Listener
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    try {
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', currentUser.id)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              const convId = data.conversationId || (data.senderId === currentUser.id ? data.receiverId : data.senderId);
              if (convId) {
                const incomingMsg: ChatMessageItem = {
                  id: change.doc.id,
                  conversationId: convId,
                  senderId: data.senderId,
                  senderName: data.senderName || 'Neural Node',
                  senderAvatar: data.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
                  senderRole: data.senderRole,
                  text: data.text || '',
                  timestamp: data.timestamp || new Date().toISOString(),
                  status: data.status || 'delivered',
                  reactions: data.reactions,
                  attachments: data.attachments,
                  voiceNote: data.voiceNote,
                  replyTo: data.replyTo,
                  isPinned: data.isPinned,
                  isUnsent: data.isUnsent,
                  deletedFor: data.deletedFor,
                  seenAt: data.seenAt,
                  editedAt: data.editedAt
                };

                // Real delivery receipt: If I received this message and it's currently 'sent', mark delivered
                if (data.senderId !== currentUser.id && data.status === 'sent') {
                  try {
                    updateDoc(doc(db, 'messages', change.doc.id), { status: 'delivered' });
                  } catch {}
                }

                // Real seen receipt: If I have this conversation currently open, mark read/seen
                if (data.senderId !== currentUser.id && activeConversationId === convId && data.status !== 'read') {
                  try {
                    updateDoc(doc(db, 'messages', change.doc.id), {
                      status: 'read',
                      seenAt: new Date().toISOString()
                    });
                  } catch {}
                }

                setMessagesMap((prev) => {
                  const currentList = prev[convId] || [];
                  if (currentList.some((m) => m.id === incomingMsg.id)) {
                    return {
                      ...prev,
                      [convId]: currentList.map((m) => (m.id === incomingMsg.id ? incomingMsg : m))
                    };
                  }
                  return {
                    ...prev,
                    [convId]: [...currentList, incomingMsg]
                  };
                });

                // Update conversation preview with real message
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId
                      ? {
                          ...c,
                          lastMessage: {
                            text: incomingMsg.text,
                            timestamp: incomingMsg.timestamp,
                            senderId: incomingMsg.senderId,
                            senderName: incomingMsg.senderName,
                            status: incomingMsg.status
                          }
                        }
                      : c
                  )
                );
              }
            }
          });
        },
        (error) => {
          console.warn('Firestore messages snapshot warning:', error);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Could not attach Firestore listener:', e);
    }
  }, [currentUser, activeConversationId]);

  // Real human typing indicator listener for active conversation
  useEffect(() => {
    if (!activeConversationId || !currentUser?.id) {
      setRealTypingUser(null);
      return;
    }

    try {
      const typingDoc = doc(db, 'presence_typing', activeConversationId);
      const unsub = onSnapshot(typingDoc, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          let typingName: string | null = null;
          const now = Date.now();
          Object.entries(data).forEach(([uid, val]) => {
            if (uid !== currentUser.id && val && typeof val === 'object') {
              const info = val as { timestamp: number; name: string };
              if (info.timestamp && now - info.timestamp < 3500) {
                typingName = info.name;
              }
            }
          });
          setRealTypingUser(typingName);
        } else {
          setRealTypingUser(null);
        }
      });

      return () => unsub();
    } catch {
      setRealTypingUser(null);
    }
  }, [activeConversationId, currentUser]);

  // Real typing trigger for current user
  const handleTypingChange = async (isTyping: boolean) => {
    if (!activeConversationId || !currentUser?.id) return;
    try {
      const typingDoc = doc(db, 'presence_typing', activeConversationId);
      await setDoc(
        typingDoc,
        {
          [currentUser.id]: {
            timestamp: isTyping ? Date.now() : 0,
            name: currentUser.name || 'User'
          }
        },
        { merge: true }
      );
    } catch {}
  };

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConversation ? messagesMap[activeConversation.id] || [] : [];

  // Mark active conversation as read when selected
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );

    // Mark any received unread messages in this conversation as seen in Firestore
    const convMsgs = messagesMap[id] || [];
    convMsgs.forEach((m) => {
      if (m.senderId !== currentUser?.id && m.status !== 'read') {
        try {
          updateDoc(doc(db, 'messages', m.id), {
            status: 'read',
            seenAt: new Date().toISOString()
          });
        } catch {}
      }
    });
  };

  // GENUINE SEND MESSAGE HANDLER (Real human-to-human only)
  const handleSendMessage = async (payload: {
    text: string;
    attachments?: any[];
    voiceNote?: any;
    replyToId?: string;
    isEditingId?: string;
  }) => {
    if (!activeConversation) return;

    const myId = currentUser?.id || 'u-current';
    const myName = currentUser?.name || 'Vexora Pilot';
    const myAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
    const myRole = currentUser?.isOwner ? 'owner' : currentUser?.role || 'member';

    // Handle Edit Mode
    if (payload.isEditingId) {
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
          m.id === payload.isEditingId
            ? { ...m, text: payload.text, editedAt: new Date().toISOString() }
            : m
        )
      }));
      setEditingMessage(null);
      try {
        await updateDoc(doc(db, 'messages', payload.isEditingId), {
          text: payload.text,
          editedAt: new Date().toISOString()
        });
      } catch {}
      return;
    }

    // Handle Reply To info
    let replyInfo: any = undefined;
    if (payload.replyToId) {
      const orig = activeMessages.find((m) => m.id === payload.replyToId);
      if (orig) {
        replyInfo = {
          id: orig.id,
          text: orig.text,
          senderName: orig.senderName
        };
      }
    }

    const newMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessageItem = {
      id: newMsgId,
      conversationId: activeConversation.id,
      senderId: myId,
      senderName: myName,
      senderAvatar: myAvatar,
      senderRole: myRole as any,
      text: payload.text,
      timestamp: new Date().toISOString(),
      status: 'sending',
      attachments: payload.attachments,
      voiceNote: payload.voiceNote,
      replyTo: replyInfo
    };

    // 1. Optimistic Update (Sending)
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMsg]
    }));

    // Update conversation lastMessage
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              lastMessage: {
                text: payload.text || (payload.voiceNote ? '🎤 Voice Transmission' : 'Attached File'),
                timestamp: new Date().toISOString(),
                senderId: myId,
                senderName: myName,
                status: 'sending'
              }
            }
          : c
      )
    );

    setReplyingToMessage(null);

    // Clear typing status on send
    handleTypingChange(false);

    // 2. Persist to Firestore as 'sent'
    try {
      await setDoc(doc(db, 'messages', newMsgId), {
        ...newMsg,
        status: 'sent',
        participants: [myId, activeConversation.id]
      });

      // Update state to 'sent'
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
          m.id === newMsgId ? { ...m, status: 'sent' } : m
        )
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id && c.lastMessage
            ? { ...c, lastMessage: { ...c.lastMessage, status: 'sent' } }
            : c
        )
      );
    } catch (e) {
      console.warn('Firestore message save note:', e);
      // Fallback local status transition for offline
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
          m.id === newMsgId ? { ...m, status: 'sent' } : m
        )
      }));
    }
  };

  // REACTION TOGGLE
  const handleToggleReaction = (msgId: string, emoji: string) => {
    if (!activeConversation) return;
    const myId = currentUser?.id || 'u-current';

    setMessagesMap((prev) => {
      const list = prev[activeConversation.id] || [];
      const updatedList = list.map((msg) => {
        if (msg.id !== msgId) return msg;

        const currentReactions = { ...(msg.reactions || {}) };
        const existing = currentReactions[emoji] || { count: 0, users: [] };
        const hasReacted = existing.users.includes(myId);

        if (hasReacted) {
          const newUsers = existing.users.filter((u) => u !== myId);
          if (newUsers.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = { count: newUsers.length, users: newUsers };
          }
        } else {
          currentReactions[emoji] = {
            count: existing.count + 1,
            users: [...existing.users, myId]
          };
        }

        return { ...msg, reactions: currentReactions };
      });

      return { ...prev, [activeConversation.id]: updatedList };
    });
  };

  // PIN TOGGLE
  const handleTogglePinMessage = (msgId: string) => {
    if (!activeConversation) return;
    setMessagesMap((prev) => {
      const list = prev[activeConversation.id] || [];
      return {
        ...prev,
        [activeConversation.id]: list.map((m) =>
          m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
        )
      };
    });
  };

  // DELETE MESSAGE
  const handleDeleteMessage = (msgId: string) => {
    if (!activeConversation) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: (prev[activeConversation.id] || []).filter((m) => m.id !== msgId)
    }));
  };

  // UNSEND MESSAGE FOR EVERYONE (Messenger style tombstone)
  const handleUnsendMessage = async (msgId: string) => {
    if (!activeConversation) return;

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
        m.id === msgId ? { ...m, isUnsent: true, text: 'This message was unsent' } : m
      )
    }));

    try {
      await updateDoc(doc(db, 'messages', msgId), {
        isUnsent: true,
        text: 'This message was unsent'
      });
    } catch (e) {
      console.warn('Firestore unsend update warning:', e);
    }
  };

  // DELETE MESSAGE FOR ME (Hide from current user's view only)
  const handleDeleteForMe = async (msgId: string) => {
    if (!activeConversation) return;
    const myId = currentUser?.id || 'u-current';

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: (prev[activeConversation.id] || []).map((m) =>
        m.id === msgId
          ? { ...m, deletedFor: [...(m.deletedFor || []), myId] }
          : m
      )
    }));

    try {
      await updateDoc(doc(db, 'messages', msgId), {
        deletedFor: arrayUnion(myId)
      });
    } catch (e) {
      console.warn('Firestore deleteForMe update warning:', e);
    }
  };

  // CONVERSATION LEVEL ACTIONS
  const handleTogglePinConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleToggleMuteConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMuted: !c.isMuted } : c))
    );
  };

  const handleToggleArchiveConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: !c.isArchived } : c))
    );
  };

  const handleMarkAsReadConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleDeleteConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearHistory = () => {
    if (!activeConversation) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: []
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, lastMessage: undefined } : c))
    );
  };

  // TEAM READY TOGGLE HANDLER
  const handleToggleMemberReady = (memberId: string) => {
    if (!activeConversation || activeConversation.type !== 'team') return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id || !c.members) return c;
        const updatedMembers = c.members.map((m) =>
          m.id === memberId || (memberId === 'u-current' && m.role === 'owner')
            ? { ...m, isReady: !m.isReady }
            : m
        );
        return { ...c, members: updatedMembers };
      })
    );
  };

  // CALL HANDLER
  const handleInitiateCall = (type: 'voice' | 'video') => {
    if (!activeConversation) return;
    if (onInitiateCall) {
      onInitiateCall(activeConversation.id, type);
    } else if (setActiveCall) {
      setActiveCall({
        type,
        status: 'calling',
        targetId: activeConversation.id,
        callId: `call-${Date.now()}`
      });
      if (setIsCallMinimized) setIsCallMinimized(false);
    }
  };

  // Combine platform registered users and known direct chats for "New Chat" modal
  const existingUsersList = (() => {
    const map = new Map<string, any>();
    conversations
      .filter((c) => c.type === 'direct')
      .forEach((c) => {
        map.set(c.id, {
          id: c.id,
          name: c.name,
          handle: c.handle || c.name.toLowerCase().replace(/\s+/g, '_'),
          avatar: c.avatar,
          isOwner: c.isOwner,
          isVerified: c.isVerified,
          role: c.role
        });
      });
    platformUsers.forEach((u) => {
      map.set(u.id, u);
    });
    return Array.from(map.values());
  })();

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="w-full h-full flex overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#060a14] shadow-[0_15px_50px_rgba(0,0,0,0.85)] relative"
    >
      {/* 1. LEFT PANEL: Conversations Sidebar */}
      <div
        className={`${
          activeConversationId ? 'hidden lg:flex' : 'flex'
        } h-full flex-shrink-0 z-20`}
      >
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onTogglePin={handleTogglePinConv}
          onToggleMute={handleToggleMuteConv}
          onToggleArchive={handleToggleArchiveConv}
          onMarkAsRead={handleMarkAsReadConv}
          onDeleteConversation={handleDeleteConv}
          language={language}
        />
      </div>

      {/* 2. CENTER PANEL: Active Conversation & Composer */}
      {activeConversation ? (
        <div
          className={`${
            activeConversationId ? 'flex' : 'hidden lg:flex'
          } flex-1 h-full flex-col min-w-0 relative`}
        >
          {/* Active Chat Messages Stream */}
          <ActiveChatArea
            conversation={activeConversation}
            messages={activeMessages}
            currentUserId={currentUser?.id || 'u-current'}
            onInitiateCall={handleInitiateCall}
            onToggleInfoPanel={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
            isInfoPanelOpen={isInfoPanelOpen}
            onBackToList={() => setActiveConversationId(null)}
            onReplyToMessage={(msg) => setReplyingToMessage(msg)}
            onEditMessage={(msg) => setEditingMessage(msg)}
            onDeleteMessage={handleDeleteMessage}
            onUnsendMessage={handleUnsendMessage}
            onDeleteForMe={handleDeleteForMe}
            onToggleReaction={handleToggleReaction}
            onTogglePinMessage={handleTogglePinMessage}
            typingText={
              realTypingUser
                ? language === 'ar'
                  ? `${realTypingUser} يكتب الآن...`
                  : `${realTypingUser} is typing...`
                : null
            }
            language={language}
          />

          {/* Advanced Message Input Composer */}
          <MessageInputComposer
            conversationId={activeConversation.id}
            onSendMessage={handleSendMessage}
            replyingToMessage={replyingToMessage}
            onCancelReply={() => setReplyingToMessage(null)}
            editingMessage={editingMessage}
            onCancelEdit={() => setEditingMessage(null)}
            members={activeConversation.members}
            onTyping={handleTypingChange}
            language={language}
          />
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <span className="text-3xl font-mono">⚡</span>
          </div>
          <h3 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
            {language === 'ar' ? 'حدد محادثة أو غرفة ألعاب' : 'Select a Transmission Channel'}
          </h3>
          <p className="text-xs font-mono text-white/40 max-w-sm">
            {language === 'ar'
              ? 'اختر من القائمة الجانبية للتواصل مع اللاعبين، تنظيم فرق الألعاب، أو دخول الغرف الإقليمية.'
              : 'Choose any conversation from the sidebar to chat with players, coordinate scrims, or join gaming lobbies.'}
          </p>
        </div>
      )}

      {/* 3. RIGHT PANEL: Collapsible Details & Team Ready Matrix */}
      {isInfoPanelOpen && activeConversation && (
        <ChatDetailsPanel
          conversation={activeConversation}
          messages={activeMessages}
          currentUserId={currentUser?.id || 'u-current'}
          onClose={() => setIsInfoPanelOpen(false)}
          onToggleMute={() =>
            handleToggleMuteConv(activeConversation.id, { stopPropagation: () => {} } as any)
          }
          onClearHistory={handleClearHistory}
          onToggleMemberReady={handleToggleMemberReady}
          language={language}
        />
      )}

      {/* CREATE CONVERSATION / GAMING TEAM MODAL */}
      {isCreateModalOpen && (
        <CreateConversationModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreateConversation={(newConv) => {
            setConversations((prev) => [newConv, ...prev]);
            setActiveConversationId(newConv.id);
          }}
          existingUsers={existingUsersList}
          language={language}
        />
      )}
    </div>
  );
}
