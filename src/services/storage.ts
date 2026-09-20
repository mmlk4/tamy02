import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ClientAccount, ScreenDevice, MediaItem, ScheduleItem, RealtimeSyncMessage } from '../types';

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
  ADMIN_SESSION: 'tamy_admin_session_v3',
  CLIENT_SESSION: 'tamy_client_session_v3',
  SAVED_SCREEN: 'tamy_saved_screen_code_v3',
  CLOUD_STATUS: 'tamy_cloud_status_v3',
};

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
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(cloudAccounts));
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
          localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(cloudScreens));
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
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(cloudMedia));
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
          localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(cloudSchedules));
          this.broadcast({
            type: 'SCHEDULE_UPDATED',
            timestamp: Date.now(),
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'schedules');
      });

    } catch (e) {
      console.error('Failed to initialize Firestore realtime listeners', e);
    }
  },

  // --- ACCOUNTS ---
  getAccounts(): ClientAccount[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },

  getAccountById(id: string): ClientAccount | undefined {
    return this.getAccounts().find(a => a.id === id);
  },

  saveAccount(account: ClientAccount): ClientAccount {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
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
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

    const screens = this.getScreens().filter(s => s.accountId !== id);
    localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));

    // Cloud Firestore Delete
    deleteDoc(doc(db, 'accounts', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `accounts/${id}`);
    });

    return true;
  },

  // --- SCREENS ---
  getScreens(accountId?: string): ScreenDevice[] {
    const data = localStorage.getItem(STORAGE_KEYS.SCREENS);
    const list: ScreenDevice[] = data ? JSON.parse(data) : [];
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
    const screens = this.getScreens();
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

    localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
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
    localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));

    const schedules = this.getSchedules().filter(sch => sch.screenId !== screenId);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));

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
    const screens = this.getScreens();
    const screen = screens.find(s => s.id === screenId || s.code.toLowerCase() === screenId.toLowerCase());
    if (screen) {
      screen.lastPing = new Date().toISOString();
      screen.status = 'online';
      localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
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
        // If doc does not exist yet, ignore or create
      });
    }
  },

  // --- MEDIA ---
  getMedia(accountId?: string): MediaItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    const list: MediaItem[] = data ? JSON.parse(data) : [];
    if (accountId) {
      return list.filter(m => m.accountId === accountId);
    }
    return list;
  },

  saveMedia(media: MediaItem): MediaItem {
    const items = this.getMedia();
    const index = items.findIndex(m => m.id === media.id);
    if (index >= 0) {
      items[index] = media;
    } else {
      items.unshift(media);
    }
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));

    // Cloud Firestore Save
    const docRef = doc(db, 'media', media.id);
    setDoc(docRef, cleanForFirestore(media)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `media/${media.id}`);
    });

    return media;
  },

  deleteMedia(mediaId: string): boolean {
    const items = this.getMedia().filter(m => m.id !== mediaId);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));

    const schedules = this.getSchedules().filter(s => s.mediaId !== mediaId);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));

    // Cloud Firestore Delete
    deleteDoc(doc(db, 'media', mediaId)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `media/${mediaId}`);
    });

    return true;
  },

  // --- SCHEDULES ---
  getSchedules(screenId?: string): ScheduleItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    const list: ScheduleItem[] = data ? JSON.parse(data) : [];
    if (screenId) {
      return list.filter(s => s.screenId === screenId);
    }
    return list;
  },

  saveSchedule(schedule: ScheduleItem): ScheduleItem {
    const items = this.getSchedules();
    const index = items.findIndex(s => s.id === schedule.id);
    if (index >= 0) {
      items[index] = schedule;
    } else {
      items.push(schedule);
    }
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(items));
    
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
    const schedules = this.getSchedules();
    const target = schedules.find(s => s.id === scheduleId);
    const updated = schedules.filter(s => s.id !== scheduleId);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(updated));

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
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.SCREENS);
      localStorage.removeItem(STORAGE_KEYS.MEDIA);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
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
