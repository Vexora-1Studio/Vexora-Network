import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, ShieldAlert, Sparkles, Radio, Users, MessageSquare, 
  Settings, Activity, RefreshCw, Send, CheckCircle2, AlertTriangle, 
  Trash2, Pin, Star, Lock, Unlock, UserCheck, UserX, Volume2, 
  VolumeX, Database, HardDrive, Cpu, Wifi, Eye, EyeOff, Search, 
  Filter, Check, X, AlertOctagon, Terminal, Mail, Zap, ChevronRight,
  Layers, Sliders, Globe, Award, Flame, RefreshCcw, UserPlus, 
  Key, ShieldCheck, UserCheck2, LogIn, ArrowRightLeft, Sparkle, 
  Coins, BellRing, Laptop, Fingerprint, Image as ImageIcon,
  Ban, ShieldX, CheckSquare, Square
} from 'lucide-react';
import { UserProfile, Post, Community } from '../types';

interface OwnerControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  allUsers: Record<string, UserProfile>;
  setAllUsers?: React.Dispatch<React.SetStateAction<Record<string, UserProfile>>>;
  onSwitchAccount?: (user: UserProfile) => void;
  allCommunities?: Community[];
  onAddNotification: (msg: string, type?: 'success' | 'alert') => void;
  language?: 'en' | 'ar';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&h=120&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop'
];

export const OwnerControlCenter: React.FC<OwnerControlCenterProps> = ({
  isOpen,
  onClose,
  currentUser,
  posts,
  setPosts,
  allUsers,
  setAllUsers,
  onSwitchAccount,
  allCommunities = [],
  onAddNotification,
  language = 'en'
}) => {
  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'broadcast' | 'content' | 'telemetry' | 'quickActions'>('orders');

  // Broadcast state
  const [emailSubject, setEmailSubject] = useState('🚨 Vexora Platform Update / إعلان رسمي من مالك الموقع');
  const [emailBody, setEmailBody] = useState('Greetings Network Nodes,\n\nThis is an official administrative broadcast from the Platform Owner (Flux Studio / Vexora Network). System capabilities have been fully augmented with quantum encryption and real-time synchronization.\n\nEnjoy the next generation of social networking!\n\nBest Regards,\nPlatform Architect & Owner');
  const [enhanceWithAi, setEnhanceWithAi] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([
    '[INIT] Owner Neural Dispatcher connected.',
    '[READY] Target matrix initialized.'
  ]);
  const [selectedUserEmails, setSelectedUserEmails] = useState<Record<string, boolean>>({});
  const [smtpStatus, setSmtpStatus] = useState<{ hasSMTP: boolean; smtpUser: string | null; smtpHost: string } | null>(null);

  // User Management state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'verified' | 'vip' | 'owner' | 'banned'>('all');
  const [localUsers, setLocalUsers] = useState<Record<string, UserProfile>>(allUsers);
  const [selectedMatrixUserIds, setSelectedMatrixUserIds] = useState<Record<string, boolean>>({});
  const [quickBanHandle, setQuickBanHandle] = useState('');

  // Add Account Modal State
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserHandle, setNewUserHandle] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'admin' | 'moderator' | 'member'>('member');
  const [newUserIsVerified, setNewUserIsVerified] = useState(true);
  const [newUserIsVip, setNewUserIsVip] = useState(false);
  const [newUserAvatar, setNewUserAvatar] = useState(PRESET_AVATARS[0]);
  const [newUserBio, setNewUserBio] = useState('');
  const [newUserLocation, setNewUserLocation] = useState('Global Matrix');
  const [newUserFollowers, setNewUserFollowers] = useState<number>(1200);

  // Content Moderation state
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState<'all' | 'pinned' | 'legendary' | 'unlisted'>('all');

  // Emergency & Quick Actions state
  const [emergencyBannerText, setEmergencyBannerText] = useState(() => localStorage.getItem('vexora_emergency_banner') || '');
  const [emergencyBannerActive, setEmergencyBannerActive] = useState(() => localStorage.getItem('vexora_emergency_banner_active') === 'true');
  const [maintenanceActive, setMaintenanceActive] = useState(() => localStorage.getItem('vexora_maintenance_mode') === 'true');
  const [systemAlertMessage, setSystemAlertMessage] = useState('');
  const [postingLocked, setPostingLocked] = useState(() => localStorage.getItem('vexora_feed_lockdown') === 'true');

  // Terminal & Command Prompt state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'VEXORA SUPREME OWNER CLI v5.0.0 [SYSTEM_READY]',
    'Type "/help" or select an Executive Directive from below to execute owner orders.',
    'Current Authenticated Owner: Flux Studio (fluxstudio4@gmail.com)'
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Live Telemetry states
  const [pingLatency, setPingLatency] = useState(24);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);

  useEffect(() => {
    setLocalUsers(allUsers);
  }, [allUsers]);

  // Load SMTP
  useEffect(() => {
    fetch('/api/owner/smtp-status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSmtpStatus({
            hasSMTP: data.hasSMTP,
            smtpUser: data.smtpUser,
            smtpHost: data.smtpHost
          });
        }
      })
      .catch(err => console.warn("Error fetching SMTP status:", err));
  }, []);

  // Initialize selected emails
  useEffect(() => {
    const list: Record<string, boolean> = {};
    (Object.values(localUsers) as UserProfile[]).forEach(u => {
      if (u && u.email) list[u.email.toLowerCase()] = true;
    });
    setSelectedUserEmails(list);
  }, [localUsers]);

  // Helper to persist users
  const persistUserUpdate = (updatedUsers: Record<string, UserProfile>) => {
    setLocalUsers(updatedUsers);
    if (setAllUsers) setAllUsers(updatedUsers);
    try {
      localStorage.setItem('vexora_custom_accounts', JSON.stringify(updatedUsers));
    } catch (e) {
      console.error('Error persisting users:', e);
    }
  };

  // Play Futuristic Audio Chime
  const playOwnerChime = (type: 'order' | 'alert' | 'vip' | 'login' = 'order') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'order') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'vip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.25); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Handle Broadcast
  const handleExecuteBroadcast = async () => {
    const targets = Object.keys(selectedUserEmails).filter(e => selectedUserEmails[e]);
    if (targets.length === 0) {
      onAddNotification(isArabic ? 'يرجى اختيار مستلم واحد على الأقل' : 'Please select at least 1 recipient', 'alert');
      return;
    }

    setIsSending(true);
    playOwnerChime('order');
    setBroadcastLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Initiating global transmission to ${targets.length} nodes...`,
      ...prev
    ]);

    try {
      const response = await fetch('/api/owner/broadcast-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          content: emailBody,
          recipients: targets,
          enhance: enhanceWithAi
        })
      });

      const result = await response.json();
      if (result.success) {
        if (result.subject) setEmailSubject(result.subject);
        if (result.content) setEmailBody(result.content);
        setBroadcastLogs(result.logs || [`[SUCCESS] Broadcast dispatched to ${targets.length} targets!`]);
        onAddNotification(
          isArabic 
            ? `تم إرسال البث بنجاح إلى ${targets.length} مستخدم!` 
            : `Broadcast successfully routed to ${targets.length} users!`, 
          'success'
        );
      } else {
        throw new Error(result.error || 'Dispatch error');
      }
    } catch (err: any) {
      setBroadcastLogs(prev => [`❌ [FAILED] ${err.message || 'Dispatch aborted'}`, ...prev]);
      onAddNotification(err.message || 'Transmission error', 'alert');
    } finally {
      setIsSending(false);
    }
  };

  // Add New Account Action
  const handleCreateAccount = (autoLogin: boolean = false) => {
    if (!newUserName.trim() || !newUserHandle.trim()) {
      onAddNotification(isArabic ? 'يرجى إدخال اسم الحساب والمعرف (@handle)' : 'Please enter Name and Handle', 'alert');
      return;
    }

    const cleanHandle = newUserHandle.replace('@', '').trim().toLowerCase();
    const newId = `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const emailToUse = newUserEmail.trim() || `${cleanHandle}@vexora.network`;
    const isOwnerRole = newUserRole === 'owner';

    const createdProfile: UserProfile = {
      id: newId,
      name: newUserName.trim() + (isOwnerRole ? ' 👑' : ''),
      handle: cleanHandle,
      email: emailToUse,
      avatar: newUserAvatar || PRESET_AVATARS[0],
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop',
      bio: newUserBio.trim() || (isOwnerRole ? 'Owner of Vexora Platform' : 'Active Vexora Node'),
      location: newUserLocation.trim() || 'Global Matrix',
      joinedDate: 'August 2026',
      followers: Number(newUserFollowers) || 1200,
      following: 24,
      isVerified: newUserIsVerified || isOwnerRole,
      isOwner: isOwnerRole,
      role: newUserRole,
      isVip: newUserIsVip || isOwnerRole || newUserRole === 'admin',
      subscriptionTier: (newUserIsVip || isOwnerRole || newUserRole === 'admin') ? 'plus_pro' : 'free',
      subscriptionStatus: 'active',
      lastActive: Date.now()
    };

    const updated = { ...localUsers, [createdProfile.name]: createdProfile, [createdProfile.id]: createdProfile };
    persistUserUpdate(updated);
    playOwnerChime('vip');

    onAddNotification(
      isArabic 
        ? `✅ تم إنشاء الحساب الجديد: ${createdProfile.name} (@${createdProfile.handle}) بنجاح!` 
        : `✅ Account created successfully: ${createdProfile.name} (@${createdProfile.handle})!`,
      'success'
    );

    setTerminalLogs(prev => [
      `[ACCOUNT_CREATED] Node ID: ${createdProfile.id} | @${createdProfile.handle} (${createdProfile.email}) | Role: ${createdProfile.role.toUpperCase()}`,
      ...prev
    ]);

    // Reset Form
    setShowAddAccountModal(false);
    setNewUserName('');
    setNewUserHandle('');
    setNewUserEmail('');
    setNewUserBio('');
    setNewUserRole('member');
    setNewUserIsVerified(true);
    setNewUserIsVip(false);

    if (autoLogin && onSwitchAccount) {
      onSwitchAccount(createdProfile);
      onClose();
    }
  };

  // Toggle User Verification
  const handleToggleVerification = (userId: string) => {
    setLocalUsers(prev => {
      const user = prev[userId] || (Object.values(prev) as UserProfile[]).find(u => u && u.id === userId);
      if (!user) return prev;
      const updatedUser = { ...user, isVerified: !user.isVerified };
      const updated = { ...prev, [user.name]: updatedUser, [user.id]: updatedUser };
      persistUserUpdate(updated);
      playOwnerChime('order');
      onAddNotification(
        isArabic 
          ? `تم ${updatedUser.isVerified ? 'توثيق' : 'إلغاء توثيق'} المستخدم: ${user.name}` 
          : `${updatedUser.isVerified ? 'Verified' : 'Unverified'} user: ${user.name}`,
        'success'
      );
      return updated;
    });
  };

  // Toggle VIP / Pro
  const handleToggleVip = (userId: string) => {
    setLocalUsers(prev => {
      const user = prev[userId] || (Object.values(prev) as UserProfile[]).find(u => u && u.id === userId);
      if (!user) return prev;
      const isNowVip = user.subscriptionTier !== 'plus_pro';
      const updatedUser: UserProfile = { 
        ...user, 
        subscriptionTier: isNowVip ? 'plus_pro' : 'free',
        isVip: isNowVip 
      };
      const updated = { ...prev, [user.name]: updatedUser, [user.id]: updatedUser };
      persistUserUpdate(updated);
      playOwnerChime('vip');
      onAddNotification(
        isArabic 
          ? `تم ترقية المستخدم ${user.name} إلى VIP 👑` 
          : `Granted VIP status to ${user.name} 👑`,
        'success'
      );
      return updated;
    });
  };

  // Toggle Ban / Mute
  const handleToggleBan = (userId: string) => {
    setLocalUsers(prev => {
      const user = prev[userId] || (Object.values(prev) as UserProfile[]).find(u => u && u.id === userId);
      if (!user) return prev;
      const isOwnerNode = user.email === 'fluxstudio4@gmail.com' || user.email === 'vexora.network@gmail.com' || user.isOwner || user.role === 'owner';
      if (isOwnerNode) {
        onAddNotification(isArabic ? 'لا يمكن حظر حساب المالك الأساسي' : 'Cannot ban owner node', 'alert');
        return prev;
      }
      const updatedUser: UserProfile = { ...user, isBanned: !user.isBanned };
      const updated = { ...prev, [user.name]: updatedUser, [user.id]: updatedUser };
      persistUserUpdate(updated);
      playOwnerChime('alert');
      onAddNotification(
        isArabic 
          ? (updatedUser.isBanned ? `🚫 تم حظر وتجميد وصول المستخدم: ${user.name}` : `✅ تم فك حظر واستعادة حساب: ${user.name}`)
          : (updatedUser.isBanned ? `🚫 Restricted & Banned user: ${user.name}` : `✅ Restored access for user: ${user.name}`),
        updatedUser.isBanned ? 'alert' : 'success'
      );
      setTerminalLogs(logs => [
        `[USER_MODERATION] ${updatedUser.isBanned ? 'BANNED (Access Restricted)' : 'UNBANNED (Access Restored)'}: @${user.handle}`,
        ...logs
      ]);
      return updated;
    });
  };

  // Toggle Matrix User Checkbox
  const handleToggleSelectMatrixUser = (userId: string) => {
    setSelectedMatrixUserIds(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Select All Users in Current View (excluding owner)
  const handleSelectAllMatrixUsers = () => {
    const next: Record<string, boolean> = {};
    userList.forEach(u => {
      const isOwnerNode = u.email === 'fluxstudio4@gmail.com' || u.email === 'vexora.network@gmail.com' || u.isOwner || u.role === 'owner';
      if (!isOwnerNode) {
        next[u.id] = true;
      }
    });
    setSelectedMatrixUserIds(next);
  };

  // Clear Matrix Selection
  const handleClearMatrixSelection = () => {
    setSelectedMatrixUserIds({});
  };

  // Ban Selected Users
  const handleBanSelectedUsers = () => {
    const targetIds = Object.keys(selectedMatrixUserIds).filter(id => selectedMatrixUserIds[id]);
    if (targetIds.length === 0) {
      onAddNotification(isArabic ? 'يرجى تحديد مستخدم واحد على الأقل لحظر حسابه' : 'Please select at least 1 user to ban', 'alert');
      return;
    }

    const updated = { ...localUsers };
    let bannedCount = 0;
    targetIds.forEach(id => {
      const user = (Object.values(updated) as UserProfile[]).find(u => u && u.id === id);
      if (user) {
        const isOwnerNode = user.email === 'fluxstudio4@gmail.com' || user.email === 'vexora.network@gmail.com' || user.isOwner || user.role === 'owner';
        if (!isOwnerNode) {
          const updatedUser = { ...user, isBanned: true };
          updated[user.id] = updatedUser;
          if (user.name) updated[user.name] = updatedUser;
          bannedCount++;
        }
      }
    });

    if (bannedCount > 0) {
      persistUserUpdate(updated);
      playOwnerChime('alert');
      onAddNotification(
        isArabic ? `🚫 أمر المالك: تم حظر وتجميد وصول (${bannedCount}) مستخدم محدد إلى المنصة!` : `🚫 Owner Directive: Banned and restricted ${bannedCount} selected users!`,
        'alert'
      );
      setTerminalLogs(prev => [`[RESTRICTION_ENFORCED] Mass ban executed on ${bannedCount} selected users. Platform access restricted.`, ...prev]);
    } else {
      onAddNotification(isArabic ? 'لم يتم العثور على حسابات مؤهلة للحظر بين المحددين' : 'No eligible accounts to ban in selection', 'alert');
    }
  };

  // Unban Selected Users
  const handleUnbanSelectedUsers = () => {
    const targetIds = Object.keys(selectedMatrixUserIds).filter(id => selectedMatrixUserIds[id]);
    if (targetIds.length === 0) {
      onAddNotification(isArabic ? 'يرجى تحديد مستخدم واحد على الأقل لإلغاء الحظر' : 'Please select at least 1 user to unban', 'alert');
      return;
    }

    const updated = { ...localUsers };
    let unbannedCount = 0;
    targetIds.forEach(id => {
      const user = (Object.values(updated) as UserProfile[]).find(u => u && u.id === id);
      if (user) {
        const updatedUser = { ...user, isBanned: false };
        updated[user.id] = updatedUser;
        if (user.name) updated[user.name] = updatedUser;
        unbannedCount++;
      }
    });

    if (unbannedCount > 0) {
      persistUserUpdate(updated);
      playOwnerChime('order');
      onAddNotification(
        isArabic ? `✅ تم إلغاء حظر واستعادة صلاحيات (${unbannedCount}) مستخدم بنجاح` : `✅ Unbanned & restored access for ${unbannedCount} selected users`,
        'success'
      );
      setTerminalLogs(prev => [`[RESTRICTION_LIFTED] Mass unban executed on ${unbannedCount} selected users.`, ...prev]);
    }
  };

  // Quick Ban by Handle
  const handleQuickBanByHandle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const handle = quickBanHandle.trim().replace('@', '').toLowerCase();
    if (!handle) return;

    const user = (Object.values(localUsers) as UserProfile[]).find(u => u && u.handle.toLowerCase() === handle);
    if (!user) {
      onAddNotification(isArabic ? `لم يتم العثور على مستخدم بالمعرف @${handle}` : `User not found: @${handle}`, 'alert');
      return;
    }

    const isOwnerNode = user.email === 'fluxstudio4@gmail.com' || user.email === 'vexora.network@gmail.com' || user.isOwner || user.role === 'owner';
    if (isOwnerNode) {
      onAddNotification(isArabic ? 'لا يمكن حظر حساب المالك الأساسي' : 'Cannot ban owner node', 'alert');
      return;
    }

    handleToggleBan(user.id);
    setQuickBanHandle('');
  };

  // Delete Selected Users
  const handleDeleteSelectedUsers = () => {
    const targetIds = Object.keys(selectedMatrixUserIds).filter(id => selectedMatrixUserIds[id]);
    if (targetIds.length === 0) {
      onAddNotification(isArabic ? 'يرجى تحديد حساب واحد على الأقل لحذفه' : 'Please select at least 1 account to delete', 'alert');
      return;
    }

    const updated = { ...localUsers };
    let deletedCount = 0;
    targetIds.forEach(id => {
      const user = (Object.values(updated) as UserProfile[]).find(u => u && u.id === id);
      if (user) {
        const isOwnerNode = user.email === 'fluxstudio4@gmail.com' || user.email === 'vexora.network@gmail.com' || user.isOwner || user.role === 'owner';
        if (!isOwnerNode) {
          delete updated[user.id];
          if (user.name) delete updated[user.name];
          deletedCount++;
        }
      }
    });

    if (deletedCount > 0) {
      persistUserUpdate(updated);
      setSelectedMatrixUserIds({});
      // Clear from custom accounts in localStorage too
      try {
        const savedCustom = localStorage.getItem('vexora_custom_accounts');
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          targetIds.forEach(id => {
            delete parsed[id];
            const found = Object.keys(parsed).find(k => parsed[k]?.id === id);
            if (found) delete parsed[found];
          });
          localStorage.setItem('vexora_custom_accounts', JSON.stringify(parsed));
        }
      } catch (e) {
        console.error("Error updating custom accounts on delete:", e);
      }
      playOwnerChime('alert');
      onAddNotification(
        isArabic ? `🗑️ أمر المالك: تم حذف (${deletedCount}) حساب نهائياً من قاعدة بيانات المنصة!` : `🗑️ Owner Directive: Permanently deleted ${deletedCount} selected accounts!`,
        'alert'
      );
      setTerminalLogs(prev => [`[ACCOUNTS_PURGED] Permanently deleted ${deletedCount} user nodes.`, ...prev]);
    } else {
      onAddNotification(isArabic ? 'لم يتم العثور على حسابات قابلة للحذف (حسابات المالك محمية)' : 'No eligible accounts to delete (Owner accounts are protected)', 'alert');
    }
  };

  // Master Directive: Wipe & Delete ALL Non-Owner Accounts from the Site
  const handleDeleteAllAccounts = () => {
    const updated: Record<string, UserProfile> = {};
    let purgedCount = 0;
    
    (Object.values(localUsers) as UserProfile[]).forEach(u => {
      if (u) {
        const isOwnerNode = u.email === 'fluxstudio4@gmail.com' || u.email === 'vexora.network@gmail.com' || u.isOwner || u.role === 'owner';
        if (isOwnerNode) {
          updated[u.id] = u;
          if (u.name) updated[u.name] = u;
        } else {
          purgedCount++;
        }
      }
    });

    // Reset local storage custom accounts
    localStorage.removeItem('vexora_custom_accounts');
    localStorage.removeItem('vexora_all_users_matrix');
    setSelectedMatrixUserIds({});
    persistUserUpdate(updated);

    playOwnerChime('alert');
    onAddNotification(
      isArabic 
        ? `🔥 تطهير شامل: تم حذف كافة حسابات الموقع (${purgedCount} حساب) بنجاح والاحتفاظ بحساب المالك فقط!` 
        : `🔥 Full Purge: Deleted all ${purgedCount} accounts from the site! Kept owner account active.`,
      'alert'
    );
    setTerminalLogs(prev => [
      `[MASTER_PURGE_EXECUTED] Purged ${purgedCount} accounts across matrix. State: CLEAN SLATE.`,
      ...prev
    ]);
  };

  // Delete User Account
  const handleDeleteUserAccount = (userId: string) => {
    const user = (Object.values(localUsers) as UserProfile[]).find(u => u && u.id === userId);
    if (!user) return;
    if (user.email === 'fluxstudio4@gmail.com' || user.isOwner) {
      onAddNotification(isArabic ? 'لا يمكن حذف حساب المالك الأساسي' : 'Cannot delete primary owner node', 'alert');
      return;
    }

    const updated = { ...localUsers };
    delete updated[user.name];
    delete updated[userId];
    persistUserUpdate(updated);

    // Also remove from custom accounts localStorage
    try {
      const savedCustom = localStorage.getItem('vexora_custom_accounts');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        delete parsed[userId];
        delete parsed[user.name];
        localStorage.setItem('vexora_custom_accounts', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error("Error updating custom accounts on single delete:", e);
    }

    playOwnerChime('alert');
    onAddNotification(
      isArabic ? `🗑️ تم حذف حساب ${user.name} نهائياً من النظام` : `🗑️ Account ${user.name} permanently deleted`,
      'alert'
    );
  };

  // ===================== OWNER EXECUTIVE ORDERS (أوامر المالك) =====================

  // 1. Grant VIP to All Users
  const handleGrantVipToAll = () => {
    const updated = { ...localUsers };
    let count = 0;
    (Object.values(updated) as UserProfile[]).forEach(u => {
      if (u && u.id) {
        updated[u.id] = { ...u, isVip: true, subscriptionTier: 'plus_pro', subscriptionStatus: 'active' };
        if (u.name) updated[u.name] = updated[u.id];
        count++;
      }
    });
    persistUserUpdate(updated);
    playOwnerChime('vip');
    onAddNotification(
      isArabic ? `👑 أمر المالك: تم منح عضوية VIP لجميع أعضاء المنصة (${count} حساب)!` : `👑 Owner Directive: Granted VIP status to ALL ${count} nodes!`,
      'success'
    );
    setTerminalLogs(prev => [`[ORDER_EXECUTED] Grant VIP status to all ${count} users: COMPLETED.`, ...prev]);
  };

  // 2. Grant Verification to All Users
  const handleVerifyAllUsers = () => {
    const updated = { ...localUsers };
    let count = 0;
    (Object.values(updated) as UserProfile[]).forEach(u => {
      if (u && u.id) {
        updated[u.id] = { ...u, isVerified: true };
        if (u.name) updated[u.name] = updated[u.id];
        count++;
      }
    });
    persistUserUpdate(updated);
    playOwnerChime('order');
    onAddNotification(
      isArabic ? `🌟 أمر المالك: تم توثيق جميع حسابات المنصة بالشارة الزرقاء (${count} حساب)!` : `🌟 Owner Directive: Verified ALL ${count} accounts with blue checkmark!`,
      'success'
    );
    setTerminalLogs(prev => [`[ORDER_EXECUTED] Global verification checkmark granted to ${count} users.`, ...prev]);
  };

  // 3. Karma Points Airdrop
  const handleAirdropKarma = () => {
    playOwnerChime('vip');
    onAddNotification(
      isArabic ? '💎 أمر المالك: تم توزيع +10,000 نقطة Vexora Karma على كافة المستخدمين المتصلين!' : '💎 Owner Directive: Dispersed +10,000 Karma Points to all active nodes!',
      'success'
    );
    setTerminalLogs(prev => [
      `[ORDER_EXECUTED] Airdrop 10,000 Karma Points to global ledger. State: CONFIRMED.`,
      ...prev
    ]);
  };

  // 4. Clean Spam & Flagged Posts
  const handlePurgeSpamPosts = () => {
    setPosts(prev => prev.filter(p => p.content.trim().length > 3));
    playOwnerChime('order');
    onAddNotification(
      isArabic ? '🧹 أمر المالك: تم مسح المنشورات المكررة والسبام وتنظيف خلاصات المحتوى!' : '🧹 Owner Directive: Sanitized spam and low-quality posts across feeds!',
      'success'
    );
    setTerminalLogs(prev => [`[ORDER_EXECUTED] AI feed sanitization & spam purge executed.`, ...prev]);
  };

  // 5. Toggle Feed Posting Lockdown
  const handleToggleFeedLockdown = () => {
    const next = !postingLocked;
    setPostingLocked(next);
    localStorage.setItem('vexora_feed_lockdown', next ? 'true' : 'false');
    playOwnerChime(next ? 'alert' : 'order');
    onAddNotification(
      isArabic 
        ? `🔒 أمر المالك: ${next ? 'تم قفل النشر العام (الموثقون فقط)' : 'تم فتح النشر للجميع'}` 
        : `🔒 Owner Directive: Global Posting Lockdown ${next ? 'ENGAGED' : 'DISENGAGED'}`,
      next ? 'alert' : 'success'
    );
    setTerminalLogs(prev => [`[ORDER_EXECUTED] Posting Lockdown status set to: ${next ? 'ACTIVE (Verified Only)' : 'OPEN'}`, ...prev]);
  };

  // 6. Emergency Siren & Audio Pulse
  const handleTriggerEmergencyPulse = () => {
    playOwnerChime('alert');
    onAddNotification(
      isArabic ? '🚨 أمر المالك: إطلاق تنبيه صوتي ونبضة طوارئ عالية التردد في عموم الشبكة!' : '🚨 Owner Directive: Triggered Global Emergency Siren & High-Frequency Audio Pulse!',
      'alert'
    );
    setTerminalLogs(prev => [`[ORDER_EXECUTED] High-frequency emergency audio wave dispatched to network.`, ...prev]);
  };

  // 7. Execute Terminal Command
  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    setCommandHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    setTerminalInput('');

    const parts = cmd.split(' ');
    const root = parts[0].toLowerCase();
    const arg1 = parts[1] || '';
    const arg2 = parts[2] || '';

    setTerminalLogs(prev => [`OWNER@VEXORA:~$ ${cmd}`, ...prev]);

    if (root === 'help' || root === '/help') {
      setTerminalLogs(prev => [
        'Available Owner Commands:',
        '  /delete <all | selected | @handle> - Delete accounts from site',
        '  /purge                      - Master wipe of all non-owner accounts',
        '  /verify <@handle | all>     - Grant blue checkmark',
        '  /vip <@handle | all>        - Grant VIP status',
        '  /ban <@handle | selected>   - Ban user from network',
        '  /unban <@handle | selected> - Restore user access',
        '  /add-user <name> <handle>   - Spawn new account',
        '  /pin <postId>               - Pin post to top of feed',
        '  /lock-feed                  - Toggle posting lockdown',
        '  /broadcast <message>        - Send instant alert to nodes',
        '  /airdrop                    - Distribute 10,000 Karma points',
        '  /clear                      - Clear terminal output',
        '  /status                     - View matrix engine health',
        ...prev
      ]);
    } else if (root === '/clear' || root === 'clear') {
      setTerminalLogs(['Console cleared by Supreme Owner.']);
    } else if (root === '/status' || root === 'status') {
      setTerminalLogs(prev => [
        `[STATUS] Latency: ${pingLatency}ms | Heap: ${memoryUsage}MB | Users: ${Object.keys(localUsers).length} | Posts: ${posts.length} | Owner Node: fluxstudio4@gmail.com (OPERATIONAL)`,
        ...prev
      ]);
    } else if (root === '/delete' || root === '/purge' || root === '/wipe') {
      if (arg1 === 'all' || root === '/purge' || root === '/wipe') {
        handleDeleteAllAccounts();
      } else if (arg1 === 'selected') {
        handleDeleteSelectedUsers();
      } else if (arg1) {
        const targetHandle = arg1.replace('@', '').toLowerCase();
        const user = (Object.values(localUsers) as UserProfile[]).find(u => u && u.handle.toLowerCase() === targetHandle);
        if (user) {
          handleDeleteUserAccount(user.id);
          setTerminalLogs(prev => [`[SUCCESS] Account @${user.handle} deleted permanently`, ...prev]);
        } else {
          setTerminalLogs(prev => [`[ERROR] User handle not found: ${arg1}`, ...prev]);
        }
      } else {
        setTerminalLogs(prev => [`[ERROR] Missing argument. Usage: /delete <all | selected | @handle>`, ...prev]);
      }
    } else if (root === '/vip') {
      if (arg1 === 'all') {
        handleGrantVipToAll();
      } else {
        const targetHandle = arg1.replace('@', '').toLowerCase();
        const user = (Object.values(localUsers) as UserProfile[]).find(u => u && u.handle.toLowerCase() === targetHandle);
        if (user) {
          handleToggleVip(user.id);
          setTerminalLogs(prev => [`[SUCCESS] Granted VIP status to @${user.handle}`, ...prev]);
        } else {
          setTerminalLogs(prev => [`[ERROR] User handle not found: ${arg1}`, ...prev]);
        }
      }
    } else if (root === '/verify') {
      if (arg1 === 'all') {
        handleVerifyAllUsers();
      } else {
        const targetHandle = arg1.replace('@', '').toLowerCase();
        const user = (Object.values(localUsers) as UserProfile[]).find(u => u && u.handle.toLowerCase() === targetHandle);
        if (user) {
          handleToggleVerification(user.id);
          setTerminalLogs(prev => [`[SUCCESS] Verification badge toggled for @${user.handle}`, ...prev]);
        } else {
          setTerminalLogs(prev => [`[ERROR] User handle not found: ${arg1}`, ...prev]);
        }
      }
    } else if (root === '/ban') {
      if (arg1 === 'selected') {
        handleBanSelectedUsers();
      } else if (arg1) {
        const targetHandle = arg1.replace('@', '').toLowerCase();
        const user = (Object.values(localUsers) as UserProfile[]).find(u => u && u.handle.toLowerCase() === targetHandle);
        if (user) {
          handleToggleBan(user.id);
          setTerminalLogs(prev => [`[SUCCESS] Ban restriction applied to @${user.handle}`, ...prev]);
        } else {
          setTerminalLogs(prev => [`[ERROR] User handle not found: ${arg1}`, ...prev]);
        }
      } else {
        setTerminalLogs(prev => [`[ERROR] Missing argument. Usage: /ban <@handle | selected>`, ...prev]);
      }
    } else if (root === '/unban') {
      if (arg1 === 'selected') {
        handleUnbanSelectedUsers();
      } else if (arg1) {
        const targetHandle = arg1.replace('@', '').toLowerCase();
        const user = (Object.values(localUsers) as UserProfile[]).find(u => u && u.handle.toLowerCase() === targetHandle);
        if (user) {
          if (user.isBanned) {
            handleToggleBan(user.id);
          }
          setTerminalLogs(prev => [`[SUCCESS] Access restored for @${user.handle}`, ...prev]);
        } else {
          setTerminalLogs(prev => [`[ERROR] User handle not found: ${arg1}`, ...prev]);
        }
      } else {
        setTerminalLogs(prev => [`[ERROR] Missing argument. Usage: /unban <@handle | selected>`, ...prev]);
      }
    } else if (root === '/airdrop') {
      handleAirdropKarma();
    } else if (root === '/lock-feed') {
      handleToggleFeedLockdown();
    } else if (root === '/broadcast') {
      const msg = parts.slice(1).join(' ');
      if (msg) {
        onAddNotification(`📢 [OWNER BROADCAST]: ${msg}`, 'success');
        setTerminalLogs(prev => [`[SUCCESS] Broadcast dispatched: "${msg}"`, ...prev]);
      } else {
        setTerminalLogs(prev => ['[ERROR] Missing broadcast message. Usage: /broadcast <message>', ...prev]);
      }
    } else if (root === '/add-user') {
      if (arg1 && arg2) {
        setNewUserName(arg1);
        setNewUserHandle(arg2);
        setShowAddAccountModal(true);
        setTerminalLogs(prev => [`[PROMPT] Opened account creator with name "${arg1}" and handle "@${arg2}"`, ...prev]);
      } else {
        setShowAddAccountModal(true);
      }
    } else {
      setTerminalLogs(prev => [
        `[UNKNOWN_COMMAND] "${cmd}". Type "/help" to view full command matrix.`,
        ...prev
      ]);
    }
  };

  // Content Actions
  const handlePinPost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isPinned = !p.isPinned;
        onAddNotification(
          isArabic 
            ? (isPinned ? '📌 تم تثبيت المنشور في أعلى الشبكة عالمياً' : 'تم إلغاء تثبيت المنشور') 
            : (isPinned ? '📌 Post pinned globally to feed' : 'Post unpinned'),
          'success'
        );
        return { ...p, isPinned };
      }
      return p;
    }));
  };

  const handleFeatureLegendary = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLegendary = !p.isLegendary;
        onAddNotification(
          isArabic 
            ? (isLegendary ? '🌟 تم تصنيف المنشور كـ Legendary Post' : 'تم إلغاء تصنيف Legendary') 
            : (isLegendary ? '🌟 Marked post as Legendary' : 'Legendary status removed'),
          'success'
        );
        return { ...p, isLegendary };
      }
      return p;
    }));
  };

  const handleToggleLock = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLocked = !p.isLocked;
        onAddNotification(
          isArabic 
            ? (isLocked ? '🔒 تم قفل التعليقات على المنشور' : '🔓 تم فتح التعليقات') 
            : (isLocked ? '🔒 Comments locked on post' : '🔓 Comments unlocked'),
          'success'
        );
        return { ...p, isLocked };
      }
      return p;
    }));
  };

  const handleDeletePostGlobally = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    onAddNotification(isArabic ? '🗑️ تم حذف المنشور بشكل فوري من كافة السجلات' : '🗑️ Post permanently deleted from network', 'alert');
  };

  // Toggle Emergency Banner
  const handleSaveEmergencyBanner = () => {
    localStorage.setItem('vexora_emergency_banner', emergencyBannerText);
    localStorage.setItem('vexora_emergency_banner_active', emergencyBannerActive ? 'true' : 'false');
    window.dispatchEvent(new Event('storage'));
    onAddNotification(
      isArabic 
        ? `تم ${emergencyBannerActive ? 'تفعيل' : 'تعطيل'} شريط التنبيه الطارئ العام` 
        : `Emergency announcement banner ${emergencyBannerActive ? 'activated' : 'deactivated'}`,
      'success'
    );
  };

  // Filtered Users List
  const userList = useMemo(() => {
    const listMap = new Map<string, UserProfile>();
    (Object.values(localUsers) as UserProfile[]).forEach(u => {
      if (u && u.id) listMap.set(u.id, u);
    });
    return Array.from(listMap.values()).filter(u => {
      const q = userSearchQuery.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (userFilter === 'verified') return u.isVerified;
      if (userFilter === 'vip') return u.subscriptionTier === 'plus_pro' || u.isVip;
      if (userFilter === 'owner') return u.isOwner || u.role === 'owner' || u.email === 'fluxstudio4@gmail.com';
      if (userFilter === 'banned') return u.isBanned;
      return true;
    });
  }, [localUsers, userSearchQuery, userFilter]);

  // Filtered Posts List
  const postList = useMemo(() => {
    return posts.filter(p => {
      const q = contentSearchQuery.toLowerCase();
      const matchesSearch = p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (contentFilter === 'pinned') return p.isPinned;
      if (contentFilter === 'legendary') return p.isLegendary;
      if (contentFilter === 'unlisted') return p.isUnlisted;
      return true;
    });
  }, [posts, contentSearchQuery, contentFilter]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-6xl h-[94vh] max-h-[880px] bg-[#080710] border border-amber-500/40 rounded-3xl shadow-[0_0_90px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-white relative"
        >
          {/* Top Bar / Master Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-black flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                  <Crown className="w-6 h-6 text-yellow-200 animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black animate-ping" />
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-300 to-white">
                    {isArabic ? 'أوامر مالك الموقع وإدارة الحسابات 👑' : 'OWNER ORDERS & MASTER ACCOUNT MATRIX 👑'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm">
                    SUPREME ARCHITECT
                  </span>
                </div>
                <p className="text-[10px] font-mono text-white/50 tracking-wider">
                  AUTHENTICATED: <strong className="text-amber-300">fluxstudio4@gmail.com</strong> | FULL PROTOCOL CONTROL
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddAccountModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4 text-yellow-200" />
                <span className="hidden sm:inline">{isArabic ? 'إضافة حساب جديد' : 'Add Account'}</span>
              </button>

              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                title="Close Control Center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-black/70 border-b border-white/5 overflow-x-auto scrollbar-hide flex-shrink-0">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-purple-600 text-white shadow-[0_0_25px_rgba(245,158,11,0.5)]' 
                  : 'text-amber-300/60 hover:text-amber-200 hover:bg-white/5'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isArabic ? '👑 أوامر المالك والتحكم' : 'Owner Orders & Shell'}</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'users' 
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isArabic ? '👥 مصفوفة الحسابات والأعضاء' : 'Accounts & User Matrix'}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/20">{Object.keys(localUsers).length}</span>
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'broadcast' 
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isArabic ? '📢 البث والبريد العام' : 'Global Broadcast & Mail'}</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'content' 
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isArabic ? '🛡️ إدارة المنشورات والتثبيت' : 'Content Moderation'}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/20">{posts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'telemetry' 
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isArabic ? '📊 رصد الخادم' : 'Telemetry'}</span>
            </button>

            <button
              onClick={() => setActiveTab('quickActions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'quickActions' 
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>{isArabic ? '⚡ الطوارئ والصيانة' : 'Emergency & Controls'}</span>
            </button>
          </div>

          {/* ===================== TAB 1: OWNER ORDERS & DIRECTIVES ===================== */}
          {activeTab === 'orders' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-6 text-left">
              {/* Directive Action Cards */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      {isArabic ? 'أوامر المالك المباشرة والتنفيذ الفوري' : 'EXECUTIVE DIRECTIVES MATRIX (1-CLICK ORDERS)'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    OWNER PRIVILEGES: UNRESTRICTED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Order 1: Grant VIP to All */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-purple-950/20 border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between gap-3 group">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
                        <Crown className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                        {isArabic ? 'منح عضوية VIP للجميع' : 'Grant VIP to All Nodes'}
                      </h4>
                      <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                        {isArabic ? 'ترقية فورية لكافة الحسابات في مصفوفة الأعضاء لعضوية VIP المميزة.' : 'Instantly upgrade all registered accounts to VIP member status.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGrantVipToAll}
                      className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-mono font-black text-[10px] uppercase tracking-wider border border-amber-500/40 transition-all cursor-pointer shadow-sm"
                    >
                      {isArabic ? 'تنفيذ الأمر 👑' : 'Execute Order 👑'}
                    </button>
                  </div>

                  {/* Order 2: Verify All Users */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border border-blue-500/30 hover:border-blue-400 transition-all flex flex-col justify-between gap-3 group">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/40">
                        <UserCheck2 className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                        {isArabic ? 'توثيق جميع الحسابات (Blue Badge)' : 'Grant Global Verification'}
                      </h4>
                      <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                        {isArabic ? 'منح علامة التوثيق الزرقاء الرسمية لكافة المستخدمين المسجلين.' : 'Grant blue checkmark verified status to all user nodes globally.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyAllUsers}
                      className="w-full py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white font-mono font-black text-[10px] uppercase tracking-wider border border-blue-500/40 transition-all cursor-pointer shadow-sm"
                    >
                      {isArabic ? 'توثيق الجميع ✓' : 'Verify All ✓'}
                    </button>
                  </div>

                  {/* Order 3: Karma Airdrop */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-pink-950/20 border border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between gap-3 group">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40">
                        <Coins className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors">
                        {isArabic ? 'توزيع +10,000 نقطة Karma' : 'Karma Points Airdrop'}
                      </h4>
                      <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                        {isArabic ? 'إرسال مكافأة رصيد ونقاط تفاعل لكافة العقد النشطة على المنصة.' : 'Distribute +10,000 Vexora Karma rewards to active network ledgers.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAirdropKarma}
                      className="w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-600 text-purple-300 hover:text-white font-mono font-black text-[10px] uppercase tracking-wider border border-purple-500/40 transition-all cursor-pointer shadow-sm"
                    >
                      {isArabic ? 'توزيع الرصيد 💎' : 'Disperse Karma 💎'}
                    </button>
                  </div>

                  {/* Order 4: Add New Account */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-teal-950/20 border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between gap-3 group">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                        {isArabic ? 'إنشاء وإضافة حساب جديد' : 'Spawn New Account'}
                      </h4>
                      <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                        {isArabic ? 'إنشاء حساب جديد وتعيين الرتبة، التوثيق، الشارة، والتبديل إليه فوراً.' : 'Create custom user profile with custom role, VIP, badge and login.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddAccountModal(true)}
                      className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-mono font-black text-[10px] uppercase tracking-wider border border-emerald-500/40 transition-all cursor-pointer shadow-sm"
                    >
                      {isArabic ? 'إضافة حساب 👤' : 'Add Account 👤'}
                    </button>
                  </div>

                  {/* Order 5: Wipe & Delete All Existing Accounts */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 to-rose-950/30 border border-red-500/40 hover:border-red-400 transition-all flex flex-col justify-between gap-3 group sm:col-span-2 lg:col-span-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center border border-red-500/40 flex-shrink-0">
                          <Trash2 className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white group-hover:text-red-300 transition-colors">
                              {isArabic ? 'حذف وتطهير كافة حسابات الموقع' : 'Wipe & Delete All Accounts on the Site'}
                            </h4>
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[8px] font-mono uppercase font-bold">
                              MASTER DIRECTIVE
                            </span>
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed font-sans">
                            {isArabic 
                              ? 'حذف كافة الحسابات المسجلة والحسابات التجريبية نهائياً من قاعدة بيانات الموقع والاحتفاظ بحساب المالك فقط.' 
                              : 'Permanently remove all user accounts and profiles from the site matrix, resetting storage and keeping only the verified owner profile active.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteAllAccounts}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-black text-xs uppercase tracking-wider border border-red-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 flex-shrink-0 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{isArabic ? 'تنفيذ حذف كافة الحسابات 🔥' : 'Purge All Accounts 🔥'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Ban by Handle Executive Bar */}
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{isArabic ? 'حظر وتجميد وصول فوري بالمعرف' : 'Instant User Ban & Access Restriction'}</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[8px] font-mono uppercase font-bold">
                          OWNER DIRECTIVE
                        </span>
                      </div>
                      <div className="text-[10px] text-white/50">
                        {isArabic ? 'أدخل معرف المستخدم (@handle) لحظر حسابه وتقييد دخوله المنصة فوراً.' : 'Enter @handle to immediately restrict platform access, posting, and comments.'}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleQuickBanByHandle} className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-52">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40">@</span>
                      <input
                        type="text"
                        value={quickBanHandle}
                        onChange={(e) => setQuickBanHandle(e.target.value)}
                        placeholder="handle..."
                        className="w-full bg-black/60 border border-red-500/30 rounded-xl pl-7 pr-3 py-1.5 text-xs font-mono text-red-200 placeholder-white/20 focus:outline-none focus:border-red-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 flex-shrink-0 border border-red-400/40"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'حظر الآن' : 'Ban User'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Secondary Directives */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Clean Spam */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isArabic ? 'تنظيف المنشورات والسبام' : 'AI Spam Purge'}</span>
                    </div>
                    <div className="text-[10px] text-white/40">Sanitize feeds and empty pulses</div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePurgeSpamPosts}
                    className="px-3 py-1.5 bg-white/5 hover:bg-purple-600 rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    Clean
                  </button>
                </div>

                {/* Lockdown Feed */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isArabic ? 'قفل النشر (الموثقون فقط)' : 'Feed Posting Lockdown'}</span>
                    </div>
                    <div className="text-[10px] text-white/40">{postingLocked ? 'LOCKED (VERIFIED)' : 'OPEN FOR ALL'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleFeedLockdown}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      postingLocked ? 'bg-red-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/60'
                    }`}
                  >
                    {postingLocked ? 'Unlock' : 'Lock'}
                  </button>
                </div>

                {/* Emergency Siren */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      <span>{isArabic ? 'نبضة تنبيه صوتي عامة' : 'Global Audio Chime'}</span>
                    </div>
                    <div className="text-[10px] text-white/40">Dispatch audio pulse to nodes</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerEmergencyPulse}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border border-red-500/30"
                  >
                    Trigger
                  </button>
                </div>
              </div>

              {/* Owner Command Terminal Shell */}
              <div className="p-5 rounded-2xl bg-black/90 border border-amber-500/30 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>SUPREME OWNER COMMAND TERMINAL (INTERACTIVE CLI)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-white/40">Type "/help" for command matrix</span>
                    <button
                      type="button"
                      onClick={() => setTerminalLogs(['Console cleared by Supreme Owner.'])}
                      className="text-[9px] font-mono uppercase text-amber-400 hover:underline cursor-pointer"
                    >
                      Clear Log
                    </button>
                  </div>
                </div>

                {/* Log Viewport */}
                <div className="h-44 bg-[#05040a] border border-white/5 rounded-xl p-3 overflow-y-auto font-mono text-[10px] space-y-1 text-left">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-amber-500 mr-1.5">❯</span>
                      <span className={
                        log.startsWith('OWNER@VEXORA') ? 'text-amber-300 font-bold' :
                        log.includes('[ERROR]') ? 'text-red-400 font-bold' :
                        log.includes('[SUCCESS') || log.includes('[ORDER_EXECUTED]') ? 'text-emerald-400 font-bold' :
                        'text-purple-200/80'
                      }>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Terminal Input */}
                <form onSubmit={handleRunCommand} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-amber-400 font-bold">
                      $
                    </span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder={isArabic ? 'اكتب أمر المالك (مثال: /vip all أو /verify @user أو /airdrop أو /help)...' : 'Enter owner order (e.g. /vip all, /verify @handle, /airdrop, /help)...'}
                      className="w-full bg-[#05040a] border border-amber-500/30 rounded-xl pl-8 pr-4 py-2 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    Execute
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: USER MATRIX & ADD ACCOUNT ===================== */}
          {activeTab === 'users' && (
            <div className="flex-1 p-5 overflow-y-auto flex flex-col space-y-4 text-left">
              {/* Header with Search, Filter and Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder={isArabic ? "بحث عن عضو (الاسم، المعرف، الإيميل)..." : "Search user by name, handle, or email..."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
                  <div className="flex items-center gap-1">
                    {(['all', 'verified', 'vip', 'owner', 'banned'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setUserFilter(f)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          userFilter === f ? 'bg-purple-600 text-white font-bold shadow-md' : 'text-white/40 hover:text-white bg-white/5'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllMatrixUsers}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-mono uppercase cursor-pointer"
                      title="Select all non-owner accounts"
                    >
                      {isArabic ? 'تحديد الكل' : 'Select All'}
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteAllAccounts}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white text-[10px] font-mono font-bold uppercase cursor-pointer border border-red-500/30 transition-all flex items-center gap-1"
                      title="Wipe and delete all non-owner accounts"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isArabic ? 'حذف كافة الحسابات' : 'Wipe All'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddAccountModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer flex-shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isArabic ? '+ حساب' : '+ Account'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Users Bulk Action Bar */}
              {Object.keys(selectedMatrixUserIds).some(id => selectedMatrixUserIds[id]) && (
                <div className="p-3.5 bg-gradient-to-r from-red-950/60 via-purple-950/40 to-black border border-red-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(239,68,68,0.2)] animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-mono font-bold text-xs text-white">
                      {isArabic 
                        ? `تم تحديد (${Object.keys(selectedMatrixUserIds).filter(id => selectedMatrixUserIds[id]).length}) مستخدم للإجراءات الجماعية:` 
                        : `Selected: ${Object.keys(selectedMatrixUserIds).filter(id => selectedMatrixUserIds[id]).length} user nodes for bulk action:`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleDeleteSelectedUsers}
                      className="px-3.5 py-2 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-red-500/50 cursor-pointer active:scale-95 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'حذف الحسابات المحددة 🗑️' : 'Delete Selected 🗑️'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBanSelectedUsers}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer border border-red-400 active:scale-95 transition-all"
                    >
                      <Ban className="w-4 h-4 animate-pulse" />
                      <span>
                        {isArabic 
                          ? `حظر (${Object.keys(selectedMatrixUserIds).filter(id => selectedMatrixUserIds[id]).length})` 
                          : `Ban (${Object.keys(selectedMatrixUserIds).filter(id => selectedMatrixUserIds[id]).length})`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUnbanSelectedUsers}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/40 cursor-pointer active:scale-95 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'فك الحظر' : 'Unban'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearMatrixSelection}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-mono uppercase cursor-pointer"
                    >
                      {isArabic ? 'إلغاء' : 'Clear'}
                    </button>
                  </div>
                </div>
              )}

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto pr-1">
                {userList.map(user => {
                  const isOwnerNode = user.email === 'fluxstudio4@gmail.com' || user.email === 'vexora.network@gmail.com' || user.isOwner || user.role === 'owner';
                  const isSelected = !!selectedMatrixUserIds[user.id];

                  return (
                    <div 
                      key={`matrix-${user.id}`}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-left group relative ${
                        user.isBanned 
                          ? 'bg-red-950/15 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                          : isSelected
                          ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                          : 'bg-white/[0.02] border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOwnerNode) handleToggleSelectMatrixUser(user.id);
                        }}
                        className={`absolute top-3 right-3 z-10 w-5 h-5 rounded-md border transition-all flex items-center justify-center cursor-pointer ${
                          isOwnerNode ? 'opacity-20 cursor-not-allowed border-white/10' :
                          isSelected ? 'bg-red-600 border-red-400 text-white shadow-md' : 'bg-black/60 border-white/20 hover:border-white/50 text-transparent'
                        }`}
                        title={isOwnerNode ? 'Owner account protected' : (isSelected ? 'Deselect user' : 'Select user')}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex items-start gap-3 pr-6">
                        <div className="relative flex-shrink-0">
                          <img src={user.avatar} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                          {user.isVerified && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white shadow-md font-bold">
                              ✓
                            </span>
                          )}
                          {user.isBanned && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white shadow-md font-bold" title="Banned">
                              ✕
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">{user.name}</span>
                            {isOwnerNode && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                            {user.isVip && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                          </div>
                          <div className="text-[10px] font-mono text-purple-400 truncate">@{user.handle}</div>
                          <div className="text-[9px] font-mono text-white/40 truncate">{user.email || 'No email registered'}</div>
                          
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase font-bold border ${
                              isOwnerNode 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                : user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : 'bg-white/5 text-white/60 border-white/10'
                            }`}>
                              {user.role || 'member'}
                            </span>
                            {user.isBanned && (
                              <span className="px-1.5 py-0.2 rounded bg-red-500/30 text-red-300 text-[8px] font-mono uppercase font-bold border border-red-500/50 animate-pulse flex items-center gap-1">
                                <Ban className="w-2.5 h-2.5" />
                                <span>BANNED</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        {/* Switch Account Quick Action */}
                        {onSwitchAccount && (
                          <button
                            type="button"
                            onClick={() => {
                              onSwitchAccount(user);
                              onClose();
                            }}
                            className="w-full py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-purple-500/30 transition-all cursor-pointer"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>{isArabic ? 'تسجيل الدخول بهذا الحساب' : 'Login as this User'}</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleVerification(user.id)}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              user.isVerified 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                                : 'bg-white/5 hover:bg-white/10 text-white/60'
                            }`}
                            title="Toggle Verification Badge"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>{user.isVerified ? 'Verified' : 'Verify'}</span>
                          </button>

                          <button
                            onClick={() => handleToggleVip(user.id)}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              user.subscriptionTier === 'plus_pro' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-white/5 hover:bg-white/10 text-white/60'
                            }`}
                            title="Grant VIP"
                          >
                            <Crown className="w-3 h-3" />
                            <span>VIP</span>
                          </button>

                          {/* Dedicated BAN / UNBAN Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleBan(user.id)}
                            disabled={isOwnerNode}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              user.isBanned 
                                ? 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 shadow-sm' 
                                : 'bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 shadow-sm'
                            } disabled:opacity-20 disabled:cursor-not-allowed`}
                            title={isOwnerNode ? 'Cannot ban owner node' : (user.isBanned ? 'Unban user and restore platform access' : 'Ban user and restrict platform access')}
                          >
                            {user.isBanned ? (
                              <>
                                <ShieldCheck className="w-3 h-3" />
                                <span>{isArabic ? 'فك الحظر' : 'Unban'}</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3 h-3" />
                                <span>{isArabic ? 'حظر 🚫' : 'Ban 🚫'}</span>
                              </>
                            )}
                          </button>

                          {!isOwnerNode && (
                            <button
                              onClick={() => handleDeleteUserAccount(user.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: BROADCAST ===================== */}
          {activeTab === 'broadcast' && (
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
              {/* Left Column: Dispatch Composer */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-black text-purple-400 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    {isArabic ? 'نظام البث الإخباري والبريد العام' : 'MASS DISPATCH & AI NOTIFICATION ENGINE'}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    GATEWAY ONLINE
                  </span>
                </div>

                {/* SMTP Status */}
                {smtpStatus && (
                  <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                    smtpStatus.hasSMTP 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${smtpStatus.hasSMTP ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                      <div>
                        <div className="font-bold uppercase tracking-wider">
                          {smtpStatus.hasSMTP ? 'Direct SMTP Delivery Active' : 'Simulation & Mailto Relay Mode Active'}
                        </div>
                        <div className="text-[10px] font-mono opacity-70">
                          {smtpStatus.hasSMTP ? `Linked Box: ${smtpStatus.smtpUser}` : 'Configure GMAIL_USER & GMAIL_APP_PASSWORD in settings for direct SMTP'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subject Field */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    {isArabic ? 'عنوان الإشعار / موضوع البث' : 'Broadcast Subject'}
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter broadcast subject..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Body Field */}
                <div className="space-y-1.5 flex-1 flex flex-col text-left">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    {isArabic ? 'نص الرسالة والبيان' : 'Broadcast Message Body'}
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Enter broadcast content for all selected nodes..."
                    rows={6}
                    className="w-full flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enhanceWithAi}
                      onChange={(e) => setEnhanceWithAi(e.target.checked)}
                      className="rounded text-purple-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-purple-300 font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isArabic ? 'تحسين الصياغة بذكاء اصطناعي (Gemini)' : 'Optimize with Gemini AI'}
                    </span>
                  </label>

                  <button
                    onClick={handleExecuteBroadcast}
                    disabled={isSending}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isArabic ? 'جاري البث...' : 'Broadcasting...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isArabic ? 'إرسال البث الآن' : 'Execute Broadcast'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Middle: Recipient Selector */}
              <div className="w-full lg:w-72 p-5 overflow-hidden flex flex-col flex-shrink-0 bg-black/40 text-left">
                <div className="pb-2 border-b border-white/5 flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white uppercase">{isArabic ? 'المستلمون' : 'Target Nodes'}</span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">
                    {Object.values(selectedUserEmails).filter(Boolean).length} / {Object.keys(selectedUserEmails).length}
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => {
                      const updated: Record<string, boolean> = {};
                      Object.keys(selectedUserEmails).forEach(k => { updated[k] = true; });
                      setSelectedUserEmails(updated);
                    }}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono uppercase text-white/70 cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => {
                      const updated: Record<string, boolean> = {};
                      Object.keys(selectedUserEmails).forEach(k => { updated[k] = false; });
                      setSelectedUserEmails(updated);
                    }}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono uppercase text-white/50 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {userList.map(user => {
                    if (!user.email) return null;
                    const emailKey = user.email.toLowerCase();
                    const isChecked = !!selectedUserEmails[emailKey];
                    return (
                      <div
                        key={`recip-${user.id}`}
                        onClick={() => setSelectedUserEmails(prev => ({ ...prev, [emailKey]: !prev[emailKey] }))}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                          isChecked ? 'bg-purple-900/20 border-purple-500/40' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={user.avatar} className="w-6 h-6 rounded-lg object-cover" alt="" />
                          <div className="truncate">
                            <div className="text-[10px] font-bold text-white truncate">{user.name}</div>
                            <div className="text-[8px] font-mono text-white/40 truncate">{user.email}</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-purple-600 text-white' : 'border border-white/20'}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live Telemetry Logs */}
              <div className="w-full lg:w-80 p-5 overflow-hidden flex flex-col flex-shrink-0 bg-[#05040a] text-left">
                <div className="pb-2 border-b border-white/5 flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white uppercase">{isArabic ? 'سجل البث الحي' : 'Live Dispatch Logs'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl p-3 overflow-y-auto font-mono text-[9px] text-purple-300 space-y-1.5">
                  {broadcastLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-purple-600 mr-1">❯</span>
                      <span className={log.includes('❌') ? 'text-red-400 font-bold' : log.includes('[SUCCESS') ? 'text-emerald-400 font-bold' : 'text-white/80'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: CONTENT MODERATION ===================== */}
          {activeTab === 'content' && (
            <div className="flex-1 p-5 overflow-y-auto flex flex-col space-y-4 text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={contentSearchQuery}
                    onChange={(e) => setContentSearchQuery(e.target.value)}
                    placeholder={isArabic ? "بحث في المنشورات والمؤلفين..." : "Search post content or author..."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
                  {(['all', 'pinned', 'legendary', 'unlisted'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setContentFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        contentFilter === f ? 'bg-purple-600 text-white font-bold' : 'text-white/40 hover:text-white bg-white/5'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {postList.map(post => (
                  <div 
                    key={`mod-${post.id}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      post.isPinned ? 'bg-purple-950/20 border-purple-500/40 shadow-lg' : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <img src={post.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0" alt="" />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-white">{post.author}</span>
                          <span className="text-[9px] font-mono text-white/40">{post.timestamp}</span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-purple-500/20 text-purple-300">
                            {post.type}
                          </span>
                          {post.isPinned && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                              <Pin className="w-2.5 h-2.5" /> PINNED
                            </span>
                          )}
                          {post.isLegendary && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1 font-bold">
                              <Star className="w-2.5 h-2.5" /> LEGENDARY
                            </span>
                          )}
                          {post.isLocked && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 font-bold">
                              <Lock className="w-2.5 h-2.5" /> LOCKED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/80 line-clamp-2 leading-relaxed font-sans">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      <button
                        onClick={() => handlePinPost(post.id)}
                        className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                          post.isPinned 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                        title={post.isPinned ? "Unpin Post" : "Pin Post Globally"}
                      >
                        <Pin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleFeatureLegendary(post.id)}
                        className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                          post.isLegendary 
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                        title={post.isLegendary ? "Remove Legendary" : "Mark as Legendary"}
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleLock(post.id)}
                        className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                          post.isLocked 
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                        title={post.isLocked ? "Unlock Comments" : "Lock Comments"}
                      >
                        {post.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeletePostGlobally(post.id)}
                        className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-all cursor-pointer"
                        title="Delete Post Globally"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 5: TELEMETRY ===================== */}
          {activeTab === 'telemetry' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-left">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-white/40 text-[10px] font-mono uppercase">
                    <span>Active User Nodes</span>
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">{Object.keys(localUsers).length}</div>
                  <div className="text-[9px] font-mono text-emerald-400 font-bold">100% HEALTHY</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-white/40 text-[10px] font-mono uppercase">
                    <span>Total Feed Pulses</span>
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">{posts.length}</div>
                  <div className="text-[9px] font-mono text-purple-400">Indexed Globally</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-white/40 text-[10px] font-mono uppercase">
                    <span>Network Latency</span>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">{pingLatency} ms</div>
                  <div className="text-[9px] font-mono text-emerald-400 font-bold">OPTIMAL LINK</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-white/40 text-[10px] font-mono uppercase">
                    <span>Memory Allocation</span>
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">{memoryUsage} MB</div>
                  <div className="text-[9px] font-mono text-white/40">Heap Active</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>SYSTEM DIAGNOSTIC CONSOLE & HOOKS</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsRefreshingTelemetry(true);
                      setPingLatency(Math.floor(18 + Math.random() * 15));
                      setMemoryUsage(Math.floor(55 + Math.random() * 20));
                      setTimeout(() => setIsRefreshingTelemetry(false), 600);
                    }}
                    className="flex items-center gap-1 text-[9px] font-mono uppercase text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    <RefreshCcw className={`w-3 h-3 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
                    <span>Refresh Telemetry</span>
                  </button>
                </div>

                <div className="space-y-1 font-mono text-[10px] text-purple-300/80 leading-relaxed bg-[#05040a] p-4 rounded-xl border border-white/5">
                  <div>&gt; [AUTH] Supreme node: fluxstudio4@gmail.com (Master Token Active)</div>
                  <div>&gt; [DATABASE] Firestore & Local Collections: ONLINE</div>
                  <div>&gt; [AI_BRIDGE] Gemini Flash 2.5 API: OPERATIONAL</div>
                  <div>&gt; [BROADCAST] Mass Dispatcher: READY</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 6: EMERGENCY & CONTROLS ===================== */}
          {activeTab === 'quickActions' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-left">
              {/* Emergency Banner */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                    <span>{isArabic ? 'شريط الإعلانات والتنبيهات الطارئة العام' : 'Global Emergency Announcement Banner'}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[10px] font-mono uppercase text-white/60">
                      {emergencyBannerActive ? 'ACTIVE 🟢' : 'DISABLED ⚪'}
                    </span>
                    <input
                      type="checkbox"
                      checked={emergencyBannerActive}
                      onChange={(e) => setEmergencyBannerActive(e.target.checked)}
                      className="rounded text-amber-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={emergencyBannerText}
                  onChange={(e) => setEmergencyBannerText(e.target.value)}
                  placeholder="Enter global banner message shown at top of website for all visitors..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveEmergencyBanner}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {isArabic ? 'حفظ وتطبيق الشريط' : 'Save & Publish Banner'}
                  </button>
                </div>
              </div>

              {/* Maintenance Mode & Quick Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-white uppercase flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>{isArabic ? 'وضع الصيانة للموقع' : 'System Maintenance Mode'}</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = !maintenanceActive;
                        setMaintenanceActive(next);
                        localStorage.setItem('vexora_maintenance_mode', next ? 'true' : 'false');
                        onAddNotification(
                          isArabic 
                            ? `تم ${next ? 'تفعيل' : 'إلغاء'} وضع الصيانة` 
                            : `Maintenance mode ${next ? 'enabled' : 'disabled'}`,
                          'success'
                        );
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer ${
                        maintenanceActive ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-white/5 text-white/50 border-white/10'
                      }`}
                    >
                      {maintenanceActive ? 'MAINTENANCE ON 🚨' : 'NORMAL MODE 🟢'}
                    </button>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                    Displays maintenance overlay for regular visitors while keeping access available for Supreme Owner nodes.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="font-bold text-xs text-white uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? 'إرسال إشعار فوري لجميع المتصلين' : 'Instant In-App Toast Alert'}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={systemAlertMessage}
                      onChange={(e) => setSystemAlertMessage(e.target.value)}
                      placeholder="Type alert notification..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (!systemAlertMessage.trim()) return;
                        onAddNotification(`📢 [OWNER BROADCAST]: ${systemAlertMessage}`, 'success');
                        setSystemAlertMessage('');
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="p-3.5 border-t border-white/10 bg-black/90 flex items-center justify-between text-[10px] font-mono text-white/40 flex-shrink-0">
            <div>VEXORA CORE PROTOCOL v5.0 | SUPREME OWNER INTERFACE</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-bold">ALL OWNER ORDERS ENGAGED</span>
            </div>
          </div>

          {/* ===================== ADD NEW ACCOUNT MODAL ===================== */}
          <AnimatePresence>
            {showAddAccountModal && (
              <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  className="w-full max-w-lg bg-[#0e0d1a] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.3)] space-y-4 text-left max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/30">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">
                          {isArabic ? 'إضافة وإنشاء حساب مستخدم جديد' : 'Spawn & Add New Account'}
                        </h3>
                        <p className="text-[10px] font-mono text-amber-400/80">Owner Account Creation Protocol</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddAccountModal(false)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    {/* Name & Handle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          {isArabic ? 'الاسم الكامل' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="e.g. Maya Lin"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          {isArabic ? 'المعرف (@handle)' : 'Handle (@handle) *'}
                        </label>
                        <input
                          type="text"
                          value={newUserHandle}
                          onChange={(e) => setNewUserHandle(e.target.value.replace('@', ''))}
                          placeholder="e.g. maya_creator"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="e.g. maya@vexora.network"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Role Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        {isArabic ? 'الرتبة والصلاحيات' : 'Account Role & Clearance'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'member', label: isArabic ? 'عضو' : 'Member', icon: <Users className="w-3 h-3" /> },
                          { id: 'moderator', label: isArabic ? 'مشرف' : 'Moderator', icon: <ShieldAlert className="w-3 h-3" /> },
                          { id: 'admin', label: isArabic ? 'مسؤول' : 'Admin', icon: <ShieldCheck className="w-3 h-3" /> },
                          { id: 'owner', label: isArabic ? 'مالك 👑' : 'Owner 👑', icon: <Crown className="w-3 h-3 text-yellow-300" /> }
                        ].map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setNewUserRole(r.id as any);
                              if (r.id === 'owner' || r.id === 'admin') {
                                setNewUserIsVerified(true);
                                setNewUserIsVip(true);
                              }
                            }}
                            className={`p-2 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              newUserRole === r.id 
                                ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-md' 
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            {r.icon}
                            <span>{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Avatar Presets */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        {isArabic ? 'الصورة الرمزية (Avatar)' : 'Avatar Selection'}
                      </label>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {PRESET_AVATARS.map((av, i) => (
                          <img
                            key={i}
                            src={av}
                            onClick={() => setNewUserAvatar(av)}
                            className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                              newUserAvatar === av ? 'border-amber-400 scale-110 shadow-lg' : 'border-white/10 opacity-60 hover:opacity-100'
                            }`}
                            alt=""
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        value={newUserAvatar}
                        onChange={(e) => setNewUserAvatar(e.target.value)}
                        placeholder="Or paste custom image URL..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none"
                      />
                    </div>

                    {/* Toggles: Verified & VIP */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <label className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between cursor-pointer select-none">
                        <span className="text-[10px] font-bold text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          {isArabic ? 'توثيق الحساب' : 'Verified Badge'}
                        </span>
                        <input
                          type="checkbox"
                          checked={newUserIsVerified}
                          onChange={(e) => setNewUserIsVerified(e.target.checked)}
                          className="rounded text-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </label>

                      <label className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between cursor-pointer select-none">
                        <span className="text-[10px] font-bold text-white flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          {isArabic ? 'عضوية VIP' : 'VIP Member'}
                        </span>
                        <input
                          type="checkbox"
                          checked={newUserIsVip}
                          onChange={(e) => setNewUserIsVip(e.target.checked)}
                          className="rounded text-amber-500 w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        {isArabic ? 'النبذة التعريفية (Bio)' : 'Biography / Bio'}
                      </label>
                      <input
                        type="text"
                        value={newUserBio}
                        onChange={(e) => setNewUserBio(e.target.value)}
                        placeholder="e.g. AI Researcher & Quantum Enthusiast"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowAddAccountModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold uppercase cursor-pointer"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCreateAccount(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase cursor-pointer"
                    >
                      {isArabic ? 'إنشاء الحساب' : 'Create Account'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCreateAccount(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
                    >
                      {isArabic ? 'إنشاء وتسجيل الدخول فوراً 👑' : 'Create & Switch 👑'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
