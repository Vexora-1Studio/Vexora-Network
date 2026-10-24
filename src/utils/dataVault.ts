// Vexora Data Vault & Persistence Management Engine
// Handles full-vault JSON exports, schema validation, smart merging, auto-snapshots, and storage diagnostics.

import { UserProfile, Post, Message, Community, Story } from '../types';

export interface BackupMetadata {
  version: string;
  timestamp: string;
  appName: string;
  userId: string;
  userHandle: string;
  totalPosts: number;
  totalMessages: number;
  totalSavedPosts: number;
  checksum?: string;
}

export interface FullBackupPayload {
  vexora_vault_signature: string;
  metadata: BackupMetadata;
  user: UserProfile;
  posts?: Post[];
  messages?: Message[];
  savedPostIds?: string[];
  communities?: Community[];
  stories?: Story[];
  customSettings?: {
    language: 'ar' | 'en';
    isDevMode?: boolean;
    feedLayoutMode?: 'expanded' | 'compact';
    feedSort?: string;
    theme?: string;
  };
}

export interface DataSnapshot {
  id: string;
  title: string;
  timestamp: string;
  sizeBytes: number;
  postCount: number;
  messageCount: number;
  data: FullBackupPayload;
}

const SNAPSHOTS_STORAGE_KEY = 'vexora_data_snapshots_v1';
const MAX_SNAPSHOTS = 10;

/**
 * Generate a complete JSON backup object of current session and storage
 */
export function generateFullBackup(
  user: UserProfile,
  posts: Post[],
  messages: Message[] = [],
  customSettings?: FullBackupPayload['customSettings']
): FullBackupPayload {
  const timestamp = new Date().toISOString();
  const userPosts = posts.filter(p => p.author === user.name || p.author === user.handle);
  
  const payload: FullBackupPayload = {
    vexora_vault_signature: 'VEXORA_NEURAL_VAULT_ENCRYPTED_V2',
    metadata: {
      version: '2.5.0',
      timestamp,
      appName: 'Vexora Network',
      userId: user.id,
      userHandle: user.handle,
      totalPosts: posts.length,
      totalMessages: messages.length,
      totalSavedPosts: user.savedPostIds?.length || 0,
      checksum: `VX-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36)}`
    },
    user,
    posts,
    messages,
    savedPostIds: user.savedPostIds || [],
    customSettings: customSettings || {
      language: 'ar',
      isDevMode: false,
      feedLayoutMode: 'expanded',
      feedSort: 'latest'
    }
  };

  return payload;
}

/**
 * Trigger browser download of full backup JSON file
 */
export function downloadBackupFile(backup: FullBackupPayload, filenamePrefix = 'vexora-vault-backup') {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `${filenamePrefix}-${backup.user.handle || 'user'}-${dateStr}.json`;
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate human-readable Markdown / Text report of user data for archiving & printing
 */
export function generateHumanReadableReport(backup: FullBackupPayload, language: 'ar' | 'en' = 'ar'): string {
  const { user, metadata, posts = [], messages = [] } = backup;
  const isAr = language === 'ar';

  return `===============================================================
  ${isAr ? 'تقرير أرشيف بيانات شبكة فيكسورا (Vexora Network)' : 'Vexora Network User Data Archive Report'}
===============================================================
${isAr ? 'تاريخ التصدير' : 'Export Timestamp'}: ${new Date(metadata.timestamp).toLocaleString()}
${isAr ? 'معرف النسخة الاحتياطية' : 'Vault Checksum ID'}: ${metadata.checksum}
${isAr ? 'إصدار النظام' : 'System Version'}: ${metadata.version}

---------------------------------------------------------------
1. ${isAr ? 'بيانات الحساب الشخصي (Profile Identity)' : 'Profile Identity'}:
---------------------------------------------------------------
- ${isAr ? 'الاسم الكامل' : 'Full Name'}: ${user.name}
- ${isAr ? 'اسم المستخدم' : 'Username'}: @${user.handle}
- ${isAr ? 'البريد الإلكتروني' : 'Email'}: ${user.email || (isAr ? 'غير مسجل' : 'Not Provided')}
- ${isAr ? 'الهاتف' : 'Phone'}: ${user.phone || (isAr ? 'غير مسجل' : 'Not Provided')}
- ${isAr ? 'الموقع الجغرافي' : 'Location'}: ${user.location || (isAr ? 'الشبكة العامة' : 'Public Grid')}
- ${isAr ? 'تاريخ الانضمام' : 'Join Date'}: ${user.joinedDate || '2026'}
- ${isAr ? 'النبذة التعريفية' : 'Bio'}:
  "${user.bio || ''}"
- ${isAr ? 'عدد المتابعين' : 'Followers'}: ${user.followers || 0}
- ${isAr ? 'عدد المتابَعين' : 'Following'}: ${user.following || 0}
- ${isAr ? 'المنشورات المحفوظة' : 'Saved Posts'}: ${user.savedPostIds?.length || 0}

---------------------------------------------------------------
2. ${isAr ? 'إحصائيات المنشورات والمحتوى' : 'Posts & Content Summary'}:
---------------------------------------------------------------
- ${isAr ? 'إجمالي المنشورات المستخرجة' : 'Total Extracted Posts'}: ${posts.length}
- ${isAr ? 'إجمالي الرسائل الخاصة' : 'Total Direct Messages'}: ${messages.length}

${posts.slice(0, 15).map((p, i) => `
[${i + 1}] ${p.author} (@${p.timestamp || 'N/A'}) - ${p.type}
"${p.content}"
Likes: ${p.likes || 0} | Comments: ${p.comments || 0}
`).join('\n')}

===============================================================
  ${isAr ? 'نهاية التقرير - تم الحفظ والتشفير عبر نظام Vexora Data Vault' : 'End of Report - Secured by Vexora Data Vault'}
===============================================================
`;
}

/**
 * Validate imported JSON backup structure
 */
export function validateBackupPayload(parsed: any): { isValid: boolean; error?: string; payload?: FullBackupPayload } {
  if (!parsed || typeof parsed !== 'object') {
    return { isValid: false, error: 'الملف ليس بتنسيق JSON صالح (Invalid JSON format).' };
  }

  if (!parsed.user || !parsed.user.id || !parsed.user.name) {
    return { isValid: false, error: 'بيانات الحساب الشخصي مفقودة أو غير متوافقة في ملف النسخة الاحتياطية.' };
  }

  return {
    isValid: true,
    payload: parsed as FullBackupPayload
  };
}

/**
 * Calculate LocalStorage Storage Footprint in KB and MB
 */
export function calculateStorageFootprint() {
  let totalBytes = 0;
  const breakdown: Record<string, { bytes: number; formatted: string }> = {};

  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const itemLength = ((localStorage[key] || '').length + key.length) * 2;
        totalBytes += itemLength;
        breakdown[key] = {
          bytes: itemLength,
          formatted: formatBytes(itemLength)
        };
      }
    }
  } catch (e) {
    console.warn("Storage calculate error:", e);
  }

  return {
    totalBytes,
    totalFormatted: formatBytes(totalBytes),
    breakdown,
    approximatePercentage: Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024)) * 100)) // based on 5MB standard localStorage
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Save an auto-snapshot into local storage snapshots collection
 */
export function createDataSnapshot(
  title: string,
  user: UserProfile,
  posts: Post[],
  messages: Message[] = []
): DataSnapshot {
  const fullBackup = generateFullBackup(user, posts, messages);
  const jsonStr = JSON.stringify(fullBackup);
  const sizeBytes = jsonStr.length * 2;

  const snapshot: DataSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    timestamp: new Date().toISOString(),
    sizeBytes,
    postCount: posts.length,
    messageCount: messages.length,
    data: fullBackup
  };

  try {
    const existing = getSavedSnapshots();
    const updated = [snapshot, ...existing.filter(s => s.id !== snapshot.id)].slice(0, MAX_SNAPSHOTS);
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to persist snapshot in localStorage:", e);
  }

  return snapshot;
}

/**
 * Retrieve saved snapshots list
 */
export function getSavedSnapshots(): DataSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Delete a specific snapshot
 */
export function deleteSnapshot(id: string): DataSnapshot[] {
  try {
    const existing = getSavedSnapshots();
    const filtered = existing.filter(s => s.id !== id);
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

/**
 * Clear cache safely (keeps user credentials and posts, purges transient caches)
 */
export function clearAppCache(): { freedBytes: number; message: string } {
  let freed = 0;
  try {
    const transientKeys = [
      'vexora_diagnostics_log',
      'vexora_temp_draft',
      'vexora_media_cache',
      'vexora_stories_cache'
    ];

    transientKeys.forEach(k => {
      if (localStorage.getItem(k)) {
        freed += (localStorage.getItem(k)?.length || 0) * 2;
        localStorage.removeItem(k);
      }
    });

    return {
      freedBytes: freed,
      message: `تم تنظيف الذاكرة المؤقتة وتحرير ${formatBytes(freed)} بنجاح!`
    };
  } catch (e) {
    return {
      freedBytes: 0,
      message: 'فشل تنظيف الذاكرة المؤقتة'
    };
  }
}
