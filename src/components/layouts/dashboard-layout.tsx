"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
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
  Avatar,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Container,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Mosque as MosqueIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  ScreenShare as ScreenIcon,
  Article as ContentIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const menuItems = [
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
  },
  {
    title: 'Display Screens',
    path: '/screens',
    icon: <ScreenIcon />,
  },
  {
    title: 'Masjid Details',
    path: '/masjid',
    icon: <MosqueIcon />,
  },
  {
    title: 'Notifications',
    path: '/notifications',
    icon: <NotificationsIcon />,
    badge: 3, // Example badge count
  },
  {
    title: 'General Settings',
    path: '/general-settings',
    icon: <SettingsIcon />,
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <PersonIcon />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/login?signOut=true'
      });
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login?signOut=true');
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation section starts directly - Logo moved to main content */}
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component="a"
              href={item.path}
              selected={pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.secondary.main,
            width: 40,
            height: 40,
          }}
        >
          A
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            Admin User
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Oxford Mosque
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton 
            size="small" 
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            onClick={handleLogout}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: theme.palette.primary.main,
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
            width: drawerWidth,
            bgcolor: theme.palette.primary.main,
            borderRight: 'none',
          },
          width: drawerWidth,
          flexShrink: 0,
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Minimal header with brand name */}
        <Container maxWidth="lg" sx={{ pt: 0, pb: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.75,
            }}
          >
            {/* Mobile menu button */}
            <Box>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            {/* Unified MasjidConnect brand - right aligned */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', pr: 0.5 }}>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                }}
              >
                Masjid
              </Typography>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.secondary.main,
                }}
              >
                Connect
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mt: 0.5, mb: 1.5 }} />
        </Container>

        {/* Page content */}
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
} 