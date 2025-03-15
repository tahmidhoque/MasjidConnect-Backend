import { ScreenStatus, ScreenOrientation } from '@prisma/client';

export interface Screen {
  id: string;
  masjidId?: string | null;
  name: string;
  apiKey?: string | null;
  pairingCode?: string | null;
  pairingCodeExpiry?: Date | null;
  lastSeen?: Date | null;
  status: ScreenStatus;
  deviceType?: string | null;
  location?: string | null;
  orientation: ScreenOrientation;
  contentConfig?: any;
  isActive: boolean;
  scheduleId?: string | null;
  schedule?: {
    id: string;
    name: string;
    isDefault: boolean;
  } | null;
  createdAt: Date;
  updatedAt: Date;
} 