"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, AppBar, Toolbar, Typography, Box, Container } from '@mui/material';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/login?signOut=true'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/login?signOut=true');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Masjid Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              Welcome, {session?.user?.name || "User"}
            </Typography>
            <Button 
              onClick={handleSignOut}
              variant="contained" 
              color="error"
              sx={{ 
                textTransform: 'none',
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
            >
              Sign out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="h5" gutterBottom>
            Dashboard Overview
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Email: {session?.user?.email}</Typography>
            <Typography variant="body1">Role: {session?.user?.role}</Typography>
            <Typography variant="body1">Masjid ID: {session?.user?.masjidId}</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 