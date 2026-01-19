
export type UserRole = 'FREE' | 'PREMIUM';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export type ExplorerViewMode = 'grid' | 'list';
export type ThemeMode = 'light' | 'dark' | 'midnight' | 'solar';

export interface FileVersion {
  dataUrl: string;
  size: number;
  createdAt: number;
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  color: string;
  x: number;
  y: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  storageUsed: number;
  isAdmin: boolean;
  profileColor?: string;
  theme?: ThemeMode;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface FileItem {
  id: string;
  userId: string;
  parentId: string | null;
  isFolder: boolean;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  createdAt: number;
  description?: string;
  notes?: string;
  tags: string[];
  versions: FileVersion[];
  isShared: boolean;
  shareId?: string;
  isDeleted: boolean;
  isLocked?: boolean;
  password?: string;
}

export enum WindowType {
  FILES = 'FILES',
  SETTINGS = 'SETTINGS',
  AUTH = 'AUTH',
  PREFERENCES = 'PREFERENCES',
  SYSTEM_INFO = 'SYSTEM_INFO',
  INTELLIGENCE = 'INTELLIGENCE',
  NOTES = 'NOTES',
  DASHBOARD = 'DASHBOARD',
  CAMERA = 'CAMERA',
  EDITOR = 'EDITOR',
  SHARE_MODAL = 'SHARE_MODAL',
  PAINT = 'PAINT',
  CALCULATOR = 'CALCULATOR',
  CALENDAR = 'CALENDAR',
  WEATHER = 'WEATHER'
}

export const STORAGE_LIMITS = {
  FREE: 2048 * 1024 * 1024,
  PREMIUM: 8040 * 1024 * 1024
};
