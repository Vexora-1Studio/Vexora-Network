import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Send, Trash2, RefreshCw, Search, ChevronRight, ChevronLeft, 
  X, Check, AlertCircle, CornerUpLeft, Plus, Folder, Star, 
  Inbox, AlertTriangle, Eye, Loader2, LogOut, CheckCircle2
} from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface VexoraGmailProps {
  gmailToken: string | null;
  setGmailToken: (token: string | null) => void;
  currentUser: any;
}

interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  isUnread: boolean;
  isStarred: boolean;
  labels: string[];
}

export default function VexoraGmail({ gmailToken, setGmailToken, currentUser }: VexoraGmailProps) {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [currentLabel, setCurrentLabel] = useState<string>('INBOX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isListLoading, setIsListLoading] = useState<boolean>(false);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  
  // Pagination
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');

  // Confirmation Modals / Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'text'>('formatted');

  // Trigger notification auto-clear
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load messages whenever token or label or page index changes
  useEffect(() => {
    if (gmailToken) {
      fetchMessages();
    }
  }, [gmailToken, currentLabel, currentPageIndex]);

  // Helper: Extract header value
  const getHeader = (headers: { name: string; value: string }[], name: string): string => {
    const h = headers?.find(item => item.name.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  // Helper: Parse message payload to extract Text and HTML bodies
  const parseMessageBody = (payload: any): { text: string; html: string } => {
    let text = '';
    let html = '';

    const decodeBase64 = (str: string) => {
      try {
        // Replace base64url characters to standard base64
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // Decode base64 bytes to raw string, and handle UTF-8 properly
        const raw = atob(base64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {
          bytes[i] = raw.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
      } catch (e) {
        console.error("Failed to decode base64 body portion:", e);
        return '';
      }
    };

    const parsePart = (part: any) => {
      if (part.body && part.body.data) {
        const decoded = decodeBase64(part.body.data);
        if (part.mimeType === 'text/plain') {
          text += decoded;
        } else if (part.mimeType === 'text/html') {
          html += decoded;
        }
      }
      if (part.parts) {
        part.parts.forEach(parsePart);
      }
    };

    if (payload.body && payload.body.data) {
      const decoded = decodeBase64(payload.body.data);
      if (payload.mimeType === 'text/plain') {
        text += decoded;
      } else if (payload.mimeType === 'text/html') {
        html += decoded;
      }
    }

    if (payload.parts) {
      payload.parts.forEach(parsePart);
    }

    return { 
      text: text || 'No plain text content.', 
      html: html || text || '<div class="text-white/40 italic">No HTML rendering available for this message.</div>' 
    };
  };

  const fetchMessages = async () => {
    if (!gmailToken) return;
    setIsListLoading(true);
    try {
      let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`;
      
      // Add label filter if not custom searching or viewing general things
      if (currentLabel) {
        url += `&labelIds=${currentLabel}`;
      }
      
      // Add search query if present
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      // Add page token if navigating forward
      if (currentPageIndex > 0 && pageHistory[currentPageIndex - 1]) {
        url += `&pageToken=${pageHistory[currentPageIndex - 1]}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${gmailToken}` }
      });

      if (res.status === 401) {
        // Token expired
        setGmailToken(null);
        setNotification({ message: "Authentication session expired. Please reconnect.", type: "error" });
        setIsListLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Gmail API listed error: ${res.statusText}`);
      }

      const data = await res.json();
      
      // Store next page token
      setNextPageToken(data.nextPageToken || null);

      if (data.messages && data.messages.length > 0) {
        // Fetch details for each message in parallel (Max 10)
        const detailsPromises = data.messages.map(async (msg: any) => {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${gmailToken}` }
          });
          if (detailRes.ok) {
            return await detailRes.json();
          }
          return null;
        });

        const rawDetails = await Promise.all(detailsPromises);
        const parsedMessages: GmailMessage[] = rawDetails
          .filter(d => d !== null)
          .map((detail: any) => {
            const headers = detail.payload?.headers || [];
            const { text, html } = parseMessageBody(detail.payload);
            
            return {
              id: detail.id,
              threadId: detail.threadId,
              subject: getHeader(headers, 'subject') || '(No Subject)',
              from: getHeader(headers, 'from') || 'Unknown Sender',
              to: getHeader(headers, 'to') || 'Unknown Recipient',
              date: getHeader(headers, 'date') || 'Unknown Date',
              snippet: detail.snippet || '',
              bodyText: text,
              bodyHtml: html,
              isUnread: detail.labelIds?.includes('UNREAD') || false,
              isStarred: detail.labelIds?.includes('STARRED') || false,
              labels: detail.labelIds || []
            };
          });

        setMessages(parsedMessages);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch Gmail list:", err);
      setNotification({ message: `Failed to load inbox: ${err.message}`, type: 'error' });
    } finally {
      setIsListLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGmailToken(credential.accessToken);
        setNotification({ message: "Quantum Sync Stable. Gmail Link Established.", type: 'success' });
      } else {
        throw new Error("No access token provided in credential.");
      }
    } catch (error: any) {
      console.error("Gmail authorization pop-up error:", error);
      setNotification({ message: `Establishment failed: ${error.message || error}`, type: 'error' });
    }
  };

  const handleNextPage = () => {
    if (nextPageToken) {
      setPageHistory(prev => {
        const nextHist = [...prev];
        nextHist[currentPageIndex] = nextPageToken;
        return nextHist;
      });
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  // Mark message as read/unread
  const toggleReadStatus = async (msg: GmailMessage, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!gmailToken) return;

    const action = msg.isUnread ? 'remove' : 'add';
    const body = msg.isUnread 
      ? { removeLabelIds: ['UNREAD'] }
      : { addLabelIds: ['UNREAD'] };

    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/modify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gmailToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        // Update local list state
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isUnread: !m.isUnread } : m));
        // Update active selection detail state if open
        if (selectedMessage && selectedMessage.id === msg.id) {
          setSelectedMessage(prev => prev ? { ...prev, isUnread: !prev.isUnread } : null);
        }
      }
    } catch (err) {
      console.error("Failed to alter read label:", err);
    }
  };

  // Star / Unstar
  const toggleStarStatus = async (msg: GmailMessage, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!gmailToken) return;

    const body = msg.isStarred
      ? { removeLabelIds: ['STARRED'] }
      : { addLabelIds: ['STARRED'] };

    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/modify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gmailToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: !m.isStarred } : m));
        if (selectedMessage && selectedMessage.id === msg.id) {
          setSelectedMessage(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
        }
      }
    } catch (err) {
      console.error("Failed to alter star label:", err);
    }
  };

  // Send new mail
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailToken) return;
    if (!composeTo.trim()) {
      setNotification({ message: "Recipient address required.", type: 'error' });
      return;
    }

    setIsSending(true);
    try {
      // Create simple text MIME body
      const emailMime = [
        `To: ${composeTo}`,
        `Subject: ${composeSubject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        composeBody
      ].join('\r\n');
      
      // Base64URL encode MIME format safely
      const encodedMime = btoa(unescape(encodeURIComponent(emailMime)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gmailToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMime })
      });

      if (!res.ok) throw new Error("Mail submission error");

      setNotification({ message: "Quantum mail packet dispatched successfully.", type: 'success' });
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      
      // Reload sent or current view
      fetchMessages();
    } catch (err: any) {
      console.error("Failed to send email:", err);
      setNotification({ message: `Mail delivery failed: ${err.message}`, type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  // Trash/Delete confirmation flow (MANDATORY per guidelines)
  const initiateTrashMessage = (msgId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setConfirmDeleteId(msgId);
  };

  const confirmTrashMessage = async () => {
    if (!confirmDeleteId || !gmailToken) return;
    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${confirmDeleteId}/trash`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${gmailToken}` }
      });

      if (!res.ok) throw new Error("Move to Trash failed");

      setNotification({ message: "Mail packet moved to Trash.", type: 'success' });
      
      // If deleted active selection, clear it
      if (selectedMessage && selectedMessage.id === confirmDeleteId) {
        setSelectedMessage(null);
      }
      
      // Remove from lists
      setMessages(prev => prev.filter(m => m.id !== confirmDeleteId));
    } catch (err: any) {
      console.error("Failed to trash message:", err);
      setNotification({ message: `Could not delete message: ${err.message}`, type: 'error' });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleReply = (msg: GmailMessage) => {
    // Extract raw email address from From header: "Name <email@domain.com>" -> "email@domain.com"
    let emailOnly = msg.from;
    const match = msg.from.match(/<([^>]+)>/);
    if (match && match[1]) {
      emailOnly = match[1];
    }
    
    setComposeTo(emailOnly);
    setComposeSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
    setComposeBody(`\n\nOn ${msg.date}, ${msg.from} wrote:\n> ${msg.snippet}`);
    setIsComposeOpen(true);
  };

  // Formatting helper for sender initials
  const getSenderInitials = (from: string) => {
    const parts = from.split('<')[0].trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return from[0].toUpperCase();
  };

  return (
    <div className="w-full text-white font-sans flex flex-col xl:flex-row gap-6 h-[80vh] min-h-[550px] relative">
      {/* Notifications Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
          notification.type === 'success' 
            ? 'bg-purple-950/90 border-purple-500/40 text-purple-200' 
            : 'bg-red-950/90 border-red-500/40 text-red-200'
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
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tightest">VEXORA MAIL CORE</h3>
              <p className="text-xs text-white/40 leading-relaxed max-w-sm">
                Establish a secure quantum connection to your Google Mail account. Dispatched letters, read files, and incoming data are fully synchronized in real-time.
              </p>
            </div>

            {/* Styled "Sign in with Google" button according to Guidelines */}
            <button 
              onClick={handleConnectGmail}
              className="gsi-material-button w-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper flex items-center justify-center gap-3 p-3 bg-white text-black rounded-xl font-bold text-sm shadow-xl">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* LEFT FOLDER NAVIGATION BAR */}
          <div className="w-full xl:w-64 flex-shrink-0 flex flex-col gap-4">
            <button 
              onClick={() => {
                setComposeTo('');
                setComposeSubject('');
                setComposeBody('');
                setIsComposeOpen(true);
              }}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Compose Packet
            </button>

            <div className="flux-card p-4 flex flex-col gap-1 text-left">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 mb-3 px-3">Sync Folders</span>
              
              <button 
                onClick={() => { setCurrentLabel('INBOX'); setCurrentPageIndex(0); setSelectedMessage(null); }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                  currentLabel === 'INBOX' ? 'bg-white/10 text-white border-l-2 border-purple-500' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4" />
                  <span>Inbox</span>
                </div>
              </button>

              <button 
                onClick={() => { setCurrentLabel('STARRED'); setCurrentPageIndex(0); setSelectedMessage(null); }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                  currentLabel === 'STARRED' ? 'bg-white/10 text-white border-l-2 border-purple-500' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4" />
                  <span>Starred</span>
                </div>
              </button>

              <button 
                onClick={() => { setCurrentLabel('SENT'); setCurrentPageIndex(0); setSelectedMessage(null); }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                  currentLabel === 'SENT' ? 'bg-white/10 text-white border-l-2 border-purple-500' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4" />
                  <span>Sent</span>
                </div>
              </button>

              <button 
                onClick={() => { setCurrentLabel('DRAFT'); setCurrentPageIndex(0); setSelectedMessage(null); }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                  currentLabel === 'DRAFT' ? 'bg-white/10 text-white border-l-2 border-purple-500' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-4 h-4" />
                  <span>Drafts</span>
                </div>
              </button>

              <button 
                onClick={() => { setCurrentLabel('TRASH'); setCurrentPageIndex(0); setSelectedMessage(null); }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                  currentLabel === 'TRASH' ? 'bg-white/10 text-white border-l-2 border-purple-500' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4" />
                  <span>Trash</span>
                </div>
              </button>
            </div>

            {/* Sync Status Badge */}
            <div className="flux-card p-4 flex flex-col gap-2 items-start text-left">
              <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/20">Terminal Connection</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold font-mono tracking-wide text-green-400">OAUTH SYNCHRONIZED</span>
              </div>
              <button 
                onClick={() => setGmailToken(null)}
                className="mt-2 text-[9px] font-mono text-red-400/60 hover:text-red-400 flex items-center gap-1.5 transition-colors uppercase"
              >
                <LogOut className="w-3 h-3" />
                Disconnect Session
              </button>
            </div>
          </div>

          {/* MAIN CHANNELS LAYOUT: MIDDLE LIST + RIGHT DETAILED VIEW */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            {/* MIDDLE MESSAGE LIST PANEL */}
            <div className="w-full lg:w-[450px] flex flex-col gap-4 flex-shrink-0 h-full overflow-hidden">
              <div className="flux-card p-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-white/30 ml-2" />
                <input 
                  type="text" 
                  placeholder="Search emails..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMessages()}
                  className="flex-1 bg-transparent border-none text-xs text-white placeholder-white/20 focus:ring-0 outline-none p-1"
                />
                <button 
                  onClick={fetchMessages}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                  title="Refresh Packet Inbox"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isListLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flux-card flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-400 font-black">
                    {currentLabel} Packet Logs
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPageIndex === 0}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-25 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[9px] font-mono text-white/40">PAGE {currentPageIndex + 1}</span>
                    <button 
                      onClick={handleNextPage}
                      disabled={!nextPageToken}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-25 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {isListLoading ? (
                    <div className="py-24 text-center space-y-4">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Synchronizing neural logs...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-24 text-center space-y-4 text-white/20">
                      <Inbox className="w-10 h-10 mx-auto opacity-35" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Zero transmission packets discovered</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className={`p-4 flex gap-3 text-left cursor-pointer transition-all hover:bg-white/5 relative group ${
                          selectedMessage?.id === msg.id ? 'bg-purple-950/20 border-r-2 border-purple-500' : ''
                        } ${msg.isUnread ? 'bg-white/2' : ''}`}
                      >
                        {/* Sender Avatar Badge */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center text-xs font-black tracking-tighter text-purple-300 border border-purple-500/10 flex-shrink-0 uppercase">
                          {getSenderInitials(msg.from)}
                        </div>

                        {/* Content snippet */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-[11px] truncate uppercase font-bold text-white/80 ${msg.isUnread ? 'text-purple-300' : ''}`}>
                              {msg.from.split('<')[0].trim() || msg.from}
                            </span>
                            <span className="text-[8px] font-mono text-white/30 whitespace-nowrap">{msg.date.split(',').pop()?.trim()}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 min-w-0">
                            {msg.isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 animate-ping" />
                            )}
                            <h4 className={`text-xs truncate text-white/90 ${msg.isUnread ? 'font-black' : 'font-medium'}`}>
                              {msg.subject}
                            </h4>
                          </div>
                          <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{msg.snippet}</p>
                        </div>

                        {/* Hover Quick Actions */}
                        <div className="absolute right-3 bottom-3 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur border border-white/10 p-1.5 rounded-lg z-10">
                          <button 
                            onClick={(e) => toggleStarStatus(msg, e)}
                            className="p-1 rounded hover:bg-white/10 text-yellow-400/80 hover:text-yellow-400 transition-colors"
                            title={msg.isStarred ? "Remove Star" : "Add Star"}
                          >
                            <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-yellow-400' : ''}`} />
                          </button>
                          <button 
                            onClick={(e) => toggleReadStatus(msg, e)}
                            className="p-1 rounded hover:bg-white/10 text-purple-400/80 hover:text-purple-400 transition-colors"
                            title={msg.isUnread ? "Mark as Read" : "Mark as Unread"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => initiateTrashMessage(msg.id, e)}
                            className="p-1 rounded hover:bg-white/10 text-red-400/80 hover:text-red-400 transition-colors"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT DETAILED MESSAGE READ VIEW */}
            <div className="flex-1 flux-card h-full overflow-hidden flex flex-col text-left">
              {selectedMessage ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Subject and core operations */}
                  <div className="p-6 border-b border-white/5 bg-white/2 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-lg font-black uppercase tracking-tight leading-snug">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => toggleStarStatus(selectedMessage)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                          title="Star logs"
                        >
                          <Star className={`w-4 h-4 ${selectedMessage.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </button>
                        <button 
                          onClick={() => toggleReadStatus(selectedMessage)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                          title={selectedMessage.isUnread ? "Mark as Read" : "Mark as Unread"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleReply(selectedMessage)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-400 hover:text-purple-300 transition-all font-bold text-xs flex items-center gap-1.5 px-3 uppercase font-mono border border-purple-500/10"
                        >
                          <CornerUpLeft className="w-3.5 h-3.5" />
                          Reply
                        </button>
                        <button 
                          onClick={() => initiateTrashMessage(selectedMessage.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300 transition-all font-bold text-xs flex items-center gap-1.5 px-3 uppercase font-mono border border-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                      <div className="space-y-1">
                        <p><span className="text-purple-400">FROM:</span> <span className="text-white/80 font-bold">{selectedMessage.from}</span></p>
                        <p><span className="text-purple-400">TO:</span> <span className="text-white/60">{selectedMessage.to}</span></p>
                      </div>
                      <span className="text-[10px] bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">{selectedMessage.date}</span>
                    </div>
                  </div>

                  {/* Body Rendering Toggles */}
                  <div className="px-6 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-mono uppercase bg-black/40">
                    <span className="text-white/20">Render Mode</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setViewMode('formatted')}
                        className={`px-3 py-1 rounded-md font-bold transition-colors ${viewMode === 'formatted' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white'}`}
                      >
                        Formatted HTML
                      </button>
                      <button 
                        onClick={() => setViewMode('text')}
                        className={`px-3 py-1 rounded-md font-bold transition-colors ${viewMode === 'text' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white'}`}
                      >
                        Raw Plain Text
                      </button>
                    </div>
                  </div>

                  {/* Body Content Container */}
                  <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/40 relative">
                    {viewMode === 'formatted' && selectedMessage.bodyHtml ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }} 
                        className="gmail-html-body prose prose-invert max-w-none text-sm text-white/90 leading-relaxed text-left break-words"
                        style={{ colorScheme: 'dark' }}
                      />
                    ) : (
                      <pre className="text-sm font-mono text-white/80 whitespace-pre-wrap text-left break-words bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed">
                        {selectedMessage.bodyText}
                      </pre>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 text-white/25">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/10">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-white/60">No email selected</h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider">Select a logs packet from the central stream to view contents</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* COMPOSE EMAIL OVERLAY MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <form 
            onSubmit={handleSendEmail}
            className="w-full max-w-2xl bg-zinc-950 border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-purple-400 font-mono">DISPATCH QUANTUM MAIL PACKET</span>
              <button 
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-white/40 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Recipient Address (To)</label>
                <input 
                  type="email" 
                  required
                  placeholder="recipient@domain.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Transmission Subject</label>
                <input 
                  type="text" 
                  placeholder="Logs, updates, and dispatches..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Message Body</label>
                <textarea 
                  rows={8}
                  placeholder="Type secure text content here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 font-mono leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border border-white/5 cursor-pointer"
              >
                Abrupt Transmission
              </button>
              <button 
                type="submit"
                disabled={isSending}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    DISPATCHING...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    DISPATCH PACKET
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (MANDATORY PER GUIDELINES) */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-zinc-950 border border-red-500/20 p-8 rounded-3xl space-y-6 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-red-400 uppercase tracking-tightest">Secure Trashing Request</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Are you absolutely sure you want to move this message packet to your Gmail Trash bin?
              </p>
            </div>

            <div className="flex gap-4 w-full pt-2">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border border-white/5"
              >
                Cancel Action
              </button>
              <button 
                onClick={confirmTrashMessage}
                className="flex-1 h-12 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] uppercase tracking-widest font-black shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
