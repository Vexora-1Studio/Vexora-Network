import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Plus, RefreshCw, Loader2, Users, User, Hash, 
  Settings, AlertCircle, Info, Shield, CheckCircle2, ChevronRight, MessageCircle,
  Check, CheckCheck, Heart, Smile, Sparkles
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface VexoraChatProps {
  gmailToken: string | null;
  setGmailToken: (token: string | null) => void;
  currentUser: any;
}

interface ChatSpace {
  name: string; // "spaces/AAAABBB"
  displayName: string;
  type: string;
  spaceType?: string;
  isSimulated?: boolean;
}

interface ChatMessage {
  name: string;
  sender: {
    name: string;
    displayName: string;
    avatarUrl?: string;
  };
  text: string;
  createTime: string;
  isSimulated?: boolean;
}

export default function VexoraChat({ gmailToken, setGmailToken, currentUser }: VexoraChatProps) {
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListLoading, setIsListLoading] = useState<boolean>(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState<boolean>(false);
  
  // Create Space Form State
  const [newSpaceName, setNewSpaceName] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  
  // Message input
  const [messageInput, setMessageInput] = useState<string>('');
  
  // Sandbox vs Real API indicator
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Notification banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch Spaces
  const fetchSpaces = async (tokenOverride?: string) => {
    const tokenToUse = tokenOverride || gmailToken;
    if (!tokenToUse) return;

    setIsListLoading(true);
    setApiError(null);
    
    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }
      
      const data = await res.json();
      if (data.spaces && data.spaces.length > 0) {
        setSpaces(data.spaces);
        setIsSandboxMode(false);
      } else {
        // Fallback to initial spaces in Sandbox
        initializeSandboxSpaces();
      }
    } catch (err: any) {
      console.warn("Failed to fetch real Google Chat spaces. Switching to high-fidelity sandbox mode.", err);
      setIsSandboxMode(true);
      setApiError(err.message || "Could not reach Chat API");
      initializeSandboxSpaces();
    } finally {
      setIsListLoading(false);
    }
  };

  const initializeSandboxSpaces = () => {
    const stored = localStorage.getItem('vexora_sandbox_spaces');
    if (stored) {
      setSpaces(JSON.parse(stored));
    } else {
      const defaultSpaces: ChatSpace[] = [
        { name: 'spaces/cluster-alpha', displayName: '🌌 Vexora Core Developers', type: 'SPACE', spaceType: 'SPACE', isSimulated: true },
        { name: 'spaces/quantum-nodes', displayName: '⚡ Quantum Linkage Hub', type: 'SPACE', spaceType: 'SPACE', isSimulated: true },
        { name: 'spaces/lobby', displayName: '📡 Unified Chat Relay', type: 'SPACE', spaceType: 'SPACE', isSimulated: true }
      ];
      setSpaces(defaultSpaces);
      localStorage.setItem('vexora_sandbox_spaces', JSON.stringify(defaultSpaces));
    }
  };

  // Fetch Messages for Selected Space
  const fetchMessages = async (space: ChatSpace) => {
    if (!gmailToken) return;
    setIsMessagesLoading(true);
    
    if (space.isSimulated || isSandboxMode) {
      // Load from localStorage or default sandbox messages
      const key = `vexora_sandbox_msgs_${space.name}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        const defaultMsgs: ChatMessage[] = [
          {
            name: `${space.name}/messages/1`,
            sender: { name: 'users/alex', displayName: 'Alex Rivera (Core)', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
            text: `Welcome to the neural chat relay for ${space.displayName}! Secure encryption protocols are online.`,
            createTime: new Date(Date.now() - 3600000).toISOString(),
            isSimulated: true
          },
          {
            name: `${space.name}/messages/2`,
            sender: { name: 'users/vexora_ai', displayName: 'Vexora AI Prime', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vexora' },
            text: "Synthesizing cluster nodes. Type a message below to broadcast to this synchronized workspace.",
            createTime: new Date(Date.now() - 1800000).toISOString(),
            isSimulated: true
          }
        ];
        setMessages(defaultMsgs);
        localStorage.setItem(key, JSON.stringify(defaultMsgs));
      }
      setIsMessagesLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://chat.googleapis.com/v1/${space.name}/messages`, {
        headers: { Authorization: `Bearer ${gmailToken}` },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to load messages: ${res.status}`);
      }
      
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      console.error("Failed to load real messages:", err);
      setNotification({ message: `API Error: ${err.message}. Loading simulated chat logs instead.`, type: 'info' });
      // Fallback
      space.isSimulated = true;
      fetchMessages(space);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  // Load spaces when token is active
  useEffect(() => {
    if (gmailToken) {
      fetchSpaces();
    }
  }, [gmailToken]);

  // Load messages when selected space changes
  useEffect(() => {
    if (selectedSpace) {
      fetchMessages(selectedSpace);
    } else {
      setMessages([]);
    }
  }, [selectedSpace]);

  const handleConnect = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGmailToken(credential.accessToken);
        setNotification({ message: "Vexora Core Synchronized. Google Chat enabled.", type: 'success' });
        fetchSpaces(credential.accessToken);
      } else {
        throw new Error("Access token missing in Google provider payload.");
      }
    } catch (err: any) {
      console.error("OAuth connector failed:", err);
      setNotification({ message: `Secure handshaking failed: ${err.message || err}`, type: 'error' });
    }
  };

  const handleCreateSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || !gmailToken) return;

    setIsCreatingSpace(true);
    
    if (isSandboxMode) {
      // Simulated space creation
      const newSpace: ChatSpace = {
        name: `spaces/sim-${Math.random().toString(36).substr(2, 9)}`,
        displayName: newSpaceName.trim(),
        type: 'SPACE',
        spaceType: 'SPACE',
        isSimulated: true
      };
      const updatedSpaces = [newSpace, ...spaces];
      setSpaces(updatedSpaces);
      localStorage.setItem('vexora_sandbox_spaces', JSON.stringify(updatedSpaces));
      setSelectedSpace(newSpace);
      setIsCreateOpen(false);
      setNewSpaceName('');
      setIsCreatingSpace(false);
      setNotification({ message: "Simulated Neural Cluster created successfully.", type: 'success' });
      return;
    }

    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gmailToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spaceType: 'SPACE',
          displayName: newSpaceName.trim()
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to create space in Google Chat (Status: ${res.status})`);
      }

      const created = await res.json();
      setSpaces(prev => [created, ...prev]);
      setSelectedSpace(created);
      setIsCreateOpen(false);
      setNewSpaceName('');
      setNotification({ message: "Google Chat Space created on the active workspace!", type: 'success' });
    } catch (err: any) {
      console.error("Real space creation failed:", err);
      setNotification({ message: `API Error: ${err.message}. Creating simulated cluster instead.`, type: 'info' });
      // Fallback
      const newSpace: ChatSpace = {
        name: `spaces/sim-${Math.random().toString(36).substr(2, 9)}`,
        displayName: newSpaceName.trim(),
        type: 'SPACE',
        spaceType: 'SPACE',
        isSimulated: true
      };
      const updatedSpaces = [newSpace, ...spaces];
      setSpaces(updatedSpaces);
      localStorage.setItem('vexora_sandbox_spaces', JSON.stringify(updatedSpaces));
      setSelectedSpace(newSpace);
      setIsCreateOpen(false);
      setNewSpaceName('');
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedSpace || !gmailToken) return;

    const textToSend = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    if (selectedSpace.isSimulated || isSandboxMode) {
      const newMsg: ChatMessage = {
        name: `${selectedSpace.name}/messages/user-${Date.now()}`,
        sender: {
          name: `users/${currentUser?.id || 'current'}`,
          displayName: currentUser?.name || 'Vexora Node Participant',
          avatarUrl: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
        },
        text: textToSend,
        createTime: new Date().toISOString(),
        isSimulated: true
      };
      
      const key = `vexora_sandbox_msgs_${selectedSpace.name}`;
      const stored = localStorage.getItem(key);
      const currentMsgs = stored ? JSON.parse(stored) : [];
      const updatedMsgs = [...currentMsgs, newMsg];
      setMessages(updatedMsgs);
      localStorage.setItem(key, JSON.stringify(updatedMsgs));
      
      setIsSending(false);
      
      // Simulate reply from Bot after 1.5 seconds
      setTimeout(() => {
        const botReply: ChatMessage = {
          name: `${selectedSpace.name}/messages/bot-${Date.now()}`,
          sender: {
            name: 'users/vexora_ai',
            displayName: 'Vexora AI Node',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vexora'
          },
          text: `[Neural Echo]: Received package "${textToSend}". Stream synchronized successfully across Vexora sandbox.`,
          createTime: new Date().toISOString(),
          isSimulated: true
        };
        const afterBotMsgs = [...updatedMsgs, botReply];
        setMessages(afterBotMsgs);
        localStorage.setItem(key, JSON.stringify(afterBotMsgs));
      }, 1200);

      return;
    }

    try {
      const res = await fetch(`https://chat.googleapis.com/v1/${selectedSpace.name}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gmailToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: textToSend
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to transmit message: ${res.status}`);
      }

      const createdMsg = await res.json();
      setMessages(prev => [...prev, createdMsg]);
    } catch (err: any) {
      console.error("Failed to deliver real message:", err);
      setNotification({ message: `API Send Error: ${err.message}. Simulating local delivery.`, type: 'error' });
      // Fallback deliver simulated
      const newMsg: ChatMessage = {
        name: `${selectedSpace.name}/messages/user-${Date.now()}`,
        sender: {
          name: 'users/fallback',
          displayName: currentUser?.name || 'Local Participant',
          avatarUrl: currentUser?.avatar
        },
        text: textToSend,
        createTime: new Date().toISOString(),
        isSimulated: true
      };
      setMessages(prev => [...prev, newMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'VN';
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 text-white text-left relative overflow-hidden bg-black/60 backdrop-blur-md p-2 md:p-6 rounded-3xl border border-white/5 shadow-2xl">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-8 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
          notification.type === 'success' 
            ? 'bg-purple-950/90 border-purple-500/40 text-purple-200' 
            : notification.type === 'error'
            ? 'bg-red-950/90 border-red-500/40 text-red-200'
            : 'bg-zinc-950/90 border-yellow-500/40 text-yellow-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-purple-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
          <span className="text-xs font-bold font-mono uppercase tracking-wider">{notification.message}</span>
        </div>
      )}

      {/* BEFORE SIGN IN OVERLAY CARD */}
      {!gmailToken ? (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-10 p-4 rounded-3xl border border-white/5 shadow-2xl">
          <div className="max-w-md w-full bg-zinc-950/90 border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tightest">VEXORA CHAT NODE</h3>
              <p className="text-xs text-white/40 leading-relaxed max-w-sm">
                Establish secure OAuth connection to your Google Chat spaces. Synchronize communication channels, direct message packets, and team hubs instantly on the unified network.
              </p>
            </div>

            <button 
              onClick={handleConnect}
              className="w-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-center gap-3 p-3 bg-white text-black rounded-xl font-bold text-sm shadow-xl">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Authorize Google Chat</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* SIDEBAR: SPACES COLLECTION */}
          <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
            
            {/* Header section with Create Button */}
            <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-black uppercase tracking-widest text-white">CHANNELS</span>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => fetchSpaces()}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
                  title="Reload cluster spaces"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isListLoading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-all flex items-center gap-1 text-[10px] uppercase font-black tracking-wider px-2.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Space
                </button>
              </div>
            </div>

            {/* Sandbox Notice Banner */}
            {isSandboxMode && (
              <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-2xl text-[10px] text-purple-200/80 leading-relaxed font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>NEURAL SANDBOX MODE ACTIVE</span>
                </div>
                <p>Google Cloud App credentials are configured. Connect to spaces or explore using localized neural simulations.</p>
              </div>
            )}

            {/* List of Spaces */}
            <div className="flex-1 bg-white/2 border border-white/5 rounded-2xl flex flex-col overflow-hidden max-h-[300px] md:max-h-none">
              <div className="p-3 border-b border-white/5 bg-white/2 flex justify-between items-center text-[9px] font-mono tracking-widest text-white/40 uppercase">
                <span>Active Spaces Stream</span>
                <span>{spaces.length} Nodes</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-none">
                {isListLoading && spaces.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
                    <p className="text-[9px] font-mono uppercase text-white/40">Searching synchronized beams...</p>
                  </div>
                ) : spaces.length === 0 ? (
                  <div className="py-12 text-center text-white/20 text-xs">
                    No active workspaces found
                  </div>
                ) : (
                  spaces.map((space) => {
                    const isSelected = selectedSpace?.name === space.name;
                    return (
                      <div
                        key={space.name}
                        onClick={() => setSelectedSpace(space)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer text-xs font-semibold tracking-wide transition-all hover:bg-white/5 ${
                          isSelected ? 'bg-purple-950/20 border-r-2 border-purple-500 text-purple-300' : 'text-white/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[11px] font-mono font-bold ${
                            isSelected ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-white/5 border-white/5 text-white/40'
                          }`}>
                            <Hash className="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          <span className="truncate uppercase text-left">{space.displayName}</span>
                        </div>
                        {space.isSimulated && (
                          <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded uppercase font-mono tracking-wide">
                            SIM
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* MAIN CHAT CONSOLE */}
          <div className="flex-1 bg-white/2 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[500px] md:h-auto min-w-0">
            {selectedSpace ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Space Header */}
                <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-white">{selectedSpace.displayName}</h4>
                      <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{selectedSpace.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold tracking-widest uppercase px-2 py-1 rounded">
                      Link Secure
                    </span>
                  </div>
                </div>

                {/* Message logs stream */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-950/20 scrollbar-none">
                  {isMessagesLoading ? (
                    <div className="py-24 text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Retrieving secure message logs...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-24 text-center text-white/30 space-y-2 font-mono uppercase text-[10px] tracking-wider">
                      <MessageCircle className="w-8 h-8 mx-auto text-white/10" />
                      <p>Space empty of active communications</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender.name.includes(currentUser?.id) || msg.sender.name.includes('current') || msg.sender.displayName === currentUser?.name;
                      return (
                        <div 
                          key={msg.name || idx}
                          className={`flex gap-3.5 text-left max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse text-right' : ''}`}
                        >
                          <img 
                            src={msg.sender.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.displayName}`} 
                            alt={msg.sender.displayName} 
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-xl border border-white/5 flex-shrink-0 bg-white/5"
                          />
                          <div className="space-y-1">
                            <div className={`flex items-center gap-2 text-[10px] font-mono text-white/40 ${isMe ? 'justify-end' : ''}`}>
                              <span className="font-bold text-white/80">{msg.sender.displayName}</span>
                              <span>•</span>
                              <span>{new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (
                                <span className="flex items-center text-sky-400 font-bold" title="Read by recipient">
                                  <CheckCheck className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe 
                                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-purple-600/20' 
                                : 'bg-white/5 border border-white/5 text-white/95 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message composition input */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-white/5 bg-white/2 flex gap-3 items-center"
                >
                  <input 
                    type="text"
                    required
                    placeholder={`Transmit message packet to ${selectedSpace.displayName}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 font-sans leading-none"
                  />
                  <button 
                    type="submit"
                    disabled={isSending || !messageInput.trim()}
                    className="h-11 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 flex-shrink-0"
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </>
                    )}
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 text-white/25">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/10">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-white/60">Select cluster space</h3>
                  <p className="text-[10px] font-mono uppercase tracking-wider">Choose a synchronized Google Chat workspace to stream transmissions</p>
                </div>
              </div>
            )}
          </div>

          {/* CREATE SPACE DIALOG MODAL */}
          {isCreateOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center p-4">
              <form 
                onSubmit={handleCreateSpaceSubmit}
                className="w-full max-w-md bg-zinc-950 border border-white/10 p-6 rounded-3xl space-y-6 shadow-2xl relative"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400 font-mono">PROVISION NEW WORKSPACE</span>
                  <button 
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="text-white/40 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Cluster Space Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Project Vexora Core, Launch Chat"
                      value={newSpaceName}
                      onChange={(e) => setNewSpaceName(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
                    />
                  </div>
                  {isSandboxMode && (
                    <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[9px] text-purple-300 leading-relaxed font-mono">
                      [Active Notice]: This channel will be created inside the current neural session simulation sandbox.
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border border-white/5"
                  >
                    Abort Provision
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreatingSpace || !newSpaceName.trim()}
                    className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingSpace ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Provision
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

    </div>
  );
}
