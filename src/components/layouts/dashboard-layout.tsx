"use client";

import { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
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
  Menu,
  MenuItem,
  Collapse,
  Skeleton,
  Fade,
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { clearUserData } from '@/lib/auth-client';
import { useUserContext } from '@/contexts/UserContext';
import ClientOnly from '@/components/ClientOnly';

const drawerWidth = 280;

// Define types
interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

// Filter out Profile and Masjid Details from main menu - they'll be in the user submenu
const menuItems: MenuItem[] = [
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
  // {
  //   title: 'Notifications',
  //   path: '/notifications',
  //   icon: <NotificationsIcon />,
  //   badge: 3, // Example badge count
  // },
  {
    title: 'General Settings',
    path: '/general-settings',
    icon: <SettingsIcon />,
  },
];

// User submenu items
const userMenuItems: MenuItem[] = [
  {
    title: 'Profile',
    path: '/profile',
    icon: <PersonIcon />,
  },
  {
    title: 'Masjid Details',
    path: '/masjid',
    icon: <MosqueIcon />,
  },
];

// User Profile Component that only renders on client
function UserProfileSection({ 
  userName, 
  masjidName, 
  isLoading, 
  isInitialized, 
  userMenuOpen, 
  handleUserMenuToggle,
  session,
  theme
}) {
  return (
    <Box 
      sx={{ 
        flex: 1,
        cursor: isInitialized ? 'pointer' : 'default',
      }}
      onClick={isInitialized ? handleUserMenuToggle : undefined}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isLoading && !userName ? (
          <Skeleton
            variant="text"
            width="80%"
            height={24}
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
            animation="pulse"
          />
        ) : (
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: 'white', 
              fontWeight: 600, 
              flexGrow: 1,
              minWidth: '120px' 
            }}
          >
            {userName || (session?.user?.name ? session.user.name : '')}
          </Typography>
        )}
        {isInitialized ? (
          userMenuOpen ? (
            <ExpandLessIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }} />
          ) : (
            <ExpandMoreIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }} />
          )
        ) : null}
      </Box>
      
      {isLoading && !masjidName ? (
        <Skeleton
          variant="text"
          width="60%"
          height={16}
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
          animation="pulse"
        />
      ) : (
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {masjidName || ''}
        </Typography>
      )}
    </Box>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user information from context instead of managing locally
  const { masjidName, userName, isLoading, isInitialized } = useUserContext();
  
  // Local UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    try {
      // Clear stored data on logout
      clearUserData();
      
      await signOut({ 
        redirect: true,
        callbackUrl: '/login?signOut=true'
      });
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login?signOut=true');
    }
  };

  // Memoize the drawer component to prevent re-renders when navigating
  const drawer = useMemo(() => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section at the top */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
          <AccountCircleIcon />
        </Avatar>
        
        {/* Wrap user profile in ClientOnly to prevent hydration issues */}
        <ClientOnly fallback={
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
          </Box>
        }>
          <UserProfileSection
            userName={userName}
            masjidName={masjidName}
            isLoading={isLoading}
            isInitialized={isInitialized}
            userMenuOpen={userMenuOpen}
            handleUserMenuToggle={handleUserMenuToggle}
            session={session}
            theme={theme}
          />
        </ClientOnly>
      </Box>

      {/* User dropdown menu - Wrap in ClientOnly */}
      <ClientOnly>
        <Collapse in={userMenuOpen && isInitialized} timeout="auto" unmountOnExit>
          <List sx={{ pt: 0, pb: 1 }}>
            {userMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ pl: 2, pr: 2, py: 0.5 }}>
                <ListItemButton
                  component="a"
                  href={item.path}
                  selected={pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    py: 0.75,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
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
            <ListItem disablePadding sx={{ pl: 2, pr: 2, py: 0.5 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  py: 0.75,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Sign Out"
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>
      </ClientOnly>

      {/* Main navigation */}
      <List sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ pl: 2, pr: 2, py: 0.5 }}>
            <ListItemButton
              component="a"
              href={item.path}
              selected={pathname === item.path}
              sx={{
                borderRadius: 2,
                py: 0.75,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
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
              {item.badge && (
                <Badge 
                  badgeContent={item.badge} 
                  color="secondary"
                  sx={{ mr: 0.5 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Optional: Admin branding at the bottom */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Masjid Admin Dashboard v1.0
        </Typography>
      </Box>
    </Box>
  ), [
    theme, 
    isInitialized, 
    isLoading, 
    userName, 
    masjidName, 
    userMenuOpen, 
    pathname, 
    handleUserMenuToggle, 
    handleLogout,
    session
  ]);

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