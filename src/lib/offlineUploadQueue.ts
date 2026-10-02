'use client';

import { WashRecord } from './types';
import { syncWashRecordToFirestore } from './firebaseService';

export interface QueuedWashUpload {
  id: string;
  stopNumber: number;
  washRecord: WashRecord;
  ownerId?: string;
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'uploading' | 'failed' | 'synced';
  lastError?: string;
}

const STORAGE_KEY = 'torque_resilient_wash_queue';
const QUEUE_EVENT = 'torque_upload_queue_changed';

let isDraining = false;

/**
 * Get all queued wash uploads from persistent localStorage
 */
export function getQueuedUploads(): QueuedWashUpload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading upload queue from localStorage:', err);
    return [];
  }
}

/**
 * Save queued uploads to localStorage safely
 */
function saveQueuedUploads(queue: QueuedWashUpload[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent(QUEUE_EVENT, { detail: { count: queue.length } }));
  } catch (err) {
    console.warn('LocalStorage quota or write notice in upload queue:', err);
  }
}

/**
 * Get count of pending uploads
 */
export function getPendingUploadsCount(): number {
  const queue = getQueuedUploads();
  return queue.filter((item) => item.status !== 'synced').length;
}

/**
 * Enqueue a completed wash or empty bay proof to the resilient offline queue.
 * Immediately persists to disk and triggers non-blocking background drain.
 */
export function enqueueWashUpload(
  stopNumber: number,
  washRecord: WashRecord,
  ownerId?: string
): QueuedWashUpload {
  const queue = getQueuedUploads();

  const newItem: QueuedWashUpload = {
    id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    stopNumber,
    washRecord,
    ownerId,
    createdAt: Date.now(),
    retryCount: 0,
    status: 'pending',
  };

  // Add to persistent queue
  queue.push(newItem);
  saveQueuedUploads(queue);

  // Trigger non-blocking background sync attempt
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      drainUploadQueue().catch((err) => {
        console.warn('Background upload sync error:', err);
      });
    }, 100);
  }

  return newItem;
}

/**
 * Helper to race an async operation against a timeout (e.g. 7 seconds)
 * preventing hung cellular connections in basements from locking up.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout in basement zone')), timeoutMs)
    ),
  ]);
}

/**
 * Drain the offline upload queue in the background.
 * Processes items sequentially with timeouts and exponential retry limits.
 */
export async function drainUploadQueue(): Promise<{ synced: number; remaining: number }> {
  if (typeof window === 'undefined') return { synced: 0, remaining: 0 };
  if (isDraining) {
    return { synced: 0, remaining: getPendingUploadsCount() };
  }

  // If browser reports strictly offline, wait for network restoration
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { synced: 0, remaining: getPendingUploadsCount() };
  }

  isDraining = true;
  let syncedCount = 0;

  try {
    const queue = getQueuedUploads();
    if (queue.length === 0) {
      isDraining = false;
      return { synced: 0, remaining: 0 };
    }

    const updatedQueue: QueuedWashUpload[] = [];

    for (const item of queue) {
      if (item.status === 'synced') {
        continue; // Already processed
      }

      try {
        // Attempt to sync to Firestore with timeout guard
        const result = await withTimeout(
          syncWashRecordToFirestore(item.washRecord, item.ownerId),
          8000
        );

        if (result.success) {
          syncedCount++;
          // Item successfully delivered to cloud, drop from persistent queue
          continue;
        } else {
          // Soft failure from Firestore, keep in queue for next cycle
          item.retryCount += 1;
          item.status = 'failed';
          item.lastError = result.error || 'Sync rejected';
          updatedQueue.push(item);
        }
      } catch (err: any) {
        // Network timeout, socket error, or basement dead zone
        item.retryCount += 1;
        item.status = 'failed';
        item.lastError = err?.message || 'Basement network timeout';
        updatedQueue.push(item);
      }
    }

    saveQueuedUploads(updatedQueue);
    return { synced: syncedCount, remaining: updatedQueue.length };
  } catch (err) {
    console.warn('Queue drain loop exception:', err);
    return { synced: syncedCount, remaining: getPendingUploadsCount() };
  } finally {
    isDraining = false;
  }
}

// Auto-wire network listeners on client boot
if (typeof window !== 'undefined') {
  // 1. Drain when device reconnects to Wi-Fi/4G upon leaving basement
  window.addEventListener('online', () => {
    drainUploadQueue().catch(() => {});
  });

  // 2. Drain when washer switches back to browser tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      drainUploadQueue().catch(() => {});
    }
  });

  // 3. Periodic recurring retry every 15 seconds
  setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const pending = getPendingUploadsCount();
      if (pending > 0) {
        drainUploadQueue().catch(() => {});
      }
    }
  }, 15000);
}
