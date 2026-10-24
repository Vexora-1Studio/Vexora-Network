import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Trash2, 
  X, 
  Sparkles, 
  Save, 
  Layers, 
  Check, 
  FileCode, 
  ArrowDownToLine, 
  Cloud, 
  CloudRain, 
  Cpu, 
  Lock
} from 'lucide-react';
import { UserProfile, Post, Message, Community, Story } from '../types';
import { 
  generateFullBackup, 
  downloadBackupFile, 
  generateHumanReadableReport, 
  validateBackupPayload, 
  calculateStorageFootprint, 
  createDataSnapshot, 
  getSavedSnapshots, 
  deleteSnapshot, 
  clearAppCache, 
  DataSnapshot, 
  FullBackupPayload 
} from '../utils/dataVault';

interface DataVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  posts: Post[];
  messages?: Message[];
  language?: 'ar' | 'en';
  onRestoreData: (restoredData: FullBackupPayload, mode: 'merge' | 'replace') => Promise<void>;
  onForceCloudSync: () => Promise<void>;
  onAddNotification?: (text: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export function DataVaultModal({
  isOpen,
  onClose,
  currentUser,
  posts,
  messages = [],
  language = 'ar',
  onRestoreData,
  onForceCloudSync,
  onAddNotification
}: DataVaultModalProps) {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'snapshots' | 'storage'>('backup');

  // Storage calculation state
  const [storageInfo, setStorageInfo] = useState(calculateStorageFootprint());
  const [snapshots, setSnapshots] = useState<DataSnapshot[]>([]);

  // Cloud Sync state
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Import / Restore file state
  const [importedFile, setImportedFile] = useState<FullBackupPayload | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Snapshot creation state
  const [newSnapshotTitle, setNewSnapshotTitle] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Refresh snapshots & storage when modal opens
  useEffect(() => {
    if (isOpen) {
      setStorageInfo(calculateStorageFootprint());
      setSnapshots(getSavedSnapshots());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Full JSON Export
  const handleExportJSON = () => {
    try {
      const backup = generateFullBackup(currentUser, posts, messages, {
        language,
        feedLayoutMode: 'expanded',
        isDevMode: false
      });
      downloadBackupFile(backup);
      if (onAddNotification) {
        onAddNotification(isAr ? 'تم تصدير نسخة النسخ الاحتياطي (JSON) بنجاح!' : 'Vault backup exported successfully!', 'success');
      }
    } catch (e) {
      console.error(e);
      if (onAddNotification) {
        onAddNotification(isAr ? 'حدث خطأ أثناء تصدير البيانات' : 'Error exporting data', 'error');
      }
    }
  };

  // Handle Human-readable Text/Markdown Export
  const handleExportReport = () => {
    try {
      const backup = generateFullBackup(currentUser, posts, messages);
      const report = generateHumanReadableReport(backup, language);
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vexora-data-report-${currentUser.handle || 'user'}-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (onAddNotification) {
        onAddNotification(isAr ? 'تم تنزيل تقرير البيانات المقروء بنجاح!' : 'Data report downloaded successfully!', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle File Input selection for restore
  const handleFileSelect = (file: File) => {
    setImportError(null);
    setImportedFile(null);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const validation = validateBackupPayload(parsed);

        if (!validation.isValid || !validation.payload) {
          setImportError(validation.error || 'الملف غير صالح للاستعادة.');
          return;
        }

        setImportedFile(validation.payload);
      } catch (err: any) {
        setImportError(isAr ? 'الملف تالف أو ليس بتنسيق JSON صالح' : 'Corrupted or invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = async () => {
    if (!importedFile) return;
    setIsRestoring(true);
    try {
      await onRestoreData(importedFile, restoreMode);
      if (onAddNotification) {
        onAddNotification(
          isAr ? 'تمت استعادة البيانات وتحديث الحساب بنجاح!' : 'Data restored successfully!',
          'success'
        );
      }
      setImportedFile(null);
      setImportFileName('');
      setStorageInfo(calculateStorageFootprint());
      onClose();
    } catch (e) {
      console.error(e);
      if (onAddNotification) {
        onAddNotification(isAr ? 'فشلت عملية استعادة البيانات' : 'Failed to restore data', 'error');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Creating Snapshot
  const handleTakeSnapshot = () => {
    setIsCreatingSnapshot(true);
    const title = newSnapshotTitle.trim() || (isAr ? `لقطة حفظ يدوية - ${new Date().toLocaleTimeString()}` : `Manual Snapshot - ${new Date().toLocaleTimeString()}`);
    const snap = createDataSnapshot(title, currentUser, posts, messages);
    setSnapshots(getSavedSnapshots());
    setNewSnapshotTitle('');
    setStorageInfo(calculateStorageFootprint());
    setIsCreatingSnapshot(false);
    if (onAddNotification) {
      onAddNotification(isAr ? 'تم إنشاء نقطة استعادة جديدة بنجاح!' : 'Snapshot created successfully!', 'success');
    }
  };

  // Handle Restoring a Snapshot from List
  const handleRestoreSnapshot = async (snap: DataSnapshot) => {
    if (!window.confirm(isAr ? `هل أنت متأكد من رغبتك في استعادة هذه النقطة ("${snap.title}")؟` : `Restore snapshot "${snap.title}"?`)) {
      return;
    }
    setIsRestoring(true);
    try {
      await onRestoreData(snap.data, 'replace');
      if (onAddNotification) {
        onAddNotification(isAr ? 'تمت استعادة نقطة الحفظ بنجاح!' : 'Snapshot restored successfully!', 'success');
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Cloud Sync trigger
  const handleTriggerCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      await onForceCloudSync();
      setLastSyncTime(new Date().toLocaleTimeString());
      if (onAddNotification) {
        onAddNotification(isAr ? 'تمت المزامنة السحابية مع السيرفر بنجاح!' : 'Cloud synchronization complete!', 'success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Handle Purge Cache
  const handleClearCache = () => {
    const res = clearAppCache();
    setStorageInfo(calculateStorageFootprint());
    if (onAddNotification) {
      onAddNotification(res.message, 'success');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-[#0b0a14] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase italic tracking-wider text-white flex items-center gap-2">
                <span>{isAr ? 'نظام حفظ واسترجاع البيانات' : 'Data Vault & Backup Manager'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono not-italic font-bold">
                  {isAr ? 'نشط ومشفر' : 'Secured'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {isAr ? 'النسخ الاحتياطي، التصدير، الاستعادة، وإدارة مساحة التخزين' : 'Full Backup, Restore, Snapshots & Storage Diagnostics'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Cloud Sync Banner */}
        <div className="px-6 py-3 bg-purple-950/20 border-b border-purple-500/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-white/80 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isAr ? 'حالة المزامنة السحابية:' : 'Cloud Sync Status:'}</span>
            <span className="text-emerald-400 font-bold">{isAr ? 'متصل ومحفوظ' : 'Connected & Synced'}</span>
            <span className="text-white/40 text-[10px]">({isAr ? 'آخر مزامنة' : 'Last'}: {lastSyncTime})</span>
          </div>

          <button
            type="button"
            onClick={handleTriggerCloudSync}
            disabled={isSyncingCloud}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isSyncingCloud ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة سحابية الآن' : 'Force Cloud Sync')}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-black/20 p-2 gap-1 overflow-x-auto justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? '1. تصدير وحفظ' : '1. Export Backup'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'restore'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isAr ? '2. استعادة واستيراد' : '2. Restore & Import'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snapshots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'snapshots'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? '3. نقاط الاسترجاع' : '3. Snapshots'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
              {snapshots.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>{isAr ? '4. الذاكرة والتخزين' : '4. Storage Usage'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EXPORT / BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Summary Stats Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">{isAr ? 'المستخدم' : 'User'}</span>
                  <div className="text-sm font-black text-purple-300 truncate mt-1">@{currentUser.handle}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">{isAr ? 'المنشورات' : 'Posts'}</span>
                  <div className="text-sm font-black text-white mt-1">{posts.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">{isAr ? 'الرسائل' : 'Messages'}</span>
                  <div className="text-sm font-black text-white mt-1">{messages.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">{isAr ? 'المحفوظات' : 'Saved'}</span>
                  <div className="text-sm font-black text-white mt-1">{currentUser.savedPostIds?.length || 0}</div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Full JSON Backup */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/30 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      {isAr ? 'نسخة احتياطية مشفرة كاملة (.JSON)' : 'Full Vault JSON Backup'}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {isAr 
                        ? 'تصدير شامل لجميع بيانات الحساب، المنشورات، الرسائل، الصور المحفوظة، والإعدادات في ملف جاهز للاسترجاع لاحقاً.'
                        : 'Export everything (profile, posts, direct messages, media and preferences) into a portable backup file.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAr ? 'تحميل النسخة الاحتياطية (.JSON)' : 'Download Backup File (.JSON)'}</span>
                  </button>
                </div>

                {/* Human-Readable Text Report */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      {isAr ? 'تقرير أرشيف بياناتي المقروء (.TXT)' : 'Human-Readable Archive Report'}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {isAr 
                        ? 'تقرير منسق ومقروء يوضح تفاصيل الحساب، المنشورات، التفاعلات، ومناسب للطباعة والاحتفاظ الشخصي.'
                        : 'A clean formatted text report of your profile, activities, and posts suitable for offline reading and printing.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportReport}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>{isAr ? 'تنزيل تقرير البيانات (.TXT)' : 'Download Text Report (.TXT)'}</span>
                  </button>
                </div>
              </div>

              {/* Security Note */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-400 space-y-1">
                  <p className="font-bold text-white">
                    {isAr ? 'حماية وخصوصية البيانات 100%' : '100% Client-Authoritative Security'}
                  </p>
                  <p>
                    {isAr 
                      ? 'يتم تشفير وتوليد ملفات النسخ الاحتياطي محلياً وبشكل مباشر من متصفحك. لا يتم مشاركة بياناتك السرية مع أي طرف خارجي.'
                      : 'Backups are generated and validated directly within your local vault sandbox.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTORE & IMPORT */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDraggingFile 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/20 hover:border-purple-500/50 bg-white/[0.01] hover:bg-white/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {importFileName ? importFileName : (isAr ? 'اسحب وأفلت ملف النسخة الاحتياطية (.JSON) هنا' : 'Drag & drop your backup .JSON file here')}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {isAr ? 'أو انقر لاختيار الملف من جهازك' : 'or click to browse from device'}
                  </p>
                </div>
              </div>

              {/* Error Box */}
              {importError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Validated Backup Preview & Controls */}
              {importedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'تم التحقق من سلامة الملف بنجاح' : 'Backup Validated Successfully'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      ID: {importedFile.metadata.checksum || 'N/A'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-zinc-400 block">{isAr ? 'صاحب الحساب' : 'User'}</span>
                      <span className="font-bold text-white">@{importedFile.user.handle}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-zinc-400 block">{isAr ? 'المنشورات' : 'Posts'}</span>
                      <span className="font-bold text-white">{importedFile.posts?.length || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-zinc-400 block">{isAr ? 'تاريخ النسخة' : 'Date'}</span>
                      <span className="font-bold text-white">{new Date(importedFile.metadata.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Restore Mode Selection */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                      {isAr ? 'اختر طريقة الاستعادة:' : 'Select Restore Mode:'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRestoreMode('merge')}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-1 cursor-pointer ${
                          restoreMode === 'merge'
                            ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                            : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{isAr ? '🔄 دمج ذكي (Smart Merge)' : '🔄 Smart Merge'}</span>
                          {restoreMode === 'merge' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                        <span className="text-[10px] font-normal text-zinc-400">
                          {isAr ? 'دمج المنشورات والبيانات دون مسح السجلات الحالية' : 'Merge new items without deleting existing data'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRestoreMode('replace')}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-1 cursor-pointer ${
                          restoreMode === 'replace'
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                            : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{isAr ? '⚡ استبدال كامل (Full Overwrite)' : '⚡ Full Overwrite'}</span>
                          {restoreMode === 'replace' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <span className="text-[10px] font-normal text-zinc-400">
                          {isAr ? 'استبدال الحساب والمنشورات بالنسخة المحفوظة بالكامل' : 'Completely overwrite current state with backup'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteRestore}
                    disabled={isRestoring}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isRestoring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري تطبيق الاستعادة...' : 'Restoring Vault...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{isAr ? 'تأكيد واستعادة البيانات الآن' : 'Confirm & Restore Vault Now'}</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 3: SNAPSHOTS (TIME MACHINE) */}
          {activeTab === 'snapshots' && (
            <div className="space-y-6">
              {/* Take Instant Snapshot */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="text"
                  value={newSnapshotTitle}
                  onChange={(e) => setNewSnapshotTitle(e.target.value)}
                  placeholder={isAr ? 'اسم نقطة الاستعادة (مثال: قبل تعديل المنشورات)...' : 'Snapshot title (e.g. Before profile edit)...'}
                  className="flex-1 w-full bg-white/5 border border-white/10 h-11 rounded-xl px-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 font-sans"
                />
                <button
                  type="button"
                  onClick={handleTakeSnapshot}
                  disabled={isCreatingSnapshot}
                  className="w-full sm:w-auto px-5 h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{isAr ? 'إنشاء نقطة استعادة فورية' : 'Create Snapshot'}</span>
                </button>
              </div>

              {/* Snapshots List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>{isAr ? 'نقاط الحفظ السابقة (Time Machine):' : 'Saved Restore Points:'}</span>
                  <span>{snapshots.length} {isAr ? 'نقطة مسجلة' : 'points recorded'}</span>
                </div>

                {snapshots.length === 0 ? (
                  <div className="py-12 text-center space-y-3 border border-dashed border-white/10 rounded-2xl">
                    <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">{isAr ? 'لا توجد نقاط استرجاع مسجلة حالياً' : 'No snapshots recorded yet'}</p>
                  </div>
                ) : (
                  snapshots.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-500/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{s.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-purple-300 font-mono">
                            {s.postCount} {isAr ? 'منشور' : 'posts'}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-3">
                          <span>{new Date(s.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span>{Math.round(s.sizeBytes / 1024)} KB</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot(s)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{isAr ? 'استعادة' : 'Restore'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSnapshots(deleteSnapshot(s.id))}
                          className="p-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 rounded-xl transition-all cursor-pointer"
                          title={isAr ? 'حذف هذه النقطة' : 'Delete snapshot'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STORAGE USAGE & CACHE MANAGER */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              {/* Storage Gauge */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">{isAr ? 'المساحة المستخدمة في التخزين المحلي:' : 'Local Vault Storage Used:'}</span>
                  <span className="font-bold text-purple-400">{storageInfo.totalFormatted} ({storageInfo.approximatePercentage}% of quota)</span>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.max(5, storageInfo.approximatePercentage)}%` }}
                  />
                </div>
              </div>

              {/* Storage Breakdown Details */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  {isAr ? 'تفاصيل استهلاك البيانات:' : 'Storage Allocation Breakdown:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(storageInfo.breakdown).map(([key, item]) => {
                    const itemData = item as { bytes: number; formatted: string };
                    return (
                      <div key={key} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <span className="text-zinc-400 font-mono truncate max-w-[180px]">{key}</span>
                        <span className="font-bold text-white font-mono">{itemData.formatted}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clean Cache Action */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-amber-300">
                    {isAr ? 'تنظيف الذاكرة المؤقتة (Clear Cache)' : 'Purge Temporary Cache'}
                  </h5>
                  <p className="text-[11px] text-zinc-400">
                    {isAr ? 'حذف السجلات المؤقتة والمسودات دون التأثير على حسابك أو منشوراتك.' : 'Clears temporary cache and diagnostic logs safely.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تنظيف الآن' : 'Clear Cache'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
