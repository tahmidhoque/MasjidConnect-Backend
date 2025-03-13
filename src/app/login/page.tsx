"use client";

import { useState, Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useUserContext } from '@/contexts/UserContext'
import { 
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link as MuiLink,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material'
import { prefetchUserData } from '@/lib/auth-client'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const theme = useTheme();
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { setMasjidName, setUserName } = useUserContext()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null)
      setIsLoading(true)

      // Step 1: Sign in
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      if (!result?.ok || result?.error) {
        throw new Error(result?.error || 'Failed to sign in');
      }

      // Step 2: Get session data with retry
      let sessionData;
      try {
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
          const userResponse = await fetch('/api/auth/session');
          if (userResponse.ok) {
            sessionData = await userResponse.json();
            if (sessionData?.user?.id && sessionData?.user?.masjidId) {
              break;
            }
          }
          // Wait before retrying
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!sessionData?.user?.id || !sessionData?.user?.masjidId) {
          throw new Error('Invalid session data after retries');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        throw new Error('Failed to fetch user session');
      }

      // Step 3: Update context and local storage
      try {
        // Set user name first
        const userName = sessionData.user.name || 'User';
        setUserName(userName);

        // Prefetch user data
        await prefetchUserData(
          sessionData.user.id,
          sessionData.user.masjidId,
          userName
        );

        // Fetch masjid data with retry
        let masjidData;
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
          try {
            const masjidResponse = await fetch(`/api/masjid/${sessionData.user.masjidId}`);
            if (masjidResponse.ok) {
              masjidData = await masjidResponse.json();
              break;
            }
          } catch (e) {
            if (i === maxRetries - 1) throw e;
          }
          // Wait before retrying
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!masjidData) {
          throw new Error('Failed to fetch masjid data after retries');
        }

        // Update masjid name in context
        setMasjidName(masjidData.name);

        // Step 4: Navigate only after all data is loaded and context is updated
        // Use replace instead of push to prevent back button issues
        router.replace('/dashboard');
      } catch (error) {
        console.error('Data fetching error:', error);
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      console.error('Login flow error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            placeholder="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
            disabled={isLoading}
            variant="outlined"
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                '& fieldset': {
                  borderColor: alpha(theme.palette.text.primary, 0.15),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.text.primary, 0.25),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiFormHelperText-root': {
                marginLeft: 0,
                marginTop: 1,
              },
            }}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            placeholder="Password"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
            disabled={isLoading}
            variant="outlined"
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                '& fieldset': {
                  borderColor: alpha(theme.palette.text.primary, 0.15),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.text.primary, 0.25),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiFormHelperText-root': {
                marginLeft: 0,
                marginTop: 1,
              },
            }}
          />
        )}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <MuiLink
          component={Link}
          href="/forgot-password"
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            textDecoration: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              color: theme.palette.primary.main,
            },
          }}
        >
          Forgot Password?
        </MuiLink>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          height: 48,
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: theme.palette.primary.dark,
          },
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
      </Button>
    </Box>
  )
}

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter()
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'left',
        position: 'relative',
        p: 0,
      }}
    >
      {/* Full page background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: { xs: 0, md: '35%' }, // Start 5% before the new card edge (40% - 5%)
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          src="/images/masjid.jpeg"
          alt="Mosque Interior"
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          priority
        />
      </Box>
      
      {/* Full page gradient overlay with different opacity on each side */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: `linear-gradient(45deg, 
            ${alpha(theme.palette.primary.main, 0.65)}, 
            ${alpha(theme.palette.primary.main, 0.65)})`,
        }}
      />

      {/* Form Card */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: '100%', md: '40%' }, // Reduced from 50% to 40%
          height: '100vh',
          display: 'flex',
          borderRadius: { xs: 0, md: '0 24px 24px 0' },
          overflow: 'hidden',
          bgcolor: '#fff',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 3, sm: 6 },
          }}
        >
          <Box sx={{ 
            mb: 8, // Increased margin bottom for more space between logo and text
            mt: -4, // Added negative margin top to optically center in the white space
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 160 // Increased height for more vertical space
          }}>
            <Image
              src="/images/logo-blue.svg"
              alt="MasjidConnect Logo"
              width={150}
              height={150}
              priority
              style={{
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1,
              fontWeight: 600,
            }}
          >
            Welcome back
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: 'text.secondary',
              display: 'flex',
              gap: 0.5,
            }}
          >
            New to MasjidConnect?{' '}
            <MuiLink 
              component={Link} 
              href="/signup" 
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Create an account
            </MuiLink>
          </Typography>

          <Suspense fallback={<CircularProgress />}>
            <LoginForm />
          </Suspense>
        </Box>
      </Paper>
    </Box>
  )
} 