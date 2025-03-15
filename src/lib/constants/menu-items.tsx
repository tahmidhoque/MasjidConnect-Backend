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
  Code as CustomIcon,
} from '@mui/icons-material';
import Image from 'next/image';

// Define types
export interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: MenuItem[];
  divider?: boolean;
}

// Custom Asma Al-Husna icon component
const AsmaAlHusnaIcon = () => (
  <div style={{ position: 'relative', width: 24, height: 24 }}>
    <Image 
      src="/icons/asma-al-husna.svg" 
      alt="99 Names of Allah" 
      width={24} 
      height={24}
      style={{ filter: 'brightness(0) invert(1)' }} // Makes the SVG white to match other icons
    />
  </div>
);

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
      {
        title: '99 Names of Allah',
        path: '/screens/content/asma_al_husna',
        icon: <AsmaAlHusnaIcon />,
      },
    ]
  },
  {
    title: 'Manage Screens',
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