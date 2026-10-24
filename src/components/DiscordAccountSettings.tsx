import { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Search, 
  Shield, 
  MessageSquare, 
  Bell, 
  Sparkles, 
  Award, 
  Repeat, 
  Gift, 
  CreditCard, 
  Mic, 
  Palette, 
  Sliders, 
  Cpu, 
  Globe, 
  Users, 
  Paperclip, 
  Code, 
  LogOut, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  Lock, 
  Smartphone, 
  Check, 
  Upload, 
  Camera, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Key, 
  ShieldCheck, 
  Monitor, 
  Volume2, 
  Video, 
  Zap, 
  Phone, 
  Mail, 
  FileText, 
  RefreshCw,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface DiscordAccountSettingsProps {
  currentUser: UserProfile | null;
  language: 'en' | 'ar';
  onClose?: () => void;
  onOpenEditProfile: () => void;
  onUpdateBio: (bio: string) => Promise<void>;
  onUpdateAvatar: (avatar: string) => Promise<void>;
  onUpdateBanner?: (banner: string) => Promise<void>;
  onUpdateProfile?: (updatedFields: Partial<UserProfile>) => Promise<void>;
  onSignOut?: () => void;
  onSetLanguage?: (lang: 'en' | 'ar') => void;
}

type SettingCategory = 
  | 'account'
  | 'data-privacy'
  | 'messaging'
  | 'notifications'
  | 'voice-video'
  | 'appearance'
  | 'accessibility'
  | 'system'
  | 'language-time'
  | 'activity-privacy'
  | 'connected-apps'
  | 'developer';

type AccountSubTab = 'info' | 'security' | 'standing' | 'family';

export default function DiscordAccountSettings({
  currentUser,
  language,
  onClose,
  onOpenEditProfile,
  onUpdateBio,
  onUpdateAvatar,
  onUpdateBanner,
  onUpdateProfile,
  onSignOut,
  onSetLanguage
}: DiscordAccountSettingsProps) {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('account');
  const [activeAccountSubTab, setActiveAccountSubTab] = useState<AccountSubTab>('info');
  const [searchQuery, setSearchQuery] = useState('');

  // Account details state
  const [username, setUsername] = useState(currentUser?.handle || 'omar_games_1');
  const [displayName, setDisplayName] = useState(currentUser?.name || 'OMAR');
  const [email, setEmail] = useState(currentUser?.email || 'omar.games@gmail.com');
  const [phone, setPhone] = useState('+1 ••• ••• 8377');
  const [bio, setBio] = useState(currentUser?.bio || '');
  
  // Visibility toggles for sensitive data
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Edit modals state
  const [editingField, setEditingField] = useState<'username' | 'email' | 'phone' | 'password' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editPasswordValue, setEditPasswordValue] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');

  // 2FA & Modals state
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showStandingModal, setShowStandingModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Avatar & Bio state
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [savedBioSuccess, setSavedBioSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const [isAvatarDragging, setIsAvatarDragging] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Banner state
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadSuccess, setBannerUploadSuccess] = useState(false);
  const [isBannerDragging, setIsBannerDragging] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // App experience settings state
  const [themeMode, setThemeMode] = useState<'dark' | 'midnight' | 'light'>('dark');
  const [chatFontSize, setChatFontSize] = useState(16);
  const [micVolume, setMicVolume] = useState(85);
  const [outputVolume, setOutputVolume] = useState(100);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [unreadBadges, setUnreadBadges] = useState(true);
  const [directMessageSafety, setDirectMessageSafety] = useState<'everyone' | 'friends' | 'none'>('friends');
  const [developerMode, setDeveloperMode] = useState(false);

  // Simulated logged-in devices list
  const [devices, setDevices] = useState([
    { id: '1', name: 'Chrome on Windows 11', location: 'London, United Kingdom', current: true, ip: '192.168.1.104', lastActive: 'Active Now' },
    { id: '2', name: 'Discord Mobile on iPhone 15 Pro', location: 'London, United Kingdom', current: false, ip: '192.168.1.112', lastActive: '12 minutes ago' },
    { id: '3', name: 'Discord Desktop on MacBook Air M2', location: 'London, United Kingdom', current: false, ip: '192.168.1.85', lastActive: '2 days ago' },
    { id: '4', name: 'Firefox on Linux Ubuntu', location: 'Manchester, UK', current: false, ip: '82.165.197.1', lastActive: '5 days ago' },
  ]);

  useEffect(() => {
    if (currentUser?.bio !== undefined) setBio(currentUser.bio);
    if (currentUser?.handle) setUsername(currentUser.handle);
    if (currentUser?.name) setDisplayName(currentUser.name);
    if (currentUser?.email) setEmail(currentUser.email);
  }, [currentUser]);

  const maskedEmail = showEmail 
    ? email 
    : email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(Math.max(4, b.length)));
  
  const maskedPhone = showPhone ? phone : '*********8377';

  // Avatar Upload processor
  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP, GIF).' : 'Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت).' : 'Image size is too large (max 5MB).');
      return;
    }
    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        await onUpdateAvatar(base64data);
        setAvatarUploadSuccess(true);
        setTimeout(() => setAvatarUploadSuccess(false), 3000);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAvatarFile(file);
    if (e.target) e.target.value = '';
  };

  const handleAvatarDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAvatarDragging(true);
  };

  const handleAvatarDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAvatarDragging(false);
  };

  const handleAvatarDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAvatarDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processAvatarFile(file);
  };

  // Banner Upload processor
  const processBannerFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP, GIF).' : 'Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 8 ميغابايت).' : 'Image size is too large (max 8MB).');
      return;
    }
    setIsUploadingBanner(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        if (onUpdateBanner) {
          await onUpdateBanner(base64data);
        } else if (onUpdateProfile) {
          await onUpdateProfile({ banner: base64data });
        }
        setBannerUploadSuccess(true);
        setTimeout(() => setBannerUploadSuccess(false), 3000);
      } finally {
        setIsUploadingBanner(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processBannerFile(file);
    if (e.target) e.target.value = '';
  };

  const handleBannerDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBannerDragging(true);
  };

  const handleBannerDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBannerDragging(false);
  };

  const handleBannerDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBannerDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processBannerFile(file);
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      await onUpdateBio(bio);
      setSavedBioSuccess(true);
      setTimeout(() => setSavedBioSuccess(false), 2500);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleSaveFieldEdit = async () => {
    if (editingField === 'username') {
      const cleanHandle = editValue.trim().replace(/^@/, '');
      if (cleanHandle) {
        setUsername(cleanHandle);
        if (onUpdateProfile) await onUpdateProfile({ handle: cleanHandle });
      }
    } else if (editingField === 'email') {
      if (editValue.includes('@')) {
        setEmail(editValue.trim());
        if (onUpdateProfile) await onUpdateProfile({ email: editValue.trim() });
      }
    } else if (editingField === 'displayName') {
      if (editValue.trim()) {
        setDisplayName(editValue.trim());
        if (onUpdateProfile) await onUpdateProfile({ name: editValue.trim() });
      }
    } else if (editingField === 'phone') {
      if (editValue.trim()) {
        setPhone(editValue.trim());
        if (onUpdateProfile) await onUpdateProfile({ phone: editValue.trim() });
      }
    } else if (editingField === 'password') {
      if (editValue.trim()) {
        if (onUpdateProfile) await onUpdateProfile({ password: editValue.trim() });
      }
    }
    setEditingField(null);
  };

  const navItems = [
    {
      category: 'USER SETTINGS',
      items: [
        { id: 'account' as SettingCategory, label: 'Account', icon: User, hasSubItems: true },
        { id: 'data-privacy' as SettingCategory, label: 'Data & Privacy', icon: Shield },
        { id: 'messaging' as SettingCategory, label: 'Messaging Permissions', icon: MessageSquare },
        { id: 'notifications' as SettingCategory, label: 'Notifications', icon: Bell },
      ]
    },
    {
      category: 'Experience',
      items: [
        { id: 'voice-video' as SettingCategory, label: 'Voice & Video', icon: Mic },
        { id: 'appearance' as SettingCategory, label: 'Appearance', icon: Palette },
        { id: 'accessibility' as SettingCategory, label: 'Accessibility', icon: Sliders },
        { id: 'system' as SettingCategory, label: 'System', icon: Cpu },
        { id: 'language-time' as SettingCategory, label: 'Language & Time', icon: Globe },
      ]
    },
    {
      category: 'Games & Apps',
      items: [
        { id: 'activity-privacy' as SettingCategory, label: 'Activity Privacy', icon: Users },
        { id: 'connected-apps' as SettingCategory, label: 'Connected Apps', icon: Paperclip },
      ]
    },
    {
      category: 'Developer',
      items: [
        { id: 'developer' as SettingCategory, label: 'Developer', icon: Code },
      ]
    }
  ];

  const filteredNavGroups = navItems.map(group => ({
    ...group,
    items: group.items.filter(item => 
      !searchQuery.trim() || 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div id="discord-settings-container" className="w-full h-full min-h-[780px] flex flex-col md:flex-row bg-[#313338] text-[#dbdee1] rounded-3xl overflow-hidden shadow-2xl border border-white/5 font-sans relative">
      {/* Hidden Avatar File Input */}
      <input
        type="file"
        id="discord-avatar-file-input"
        ref={avatarFileInputRef}
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Hidden Banner File Input */}
      <input
        type="file"
        id="discord-banner-file-input"
        ref={bannerFileInputRef}
        accept="image/*"
        onChange={handleBannerFileChange}
        className="hidden"
      />

      {/* LEFT SIDEBAR */}
      <aside 
        id="discord-settings-sidebar"
        className="w-full md:w-[260px] lg:w-[290px] shrink-0 bg-[#2b2d31] flex flex-col border-b md:border-b-0 md:border-r border-[#1f2023] select-none"
      >
        {/* User Mini Profile Badge */}
        <div id="discord-sidebar-user-header" className="p-4 pb-2 flex items-center gap-3">
          <div className="relative">
            <div 
              onClick={() => avatarFileInputRef.current?.click()}
              className="w-10 h-10 rounded-full overflow-hidden bg-[#1e1f22] border border-white/10 flex items-center justify-center cursor-pointer relative group"
              title="Change Avatar"
            >
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name || 'User'} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5 text-white/50" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            {/* Status dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm tracking-wide truncate">
              {currentUser?.name || displayName}
            </div>
            <button
              id="discord-edit-profiles-btn"
              type="button"
              onClick={onOpenEditProfile}
              className="text-[#949ba4] hover:text-[#dbdee1] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Edit Profiles</span>
              <span className="text-[10px]">✏️</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3.5 py-2">
          <div className="relative flex items-center bg-[#1e1f22] rounded-md px-2.5 py-1.5 border border-transparent focus-within:border-[#5865f2] transition-all">
            <Search className="w-4 h-4 text-[#949ba4] shrink-0" />
            <input
              id="discord-settings-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent border-none text-xs text-white placeholder-[#949ba4] px-2 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[#949ba4] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 text-xs font-medium custom-scrollbar">
          {filteredNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[11px] font-black tracking-wider text-[#949ba4] uppercase">
                {group.category}
              </div>
              {group.items.map((item) => {
                const isSelected = activeCategory === item.id;
                const Icon = item.icon;
                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      id={`discord-nav-tab-${item.id}`}
                      type="button"
                      onClick={() => {
                        setActiveCategory(item.id);
                        if (item.id === 'account') setActiveAccountSubTab('info');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-colors cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-[#3f4248] text-white font-semibold' 
                          : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>

                    {/* Sub-menu if Account is selected */}
                    {item.hasSubItems && isSelected && (
                      <div className="ml-5 pl-2.5 border-l border-[#4e5058]/40 space-y-0.5 my-1">
                        {[
                          { id: 'info' as AccountSubTab, label: 'Account Info' },
                          { id: 'security' as AccountSubTab, label: 'Password & Security' },
                          { id: 'standing' as AccountSubTab, label: 'Account Standing' },
                          { id: 'family' as AccountSubTab, label: 'Family Center' },
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            id={`discord-subtab-${sub.id}`}
                            type="button"
                            onClick={() => setActiveAccountSubTab(sub.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-[11.5px] transition-colors cursor-pointer relative ${
                              activeAccountSubTab === sub.id
                                ? 'text-white font-bold bg-[#35373c]'
                                : 'text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#35373c]/50'
                            }`}
                          >
                            {activeAccountSubTab === sub.id && (
                              <span className="absolute -left-[11px] top-1.5 bottom-1.5 w-1 bg-white rounded-r" />
                            )}
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Log Out */}
          <div className="pt-2 border-t border-[#35373c]">
            <button
              id="discord-nav-logout-btn"
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[#f23f43] hover:bg-[#f23f43]/10 font-semibold transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-2.5 pt-3 pb-4 text-[10px] text-[#949ba4]/70 space-y-1 font-mono">
            <div>stable 593254 (2bac426)</div>
            <div className="hover:underline cursor-pointer">Privacy Policy • Terms of Service • More</div>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT PANEL */}
      <main 
        id="discord-settings-main-panel"
        className="flex-1 bg-[#313338] overflow-y-auto p-6 md:p-10 flex flex-col relative custom-scrollbar max-w-4xl"
      >
        {/* Header with Title & Close (ESC) Button */}
        <div className="flex items-center justify-between pb-6 border-b border-[#3f4147]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {activeCategory === 'account' ? 'Account' : navItems.flatMap(g => g.items).find(i => i.id === activeCategory)?.label || 'Settings'}
            </h2>
          </div>

          {/* Close button with ESC badge */}
          <div className="flex flex-col items-center gap-1">
            <button
              id="discord-settings-close-btn"
              type="button"
              onClick={onClose}
              title="Close Settings (ESC)"
              className="w-9 h-9 rounded-full border-2 border-[#80848e] hover:border-white text-[#80848e] hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono text-[#80848e] font-bold">ESC</span>
          </div>
        </div>

        {/* CONTENT RENDER BY CATEGORY */}
        <div className="mt-6 space-y-8 flex-1">
          {activeCategory === 'account' && (
            <>
              {/* Profile Card with Banner, Avatar Drag & Drop & Bio Quick Edit */}
              <div 
                id="discord-profile-banner-card"
                className="w-full bg-[#1e1f22] rounded-2xl overflow-hidden border border-[#232428] shadow-lg"
              >
                {/* Banner with gradient background / custom image */}
                <div 
                  className={`h-28 sm:h-36 relative overflow-hidden group transition-all ${
                    currentUser?.banner ? 'bg-black/60' : 'bg-gradient-to-r from-[#5865f2] via-[#7289da] to-[#4752c4]'
                  } ${isBannerDragging ? 'ring-4 ring-[#5865f2] scale-[1.01]' : ''}`}
                  onDragOver={handleBannerDragOver}
                  onDragEnter={handleBannerDragOver}
                  onDragLeave={handleBannerDragLeave}
                  onDrop={handleBannerDrop}
                >
                  {currentUser?.banner && (
                    <img 
                      src={currentUser.banner} 
                      alt="Profile Banner" 
                      className={`w-full h-full object-cover transition-opacity ${
                        isBannerDragging ? 'opacity-40' : 'opacity-90 group-hover:opacity-100'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Banner Controls & Status */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <button
                      type="button"
                      id="discord-change-banner-btn"
                      onClick={() => bannerFileInputRef.current?.click()}
                      disabled={isUploadingBanner}
                      className="px-3 py-1.5 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105"
                      title={language === 'ar' ? 'تغيير صورة أو GIF الغلاف' : 'Change Banner Cover / GIF'}
                    >
                      <Camera className="w-3.5 h-3.5 text-[#5865f2]" />
                      <span>
                        {isUploadingBanner 
                          ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') 
                          : (language === 'ar' ? 'تغيير الغلاف' : 'Change Banner')}
                      </span>
                    </button>
                    {bannerUploadSuccess && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{language === 'ar' ? 'تم الحفظ!' : 'Saved!'}</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={onOpenEditProfile}
                      className="px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تعديل الحساب' : 'Edit Profile'}</span>
                    </button>
                  </div>
                </div>

                {/* Avatar & User Details */}
                <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                    {/* Avatar Circle with Dropzone */}
                    <div 
                      id="discord-avatar-drop-target"
                      onClick={() => avatarFileInputRef.current?.click()}
                      onDragOver={handleAvatarDragOver}
                      onDragEnter={handleAvatarDragOver}
                      onDragLeave={handleAvatarDragLeave}
                      onDrop={handleAvatarDrop}
                      title="Click or drop an image here to upload avatar"
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#1e1f22] bg-[#2b2d31] flex items-center justify-center relative group cursor-pointer shadow-xl transition-all ${
                        isAvatarDragging 
                          ? 'ring-4 ring-[#5865f2] scale-105' 
                          : 'hover:opacity-90'
                      }`}
                    >
                      {currentUser?.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.name || 'Avatar'} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white/50" />
                      )}

                      {/* Hover / Drag Overlay */}
                      <div className={`absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-opacity ${
                        isAvatarDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <Camera className="w-6 h-6 text-[#5865f2]" />
                        <span className="text-[9px] font-bold uppercase tracking-wider mt-1">
                          {isAvatarDragging ? 'Drop Image' : 'Change Avatar'}
                        </span>
                      </div>

                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-[#5865f2] animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/30 font-bold uppercase tracking-wider">
                          {language === 'ar' ? 'الاسم المستعار' : 'Nickname'}
                        </span>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                          {currentUser?.name || displayName}
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#5865f2] text-white uppercase font-bold tracking-wider">
                            Active
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#949ba4] font-mono">
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-bold text-white/60">
                          {language === 'ar' ? 'اسم المستخدم' : 'Username'}:
                        </span>
                        <span className="text-white/80 font-bold">
                          @{currentUser?.handle || username}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device upload & Remove button */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{avatarUploadSuccess ? 'Uploaded!' : 'Upload Image'}</span>
                    </button>
                    {currentUser?.avatar && (
                      <button
                        type="button"
                        onClick={() => onUpdateAvatar('')}
                        className="p-2 bg-[#da373c]/20 hover:bg-[#da373c]/30 text-[#f23f43] rounded-md transition-colors cursor-pointer"
                        title="Remove Avatar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Bio Editor */}
                <div className="px-6 pb-6 pt-2 border-t border-[#2b2d31]/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4]">
                      About Me / Bio
                    </label>
                    <span className="text-[10px] font-mono text-[#949ba4]">
                      {bio.length}/300
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      id="discord-bio-input"
                      value={bio}
                      maxLength={300}
                      rows={2}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the community a bit about yourself..."
                      className="flex-1 bg-[#2b2d31] border border-transparent focus:border-[#5865f2] rounded-lg p-3 text-xs text-white placeholder-[#949ba4] focus:outline-none resize-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleSaveBio}
                      disabled={isSavingBio}
                      className={`px-4 py-2 self-end sm:self-auto rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        savedBioSuccess
                          ? 'bg-[#23a55a] text-white'
                          : 'bg-[#5865f2] hover:bg-[#4752c4] text-white'
                      }`}
                    >
                      {savedBioSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{savedBioSuccess ? 'Saved' : 'Save Bio'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1. Account Info Section */}
              <div id="discord-section-account-info" className="space-y-4">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Account Info
                </h3>

                <div className="bg-[#2b2d31] rounded-lg p-4 space-y-4 border border-[#232428]">
                  {/* Username Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[#b5bac1] uppercase tracking-wider">
                        Username
                      </div>
                      <div id="discord-username-value" className="text-sm font-medium text-white">
                        {username}
                      </div>
                    </div>
                    <button
                      id="discord-edit-username-btn"
                      type="button"
                      onClick={() => {
                        setEditingField('username');
                        setEditValue(username);
                      }}
                      className="px-4 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white font-medium text-xs rounded-md transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="h-px bg-[#35373c]" />

                  {/* Email Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[#b5bac1] uppercase tracking-wider">
                        Email
                      </div>
                      <div className="flex items-center gap-2">
                        <span id="discord-email-value" className="text-sm font-medium text-white">
                          {maskedEmail}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowEmail(!showEmail)}
                          className="text-xs text-[#00a8fc] hover:underline font-medium cursor-pointer"
                        >
                          {showEmail ? 'Hide' : 'Reveal'}
                        </button>
                      </div>
                    </div>
                    <button
                      id="discord-edit-email-btn"
                      type="button"
                      onClick={() => {
                        setEditingField('email');
                        setEditValue(email);
                      }}
                      className="px-4 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white font-medium text-xs rounded-md transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="h-px bg-[#35373c]" />

                  {/* Phone Number Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[#b5bac1] uppercase tracking-wider">
                        Phone Number
                      </div>
                      <div className="flex items-center gap-2">
                        <span id="discord-phone-value" className="text-sm font-medium text-white">
                          {maskedPhone}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPhone(!showPhone)}
                          className="text-xs text-[#00a8fc] hover:underline font-medium cursor-pointer"
                        >
                          {showPhone ? 'Hide' : 'Reveal'}
                        </button>
                      </div>
                    </div>
                    <button
                      id="discord-edit-phone-btn"
                      type="button"
                      onClick={() => {
                        setEditingField('phone');
                        setEditValue(phone.includes('•') ? '+1 (555) 234-8377' : phone);
                      }}
                      className="px-4 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white font-medium text-xs rounded-md transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Password & Security Section */}
              <div id="discord-section-password-security" className="space-y-4">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Password & Security
                </h3>

                <div className="bg-[#2b2d31] rounded-lg p-4 space-y-4 border border-[#232428]">
                  {/* Password row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[#b5bac1] uppercase tracking-wider">
                        Password
                      </div>
                      <div className="text-sm font-medium text-white tracking-widest">
                        ••••••••••••
                      </div>
                    </div>
                    <button
                      id="discord-edit-password-btn"
                      type="button"
                      onClick={() => {
                        setEditingField('password');
                        setEditPasswordValue('');
                        setEditPasswordConfirm('');
                      }}
                      className="px-4 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white font-medium text-xs rounded-md transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="h-px bg-[#35373c]" />

                  {/* Multi-Factor Authentication */}
                  <button
                    type="button"
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    className="w-full flex items-center justify-between gap-4 text-left hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[#b5bac1] uppercase tracking-wider">
                        Multi-Factor Authentication
                      </div>
                      <div className="text-xs text-[#949ba4]">
                        Protect your account with an extra security layer (Authenticator app or SMS).
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className={is2FAEnabled ? 'text-[#23a55a]' : 'text-[#f23f43]'}>
                        {is2FAEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#949ba4]" />
                    </div>
                  </button>

                  <div className="h-px bg-[#35373c]" />

                  {/* Logged-in Devices */}
                  <button
                    type="button"
                    onClick={() => setShowDevicesModal(true)}
                    className="w-full flex items-center justify-between gap-4 text-left hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-[#b5bac1] uppercase tracking-wider">
                        Logged-in Devices
                      </div>
                      <div className="text-xs text-[#949ba4]">
                        Review all active logins and manage trusted sessions.
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <span>{devices.length} devices</span>
                      <ChevronRight className="w-4 h-4 text-[#949ba4]" />
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Account Standing Section */}
              <div id="discord-section-account-standing" className="space-y-4">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Account Standing
                </h3>

                <button
                  id="discord-account-standing-card"
                  type="button"
                  onClick={() => setShowStandingModal(true)}
                  className="w-full bg-[#2b2d31] hover:bg-[#35373c] transition-colors rounded-lg p-4 flex items-center justify-between gap-4 text-left border border-[#232428] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#f0b232]/15 border border-[#f0b232]/30 flex items-center justify-center shrink-0 text-[#f0b232]">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white">
                        Your account is limited
                      </div>
                      <div className="text-xs text-[#949ba4]">
                        You may lose access to some parts of Discord if you break the rules again.
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#949ba4] shrink-0" />
                </button>
              </div>

              {/* 4. Family Center Section */}
              <div id="discord-section-family-center" className="space-y-4">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Family Center
                </h3>

                <button
                  id="discord-family-center-card"
                  type="button"
                  onClick={() => setShowFamilyModal(true)}
                  className="w-full bg-[#2b2d31] hover:bg-[#35373c] transition-colors rounded-lg p-4 flex items-center justify-between gap-4 text-left border border-[#232428] cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white">
                      Set up Family Center
                    </div>
                    <div className="text-xs text-[#949ba4] max-w-xl">
                      Stay informed about your teen's experience on Discord. See their activity, manage key safety settings, and start better conversations together.
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#949ba4] shrink-0" />
                </button>
              </div>

              {/* 5. Account Lifecycle: Disable / Delete Section */}
              <div id="discord-section-account-lifecycle" className="pt-4 border-t border-[#3f4147] space-y-4">
                {/* Disable account */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-white">
                      Disable your account
                    </div>
                    <div className="text-xs text-[#949ba4]">
                      Temporarily disable your account.
                    </div>
                  </div>
                  <button
                    id="discord-disable-account-btn"
                    type="button"
                    onClick={() => setShowDisableModal(true)}
                    className="px-4 py-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white font-semibold text-xs rounded-md transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    Disable Account
                  </button>
                </div>

                {/* Close account */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-white">
                      Close your account
                    </div>
                    <div className="text-xs text-[#949ba4]">
                      Permanently close your account.
                    </div>
                  </div>
                  <button
                    id="discord-delete-account-btn"
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-[#da373c] hover:bg-[#c02e33] text-white font-semibold text-xs rounded-md transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </>
          )}

          {/* DATA & PRIVACY */}
          {activeCategory === 'data-privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Data & Privacy Controls</h3>
              <div className="bg-[#2b2d31] rounded-lg p-5 space-y-5 border border-[#232428]">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-white">Direct Message Safety</div>
                  <p className="text-xs text-[#949ba4]">Automatically scan and filter explicit media from direct messages.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    {(['everyone', 'friends', 'none'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDirectMessageSafety(mode)}
                        className={`p-3 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                          directMessageSafety === mode 
                            ? 'border-[#5865f2] bg-[#5865f2]/20 text-white' 
                            : 'border-[#35373c] bg-[#1e1f22] text-[#949ba4] hover:text-white'
                        }`}
                      >
                        {mode === 'everyone' ? 'Filter Everyone' : mode === 'friends' ? 'Filter Friends' : 'Do Not Filter'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#35373c]" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Use data to improve Discord</div>
                    <div className="text-xs text-[#949ba4]">Allow us to use information about your usage to enhance product features.</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#5865f2] cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeCategory === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
              <div className="bg-[#2b2d31] rounded-lg p-5 space-y-4 border border-[#232428]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Enable Desktop Notifications</div>
                    <div className="text-xs text-[#949ba4]">Receive notifications on your device when mentioned or messaged.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={desktopNotifications} 
                    onChange={(e) => setDesktopNotifications(e.target.checked)} 
                    className="w-4 h-4 accent-[#5865f2] cursor-pointer" 
                  />
                </div>
                <div className="h-px bg-[#35373c]" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Unread Message Badge</div>
                    <div className="text-xs text-[#949ba4]">Show a red badge indicator on channels with unread messages.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={unreadBadges} 
                    onChange={(e) => setUnreadBadges(e.target.checked)} 
                    className="w-4 h-4 accent-[#5865f2] cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* VOICE & VIDEO */}
          {activeCategory === 'voice-video' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Voice & Video Settings</h3>
              <div className="bg-[#2b2d31] rounded-lg p-5 space-y-5 border border-[#232428]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white flex items-center gap-2"><Mic className="w-4 h-4 text-[#5865f2]" /> Input Volume</span>
                    <span className="font-mono text-[#949ba4]">{micVolume}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100} 
                    value={micVolume} 
                    onChange={(e) => setMicVolume(Number(e.target.value))} 
                    className="w-full accent-[#5865f2] cursor-pointer" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white flex items-center gap-2"><Volume2 className="w-4 h-4 text-[#5865f2]" /> Output Volume</span>
                    <span className="font-mono text-[#949ba4]">{outputVolume}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100} 
                    value={outputVolume} 
                    onChange={(e) => setOutputVolume(Number(e.target.value))} 
                    className="w-full accent-[#5865f2] cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeCategory === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Theme & Appearance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark', desc: 'Classic dark palette' },
                  { id: 'midnight', label: 'Midnight', desc: 'OLED pure blacks' },
                  { id: 'light', label: 'Light', desc: 'Crisp high-contrast light' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeMode(t.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      themeMode === t.id 
                        ? 'border-[#5865f2] bg-[#5865f2]/10 ring-2 ring-[#5865f2]/30' 
                        : 'border-[#35373c] bg-[#2b2d31] hover:border-[#4e5058]'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{t.label}</div>
                    <div className="text-xs text-[#949ba4] mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>

              <div className="bg-[#2b2d31] rounded-lg p-5 space-y-3 border border-[#232428]">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white">Chat Font Scale</span>
                  <span className="font-mono text-[#949ba4]">{chatFontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min={12} 
                  max={24} 
                  value={chatFontSize} 
                  onChange={(e) => setChatFontSize(Number(e.target.value))} 
                  className="w-full accent-[#5865f2] cursor-pointer" 
                />
              </div>
            </div>
          )}

          {/* LANGUAGE & TIME */}
          {activeCategory === 'language-time' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Language & Region</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
                  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
                  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
                  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
                  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
                  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      if ((l.code === 'en' || l.code === 'ar') && onSetLanguage) {
                        onSetLanguage(l.code);
                      }
                    }}
                    className={`p-3.5 rounded-lg border flex items-center justify-between text-left transition-all cursor-pointer ${
                      language === l.code 
                        ? 'border-[#5865f2] bg-[#5865f2]/15 text-white font-bold' 
                        : 'border-[#35373c] bg-[#2b2d31] text-[#dbdee1] hover:bg-[#35373c]'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </span>
                    {language === l.code && <Check className="w-4 h-4 text-[#5865f2]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DEVELOPER */}
          {activeCategory === 'developer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Developer Mode</h3>
              <div className="bg-[#2b2d31] rounded-lg p-5 space-y-4 border border-[#232428]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Developer Mode</div>
                    <div className="text-xs text-[#949ba4]">Expose context menu items like 'Copy ID' for users, channels, and messages.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={developerMode} 
                    onChange={(e) => setDeveloperMode(e.target.checked)} 
                    className="w-4 h-4 accent-[#5865f2] cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* EDIT MODAL FOR USERNAME / EMAIL / PHONE / PASSWORD */}
      <AnimatePresence>
        {editingField && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#313338] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    {editingField === 'username' && 'Change Username'}
                    {editingField === 'email' && 'Change Email'}
                    {editingField === 'phone' && 'Change Phone Number'}
                    {editingField === 'password' && 'Change Password'}
                  </h3>
                  <button 
                    onClick={() => setEditingField(null)}
                    className="text-[#949ba4] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {editingField !== 'password' ? (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#b5bac1]">
                      {editingField}
                    </label>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#b5bac1]">New Password</label>
                      <input
                        type="password"
                        value={editPasswordValue}
                        onChange={(e) => setEditPasswordValue(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#b5bac1]">Confirm Password</label>
                      <input
                        type="password"
                        value={editPasswordConfirm}
                        onChange={(e) => setEditPasswordConfirm(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#1e1f22] border border-[#232428] focus:border-[#5865f2] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#dbdee1] hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFieldEdit}
                    className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGGED IN DEVICES MODAL */}
      <AnimatePresence>
        {showDevicesModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#313338] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Logged-in Devices</h3>
                    <p className="text-xs text-[#949ba4]">You're currently signed in on {devices.length} active sessions.</p>
                  </div>
                  <button 
                    onClick={() => setShowDevicesModal(false)}
                    className="text-[#949ba4] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {devices.map((d) => (
                    <div key={d.id} className="p-3.5 bg-[#2b2d31] rounded-xl border border-[#232428] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#1e1f22] flex items-center justify-center text-[#5865f2]">
                          {d.name.includes('iPhone') || d.name.includes('Mobile') ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Monitor className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{d.name}</span>
                            {d.current && (
                              <span className="px-1.5 py-0.2 bg-[#23a55a]/20 text-[#23a55a] text-[9px] rounded font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#949ba4]">{d.location} • {d.lastActive}</div>
                        </div>
                      </div>
                      {!d.current && (
                        <button
                          type="button"
                          onClick={() => setDevices(prev => prev.filter(item => item.id !== d.id))}
                          className="text-xs text-[#f23f43] hover:underline font-semibold"
                        >
                          Log Out
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#3f4147]">
                  <button
                    type="button"
                    onClick={() => setDevices(prev => prev.filter(d => d.current))}
                    className="px-4 py-2 bg-[#da373c]/20 hover:bg-[#da373c]/30 text-[#f23f43] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Log Out All Other Devices
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDevicesModal(false)}
                    className="px-4 py-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACCOUNT STANDING MODAL */}
      <AnimatePresence>
        {showStandingModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#313338] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0b232]/20 border border-[#f0b232]/30 flex items-center justify-center text-[#f0b232]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Account Standing Details</h3>
                  <p className="text-xs text-[#949ba4] mt-1">
                    Your account has 1 active warning regarding policy guidelines. Further violations may lead to temporary suspension or server restrictions.
                  </p>
                </div>
                <div className="bg-[#2b2d31] p-3 rounded-lg border border-[#232428] text-xs space-y-1">
                  <div className="font-bold text-white">Status: Limited Standing</div>
                  <div className="text-[#949ba4]">Expires in 14 days if no new infractions occur.</div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowStandingModal(false)}
                    className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Understood
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAMILY CENTER MODAL */}
      <AnimatePresence>
        {showFamilyModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#313338] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5865f2]/20 border border-[#5865f2]/30 flex items-center justify-center text-[#5865f2]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Set up Family Center</h3>
                  <p className="text-xs text-[#949ba4] mt-1">
                    Connect with your family members to monitor activity, friend additions, and active servers safely with end-to-end transparency.
                  </p>
                </div>
                <div className="bg-[#2b2d31] p-3 rounded-lg border border-[#232428] text-xs space-y-1.5">
                  <div className="font-bold text-white">1. Generate Connection Link</div>
                  <div className="text-[#949ba4]">Share with family members to link accounts safely.</div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowFamilyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#dbdee1] hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Family Center invitation link generated.');
                      setShowFamilyModal(false);
                    }}
                    className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Generate Link
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISABLE / DELETE CONFIRMATION MODALS */}
      <AnimatePresence>
        {(showDisableModal || showDeleteModal) && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#313338] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#da373c]/20 border border-[#da373c]/30 flex items-center justify-center text-[#f23f43]">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {showDisableModal ? 'Disable Account' : 'Delete Account'}
                    </h3>
                    <p className="text-xs text-[#949ba4]">
                      {showDisableModal 
                        ? 'Are you sure you want to temporarily disable your account? You can re-enable it by logging in again.' 
                        : 'Are you sure you want to permanently delete your account? This action cannot be undone.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisableModal(false);
                      setShowDeleteModal(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#dbdee1] hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisableModal(false);
                      setShowDeleteModal(false);
                      if (onSignOut) onSignOut();
                    }}
                    className={`px-5 py-2 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      showDisableModal ? 'bg-[#4e5058] hover:bg-[#6d6f78]' : 'bg-[#da373c] hover:bg-[#c02e33]'
                    }`}
                  >
                    {showDisableModal ? 'Disable Account' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
