import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ClientAccount, ScreenDevice, MediaItem, ScheduleItem, InquiryRequest, RealtimeSyncMessage } from '../types';

// Error Handler Conforming to Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Clean object to avoid undefined fields in Firestore
function cleanForFirestore(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        cleaned[key] = cleanForFirestore(val);
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

const STORAGE_KEYS = {
  ACCOUNTS: 'tamy_accounts_v3',
  SCREENS: 'tamy_screens_v3',
  MEDIA: 'tamy_media_v3',
  SCHEDULES: 'tamy_schedules_v3',
  INQUIRIES: 'tamy_inquiries_v3',
  ADMIN_SESSION: 'tamy_admin_session_v3',
  CLIENT_SESSION: 'tamy_client_session_v3',
  SAVED_SCREEN: 'tamy_saved_screen_code_v3',
  CLOUD_STATUS: 'tamy_cloud_status_v3',
};

// ---------------------------------------------------------------------------
// 1. IndexedDB Helper for High-Capacity Offline Storage (Images, Videos, Large Lists)
// ---------------------------------------------------------------------------
const IDB_NAME = 'tamy_offline_store_v3';
const IDB_STORE = 'tamy_data';

function openIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSave(key: string, val: any): Promise<void> {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(val, key);
  } catch (e) {
    // IDB save failure ignored silently
  }
}

async function idbLoad<T>(key: string): Promise<T | null> {
  try {
    const db = await openIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbClear(): Promise<void> {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
  } catch {}
}

// ---------------------------------------------------------------------------
// 2. In-Memory Cache (Guarantees Instant Sync Return without Quota Exceptions)
// ---------------------------------------------------------------------------
const memoryCache: {
  accounts: ClientAccount[] | null;
  screens: ScreenDevice[] | null;
  media: MediaItem[] | null;
  schedules: ScheduleItem[] | null;
  inquiries: InquiryRequest[] | null;
} = {
  accounts: null,
  screens: null,
  media: null,
  schedules: null,
  inquiries: null,
};

// Initial synchronous load from localStorage with full try/catch protection
if (typeof window !== 'undefined') {
  try {
    const acc = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (acc) memoryCache.accounts = JSON.parse(acc);
  } catch {}

  try {
    const scr = localStorage.getItem(STORAGE_KEYS.SCREENS);
    if (scr) memoryCache.screens = JSON.parse(scr);
  } catch {}

  try {
    const med = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (med) memoryCache.media = JSON.parse(med);
  } catch {}

  try {
    const sch = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (sch) memoryCache.schedules = JSON.parse(sch);
  } catch {}

  try {
    const inq = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (inq) memoryCache.inquiries = JSON.parse(inq);
  } catch {}

  // Asynchronously rehydrate from IndexedDB in case localStorage was previously full
  idbLoad<MediaItem[]>(STORAGE_KEYS.MEDIA).then((stored) => {
    if (stored && Array.isArray(stored) && stored.length > 0) {
      if (!memoryCache.media || stored.length >= memoryCache.media.length) {
        memoryCache.media = stored;
      }
    }
  });

  idbLoad<ScheduleItem[]>(STORAGE_KEYS.SCHEDULES).then((stored) => {
    if (stored && Array.isArray(stored) && stored.length > 0) {
      if (!memoryCache.schedules || stored.length >= memoryCache.schedules.length) {
        memoryCache.schedules = stored;
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 3. Safe LocalStorage Writer (Catches QuotaExceededError & Prevents Crashing)
// ---------------------------------------------------------------------------
function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    const isQuotaError = 
      e?.name === 'QuotaExceededError' || 
      e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
      e?.code === 22 || 
      e?.code === 1014 ||
      (e?.message && typeof e.message === 'string' && e.message.toLowerCase().includes('quota'));

    if (isQuotaError) {
      console.warn(`[StorageService] localStorage quota reached for '${key}'. Safely falling back to Memory + IndexedDB.`);
      // If media key overflows, try keeping only lightweight items in localStorage
      if (key === STORAGE_KEYS.MEDIA) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const lightweight = parsed.map((m: MediaItem) => ({
              ...m,
              url: m.url?.startsWith('data:') ? '[idb_stored_asset]' : m.url,
            }));
            localStorage.setItem(key, JSON.stringify(lightweight));
          }
        } catch {
          // If still overflowing, remove from localStorage to free space
          try {
            localStorage.removeItem(key);
          } catch {}
        }
      } else if (key === STORAGE_KEYS.SCHEDULES) {
        // Remove overflowing key from localStorage; memory and IDB preserve data safely
        try {
          localStorage.removeItem(key);
        } catch {}
      }
    }
  }
}

// Cross-tab broadcast channel for instantaneous zero-latency local dispatch
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('tamy_cloud_sync_bus');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

// In-memory runtime state populated from Firestore
let isFirestoreInitialized = false;

export const StorageService = {
  // Initialize Cloud Realtime Listeners
  initCloudSync(): void {
    if (isFirestoreInitialized || typeof window === 'undefined') return;
    isFirestoreInitialized = true;

    try {
      // 1. Listen to Accounts
      const accountsColl = collection(db, 'accounts');
      onSnapshot(accountsColl, (snapshot) => {
        const cloudAccounts: ClientAccount[] = [];
        snapshot.forEach((docSnap) => {
          cloudAccounts.push(docSnap.data() as ClientAccount);
        });

        if (cloudAccounts.length > 0) {
          memoryCache.accounts = cloudAccounts;
          safeSetItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(cloudAccounts));
          idbSave(STORAGE_KEYS.ACCOUNTS, cloudAccounts);
          this.broadcast({
            type: 'SCREEN_REFRESH',
            timestamp: Date.now(),
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'accounts');
      });

      // 2. Listen to Screens
      const screensColl = collection(db, 'screens');
      onSnapshot(screensColl, (snapshot) => {
        const cloudScreens: ScreenDevice[] = [];
        snapshot.forEach((docSnap) => {
          cloudScreens.push(docSnap.data() as ScreenDevice);
        });

        if (cloudScreens.length > 0) {
          memoryCache.screens = cloudScreens;
          safeSetItem(STORAGE_KEYS.SCREENS, JSON.stringify(cloudScreens));
          idbSave(STORAGE_KEYS.SCREENS, cloudScreens);
          this.broadcast({
            type: 'SCREEN_REFRESH',
            timestamp: Date.now(),
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'screens');
      });

      // 3. Listen to Media
      const mediaColl = collection(db, 'media');
      onSnapshot(mediaColl, (snapshot) => {
        const cloudMedia: MediaItem[] = [];
        snapshot.forEach((docSnap) => {
          cloudMedia.push(docSnap.data() as MediaItem);
        });

        if (cloudMedia.length > 0) {
          memoryCache.media = cloudMedia;
          safeSetItem(STORAGE_KEYS.MEDIA, JSON.stringify(cloudMedia));
          idbSave(STORAGE_KEYS.MEDIA, cloudMedia);
          this.broadcast({
            type: 'SCREEN_REFRESH',
            timestamp: Date.now(),
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'media');
      });

      // 4. Listen to Schedules
      const schedulesColl = collection(db, 'schedules');
      onSnapshot(schedulesColl, (snapshot) => {
        const cloudSchedules: ScheduleItem[] = [];
        snapshot.forEach((docSnap) => {
          cloudSchedules.push(docSnap.data() as ScheduleItem);
        });

        if (cloudSchedules.length > 0) {
          memoryCache.schedules = cloudSchedules;
          safeSetItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(cloudSchedules));
          idbSave(STORAGE_KEYS.SCHEDULES, cloudSchedules);
          this.broadcast({
            type: 'SCHEDULE_UPDATED',
            timestamp: Date.now(),
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'schedules');
      });

      // 5. Listen to Inquiries (Contact Requests & Subscription Interests)
      const inquiriesColl = collection(db, 'inquiries');
      onSnapshot(inquiriesColl, (snapshot) => {
        const cloudInquiries: InquiryRequest[] = [];
        snapshot.forEach((docSnap) => {
          cloudInquiries.push(docSnap.data() as InquiryRequest);
        });

        if (cloudInquiries.length > 0) {
          memoryCache.inquiries = cloudInquiries;
          safeSetItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(cloudInquiries));
          idbSave(STORAGE_KEYS.INQUIRIES, cloudInquiries);
          this.broadcast({
            type: 'INQUIRIES_UPDATED',
            timestamp: Date.now(),
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'inquiries');
      });

    } catch (e) {
      console.error('Failed to initialize Firestore realtime listeners', e);
    }
  },

  // --- ACCOUNTS ---
  getAccounts(): ClientAccount[] {
    let list: ClientAccount[] = [];
    if (memoryCache.accounts && Array.isArray(memoryCache.accounts)) {
      list = memoryCache.accounts;
    } else {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        if (data) {
          list = JSON.parse(data);
          memoryCache.accounts = list;
        }
      } catch {}
    }

    // Ensure any account missing subscription fields gets standardized defaults
    let hasMigration = false;
    const normalized = list.map(acc => {
      if (!acc.subscriptionExpiresAt) {
        hasMigration = true;
        const base = acc.createdAt ? new Date(acc.createdAt).getTime() : Date.now();
        const days = acc.subscriptionDays || 30;
        const expires = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
        return {
          ...acc,
          subscriptionDays: days,
          subscriptionExpiresAt: expires,
          subscriptionStartedAt: acc.createdAt || new Date().toISOString(),
        };
      }
      return acc;
    });

    if (hasMigration && normalized.length > 0) {
      memoryCache.accounts = normalized;
      safeSetItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(normalized));
    }

    return normalized;
  },

  getAccountById(id: string): ClientAccount | undefined {
    return this.getAccounts().find(a => a.id === id);
  },

  isAccountExpired(account?: ClientAccount): boolean {
    if (!account) return true;
    if (account.status === 'suspended') return true;
    if (!account.subscriptionExpiresAt) return false;
    return new Date(account.subscriptionExpiresAt).getTime() < Date.now();
  },

  getSubscriptionRemainingDays(account?: ClientAccount): number {
    if (!account || !account.subscriptionExpiresAt) return 0;
    const expiryTime = new Date(account.subscriptionExpiresAt).getTime();
    const nowTime = Date.now();
    return Math.ceil((expiryTime - nowTime) / (1000 * 60 * 60 * 24));
  },

  extendAccountSubscription(
    accountId: string,
    options: { days?: number; targetDate?: string }
  ): ClientAccount | null {
    const account = this.getAccountById(accountId);
    if (!account) return null;

    let newExpiresAt: string;
    let newDays: number;

    if (options.targetDate) {
      // Direct specific target date (YYYY-MM-DD)
      const parts = options.targetDate.split('-');
      let targetObj: Date;
      if (parts.length === 3) {
        targetObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
      } else {
        targetObj = new Date(options.targetDate);
        targetObj.setHours(23, 59, 59, 999);
      }
      newExpiresAt = targetObj.toISOString();
      const diffDays = Math.max(1, Math.ceil((targetObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      newDays = diffDays;
    } else if (options.days && options.days > 0) {
      const isExpired = this.isAccountExpired(account);
      let baseTime: number;
      if (isExpired || !account.subscriptionExpiresAt) {
        // Start counting from now if expired
        baseTime = Date.now();
      } else {
        // Extend existing active date
        baseTime = new Date(account.subscriptionExpiresAt).getTime();
      }
      const targetTime = baseTime + options.days * 24 * 60 * 60 * 1000;
      const targetDate = new Date(targetTime);
      targetDate.setHours(23, 59, 59, 999);
      newExpiresAt = targetDate.toISOString();
      newDays = (account.subscriptionDays || 0) + options.days;
    } else {
      return account;
    }

    const updated: ClientAccount = {
      ...account,
      subscriptionExpiresAt: newExpiresAt,
      subscriptionDays: newDays,
      status: 'active', // Reactivate account automatically upon extension
    };

    return this.saveAccount(updated);
  },

  saveAccount(account: ClientAccount): ClientAccount {
    const accounts = [...this.getAccounts()];
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }

    memoryCache.accounts = accounts;
    safeSetItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    idbSave(STORAGE_KEYS.ACCOUNTS, accounts);

    this.broadcast({
      type: 'SCREEN_REFRESH',
      accountId: account.id,
      timestamp: Date.now(),
    });

    // Asynchronously persist to Cloud Firestore
    const docRef = doc(db, 'accounts', account.id);
    setDoc(docRef, cleanForFirestore(account)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `accounts/${account.id}`);
    });

    return account;
  },

  deleteAccount(id: string): boolean {
    const accounts = this.getAccounts().filter(a => a.id !== id);
    memoryCache.accounts = accounts;
    safeSetItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    idbSave(STORAGE_KEYS.ACCOUNTS, accounts);

    const screens = this.getScreens().filter(s => s.accountId !== id);
    memoryCache.screens = screens;
    safeSetItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
    idbSave(STORAGE_KEYS.SCREENS, screens);

    // Cloud Firestore Delete
    deleteDoc(doc(db, 'accounts', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `accounts/${id}`);
    });

    return true;
  },

  // --- SCREENS ---
  getScreens(accountId?: string): ScreenDevice[] {
    let list: ScreenDevice[] = [];
    if (memoryCache.screens && Array.isArray(memoryCache.screens)) {
      list = memoryCache.screens;
    } else {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.SCREENS);
        if (data) {
          list = JSON.parse(data);
          memoryCache.screens = list;
        }
      } catch {}
    }

    if (accountId) {
      return list.filter(s => s.accountId === accountId);
    }
    return list;
  },

  getScreenById(idOrCode: string): ScreenDevice | undefined {
    const screens = this.getScreens();
    return screens.find(s => s.id === idOrCode || s.code.toLowerCase() === idOrCode.toLowerCase());
  },

  saveScreen(screen: ScreenDevice): { success: boolean; error?: string; screen?: ScreenDevice } {
    const account = this.getAccountById(screen.accountId);
    const screens = [...this.getScreens()];
    const existingIndex = screens.findIndex(s => s.id === screen.id);

    // Enforce quota limit
    if (existingIndex === -1 && account) {
      const currentScreensCount = screens.filter(s => s.accountId === screen.accountId).length;
      if (currentScreensCount >= account.maxScreens) {
        return {
          success: false,
          error: `تم الوصول للحد الأقصى لعدد الشاشات المسموح بها لهذا الحساب (${account.maxScreens} شاشات). يرجى ترقية الحساب من لوحة الإدارة.`,
        };
      }
    }

    if (existingIndex >= 0) {
      screens[existingIndex] = screen;
    } else {
      screens.push(screen);
    }

    memoryCache.screens = screens;
    safeSetItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
    idbSave(STORAGE_KEYS.SCREENS, screens);

    this.broadcast({
      type: 'SCREEN_REFRESH',
      screenId: screen.id,
      accountId: screen.accountId,
      timestamp: Date.now(),
    });

    // Asynchronously persist to Cloud Firestore
    const docRef = doc(db, 'screens', screen.id);
    setDoc(docRef, cleanForFirestore(screen)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `screens/${screen.id}`);
    });

    return { success: true, screen };
  },

  deleteScreen(screenId: string): boolean {
    const screens = this.getScreens().filter(s => s.id !== screenId);
    memoryCache.screens = screens;
    safeSetItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
    idbSave(STORAGE_KEYS.SCREENS, screens);

    const schedules = this.getSchedules().filter(sch => sch.screenId !== screenId);
    memoryCache.schedules = schedules;
    safeSetItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    idbSave(STORAGE_KEYS.SCHEDULES, schedules);

    this.broadcast({
      type: 'SCREEN_REFRESH',
      screenId,
      timestamp: Date.now(),
    });

    // Cloud Firestore Delete
    deleteDoc(doc(db, 'screens', screenId)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `screens/${screenId}`);
    });

    return true;
  },

  pingScreen(screenId: string): void {
    const screens = [...this.getScreens()];
    const screen = screens.find(s => s.id === screenId || s.code.toLowerCase() === screenId.toLowerCase());
    if (screen) {
      screen.lastPing = new Date().toISOString();
      screen.status = 'online';

      memoryCache.screens = screens;
      safeSetItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));

      this.broadcast({
        type: 'HEARTBEAT',
        screenId: screen.id,
        timestamp: Date.now(),
      });

      // Update Firestore heartbeat online status
      const docRef = doc(db, 'screens', screen.id);
      updateDoc(docRef, {
        lastPing: screen.lastPing,
        status: 'online',
      }).catch(() => {
        // If doc does not exist yet, ignore
      });
    }
  },

  // --- MEDIA ---
  getMedia(accountId?: string): MediaItem[] {
    let list: MediaItem[] = [];
    if (memoryCache.media && Array.isArray(memoryCache.media)) {
      list = memoryCache.media;
    } else {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
        if (data) {
          list = JSON.parse(data);
          memoryCache.media = list;
        }
      } catch {}
    }

    if (accountId) {
      return list.filter(m => m.accountId === accountId);
    }
    return list;
  },

  saveMedia(media: MediaItem): MediaItem {
    const items = [...this.getMedia()];
    const index = items.findIndex(m => m.id === media.id);
    if (index >= 0) {
      items[index] = media;
    } else {
      items.unshift(media);
    }

    memoryCache.media = items;
    safeSetItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
    idbSave(STORAGE_KEYS.MEDIA, items);

    // Cloud Firestore Save
    const docRef = doc(db, 'media', media.id);
    setDoc(docRef, cleanForFirestore(media)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `media/${media.id}`);
    });

    return media;
  },

  deleteMedia(mediaId: string): boolean {
    const items = this.getMedia().filter(m => m.id !== mediaId);
    memoryCache.media = items;
    safeSetItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
    idbSave(STORAGE_KEYS.MEDIA, items);

    const schedules = this.getSchedules().filter(s => s.mediaId !== mediaId);
    memoryCache.schedules = schedules;
    safeSetItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    idbSave(STORAGE_KEYS.SCHEDULES, schedules);

    // Cloud Firestore Delete
    deleteDoc(doc(db, 'media', mediaId)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `media/${mediaId}`);
    });

    return true;
  },

  // --- SCHEDULES ---
  getSchedules(screenId?: string): ScheduleItem[] {
    let list: ScheduleItem[] = [];
    if (memoryCache.schedules && Array.isArray(memoryCache.schedules)) {
      list = memoryCache.schedules;
    } else {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
        if (data) {
          list = JSON.parse(data);
          memoryCache.schedules = list;
        }
      } catch {}
    }

    if (screenId) {
      return list.filter(s => s.screenId === screenId);
    }
    return list;
  },

  saveSchedule(schedule: ScheduleItem): ScheduleItem {
    const items = [...this.getSchedules()];
    const index = items.findIndex(s => s.id === schedule.id);
    if (index >= 0) {
      items[index] = schedule;
    } else {
      items.push(schedule);
    }

    memoryCache.schedules = items;
    safeSetItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(items));
    idbSave(STORAGE_KEYS.SCHEDULES, items);
    
    // Broadcast instant local signal
    this.broadcast({
      type: 'SCHEDULE_UPDATED',
      screenId: schedule.screenId,
      payload: schedule,
      timestamp: Date.now(),
    });

    // Cloud Firestore Save
    const docRef = doc(db, 'schedules', schedule.id);
    setDoc(docRef, cleanForFirestore(schedule)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `schedules/${schedule.id}`);
    });

    return schedule;
  },

  deleteSchedule(scheduleId: string): boolean {
    const schedules = [...this.getSchedules()];
    const target = schedules.find(s => s.id === scheduleId);
    const updated = schedules.filter(s => s.id !== scheduleId);

    memoryCache.schedules = updated;
    safeSetItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updated));
    idbSave(STORAGE_KEYS.SCHEDULES, updated);

    if (target) {
      this.broadcast({
        type: 'SCHEDULE_UPDATED',
        screenId: target.screenId,
        timestamp: Date.now(),
      });
    }

    // Cloud Firestore Delete
    deleteDoc(doc(db, 'schedules', scheduleId)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `schedules/${scheduleId}`);
    });

    return true;
  },

  // --- INQUIRIES (CONTACT REQUESTS & SUBSCRIPTION INTERESTS) ---
  getInquiries(): InquiryRequest[] {
    if (memoryCache.inquiries && Array.isArray(memoryCache.inquiries)) {
      return memoryCache.inquiries;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (data) {
        const list = JSON.parse(data);
        memoryCache.inquiries = list;
        return list;
      }
    } catch {}

    // Seed realistic sample requests so the Admin immediately sees requests
    const seedInquiries: InquiryRequest[] = [
      {
        id: 'inq-001',
        name: 'عبدالله السبيعي',
        company: 'سلسلة مطاعم ركن الذواقة',
        phone: '+966501234567',
        screensCount: '4-5',
        selectedPlan: 'باقة المشروعات (شاشات متعددة)',
        notes: 'نرغب في ربط شاشات 4 فروع لعرض قوائم الطعام الديناميكية والعروض الترويجية في الرياض.',
        type: 'subscription',
        status: 'new',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'inq-002',
        name: 'م. فهد القحطاني',
        company: 'مجمع عيادات النخبة الطبية',
        phone: '+966559876543',
        screensCount: '2-3',
        selectedPlan: 'طلب ترخيص شاشة (29 ر.س/شهرياً)',
        notes: 'شاشات صالة الانتظار والاستقبال لعرض التوعية الطبية ومواعيد العيادات.',
        type: 'contact',
        status: 'contacted',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'inq-003',
        name: 'سارة المنصور',
        company: 'صالون وسبا فيوليت',
        phone: '+966562233445',
        screensCount: '1',
        selectedPlan: 'باقة التجربة المجانية',
        notes: 'نريد تجربة شاشة ستاند رئيسية في مدخل المركز لعرض باقات العناية بالبشرة.',
        type: 'subscription',
        status: 'completed',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
    memoryCache.inquiries = seedInquiries;
    safeSetItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(seedInquiries));
    idbSave(STORAGE_KEYS.INQUIRIES, seedInquiries);
    return seedInquiries;
  },

  saveInquiry(inquiry: InquiryRequest): InquiryRequest {
    const inquiries = [...this.getInquiries()];
    const index = inquiries.findIndex(i => i.id === inquiry.id);
    if (index >= 0) {
      inquiries[index] = inquiry;
    } else {
      inquiries.unshift(inquiry);
    }
    memoryCache.inquiries = inquiries;
    safeSetItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    idbSave(STORAGE_KEYS.INQUIRIES, inquiries);

    this.broadcast({
      type: 'INQUIRIES_UPDATED',
      timestamp: Date.now(),
    });

    const docRef = doc(db, 'inquiries', inquiry.id);
    setDoc(docRef, cleanForFirestore(inquiry)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `inquiries/${inquiry.id}`);
    });

    return inquiry;
  },

  updateInquiryStatus(id: string, status: 'new' | 'contacted' | 'completed'): void {
    const inquiries = [...this.getInquiries()];
    const item = inquiries.find(i => i.id === id);
    if (item) {
      item.status = status;
      memoryCache.inquiries = inquiries;
      safeSetItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
      idbSave(STORAGE_KEYS.INQUIRIES, inquiries);

      this.broadcast({
        type: 'INQUIRIES_UPDATED',
        timestamp: Date.now(),
      });

      const docRef = doc(db, 'inquiries', id);
      updateDoc(docRef, { status }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
      });
    }
  },

  deleteInquiry(id: string): boolean {
    const inquiries = this.getInquiries().filter(i => i.id !== id);
    memoryCache.inquiries = inquiries;
    safeSetItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    idbSave(STORAGE_KEYS.INQUIRIES, inquiries);

    this.broadcast({
      type: 'INQUIRIES_UPDATED',
      timestamp: Date.now(),
    });

    deleteDoc(doc(db, 'inquiries', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
    });

    return true;
  },

  // --- SESSIONS & AUTHENTICATION ---
  getAdminSession(): { email: string; name: string } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setAdminSession(session: { email: string; name: string } | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
      }
    } catch (e) {
      console.error('Failed to set admin session', e);
    }
  },

  getClientSession(): { accountId: string } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENT_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setClientSession(session: { accountId: string } | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.CLIENT_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CLIENT_SESSION);
      }
    } catch (e) {
      console.error('Failed to set client session', e);
    }
  },

  getSavedScreenCode(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.SAVED_SCREEN);
    } catch {
      return null;
    }
  },

  setSavedScreenCode(code: string | null): void {
    try {
      if (code) {
        localStorage.setItem(STORAGE_KEYS.SAVED_SCREEN, code);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SAVED_SCREEN);
      }
    } catch (e) {
      console.error('Failed to set saved screen code', e);
    }
  },

  // --- PURGE ALL DATA ---
  clearAllData(): void {
    try {
      memoryCache.accounts = [];
      memoryCache.screens = [];
      memoryCache.media = [];
      memoryCache.schedules = [];

      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.SCREENS);
      localStorage.removeItem(STORAGE_KEYS.MEDIA);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULES);

      idbClear();

      this.broadcast({
        type: 'SCREEN_REFRESH',
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  },

  // --- REALTIME BROADCAST & SUBSCRIPTION ---
  broadcast(message: RealtimeSyncMessage): void {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(message);
      } catch (e) {
        console.error('Broadcast message failed', e);
      }
    }
    try {
      localStorage.setItem('tamy_sync_signal', JSON.stringify({ ...message, nonce: Math.random() }));
    } catch (e) {
      // ignore
    }
  },

  subscribe(callback: (message: RealtimeSyncMessage) => void): () => void {
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object' && event.data.type) {
        callback(event.data as RealtimeSyncMessage);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'tamy_sync_signal' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          callback(parsed as RealtimeSyncMessage);
        } catch (e) {
          // ignore
        }
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }
    window.addEventListener('storage', handleStorage);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorage);
    };
  },
};

// Initialize cloud realtime synchronization immediately on load
if (typeof window !== 'undefined') {
  StorageService.initCloudSync();
}
