export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ClientAccount {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  password?: string;
  maxScreens: number;
  status: 'active' | 'suspended';
  createdAt: string;
  notes?: string;
}

export interface ScreenDevice {
  id: string;
  code: string; // e.g. albasatin-001
  name: string; // e.g. albasatin 001
  branch: string; // e.g. فرع البساتين
  accountId: string;
  status: 'online' | 'offline';
  lastPing: string;
  orientation: 'landscape' | 'portrait';
  currentMediaId?: string;
  pairingPin?: string;
  resolution?: string;
}

export interface MediaItem {
  id: string;
  accountId: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  durationSeconds: number; // For slideshow cycling
  fileSize?: string;
  createdAt: string;
  aspectRatio?: '16:9' | '9:16';
}

export interface ScheduleItem {
  id: string;
  screenId: string;
  mediaId: string;
  media: MediaItem;
  days: DayOfWeek[];
  startTime: string; // "12:00"
  endTime: string;   // "15:30"
  isForever: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface RealtimeSyncMessage {
  type: 'SCHEDULE_UPDATED' | 'SCREEN_REFRESH' | 'HEARTBEAT';
  screenId?: string;
  accountId?: string;
  payload?: any;
  timestamp: number;
}
