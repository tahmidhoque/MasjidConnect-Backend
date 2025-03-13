import {
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  ViewCarousel as ContentIcon,
  Computer as ScreenIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  MenuBook as VerseIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  Code as CustomIcon
} from '@mui/icons-material';

// Define types
// export interface MenuItem {
//   title: string;
//   path: string;
//   icon: ReactNode;
//   badge?: number;
//   children?: MenuItem[];
//   divider?: boolean;
// }

// Main menu items
export const mainMenuItems = [
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
        title: 'All Content',
        path: '/screens/content',
        icon: <ContentIcon />,
      },
      {
        divider: true,
        title: 'Content Types',
        path: '',
        icon: <></>
      },
      {
        title: 'Verse/Hadith',
        path: '/screens/content/create/verse_hadith',
        icon: <VerseIcon />,
      },
      {
        title: 'Announcements',
        path: '/screens/content/create/announcement',
        icon: <AnnouncementIcon />,
      },
      {
        title: 'Events',
        path: '/screens/content/create/event',
        icon: <EventIcon />,
      },
      {
        title: 'Custom Content',
        path: '/screens/content/create/custom',
        icon: <CustomIcon />,
      },
    ]
  },
  {
    title: 'Screen Management',
    path: '/screens',
    icon: <ScreenIcon />,
  },
  {
    title: 'General Settings',
    path: '/general-settings',
    icon: <SettingsIcon />,
  },
];

// User submenu items
export const userMenuItems = [
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