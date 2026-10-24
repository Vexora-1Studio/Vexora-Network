import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Smile, Paperclip, Mic, MicOff, Image as ImageIcon,
  Film, FileText, X, Check, Slash, Flame, Swords, Sparkles,
  AlertCircle, ChevronUp, CornerUpLeft, Edit2
} from 'lucide-react';
import { ChatAttachment, ChatMessageItem, TeamMember } from './messagingTypes';

interface MessageInputComposerProps {
  conversationId: string;
  onSendMessage: (payload: {
    text: string;
    attachments?: ChatAttachment[];
    voiceNote?: { url: string; duration: number; waveform?: number[] };
    replyToId?: string;
    isEditingId?: string;
  }) => void;
  replyingToMessage: ChatMessageItem | null;
  onCancelReply: () => void;
  editingMessage: ChatMessageItem | null;
  onCancelEdit: () => void;
  members?: TeamMember[];
  onTyping?: (isTyping: boolean) => void;
  language: 'en' | 'ar';
}

const SLASH_COMMANDS = [
  { cmd: '/ready', desc: 'Declare ready status for gaming lobby', icon: Swords },
  { cmd: '/roll', desc: 'Roll a random d100 gaming die (1-100)', icon: Flame },
  { cmd: '/shrug', desc: 'Add ¯\\_(ツ)_/¯', icon: Smile },
  { cmd: '/tableflip', desc: 'Add (╯°□°)╯︵ ┻━┻', icon: Flame },
  { cmd: '/afk', desc: 'Set temporary away from keyboard signal', icon: AlertCircle },
];

const GAMING_EMOJIS = [
  '⚡', '🔥', '👑', '🎯', '💀', '⚔️', '🎮', '🚀', 
  '👍', '❤️', '🏆', '💎', '🎉', '🛡️', '👾', '✨',
  '💥', '👀', '🤣', '🥶', '🤝', '🦾', '🧠', '💯'
];

export const MessageInputComposer: React.FC<MessageInputComposerProps> = ({
  conversationId,
  onSendMessage,
  replyingToMessage,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  members = [],
  onTyping,
  language
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);

  // Typing debounce timer ref
  const typingTimerRef = useRef<any>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore draft per conversationId
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      textareaRef.current?.focus();
      return;
    }
    const savedDraft = localStorage.getItem(`vexora_draft_${conversationId}`);
    if (savedDraft) {
      setText(savedDraft);
    } else {
      setText('');
    }
    setPendingAttachments([]);
  }, [conversationId, editingMessage]);

  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // Save draft on change & trigger real typing indicator
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (!editingMessage) {
      if (val.trim()) {
        localStorage.setItem(`vexora_draft_${conversationId}`, val);
      } else {
        localStorage.removeItem(`vexora_draft_${conversationId}`);
      }
    }

    // Real human typing trigger
    if (onTyping && val.trim()) {
      onTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
      }, 2500);
    } else if (onTyping && !val.trim()) {
      onTyping(false);
    }

    // Check for slash command trigger
    if (val.startsWith('/')) {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }

    // Check for @mention trigger
    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const words = textBefore.split(/\s/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleSend = () => {
    if (!text.trim() && pendingAttachments.length === 0) return;

    if (onTyping) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      onTyping(false);
    }

    onSendMessage({
      text: text.trim(),
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      replyToId: replyingToMessage ? replyingToMessage.id : undefined,
      isEditingId: editingMessage ? editingMessage.id : undefined
    });

    setText('');
    localStorage.removeItem(`vexora_draft_${conversationId}`);
    setPendingAttachments([]);
    setShowEmojiPicker(false);
    setShowSlashCommands(false);
    setShowMentions(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Generate simulated waveform
        const waveform = Array.from({ length: 16 }, () => Math.floor(Math.random() * 80) + 15);
        
        onSendMessage({
          text: language === 'ar' ? '🎤 تسجيل صوتي عصبي' : '🎤 Neural Voice Transmission',
          voiceNote: {
            url: audioUrl,
            duration: recordingSeconds || 4,
            waveform
          },
          replyToId: replyingToMessage ? replyingToMessage.id : undefined
        });

        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unsupported, using simulated voice packet:', err);
      // High-fidelity fallback simulated voice note
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      const waveform = Array.from({ length: 16 }, () => Math.floor(Math.random() * 80) + 15);
      onSendMessage({
        text: language === 'ar' ? '🎤 تسجيل صوتي عصبي' : '🎤 Neural Voice Transmission',
        voiceNote: {
          url: 'https://actions.google.com/sounds/v1/science_fiction/teleport_arrival.ogg',
          duration: recordingSeconds || 5,
          waveform
        },
        replyToId: replyingToMessage ? replyingToMessage.id : undefined
      });
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Attachment file handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      const isAud = file.type.startsWith('audio/');

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newAtt: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: isImg ? 'image' : isVid ? 'video' : isAud ? 'audio' : 'file',
          name: file.name,
          url,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          mimeType: file.type
        };
        setPendingAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const insertMention = (handle: string) => {
    const words = text.split(/\s/);
    words[words.length - 1] = `@${handle} `;
    setText(words.join(' '));
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const selectSlashCommand = (cmd: string) => {
    if (cmd === '/shrug') {
      setText((prev) => prev.replace(/^\/shrug\s*/, '') + ' ¯\\_(ツ)_/¯');
    } else if (cmd === '/tableflip') {
      setText((prev) => prev.replace(/^\/tableflip\s*/, '') + ' (╯°□°)╯︵ ┻━┻');
    } else if (cmd === '/roll') {
      const rollVal = Math.floor(Math.random() * 100) + 1;
      setText(`🎲 Rolled a [${rollVal}/100] on the neural die!`);
    } else if (cmd === '/ready') {
      setText('⚔️ [TEAM STATUS] Ready and loaded for the next scrim match!');
    } else if (cmd === '/afk') {
      setText('🌙 [AFK] Stepping away from neural terminal. Back shortly.');
    }
    setShowSlashCommands(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-3 md:p-4 bg-[#080d19]/95 border-t border-cyan-500/10 backdrop-blur-2xl relative z-30">
      {/* Replying Banner */}
      {replyingToMessage && (
        <div className="mb-2 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <CornerUpLeft className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-cyan-400 font-bold block truncate">
                {language === 'ar' ? 'الرد على' : 'Replying to'} {replyingToMessage.senderName}
              </span>
              <p className="text-white/60 text-[11px] truncate">{replyingToMessage.text}</p>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="mb-2 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <Edit2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-yellow-400 font-bold block">
                {language === 'ar' ? 'تعديل الرسالة' : 'Editing Message'}
              </span>
              <p className="text-white/60 text-[11px] truncate">{editingMessage.text}</p>
            </div>
          </div>
          <button
            onClick={onCancelEdit}
            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {pendingAttachments.length > 0 && (
        <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {pendingAttachments.map((att) => (
            <div
              key={att.id}
              className="relative group p-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 pr-6 flex-shrink-0"
            >
              {att.type === 'image' ? (
                <img src={att.url} alt={att.name} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="text-[10px] font-mono">
                <span className="block truncate max-w-[100px] text-white font-bold">{att.name}</span>
                <span className="text-white/40">{att.size}</span>
              </div>
              <button
                onClick={() => removePendingAttachment(att.id)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 hover:bg-red-500 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Slash Commands Dropdown */}
      {showSlashCommands && (
        <div className="absolute bottom-full left-4 mb-2 w-72 rounded-2xl bg-[#0c1322] border border-cyan-500/30 p-2 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2 py-1 text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider border-b border-white/5 mb-1 flex items-center gap-1.5">
            <Slash className="w-3 h-3" />
            <span>Slash Commands</span>
          </div>
          {SLASH_COMMANDS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.cmd}
                onClick={() => selectSlashCommand(item.cmd)}
                className="w-full p-2 rounded-xl hover:bg-cyan-500/20 text-left flex items-center gap-2.5 transition-all text-xs font-mono group"
              >
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 group-hover:scale-110">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-cyan-300 block">{item.cmd}</span>
                  <span className="text-[10px] text-white/50 truncate block">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Mentions Dropdown */}
      {showMentions && members.length > 0 && (
        <div className="absolute bottom-full left-12 mb-2 w-64 max-h-48 overflow-y-auto rounded-2xl bg-[#0c1322] border border-cyan-500/30 p-1.5 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 scrollbar-thin">
          <div className="px-2 py-1 text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider border-b border-white/5 mb-1">
            Mention Member
          </div>
          {members
            .filter((m) => m.name.toLowerCase().includes(mentionQuery) || m.handle.toLowerCase().includes(mentionQuery))
            .map((m) => (
              <button
                key={m.id}
                onClick={() => insertMention(m.handle)}
                className="w-full p-1.5 rounded-xl hover:bg-white/10 flex items-center gap-2 text-left transition-all text-xs font-mono"
              >
                <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-lg object-cover" />
                <div className="min-w-0">
                  <span className="text-white font-bold block truncate">{m.name}</span>
                  <span className="text-cyan-400/70 text-[9px]">@{m.handle}</span>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 p-3 rounded-2xl bg-[#0c1322] border border-cyan-500/30 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
            Gaming Reactions & Emojis
          </div>
          <div className="grid grid-cols-8 gap-1">
            {GAMING_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setText((prev) => prev + emoji);
                  textareaRef.current?.focus();
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-base hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recording Active Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/40 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono text-red-400 font-black uppercase tracking-wider">
              {language === 'ar' ? 'جاري التسجيل الصوتي...' : 'Recording Voice Note...'}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-black/40 font-mono text-xs text-white">
              {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:
              {(recordingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-mono cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={stopAndSendRecording}
              className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Message Composer */
        <div className="flex items-end gap-2 bg-white/[0.03] border border-white/10 focus-within:border-cyan-500/50 focus-within:bg-white/[0.06] rounded-2xl p-1.5 transition-all shadow-inner">
          {/* Action buttons (attachments, emoji) */}
          <div className="flex items-center gap-0.5 pb-1 pl-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Attach File / Media"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showEmojiPicker ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-white/40 hover:text-cyan-400'
              }`}
              title="Emoji Picker"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'ar'
                ? 'اكتب رسالة مشفرة، أو استخدم @ للتنبيه، أو / للأوامر...'
                : 'Transmit neural message, type @ to mention, or / for commands...'
            }
            className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none text-white text-xs font-sans placeholder:text-white/30 resize-none py-2 px-2 focus:outline-none focus:ring-0 leading-relaxed"
          />

          {/* Right Action: Voice Record or Send */}
          <div className="flex items-center gap-1 pb-1 pr-1">
            {!text.trim() && pendingAttachments.length === 0 ? (
              <button
                type="button"
                onClick={startRecording}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)] active:scale-95"
                title={language === 'ar' ? 'تسجيل رسالة صوتية' : 'Record Voice Note'}
              >
                <Mic className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 cursor-pointer"
              >
                <span>{editingMessage ? (language === 'ar' ? 'حفظ' : 'Save') : (language === 'ar' ? 'إرسال' : 'Send')}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
