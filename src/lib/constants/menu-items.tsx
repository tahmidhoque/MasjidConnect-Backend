import React from 'react';
import {
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  ViewCarousel as ContentIcon,
  Computer as ScreenIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  MenuBook as VerseIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  Code as CustomIcon
} from '@mui/icons-material';

// Define types
export interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: MenuItem[];
  divider?: boolean;
}

// Main menu items
// Note: General Settings feature is temporarily disabled and will be implemented in a future update
export const mainMenuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Prayer Times',
    path: '/prayer-times',
    icon: <ScheduleIcon />,
  },
  {
    title: 'Content Management',
    path: '/screens/content',
    icon: <ContentIcon />,
    children: [
      {
        title: 'Content Schedules',
        path: '/screens/content',
        icon: <ContentIcon />,
      },
      {
        divider: true,
        title: 'Content Types',
        path: '',
        icon: <></>,
      },
      {
        title: 'Verse/Hadith',
        path: '/screens/content/verse_hadith',
        icon: <VerseIcon />,
      },
      {
        title: 'Announcements',
        path: '/screens/content/announcement',
        icon: <AnnouncementIcon />,
      },
      {
        title: 'Events',
        path: '/screens/content/event',
        icon: <EventIcon />,
      },
      {
        title: 'Custom Content',
        path: '/screens/content/custom',
        icon: <CustomIcon />,
      },
    ]
  },
  {
    title: 'Display Screens',
    path: '/screens',
    icon: <ScreenIcon />,
  },
];

// User submenu items
export const userMenuItems: MenuItem[] = [
  {
    title: 'Profile',
    path: '/profile',
    icon: <PersonIcon />,
  },
  {
    title: 'Masjid Details',
    path: '/masjid',
    icon: <BusinessIcon />,
  },
]; 