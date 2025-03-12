import { ContentType, ScreenOrientation, ScreenStatus } from '@prisma/client';

export interface DashboardScreen {
  id: string;
  name: string;
  status: ScreenStatus;
  lastSeen: Date | null;
  location: string | null;
  orientation: ScreenOrientation;
  schedule?: {
    name: string;
  } | null;
}

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  content: any;
  duration: number;
  isActive: boolean;
}

export interface ContentScheduleItem {
  id: string;
  contentItem: ContentItem;
  order: number;
}

export interface ContentSchedule {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  items: ContentScheduleItem[];
}

export interface OfflineScreen {
  id: string;
  name: string;
  lastSeen: Date | null;
}

export interface DashboardAlerts {
  missingPrayerTimes: string[];
  offlineScreens: OfflineScreen[];
}

export interface DashboardData {
  screens: DashboardScreen[];
  contentSchedules: ContentSchedule[];
  alerts: DashboardAlerts;
} 