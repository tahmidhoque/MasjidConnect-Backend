"use client";

import { useState, Suspense, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Box,
  Container,
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      if (result?.error) {
        setError(result.error || 'Failed to sign in');
        setIsLoading(false);
        return;
      }
      
      // Fetch user data
      try {
        // Get user and masjid data from API
        const userResponse = await fetch('/api/auth/session');
        if (userResponse.ok) {
          const sessionData = await userResponse.json();
          if (sessionData?.user?.id && sessionData?.user?.masjidId) {
            // Prefetch and store user data
            await prefetchUserData(
              sessionData.user.id, 
              sessionData.user.masjidId,
              sessionData.user.name || 'User'
            );
          }
        }
      } catch (error) {
        console.error('Error prefetching user data:', error);
        // Continue with login even if prefetching fails
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
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
            ${alpha(theme.palette.secondary.main, 0.65)})`,
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
          <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
            <Typography
              component="span"
              variant="h5"
              sx={{ 
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              Masjid
            </Typography>
            <Typography
              component="span"
              variant="h5"
              sx={{ 
                fontWeight: 600,
                color: theme.palette.secondary.main,
              }}
            >
              Connect
            </Typography>
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