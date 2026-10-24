import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Upload,
  Camera,
  Trash2,
  Check,
  Sparkles,
  Edit3,
  Shield,
  Key,
  Smartphone,
  Globe,
  Bell,
  LogOut,
  Zap,
  Award,
  Calendar,
  MapPin,
  Mail,
  Lock,
  FileText,
  RefreshCw,
  Sliders,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  X,
  Phone as PhoneIcon,
  AtSign,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  Database,
  Volume2,
  Download,
  Mic,
  HardDrive,
  Gamepad2,
} from "lucide-react";
import { UserProfile } from "../types";

interface MyAccountSectionProps {
  currentUser: UserProfile | null;
  language: "en" | "ar";
  onOpenEditProfile: () => void;
  onUpdateBio: (bio: string) => Promise<void>;
  onUpdateAvatar: (avatar: string) => Promise<void>;
  onUpdateBanner?: (banner: string) => Promise<void>;
  onUpdateProfile?: (updatedFields: Partial<UserProfile>) => Promise<void>;
  onSignOut?: () => void;
  onOpenLogin?: () => void;
  onSetLanguage?: (lang: "en" | "ar") => void;
  onOpenOwnerConsole?: () => void;
  onOpenDataVault?: () => void;
  onOpenVoiceSettings?: () => void;
  onOpenGamingAccounts?: () => void;
  isOwner?: boolean;
  userPostCount?: number;
  userSavedCount?: number;
}

type EditFieldType =
  "username" | "displayName" | "email" | "phone" | "password" | null;

export default function MyAccountSection({
  currentUser,
  language,
  onOpenEditProfile,
  onUpdateBio,
  onUpdateAvatar,
  onUpdateBanner,
  onUpdateProfile,
  onSignOut,
  onOpenLogin,
  onSetLanguage,
  onOpenOwnerConsole,
  onOpenDataVault,
  onOpenVoiceSettings,
  onOpenGamingAccounts,
  isOwner,
  userPostCount = 0,
  userSavedCount = 0,
}: MyAccountSectionProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences" | "dataVault" | "voiceSettings" | "gamingMatrix"
  >("profile");

  // Bio state
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [savedBioSuccess, setSavedBioSuccess] = useState(false);

  // Avatar upload & drag states
  const [isDragging, setIsDragging] = useState(false);
  const [isAvatarDragging, setIsAvatarDragging] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Banner upload & drag states
  const [isBannerDragging, setIsBannerDragging] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadSuccess, setBannerUploadSuccess] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Security preferences state
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [activityBroadcast, setActivityBroadcast] = useState(true);

  // Account Information Modal state
  const [activeModalField, setActiveModalField] = useState<EditFieldType>(null);
  const [modalInputValue, setModalInputValue] = useState("");

  // Password specific state
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSavingField, setIsSavingField] = useState(false);
  const [fieldSuccessMessage, setFieldSuccessMessage] = useState<string | null>(
    null,
  );
  const [showConfirmSaveDialog, setShowConfirmSaveDialog] =
    useState<boolean>(false);

  // Fallback defaults matching screenshot
  const currentUsername = currentUser?.handle || "omar_games_1";
  const currentDisplayName = currentUser?.name || "OMAR";
  const currentEmail = currentUser?.email || "waveuifl@gmail.com";
  const currentPhone = currentUser?.phone || "+201285888377";

  useEffect(() => {
    setBio(currentUser?.bio || "");
  }, [currentUser?.bio]);

  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(
        language === "ar"
          ? "يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP, GIF)."
          : "Please select a valid image file (JPEG, PNG, WEBP, GIF).",
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(
        language === "ar"
          ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)."
          : "Image size is too large (max 5MB).",
      );
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
    if (file) {
      processAvatarFile(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const processBannerFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(
        language === "ar"
          ? "يرجى اختيار ملف صورة صالح لغلاف الحساب."
          : "Please select a valid image file for banner cover.",
      );
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert(
        language === "ar"
          ? "حجم صورة الغلاف كبير جداً (الحد الأقصى 8 ميغابايت)."
          : "Banner image is too large (max 8MB).",
      );
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
    if (file) {
      processBannerFile(file);
    }
    if (e.target) {
      e.target.value = "";
    }
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
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleCardDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleCardDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleCardDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
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

  const openFieldEditor = (field: EditFieldType) => {
    setValidationError(null);
    setFieldSuccessMessage(null);
    setActiveModalField(field);

    if (field === "username")
      setModalInputValue(currentUser?.handle || "omar_games_1");
    else if (field === "displayName")
      setModalInputValue(currentUser?.name || "OMAR");
    else if (field === "email")
      setModalInputValue(currentUser?.email || "waveuifl@gmail.com");
    else if (field === "phone")
      setModalInputValue(currentUser?.phone || "+201285888377");
    else if (field === "password") {
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    }
  };

  const handleSaveField = () => {
    if (!activeModalField) return;
    setValidationError(null);

    // Form validations
    if (activeModalField === "username") {
      const cleanHandle = modalInputValue.replace(/^@/, "").trim();
      if (!cleanHandle) {
        setValidationError(
          language === "ar"
            ? "يرجى إدخال اسم مستخدم صحيح."
            : "Please enter a valid username.",
        );
        return;
      }
      if (cleanHandle.length < 3) {
        setValidationError(
          language === "ar"
            ? "يجب أن يتكون اسم المستخدم من 3 أحرف على الأقل."
            : "Username must be at least 3 characters long.",
        );
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanHandle)) {
        setValidationError(
          language === "ar"
            ? "اسم المستخدم يجب أن يحتوي فقط على أحرف إنجليزية وأرقام وعلامة _."
            : "Username can only contain English letters, numbers, and underscores.",
        );
        return;
      }
    } else if (activeModalField === "displayName") {
      if (!modalInputValue.trim()) {
        setValidationError(
          language === "ar"
            ? "يرجى إدخال الاسم المعروض (اللقب)."
            : "Please enter a valid display name / nickname.",
        );
        return;
      }
    } else if (activeModalField === "email") {
      const emailTrimmed = modalInputValue.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        setValidationError(
          language === "ar"
            ? "يرجى إدخال بريد إلكتروني صالح."
            : "Please enter a valid email address.",
        );
        return;
      }
    } else if (activeModalField === "phone") {
      const phoneTrimmed = modalInputValue.trim();
      if (phoneTrimmed.length < 7) {
        setValidationError(
          language === "ar"
            ? "يرجى إدخال رقم هاتف صحيح."
            : "Please enter a valid phone number.",
        );
        return;
      }
    } else if (activeModalField === "password") {
      if (!currentPasswordInput) {
        setValidationError(
          language === "ar"
            ? "يرجى إدخال كلمة المرور الحالية."
            : "Please enter your current password.",
        );
        return;
      }
      if (newPasswordInput.length < 6) {
        setValidationError(
          language === "ar"
            ? "يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف."
            : "New password must be at least 6 characters.",
        );
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        setValidationError(
          language === "ar"
            ? "كلمتا المرور غير متطابقتين."
            : "Passwords do not match.",
        );
        return;
      }
    }

    // Open Save Confirmation Dialog to confirm user intent
    setShowConfirmSaveDialog(true);
  };

  const executeSaveField = async () => {
    if (!activeModalField) return;
    setIsSavingField(true);
    setShowConfirmSaveDialog(false);

    const updateObj: Partial<UserProfile> = {};
    if (activeModalField === "username") {
      const cleanHandle = modalInputValue.replace(/^@/, "").trim();
      updateObj.handle = cleanHandle;
    } else if (activeModalField === "displayName") {
      updateObj.name = modalInputValue.trim();
    } else if (activeModalField === "email") {
      updateObj.email = modalInputValue.trim();
    } else if (activeModalField === "phone") {
      updateObj.phone = modalInputValue.trim();
    } else if (activeModalField === "password") {
      updateObj.password = newPasswordInput.trim();
      localStorage.setItem("vexora_password_updated", Date.now().toString());
    }

    try {
      if (onUpdateProfile && Object.keys(updateObj).length > 0) {
        await onUpdateProfile(updateObj);
      }
      setFieldSuccessMessage(
        activeModalField === "password"
          ? language === "ar"
            ? "تم تأكيد وتحديث كلمة المرور بنجاح!"
            : "Password updated and secured successfully!"
          : activeModalField === "displayName"
            ? language === "ar"
              ? "تم تأكيد وتحديث اللقب (Nickname) بنجاح!"
              : "Nickname updated successfully!"
            : activeModalField === "username"
              ? language === "ar"
                ? "تم تأكيد وتحديث اسم المستخدم (Username) بنجاح!"
                : "Username updated successfully!"
              : language === "ar"
                ? "تم تأكيد وحفظ البيانات بنجاح!"
                : "Field updated successfully!",
      );
      setTimeout(() => {
        setFieldSuccessMessage(null);
        setActiveModalField(null);
      }, 1200);
    } catch (err) {
      console.error(err);
      setValidationError(
        language === "ar"
          ? "حدث خطأ أثناء التحديث."
          : "Failed to update field.",
      );
    } finally {
      setIsSavingField(false);
    }
  };

  return (
    <motion.div
      id="my-account-section"
      initial={{ opacity: 0, y: 16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 lg:p-8"
    >
      {/* Hidden Avatar File Input for Device Selection */}
      <input
        type="file"
        id="my-account-avatar-file-input"
        ref={avatarFileInputRef}
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Hidden Banner File Input for Device Selection */}
      <input
        type="file"
        id="my-account-banner-file-input"
        ref={bannerFileInputRef}
        accept="image/*"
        onChange={handleBannerFileChange}
        className="hidden"
      />

      {/* Top Banner & Profile Overview Card */}
      <div
        id="my-account-header-card"
        className="flux-card rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0d0f15]/80 backdrop-blur-xl"
      >
        {/* Ambient Top Glow / Gradient Banner / Banner Image */}
        <div
          className="h-36 sm:h-48 w-full bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-cyan-900/50 relative overflow-hidden group"
          onDragOver={(e) => {
            e.preventDefault();
            setIsBannerDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsBannerDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsBannerDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processBannerFile(file);
          }}
        >
          {currentUser?.banner ? (
            <img
              src={currentUser.banner}
              alt="Profile Banner"
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isBannerDragging ? "opacity-40" : "opacity-90"}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.35),transparent_70%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(13,15,21,0.95)_100%)]" />
            </>
          )}

          {/* Banner Edit / Change Overlay Button */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <button
              type="button"
              id="my-account-change-banner-button"
              onClick={() => bannerFileInputRef.current?.click()}
              disabled={isUploadingBanner}
              className="px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold bg-black/60 hover:bg-black/80 text-white/90 border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={
                language === "ar"
                  ? "تغيير صورة الغلاف"
                  : "Change banner cover image"
              }
            >
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isUploadingBanner
                  ? language === "ar"
                    ? "جاري الرفع..."
                    : "Uploading..."
                  : language === "ar"
                    ? "تغيير الغلاف"
                    : "Change Banner"}
              </span>
            </button>
            {bannerUploadSuccess && (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3 h-3" />
                <span>{language === "ar" ? "تم الحفظ!" : "Saved!"}</span>
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold bg-black/70 text-cyan-300 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <img src="/vexora-logo.jpg" alt="Vexora" className="w-3.5 h-3.5 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span>VEXORA</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>
                {currentUser?.isVerified ? "VERIFIED NODE" : "STANDARD TIER"}
              </span>
            </span>
          </div>
        </div>

        {/* Profile Content Details - Perfectly Centered Layout */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center justify-center text-center -mt-16 sm:-mt-20 gap-4">
          {/* Interactive Centered Avatar Circle with Drag & Drop */}
          <div
            id="my-account-avatar"
            onClick={() => avatarFileInputRef.current?.click()}
            onDragOver={handleAvatarDragOver}
            onDragEnter={handleAvatarDragOver}
            onDragLeave={handleAvatarDragLeave}
            onDrop={handleAvatarDrop}
            title={
              language === "ar"
                ? "انقر أو اسحب صورة إلى هنا لتغيير الصورة الشخصية"
                : "Click or drop an image here to change avatar"
            }
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden flex items-center justify-center border-4 shadow-2xl relative group cursor-pointer transition-all shrink-0 mx-auto ${
              isAvatarDragging
                ? "border-purple-400 bg-purple-600/30 scale-105 shadow-[0_0_35px_rgba(168,85,247,0.6)] ring-4 ring-purple-500/40"
                : "border-[#0d0f15] bg-[#161822] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]"
            }`}
          >
            {currentUser?.avatar ? (
              <img
                id="my-account-avatar-image"
                src={currentUser.avatar}
                alt={currentUser.name || "User Profile"}
                className={`w-full h-full object-cover transition-transform duration-500 ${isAvatarDragging ? "scale-110 opacity-40" : "group-hover:scale-105"}`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                id="my-account-avatar-placeholder"
                className="w-full h-full rounded-3xl flex items-center justify-center bg-white/5 text-white/40"
              >
                <User
                  id="my-account-avatar-user-icon"
                  className="w-14 h-14 text-white/50"
                />
              </div>
            )}

            {/* Active Drag Overlay */}
            {isAvatarDragging && (
              <div
                id="my-account-avatar-drag-overlay"
                className="absolute inset-0 bg-purple-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-white animate-pulse"
              >
                <Upload className="w-7 h-7 text-purple-200" />
                <span className="text-[10px] font-black tracking-wider uppercase text-purple-200">
                  {language === "ar" ? "أفلت هنا" : "Drop Here"}
                </span>
              </div>
            )}

            {/* Hover overlay with camera icon */}
            {!isAvatarDragging && (
              <div
                id="my-account-avatar-hover-overlay"
                className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-300 text-white"
              >
                <Camera className="w-6 h-6 text-purple-300" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  {language === "ar" ? "تغيير" : "Change"}
                </span>
              </div>
            )}

            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Nickname & Username explicitly placed directly under banner in center */}
          <div className="space-y-2 text-center w-full max-w-lg mx-auto">
            {/* Nickname (Display Name) Row */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                {language === "ar" ? "الاسم المستعار • NICKNAME" : "NICKNAME"}
              </span>
              <h3
                id="my-account-user-name"
                className="text-xl sm:text-2xl font-black text-white tracking-wide"
              >
                {currentUser?.name || currentDisplayName}
              </h3>
              {currentUser?.isVerified && (
                <span title="Verified Account">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </span>
              )}
            </div>

            {/* Username (Handle) & Meta Details Row */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-white/50 font-mono">
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/60">
                  {language === "ar" ? "اسم المستخدم • USERNAME" : "USERNAME"}:
                </span>
                <span
                  id="my-account-user-handle"
                  className="text-purple-400 font-bold"
                >
                  @{currentUser?.handle || currentUsername}
                </span>
              </div>
              {currentUser?.location && (
                <span className="flex items-center gap-1 text-white/60 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400/70" />
                  <span>{currentUser.location}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-purple-400/70" />
                <span>
                  {currentUser?.joinedDate
                    ? `Joined ${currentUser.joinedDate}`
                    : "Active Member"}
                </span>
              </span>
            </div>
          </div>

          {/* Action Buttons: Centered Grid Rows */}
          <div className="flex flex-col items-center justify-center gap-2 w-full max-w-md mx-auto pt-2">
            {/* Row 1: Owner Tools & Switch / Login */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {(isOwner ||
                currentUser?.email === "fluxstudio4@gmail.com" ||
                currentUser?.email === "vexora.network@gmail.com" ||
                currentUser?.isOwner) &&
                onOpenOwnerConsole && (
                  <motion.button
                    id="my-account-owner-console-btn"
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenOwnerConsole}
                    className="flex-1 min-w-[140px] px-4 py-2.5 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-yellow-200" />
                    <span>
                      {language === "ar" ? "أدوات المالك 👑" : "Owner Tools 👑"}
                    </span>
                  </motion.button>
                )}

              {onOpenLogin && (
                <motion.button
                  id="my-account-switch-account-btn"
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onOpenLogin}
                  className="flex-1 min-w-[140px] px-4 py-2.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>
                    {language === "ar"
                      ? "تبديل / تسجيل الدخول"
                      : "Switch / Log In"}
                  </span>
                </motion.button>
              )}
            </div>

            {/* Row 2: Edit Profile, Upload Image, Remove Avatar */}
            <div className="flex items-center justify-center gap-2 w-full">
              <motion.button
                id="my-account-edit-profile-btn"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenEditProfile}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>
                  {language === "ar" ? "تعديل الحساب" : "Edit Profile"}
                </span>
              </motion.button>

              <motion.button
                id="my-account-quick-upload-btn"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => avatarFileInputRef.current?.click()}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 rounded-xl font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>{language === "ar" ? "رفع صورة" : "Upload Image"}</span>
              </motion.button>

              {currentUser?.avatar && (
                <motion.button
                  id="my-account-quick-remove-avatar-btn"
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onUpdateAvatar("")}
                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all cursor-pointer flex-shrink-0"
                  title={
                    language === "ar" ? "إزالة الصورة الشخصية" : "Remove Avatar"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Row 3: Log Out Button */}
            {onSignOut && (
              <motion.button
                id="my-account-header-signout-btn"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSignOut}
                className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                title={
                  language === "ar"
                    ? "تسجيل الخروج من الحساب"
                    : "Sign out of current account"
                }
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>{language === "ar" ? "تسجيل الخروج" : "Log Out"}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Metrics Bar */}
        <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.02]">
          <div className="p-4 text-center border-r border-white/5">
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {currentUser?.followers || 0}
            </div>
            <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase mt-0.5">
              {language === "ar" ? "المتابعون" : "Followers"}
            </div>
          </div>
          <div className="p-4 text-center border-r border-white/5">
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {currentUser?.following || 0}
            </div>
            <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase mt-0.5">
              {language === "ar" ? "المتابعون" : "Following"}
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {userSavedCount || currentUser?.savedPostIds?.length || 0}
            </div>
            <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase mt-0.5">
              {language === "ar" ? "المحفوظات" : "Saved"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#0d0f15]/80 border border-white/10 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "profile"
              ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{language === "ar" ? "الملف والبيانات" : "Profile"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "security"
              ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{language === "ar" ? "الأمان والحساب" : "Security"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "preferences"
              ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{language === "ar" ? "التفضيلات" : "Preferences"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dataVault")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "dataVault"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]"
              : "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          }`}
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span>
            {language === "ar" ? "💾 حفظ البيانات والنسخ" : "💾 Data Vault"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("voiceSettings")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "voiceSettings"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]"
              : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
          }`}
        >
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span>{language === "ar" ? "🎙️ ضبط الصوت" : "🎙️ Audio & Voice"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gamingMatrix")}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "gamingMatrix"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span>{language === "ar" ? "🎮 حسابات الألعاب" : "🎮 Gaming IDs"}</span>
        </button>
      </div>

      {/* TAB 1: Profile & Account Information */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Exact Account Information Section from the screenshot */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3
                id="account-info-title"
                className="text-sm font-semibold text-white/70"
              >
                {language === "ar" ? "معلومات الحساب" : "Account Information"}
              </h3>
              <span className="text-[11px] text-purple-400 font-mono">
                {language === "ar"
                  ? "انقر لتعديل أي حقل"
                  : "Click any field to edit"}
              </span>
            </div>

            <div
              id="account-information-card"
              className="w-full bg-[#1b1c24] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl divide-y divide-white/[0.07]"
            >
              {/* Row 1: Username */}
              <button
                id="account-info-row-username"
                type="button"
                onClick={() => openFieldEditor("username")}
                className="w-full px-5 py-4.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <AtSign className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white/90">
                    {language === "ar" ? "اسم المستخدم" : "Username"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    id="account-info-val-username"
                    className="text-sm text-white/60 font-mono tracking-tight group-hover:text-white/90 transition-colors"
                  >
                    {currentUser?.handle || "omar_games_1"}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Row 2: Display Name */}
              <button
                id="account-info-row-display-name"
                type="button"
                onClick={() => openFieldEditor("displayName")}
                className="w-full px-5 py-4.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white/90">
                    {language === "ar" ? "الاسم المعروض" : "Display Name"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    id="account-info-val-display-name"
                    className="text-sm font-extrabold tracking-wide uppercase text-white/80 group-hover:text-white transition-colors"
                  >
                    {currentUser?.name || "OMAR"}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Row 3: Email */}
              <button
                id="account-info-row-email"
                type="button"
                onClick={() => openFieldEditor("email")}
                className="w-full px-5 py-4.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white/90">
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    id="account-info-val-email"
                    className="text-sm text-white/60 font-mono tracking-tight group-hover:text-white/90 transition-colors"
                  >
                    {currentUser?.email || "waveuifl@gmail.com"}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Row 4: Phone */}
              <button
                id="account-info-row-phone"
                type="button"
                onClick={() => openFieldEditor("phone")}
                className="w-full px-5 py-4.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white/90">
                    {language === "ar" ? "رقم الهاتف" : "Phone"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    id="account-info-val-phone"
                    className="text-sm text-white/60 font-mono tracking-tight group-hover:text-white/90 transition-colors"
                  >
                    {currentUser?.phone || "+201285888377"}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* Row 5: Password */}
              <button
                id="account-info-row-password"
                type="button"
                onClick={() => openFieldEditor("password")}
                className="w-full px-5 py-4.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white/90">
                    {language === "ar" ? "كلمة المرور" : "Password"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    id="account-info-val-password"
                    className="text-sm text-white/60 font-mono tracking-widest group-hover:text-white/90 transition-colors"
                  >
                    ••••••••••••
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </div>
          </div>

          {/* Avatar Dropzone Box */}
          <div
            id="my-account-avatar-upload-card"
            onDragOver={handleCardDragOver}
            onDragLeave={handleCardDragLeave}
            onDrop={handleCardDrop}
            className={`w-full rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center ${
              isDragging
                ? "border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                : "border-white/10 bg-[#0d0f15]/80 backdrop-blur-xl shadow-xl"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4
                id="my-account-upload-title"
                className="text-base font-bold text-white tracking-wide"
              >
                {language === "ar"
                  ? "رفع صورة شخصية من جهازك"
                  : "Upload Avatar from Device"}
              </h4>
              <p
                id="my-account-upload-desc"
                className="text-xs text-white/50 max-w-md mx-auto"
              >
                {language === "ar"
                  ? "اسحب وأسقط صورة هنا أو اختر ملفاً من جهازك (PNG, JPG, WEBP, GIF)"
                  : "Drag & drop an image here or choose a file from your device (PNG, JPG, WEBP, GIF)"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <motion.button
                id="my-account-upload-device-btn"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => avatarFileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className={`px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  avatarUploadSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-500/30"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                }`}
              >
                {avatarUploadSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {language === "ar"
                        ? "تم الرفع بنجاح!"
                        : "Avatar Uploaded!"}
                    </span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>
                      {language === "ar"
                        ? "اختيار ملف من الجهاز"
                        : "Choose from Device"}
                    </span>
                  </>
                )}
              </motion.button>

              {currentUser?.avatar && (
                <motion.button
                  id="my-account-remove-avatar-btn"
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onUpdateAvatar("")}
                  className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "إزالة الصورة" : "Remove Image"}
                  </span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Bio Input & Display Card */}
          <div
            id="my-account-bio-container"
            className="w-full rounded-3xl p-6 sm:p-7 border border-white/10 bg-[#0d0f15]/80 backdrop-blur-xl shadow-xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="my-account-bio-textarea"
                className="text-xs uppercase tracking-widest font-black text-white/80 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>
                  {language === "ar"
                    ? "النبذة التعريفية (Bio)"
                    : "Bio Information"}
                </span>
              </label>
              <span className="text-[11px] font-mono text-white/40">
                {bio.length}/300
              </span>
            </div>

            <textarea
              id="my-account-bio-textarea"
              value={bio}
              maxLength={300}
              rows={4}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                language === "ar"
                  ? "اكتب نبذة عن نفسك لعرضها على صفحتك الشخصية..."
                  : "Write a bio to share something about yourself across Vexora..."
              }
              className="w-full bg-black/40 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-2xl p-4 text-sm text-white placeholder-white/20 focus:outline-none transition-all resize-none leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <motion.button
                id="my-account-save-bio-button"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSavingBio}
                onClick={handleSaveBio}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  savedBioSuccess
                    ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                }`}
              >
                {savedBioSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {language === "ar" ? "تم الحفظ بنجاح!" : "Bio Saved!"}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === "ar" ? "حفظ النبذة" : "Save Bio"}</span>
                  </>
                )}
              </motion.button>

              <motion.button
                id="my-account-edit-profile-button"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenEditProfile}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 rounded-xl font-medium text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-purple-400" />
                <span>
                  {language === "ar"
                    ? "تعديل الملف بالكامل"
                    : "Full Profile Editor"}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Security & Access Management */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-7 border border-white/10 bg-[#0d0f15]/80 backdrop-blur-xl shadow-xl space-y-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>
                {language === "ar"
                  ? "أمان الحساب والتوثيق"
                  : "Authentication & Security"}
              </span>
            </h4>

            {/* Quick Action to Change Password */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>
                    {language === "ar"
                      ? "تغيير كلمة المرور"
                      : "Password & Authentication"}
                  </span>
                </div>
                <div className="text-xs text-white/40">
                  {language === "ar"
                    ? "تحديث كلمة المرور لحماية حسابك."
                    : "Keep your account safe by updating your password periodically."}
                </div>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openFieldEditor("password")}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {language === "ar" ? "تغيير الآن" : "Change Password"}
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>
                      {language === "ar"
                        ? "المصادقة الثنائية (2FA)"
                        : "Two-Factor Authentication"}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 max-w-md">
                    {language === "ar"
                      ? "حماية إضافية لحسابك عند تسجيل الدخول من أجهزة جديدة."
                      : "Add an extra layer of protection when logging into your account."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    twoFactorAuth ? "bg-purple-600" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      twoFactorAuth ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Email Alerts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <span>
                      {language === "ar"
                        ? "تنبيهات تسجيل الدخول"
                        : "Login Security Alerts"}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 max-w-md">
                    {language === "ar"
                      ? "استلام إشعارات فورية عند تسجيل الدخول من متصفح غير معتاد."
                      : "Receive security alerts via email on suspicious activities."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    emailAlerts ? "bg-purple-600" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      emailAlerts ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white">
                  {language === "ar"
                    ? "جلسة تسجيل الدخول"
                    : "Session Management"}
                </div>
                <div className="text-xs text-white/40">
                  {language === "ar"
                    ? "تسجيل الخروج من هذا الجهاز بأمان."
                    : "Safely sign out from current session."}
                </div>
              </div>
              {onSignOut && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSignOut}
                  className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Preferences */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-7 border border-white/10 bg-[#0d0f15]/80 backdrop-blur-xl shadow-xl space-y-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>
                {language === "ar"
                  ? "تفضيلات الواجهة واللغة"
                  : "Interface & Language"}
              </span>
            </h4>

            <div className="space-y-4">
              {/* Language Switcher */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>
                      {language === "ar" ? "لغة الواجهة" : "Display Language"}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    {language === "ar"
                      ? "تغيير اللغة بين العربية والإنجليزية."
                      : "Toggle between English and Arabic."}
                  </div>
                </div>
                {onSetLanguage && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => onSetLanguage("en")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        language === "en"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetLanguage("ar")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        language === "ar"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      عربي
                    </button>
                  </div>
                )}
              </div>

              {/* Activity Broadcast */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>
                      {language === "ar"
                        ? "حالة التواجد والتفاعل"
                        : "Broadcast Presence"}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    {language === "ar"
                      ? "إظهار شارة النشاط المباشر للأصدقاء."
                      : "Show live online presence to peers in communities."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivityBroadcast(!activityBroadcast)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    activityBroadcast ? "bg-purple-600" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      activityBroadcast ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA VAULT & BACKUP PERSISTENCE */}
      {activeTab === "dataVault" && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-7 border border-purple-500/20 bg-[#0d0f15]/90 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <h4 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <span>
                    {language === "ar"
                      ? "نظام حفظ ونسخ واسترجاع البيانات (Data Vault)"
                      : "Data Vault & Backup Manager"}
                  </span>
                </h4>
                <p className="text-xs text-zinc-400">
                  {language === "ar"
                    ? "حفظ شامل لملفك الشخصي، الصور، المنشورات، الرسائل، وتصدير واستيراد النسخ الاحتياطية بأمان تام."
                    : "Full persistence, JSON export, snapshots and disaster recovery for your profile and activities."}
                </p>
              </div>

              {onOpenDataVault && (
                <button
                  type="button"
                  onClick={onOpenDataVault}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Database className="w-4 h-4" />
                  <span>
                    {language === "ar"
                      ? "فتح لوحة حفظ البيانات الكاملة"
                      : "Launch Full Vault Manager"}
                  </span>
                </button>
              )}
            </div>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={onOpenDataVault}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-white">
                  {language === "ar" ? "تصدير نسخة JSON" : "Export Full JSON"}
                </h5>
                <p className="text-[11px] text-zinc-400">
                  {language === "ar"
                    ? "تحميل كامل محتوى الحساب والمنشورات بملف مشفر."
                    : "Download complete offline backup file."}
                </p>
              </div>

              <div
                onClick={onOpenDataVault}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-white">
                  {language === "ar" ? "استعادة واستيراد" : "Restore & Import"}
                </h5>
                <p className="text-[11px] text-zinc-400">
                  {language === "ar"
                    ? "استرجاع فوري لبياناتك بأسلوب الدمج الذكي أو الاستبدال."
                    : "Instant restore via Smart Merge or Full Overwrite."}
                </p>
              </div>

              <div
                onClick={onOpenDataVault}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-white">
                  {language === "ar"
                    ? "نقاط الحفظ الفورية"
                    : "Time Machine Snapshots"}
                </h5>
                <p className="text-[11px] text-zinc-400">
                  {language === "ar"
                    ? "لقطات دورية سريعة تسمح بالعودة لأي تاريخ سابق."
                    : "Instant restore points before major changes."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VOICE & AUDIO TUNING */}
      {activeTab === "voiceSettings" && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-7 border border-indigo-500/20 bg-[#0d0f15]/90 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <h4 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-indigo-400" />
                  <span>
                    {language === "ar"
                      ? "ضبط إعدادات الصوت والميكروفون"
                      : "Voice & Sound Control Studio"}
                  </span>
                </h4>
                <p className="text-xs text-zinc-400">
                  {language === "ar"
                    ? "التحكم بمستويات الصوت، اختبار الميكروفون المباشر، عزل الضوضاء، ونغمات رنين المكالمات."
                    : "Master volume, microphone sensitivity, noise filtering, ringtones and AI speech tuning."}
                </p>
              </div>

              {onOpenVoiceSettings && (
                <button
                  type="button"
                  onClick={onOpenVoiceSettings}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {language === "ar"
                      ? "فتح استوديو ضبط الصوت"
                      : "Launch Sound Studio"}
                  </span>
                </button>
              )}
            </div>

            {/* Quick Sound Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={onOpenVoiceSettings}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-white">
                  {language === "ar" ? "مستويات الصوت" : "Volume Sliders"}
                </h5>
                <p className="text-[11px] text-zinc-400">
                  {language === "ar"
                    ? "التحكم بصوت الرنات، المكالمات، والمؤثرات التفاعلية."
                    : "Master, ringtone and UI sound effects volume."}
                </p>
              </div>

              <div
                onClick={onOpenVoiceSettings}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Mic className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-white">
                  {language === "ar"
                    ? "اختبار المايك وعزل الضوضاء"
                    : "Live Mic Test & Filters"}
                </h5>
                <p className="text-[11px] text-zinc-400">
                  {language === "ar"
                    ? "مؤشر بصري لاختبار حساسية الميكروفون وإلغاء الصدى."
                    : "Hardware level meter, echo cancellation & gain."}
                </p>
              </div>

              <div
                onClick={onOpenVoiceSettings}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-white">
                  {language === "ar"
                    ? "نغمات الرنين والمؤثرات"
                    : "Ringtones & SFX"}
                </h5>
                <p className="text-[11px] text-zinc-400">
                  {language === "ar"
                    ? "معاينة واختيار نغمة الرنين المناسبة للمكالمات."
                    : "Preview and select custom call ringtones."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PC Gaming Accounts Matrix */}
      {activeTab === "gamingMatrix" && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 sm:p-7 border border-cyan-500/20 bg-[#0d121f]/90 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <h4 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  <span>
                    {language === "ar"
                      ? "مصفوفة ربط حسابات الألعاب الإلكترونية (PC Gaming IDs)"
                      : "PC Gaming Account Matrix"}
                  </span>
                </h4>
                <p className="text-xs text-zinc-400">
                  {language === "ar"
                    ? "اربط هوياتك في Steam و Discord و Battle.net و Riot Games للتأكيد في بطولات الدوري وفرق LFG."
                    : "Connect Steam, Discord, Battle.net and Riot accounts to sync MMR and verify league roster participation."}
                </p>
              </div>

              {onOpenGamingAccounts && (
                <button
                  type="button"
                  onClick={onOpenGamingAccounts}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Gamepad2 className="w-4 h-4 text-black" />
                  <span>
                    {language === "ar"
                      ? "تعديل وربط الحسابات"
                      : "Manage Gaming IDs"}
                  </span>
                </button>
              )}
            </div>

            {/* Matrix Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={onOpenGamingAccounts}
                className="p-4 rounded-2xl bg-black/40 border border-[#1b2838] hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#171a21] border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-black">
                    STM
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Linked
                  </span>
                </div>
                <h5 className="font-bold text-xs text-white">Steam PC</h5>
                <p className="text-[10px] font-mono text-zinc-400">
                  {language === "ar" ? "تأكيد VAC وحساب الألعاب" : "VAC Clean • Library Synced"}
                </p>
              </div>

              <div
                onClick={onOpenGamingAccounts}
                className="p-4 rounded-2xl bg-black/40 border border-[#5865f2]/40 hover:border-[#5865f2]/70 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#5865f2]/20 border border-[#5865f2]/50 flex items-center justify-center text-[#858ffd] font-mono text-xs font-black">
                    DIS
                  </div>
                  <span className="text-[9px] font-mono text-[#858ffd] bg-[#5865f2]/10 px-2 py-0.5 rounded border border-[#5865f2]/30">
                    Syncing
                  </span>
                </div>
                <h5 className="font-bold text-xs text-white">Discord</h5>
                <p className="text-[10px] font-mono text-zinc-400">
                  {language === "ar" ? "غرف الصوت والرسائل الفورية" : "Voice Channels & Tags"}
                </p>
              </div>

              <div
                onClick={onOpenGamingAccounts}
                className="p-4 rounded-2xl bg-black/40 border border-[#00aeff]/30 hover:border-[#00aeff]/60 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#00aeff]/20 border border-[#00aeff]/40 flex items-center justify-center text-[#00aeff] font-mono text-xs font-black">
                    BTL
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    Active
                  </span>
                </div>
                <h5 className="font-bold text-xs text-white">Battle.net</h5>
                <p className="text-[10px] font-mono text-zinc-400">
                  {language === "ar" ? "بطولات Overwatch و Warzone" : "Overwatch & COD Tag"}
                </p>
              </div>

              <div
                onClick={onOpenGamingAccounts}
                className="p-4 rounded-2xl bg-black/40 border border-[#ff4655]/40 hover:border-[#ff4655]/70 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#ff4655]/20 border border-[#ff4655]/40 flex items-center justify-center text-[#ff4655] font-mono text-xs font-black">
                    ROT
                  </div>
                  <span className="text-[9px] font-mono text-[#ff4655] bg-[#ff4655]/10 px-2 py-0.5 rounded border border-[#ff4655]/30">
                    Verified
                  </span>
                </div>
                <h5 className="font-bold text-xs text-white">Riot Games</h5>
                <p className="text-[10px] font-mono text-zinc-400">
                  {language === "ar" ? "رتبة Valorant & League" : "Valorant Radiant Shard"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Edit Modal for Account Information Fields */}
      <AnimatePresence>
        {activeModalField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#161822] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-white relative overflow-hidden my-auto min-h-[360px]"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    {activeModalField === "username" && (
                      <AtSign className="w-5 h-5" />
                    )}
                    {activeModalField === "displayName" && (
                      <User className="w-5 h-5" />
                    )}
                    {activeModalField === "email" && (
                      <Mail className="w-5 h-5" />
                    )}
                    {activeModalField === "phone" && (
                      <PhoneIcon className="w-5 h-5" />
                    )}
                    {activeModalField === "password" && (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold tracking-tight">
                      {activeModalField === "username" &&
                        (language === "ar"
                          ? "تعديل اسم المستخدم"
                          : "Change Username")}
                      {activeModalField === "displayName" &&
                        (language === "ar"
                          ? "تعديل الاسم المعروض"
                          : "Change Display Name")}
                      {activeModalField === "email" &&
                        (language === "ar"
                          ? "تعديل البريد الإلكتروني"
                          : "Change Email Address")}
                      {activeModalField === "phone" &&
                        (language === "ar"
                          ? "تعديل رقم الهاتف"
                          : "Change Phone Number")}
                      {activeModalField === "password" &&
                        (language === "ar"
                          ? "تغيير كلمة المرور"
                          : "Change Password")}
                    </h4>
                    <p className="text-xs text-white/40">
                      {activeModalField === "username" &&
                        (language === "ar"
                          ? "اسم المعرف الفريد الخاص بك على المنصة"
                          : "Your unique @handle across the network")}
                      {activeModalField === "displayName" &&
                        (language === "ar"
                          ? "الاسم الظاهر للمستخدمين في النبضات"
                          : "The name displayed on your posts and profile")}
                      {activeModalField === "email" &&
                        (language === "ar"
                          ? "البريد المستخدم لتسجيل الدخول والإشعارات"
                          : "Used for secure logins and account recovery")}
                      {activeModalField === "phone" &&
                        (language === "ar"
                          ? "رقم الهاتف للتواصل والمصادقة"
                          : "Phone number for SMS alerts and account verification")}
                      {activeModalField === "password" &&
                        (language === "ar"
                          ? "تحديث كلمة المرور لحماية حسابك"
                          : "Ensure your new password has at least 6 characters")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalField(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Standard Input Form for Username / Name / Email / Phone */}
              {activeModalField !== "password" ? (
                <div className="space-y-2 relative z-10">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    {activeModalField === "username" &&
                      (language === "ar"
                        ? "اسم المستخدم الجديد (@)"
                        : "New Username (@)")}
                    {activeModalField === "displayName" &&
                      (language === "ar"
                        ? "الاسم المعروض الجديد"
                        : "New Display Name")}
                    {activeModalField === "email" &&
                      (language === "ar"
                        ? "عنوان البريد الإلكتروني الجديد"
                        : "New Email Address")}
                    {activeModalField === "phone" &&
                      (language === "ar"
                        ? "رقم الهاتف الجديد"
                        : "New Phone Number")}
                  </label>

                  <div className="relative">
                    {activeModalField === "username" && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-mono text-sm font-bold">
                        @
                      </span>
                    )}
                    <input
                      type={
                        activeModalField === "email"
                          ? "email"
                          : activeModalField === "phone"
                            ? "tel"
                            : "text"
                      }
                      value={modalInputValue}
                      onChange={(e) => setModalInputValue(e.target.value)}
                      placeholder={
                        activeModalField === "username"
                          ? "omar_games_1"
                          : activeModalField === "displayName"
                            ? "OMAR"
                            : activeModalField === "email"
                              ? "waveuifl@gmail.com"
                              : "+201285888377"
                      }
                      className={`w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-white/30 text-sm font-medium focus:outline-none transition-all ${
                        activeModalField === "username" ? "pl-8" : ""
                      }`}
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                /* Password Change Multi-field Form */
                <div className="space-y-4 relative z-10">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      {language === "ar"
                        ? "كلمة المرور الحالية"
                        : "Current Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPasswordInput}
                        onChange={(e) =>
                          setCurrentPasswordInput(e.target.value)
                        }
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-white/30 text-sm font-medium focus:outline-none transition-all pr-11"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      {language === "ar"
                        ? "كلمة المرور الجديدة"
                        : "New Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-white/30 text-sm font-medium focus:outline-none transition-all pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      {language === "ar"
                        ? "تأكيد كلمة المرور الجديدة"
                        : "Confirm New Password"}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPasswordInput}
                        onChange={(e) =>
                          setConfirmPasswordInput(e.target.value)
                        }
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-white/30 text-sm font-medium focus:outline-none transition-all pr-11"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Error Banner */}
              {validationError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Success Banner */}
              {fieldSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{fieldSuccessMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setActiveModalField(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveField}
                  disabled={
                    isSavingField ||
                    (activeModalField !== "password" &&
                      !modalInputValue.trim()) ||
                    (activeModalField === "password" &&
                      (!currentPasswordInput ||
                        !newPasswordInput ||
                        !confirmPasswordInput))
                  }
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingField ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                  </span>
                </motion.button>
              </div>

              {/* Confirmation Dialog Overlay - Always fully visible with guaranteed buttons & scrolling */}
              <AnimatePresence>
                {showConfirmSaveDialog && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="absolute inset-0 z-50 bg-[#0d0e15] p-5 sm:p-6 flex flex-col justify-between rounded-3xl border border-purple-500/40 shadow-2xl overflow-y-auto max-h-full"
                  >
                    <div className="space-y-3.5">
                      {/* Confirmation Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0">
                          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-black tracking-tight text-white flex flex-wrap items-center gap-2">
                            <span>
                              {language === "ar"
                                ? "تأكيد حفظ التعديل"
                                : "Confirm Save Changes"}
                            </span>
                            <span className="text-amber-400 text-[10px] font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              {language === "ar"
                                ? "تأكيد مطلوب"
                                : "Required"}
                            </span>
                          </h4>
                          <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">
                            {language === "ar"
                              ? "يرجى مراجعة وتأكيد تطبيق التغيير التالي على حسابك:"
                              : "Please verify and confirm applying this update to your profile:"}
                          </p>
                        </div>
                      </div>

                      {/* Detail of What is changing */}
                      <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                        <div className="text-xs text-zinc-300 font-medium">
                          {activeModalField === "displayName" && (
                            <div className="space-y-1.5">
                              <p className="text-white/80 text-[11px]">
                                {language === "ar"
                                  ? "الاسم المعروض (Nickname) الجديد:"
                                  : "Your new Display Name / Nickname:"}
                              </p>
                              <div className="px-3 py-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 font-bold text-sm tracking-wide flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="truncate">{modalInputValue.trim()}</span>
                              </div>
                            </div>
                          )}

                          {activeModalField === "username" && (
                            <div className="space-y-1.5">
                              <p className="text-white/80 text-[11px]">
                                {language === "ar"
                                  ? "اسم المستخدم (Username @handle) الجديد:"
                                  : "Your new unique username handle:"}
                              </p>
                              <div className="px-3 py-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono font-bold text-sm tracking-wide flex items-center gap-2">
                                <AtSign className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="truncate">
                                  @{modalInputValue.replace(/^@/, "").trim()}
                                </span>
                              </div>
                            </div>
                          )}

                          {activeModalField === "password" && (
                            <div className="space-y-1.5">
                              <p className="text-white/80 text-[11px]">
                                {language === "ar"
                                  ? "تحديث كلمة المرور وتأمين الحساب:"
                                  : "Password update & account security:"}
                              </p>
                              <div className="px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 font-mono font-bold text-xs tracking-wide flex items-center gap-2">
                                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>
                                  {language === "ar"
                                    ? "سيتم تطبيق كلمة المرور الجديدة فوراً."
                                    : "New password will take effect immediately."}
                                </span>
                              </div>
                            </div>
                          )}

                          {activeModalField === "email" && (
                            <div className="space-y-1.5">
                              <p className="text-white/80 text-[11px]">
                                {language === "ar"
                                  ? "البريد الإلكتروني الجديد:"
                                  : "Your new email address:"}
                              </p>
                              <div className="px-3 py-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono font-bold text-sm tracking-wide flex items-center gap-2">
                                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="truncate">{modalInputValue.trim()}</span>
                              </div>
                            </div>
                          )}

                          {activeModalField === "phone" && (
                            <div className="space-y-1.5">
                              <p className="text-white/80 text-[11px]">
                                {language === "ar"
                                  ? "رقم الهاتف الجديد:"
                                  : "Your new phone number:"}
                              </p>
                              <div className="px-3 py-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono font-bold text-sm tracking-wide flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="truncate">{modalInputValue.trim()}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-amber-300 font-mono pt-0.5">
                          {language === "ar"
                            ? "⚡ هل أنت متأكد من رغبتك في حفظ وتطبيق هذا التعديل؟"
                            : "⚡ Are you sure you want to save and commit this update?"}
                        </p>
                      </div>
                    </div>

                    {/* Confirmation Buttons - Always prominent, full width or flexed with clear contrast */}
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 mt-3 border-t border-white/10">
                      <button
                        type="button"
                        id="confirm-save-cancel-btn"
                        onClick={() => setShowConfirmSaveDialog(false)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center min-h-[42px] flex items-center justify-center"
                      >
                        {language === "ar"
                          ? "تراجع / إلغاء"
                          : "Cancel & Go Back"}
                      </button>

                      <motion.button
                        type="button"
                        id="confirm-save-execute-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={executeSaveField}
                        disabled={isSavingField}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                      >
                        {isSavingField ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        ) : (
                          <Check className="w-4 h-4 text-black stroke-[3]" />
                        )}
                        <span>
                          {language === "ar"
                            ? "نعم، تأكيد وحفظ"
                            : "Yes, Confirm & Save"}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
