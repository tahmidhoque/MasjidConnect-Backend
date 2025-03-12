/**
 * DTO for creating a new content schedule
 */
export interface CreateContentScheduleDTO {
  name: string;
  description?: string;
  isActive?: boolean;
  slides?: Array<{
    id: string;
    type: string;
    duration: number;
  }>;
}

/**
 * DTO for updating an existing content schedule
 */
export interface UpdateContentScheduleDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
  slides?: Array<{
    id: string;
    type: string;
    duration: number;
  }>;
}

/**
 * DTO for toggling a schedule's active status
 */
export interface ToggleActiveDTO {
  isActive: boolean;
}

/**
 * DTO for duplicating a schedule
 */
export interface DuplicateScheduleDTO {
  sourceScheduleId: string;
  name: string;
}

/**
 * Represents a content item in a schedule
 */
export interface ContentItemType {
  id: string;
  type: string;
  title: string;
  content: any;
  duration: number;
  isActive: boolean;
}

/**
 * Represents a schedule item with its content
 */
export interface ContentScheduleItemType {
  id: string;
  scheduleId: string;
  contentItemId: string;
  order: number;
  contentItem: ContentItemType;
}

/**
 * Represents a complete content schedule with its items
 */
export interface ContentScheduleType {
  id: string;
  masjidId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  items: ContentScheduleItemType[];
  createdAt: Date;
  updatedAt: Date;
} 