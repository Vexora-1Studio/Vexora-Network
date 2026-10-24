import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Sparkles,
  Film,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  FileVideo,
  X,
  FolderOpen,
  HelpCircle,
} from "lucide-react";
import {
  storeVideoInIndexedDB,
  getStoredVideoBlobUrl,
  uploadVideoToServer,
} from "../utils/videoStorage";

interface VexoraPromoVideoPlayerProps {
  language?: "en" | "ar";
  compact?: boolean;
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
  autoPlay?: boolean;
}

export const VexoraPromoVideoPlayer: React.FC<VexoraPromoVideoPlayerProps> = ({
  language = "en",
  compact = false,
  onOpenRegister,
  onOpenLogin,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>("/Vexora_Network_Ad.mp4");
  const [activeFileName, setActiveFileName] = useState<string>("Vexora_Network_Ad.mp4");
  const [isCustomLoaded, setIsCustomLoaded] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize stored video from IndexedDB or server
  useEffect(() => {
    let isMounted = true;

    async function initVideo() {
      // 1. Check local IndexedDB storage first
      const stored = await getStoredVideoBlobUrl();
      if (isMounted && stored.blobUrl) {
        setVideoSrc(stored.blobUrl);
        if (stored.name) setActiveFileName(stored.name);
        setIsCustomLoaded(true);
        return;
      }

      // 2. Query server for video info or custom URL
      try {
        const res = await fetch("/api/video/info");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.url) {
            setVideoSrc(data.url);
            if (data.fileName) setActiveFileName(data.fileName);
            if (data.customUrl) setIsCustomLoaded(true);
          }
        }
      } catch (_) {
        // Fallback to default path
      }
    }

    initVideo();

    const handleVideoUpdated = (e: any) => {
      if (e.detail?.blobUrl) {
        setVideoSrc(e.detail.blobUrl);
        if (e.detail.name) setActiveFileName(e.detail.name);
        setIsCustomLoaded(true);
      }
    };

    window.addEventListener("vexora-video-updated", handleVideoUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("vexora-video-updated", handleVideoUpdated);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleError = () => {
      // If Vexora_Network_Ad.mp4 fails, fallback to vexora-intro.mp4
      if (videoSrc === "/Vexora_Network_Ad.mp4") {
        setVideoSrc("/vexora-intro.mp4");
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
    };
  }, [videoSrc]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    video.play().catch(() => {});
  };

  // Process uploaded video file
  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(
      language === "ar"
        ? `جاري تثبيت ${file.name} من جهازك...`
        : `Mounting ${file.name} from your device...`
    );

    try {
      // 1. Immediately store in IndexedDB and set blob URL for instantaneous playback
      const blobUrl = await storeVideoInIndexedDB(file, file.name);
      setVideoSrc(blobUrl);
      setActiveFileName(file.name);
      setIsCustomLoaded(true);

      // 2. Send to backend server
      const uploadRes = await uploadVideoToServer(file);
      if (uploadRes.success) {
        setUploadStatus(
          language === "ar"
            ? `✅ تم تثبيت ${file.name} بنجاح كالفيديو الرسمي!`
            : `✅ Successfully set ${file.name} as official video!`
        );
      } else {
        setUploadStatus(
          language === "ar"
            ? `✅ تم تشغيل الفيديو بنجاح من جهازك (${file.name})`
            : `✅ Playing locally (${file.name})`
        );
      }

      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
        setUploadStatus(null);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 1200);
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatus(
        language === "ar"
          ? `تعذر حفظ الفيديو: ${err.message}`
          : `Failed to save video: ${err.message}`
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomUrlInput(val);

    if (
      val.startsWith("file://") ||
      val.includes("Desktop") ||
      val.includes("Vexora_Network_Ad.mp4") ||
      /^[A-Za-z]:\\/.test(val)
    ) {
      setUploadStatus(
        language === "ar"
          ? "💡 المتصفحات تمنع قراءة روابط file:/// المباشرة لأمان جهازك. اضغط 'اختيار الملف' أدناه لتحديده من سطح المكتب وسيعمل فوراً!"
          : "💡 Browsers restrict direct file:/// paths for security. Click 'Select from Desktop' below to load it instantly!"
      );
    }
  };

  const handleSaveCustomUrl = async () => {
    const val = customUrlInput.trim();
    if (!val) return;

    // Check if user entered local file path
    if (
      val.startsWith("file://") ||
      val.includes("Desktop") ||
      val.includes("Vexora_Network_Ad.mp4") ||
      /^[A-Za-z]:\\/.test(val)
    ) {
      setUploadStatus(
        language === "ar"
          ? "⚠️ متصفحات الويب تمنع قراءة روابط file:/// تلقائياً. جاري فتح مستكشف الملفات لتحديده من سطح المكتب مباشرة..."
          : "⚠️ Direct file:/// access is restricted by browsers. Opening file picker to choose from Desktop..."
      );
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 500);
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/video/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: val }),
      });
      if (res.ok) {
        setVideoSrc(val);
        setActiveFileName(val);
        setIsCustomLoaded(true);
        setShowUploadModal(false);
      }
    } catch (_) {
      setVideoSrc(val);
      setIsCustomLoaded(true);
      setShowUploadModal(false);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-zinc-950/95 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] transition-all ${
        compact ? "p-3 space-y-3" : "p-4 sm:p-5 space-y-3.5"
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 flex-shrink-0">
            <Film className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black tracking-wider uppercase text-white font-sans">
                {language === "ar" ? "فيديو Vexora Network الرسمي" : "Official Vexora Video"}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 truncate max-w-[140px]">
                {activeFileName}
              </span>
              {isCustomLoaded && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {language === "ar" ? "مُثبّت" : "Active"}
                </span>
              )}
            </div>
            <p className="text-[9px] font-mono text-zinc-400 truncate">
              {language === "ar"
                ? "شاهد الفيديو التعريفي الرسمي لشبكة Vexora Network"
                : "Watch official Vexora Network overview"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            title={language === "ar" ? "إعدادات أو استبدال الفيديو" : "Video options"}
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">
              {language === "ar" ? "استبدال / رفع" : "Options"}
            </span>
          </button>

          <button
            type="button"
            onClick={restartVideo}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={language === "ar" ? "إعادة التشغيل من البداية" : "Replay from start"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop Local File Link Quick Bar (Matches user's local path) */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/70 border border-cyan-500/30">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
            <FolderOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white font-sans truncate">
                {language === "ar"
                  ? "ملفك الأصلي: Vexora_Network_Ad.mp4"
                  : "Your file: Vexora_Network_Ad.mp4"}
              </span>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Desktop
              </span>
            </div>
            <p className="text-[8.5px] font-mono text-zinc-400 truncate">
              file:///C:/Users/Administrator/Desktop/Vexora_Network_Ad.mp4
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-[9.5px] font-mono font-bold tracking-wider uppercase transition-all shadow-md shadow-cyan-600/30 flex items-center gap-1 flex-shrink-0 cursor-pointer active:scale-95"
          title={
            language === "ar"
              ? "اضغط لاختيار ملف Vexora_Network_Ad.mp4 من سطح المكتب"
              : "Select Vexora_Network_Ad.mp4 from Desktop"
          }
        >
          <Upload className="w-3 h-3" />
          <span>{language === "ar" ? "اختيار من Desktop" : "Choose File"}</span>
        </button>
      </div>

      {/* Upload & Replace Modal / Accordion */}
      {showUploadModal && (
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 font-mono">
              <FileVideo className="w-4 h-4 text-cyan-400" />
              <span>
                {language === "ar"
                  ? "تثبيت الفيديو الأصلي (Vexora_Network_Ad.mp4)"
                  : "Set Original Video (Vexora_Network_Ad.mp4)"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] space-y-1 font-sans">
            <div className="flex items-center gap-1.5 font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                {language === "ar"
                  ? "تنبيه أمني هام بخصوص روابط file:///"
                  : "Security Notice regarding file:/// links"}
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[9.5px]">
              {language === "ar"
                ? "روابط file:/// لا تستطيع متصفحات الويب (كروم/إيدج/فايرفوكس) فتحها برمجياً لأسباب تتعلق بأمان جهازك. لذلك وفرنا لك زر الاختيار المباشر أدناه لفتح ملفك Vexora_Network_Ad.mp4 من سطح المكتب بضغطة واحدة وتثبيته فوراً لجميع المستخدمين!"
                : "Web browsers prevent reading local file:/// paths directly to protect your device. Use the button below to pick Vexora_Network_Ad.mp4 directly from your Desktop."}
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              isDragging
                ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                : "border-purple-500/40 hover:border-cyan-400 bg-black/40 hover:bg-black/60"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Upload className="w-5 h-5 animate-bounce" />
            </div>
            <div className="text-center space-y-0.5">
              <span className="text-xs font-bold text-white block">
                {language === "ar"
                  ? "اضغط هنا لاختيار Vexora_Network_Ad.mp4 من سطح المكتب أو اسحبه هنا"
                  : "Click here to select Vexora_Network_Ad.mp4 or drag & drop"}
              </span>
              <span className="text-[9px] font-mono text-zinc-400 block">
                C:\Users\Administrator\Desktop\Vexora_Network_Ad.mp4
              </span>
            </div>
          </div>

          {/* Or Paste Direct Link */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">
              {language === "ar" ? "أو أدخل رابط ويب للفيديو:" : "Or enter web video URL:"}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="file:///C:/Users/Administrator/Desktop/Vexora_Network_Ad.mp4"
                  value={customUrlInput}
                  onChange={handleUrlInputChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveCustomUrl}
                disabled={!customUrlInput.trim() || isUploading}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                {language === "ar" ? "تطبيق" : "Apply"}
              </button>
            </div>
          </div>

          {uploadStatus && (
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[9px] border border-cyan-500/40 cursor-pointer"
              >
                {language === "ar" ? "اختيار الملف" : "Choose File"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Video Container */}
      <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-video group shadow-inner border border-white/10">
        <video
          ref={videoRef}
          src={videoSrc}
          poster="/vexora-banner.png"
          autoPlay={autoPlay}
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
        />

        {/* Ambient Overlay Controls (hover or paused) */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-3 ${
            !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {/* Top Bar inside Video */}
          <div className="flex items-center justify-between pointer-events-auto">
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-cyan-300 border border-white/10 flex items-center gap-1 max-w-[200px] truncate">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse flex-shrink-0" />
              <span className="truncate">{activeFileName}</span>
            </span>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md text-white border border-white/10 transition-transform active:scale-95 cursor-pointer"
              title={
                isMuted
                  ? language === "ar"
                    ? "تشغيل الصوت"
                    : "Unmute"
                  : language === "ar"
                  ? "كتم الصوت"
                  : "Mute"
              }
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
              )}
            </button>
          </div>

          {/* Big Center Play Button when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-cyan-500/30 border-2 border-cyan-400 flex items-center justify-center text-white backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse">
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Bottom Controls Bar inside Video */}
          <div className="space-y-1.5 pointer-events-auto">
            {/* Progress Scrubber */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="hover:text-cyan-300 cursor-pointer p-0.5"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleFullscreen}
                className="hover:text-cyan-300 cursor-pointer p-0.5"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons below video (if opened from Auth modal) */}
      {(onOpenRegister || onOpenLogin) && (
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          {onOpenRegister && (
            <button
              type="button"
              onClick={onOpenRegister}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "إنشاء حساب الآن" : "Create Account Now"}</span>
            </button>
          )}
          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>{language === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VexoraPromoVideoPlayer;
