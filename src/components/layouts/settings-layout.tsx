"use client";

import { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Mosque as MosqueIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useUnsavedChanges } from '@/contexts/UnsavedChangesContext';

const drawerWidth = 280;

const menuItems = [
  {
    title: 'General Settings',
    path: '/settings',
    icon: <SettingsIcon />,
  },
  {
    title: 'Profile',
    path: '/settings/profile',
    icon: <PersonIcon />,
  },
  {
    title: 'Masjid Details',
    path: '/settings/masjid',
    icon: <MosqueIcon />,
  },
  {
    title: 'Prayer Times',
    path: '/settings/prayer-times',
    icon: <ScheduleIcon />,
  },
  {
    title: 'Notifications',
    path: '/settings/notifications',
    icon: <NotificationsIcon />,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { confirmNavigation } = useUnsavedChanges();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    confirmNavigation(() => {
      router.push(path);
      if (isMobile) {
        handleDrawerToggle();
      }
    });
  };

  // Memoize the drawer component to prevent re-renders during navigation
  const drawer = useMemo(() => (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Settings
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  ), [pathname, handleNavigation]);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile drawer toggle */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        {/* Mobile app bar */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Settings
          </Typography>
        </Box>

        {/* Page content */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
} 