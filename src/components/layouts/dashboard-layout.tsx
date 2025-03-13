"use client";

import { useState, useMemo, useCallback } from 'react';
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
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { clearUserData } from '@/lib/auth-client';
import { useUserContext } from '@/contexts/UserContext';
import ClientOnly from '@/components/ClientOnly';
import React from 'react';
import { mainMenuItems, userMenuItems } from '@/lib/constants/menu-items';

const drawerWidth = 280;

// Define interface for UserProfileSection props
interface UserProfileSectionProps {
  userName: string | null;
  masjidName: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  userMenuOpen: boolean;
  handleUserMenuToggle: () => void;
  session: any; // Using any for session since it's a complex type from next-auth
  theme: any; // Using any for theme since it's from MUI
}

// Memoize the UserProfileSection component
const UserProfileSection = React.memo(function UserProfileSection({ 
  userName, 
  masjidName, 
  isLoading, 
  isInitialized, 
  userMenuOpen, 
  handleUserMenuToggle,
  session,
  theme
}: UserProfileSectionProps) {
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
});

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
  const [contentMenuOpen, setContentMenuOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Update contentMenuOpen when pathname changes
  React.useEffect(() => {
    if (pathname.startsWith('/screens/content')) {
      setContentMenuOpen(true);
    }
  }, [pathname]);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const handleUserMenuToggle = useCallback(() => {
    setUserMenuOpen(!userMenuOpen);
  }, [userMenuOpen]);

  const handleContentMenuToggle = useCallback(() => {
    setContentMenuOpen(!contentMenuOpen);
  }, [contentMenuOpen]);

  const handleLogout = useCallback(async () => {
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
  }, [router]);

  // Memoize user profile data
  const userProfileData = useMemo(() => ({
    userName,
    masjidName,
    isLoading,
    isInitialized,
    userMenuOpen,
    handleUserMenuToggle,
    session,
    theme
  }), [
    userName,
    masjidName,
    isLoading,
    isInitialized,
    userMenuOpen,
    handleUserMenuToggle,
    session,
    theme
  ]);

  // Memoize the drawer component to prevent re-renders when navigating
  const drawer = useMemo(() => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section at the top */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
            <UserProfileSection {...userProfileData} />
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
      </Box>

      {/* Main navigation */}
      <List sx={{ pt: 0.5, pb: 0.5, flexGrow: 1 }}>
        {mainMenuItems.map((item) => (
          <React.Fragment key={item.path}>
            <ListItem disablePadding sx={{ pl: 2, pr: 2, py: 0.25 }}>
              <ListItemButton
                component={item.children ? 'button' : 'a'}
                href={item.children ? undefined : item.path}
                onClick={item.children ? 
                  (item.title === 'Content Management' ? handleContentMenuToggle : undefined) 
                  : undefined}
                selected={pathname === item.path}
                sx={{
                  borderRadius: 1.5,
                  py: 0.5,
                  minHeight: '36px',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  sx={{
                    my: 0,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      lineHeight: 1.2,
                    },
                  }}
                />
                {item.children && (
                  item.title === 'Content Management' ? (
                    contentMenuOpen ? (
                      <ExpandLessIcon 
                        sx={{ 
                          fontSize: '1.1rem',
                          color: 'rgba(255, 255, 255, 0.7)',
                          transition: 'transform 0.2s',
                        }} 
                      />
                    ) : (
                      <ExpandMoreIcon 
                        sx={{ 
                          fontSize: '1.1rem',
                          color: 'rgba(255, 255, 255, 0.7)',
                          transition: 'transform 0.2s',
                        }} 
                      />
                    )
                  ) : null
                )}
              </ListItemButton>
            </ListItem>
            {item.children && contentMenuOpen && item.title === 'Content Management' && (
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <React.Fragment key={child.path}>
                    {child.divider ? (
                      <>
                        <Divider 
                          sx={{ 
                            my: 0.5,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          }} 
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            px: 4,
                            py: 0.25,
                            display: 'block',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        >
                          {child.title}
                        </Typography>
                      </>
                    ) : (
                      <ListItem disablePadding sx={{ pl: 4, pr: 2, py: 0.25 }}>
                        <ListItemButton
                          component="a"
                          href={child.path}
                          selected={pathname === child.path}
                          sx={{
                            borderRadius: 1.5,
                            py: 0.5,
                            minHeight: '32px',
                            '&.Mui-selected': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.15)',
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.title}
                            sx={{
                              my: 0,
                              '& .MuiListItemText-primary': {
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                lineHeight: 1.2,
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </React.Fragment>
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
          MasjidConnect v1.0
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
    contentMenuOpen,
    pathname, 
    handleUserMenuToggle,
    handleContentMenuToggle,
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
            <Box sx={{ display: 'inline-flex', alignItems: 'center', pr: 0.5, height: '48px' }}>
              <Image
                src="/images/logo-blue.svg"
                alt="MasjidConnect Logo"
                width={240}
                height={100}
                priority
                style={{
                  width: 'auto',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Box>
          <Divider sx={{ mt: 0.5, mb: 1.5 }} />
        </Container>

        {/* Page content */}
        <Container maxWidth="lg">
          <Box>
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 