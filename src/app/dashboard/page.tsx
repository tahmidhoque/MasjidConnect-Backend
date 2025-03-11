"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  MonetizationOn as DonationIcon,
} from '@mui/icons-material';

const stats = [
  {
    title: 'Total Members',
    value: '1,234',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    color: 'primary.main',
  },
  {
    title: 'Upcoming Events',
    value: '5',
    icon: <EventIcon sx={{ fontSize: 40 }} />,
    color: 'success.main',
  },
  {
    title: 'Active Announcements',
    value: '3',
    icon: <AnnouncementIcon sx={{ fontSize: 40 }} />,
    color: 'warning.main',
  },
  {
    title: 'Monthly Donations',
    value: '$12,345',
    icon: <DonationIcon sx={{ fontSize: 40 }} />,
    color: 'error.main',
  },
];

export default function Dashboard() {
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
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, Admin
        </Typography>
        <Typography color="text.secondary">
          Here's what's happening with your masjid today.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" startIcon={<EventIcon />}>
                  Add New Event
                </Button>
                <Button variant="outlined" startIcon={<AnnouncementIcon />}>
                  Create Announcement
                </Button>
                <Button variant="outlined" startIcon={<PeopleIcon />}>
                  Manage Members
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Prayer Times
              </Typography>
              <Stack spacing={2}>
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                  <Box
                    key={prayer}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography>{prayer}</Typography>
                    <Typography>5:30 AM</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 