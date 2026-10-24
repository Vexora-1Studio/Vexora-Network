/**
 * Video Storage Utility
 * Manages storing and retrieving the original Vexora_Network_Ad.mp4 video file
 * using IndexedDB for instant, zero-latency local playback, while synchronizing
 * with the server-side backend (/api/video/upload).
 */

const DB_NAME = "vexora_video_vault";
const STORE_NAME = "ad_videos";
const VIDEO_KEY = "official_ad_video";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeVideoInIndexedDB(file: Blob, name: string): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put({ blob: file, name, timestamp: Date.now() }, VIDEO_KEY);
    putReq.onsuccess = () => {
      const blobUrl = URL.createObjectURL(file);
      // Dispatch custom event so all video components update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vexora-video-updated", { detail: { blobUrl, name } }));
      }
      resolve(blobUrl);
    };
    putReq.onerror = () => reject(putReq.error);
  });
}

export async function getStoredVideoBlobUrl(): Promise<{ blobUrl: string | null; name?: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(VIDEO_KEY);
      getReq.onsuccess = () => {
        const data = getReq.result;
        if (data && data.blob) {
          const blobUrl = URL.createObjectURL(data.blob);
          resolve({ blobUrl, name: data.name });
        } else {
          resolve({ blobUrl: null });
        }
      };
      getReq.onerror = () => resolve({ blobUrl: null });
    });
  } catch {
    return { blobUrl: null };
  }
}

export async function uploadVideoToServer(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Read as base64 to ensure seamless JSON transmission without multipart dependencies
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch("/api/video/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64,
              fileName: file.name || "Vexora_Network_Ad.mp4",
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            resolve({ success: true, url: data.url });
          } else {
            resolve({ success: false, error: data.error || "Upload failed" });
          }
        } catch (err: any) {
          resolve({ success: false, error: err.message || "Network error" });
        }
      };
      reader.onerror = () => resolve({ success: false, error: "Failed to read file" });
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
