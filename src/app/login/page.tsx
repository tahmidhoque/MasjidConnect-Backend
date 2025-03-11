"use client";

import { useState, Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link as MuiLink,
  CircularProgress
} from '@mui/material'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const searchParams = useSearchParams()
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
        redirect: true,
        callbackUrl: '/dashboard'
      })
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
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
            disabled={isLoading}
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
            label="Password"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
            disabled={isLoading}
          />
        )}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ minWidth: 100 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'LOGIN'}
        </Button>

        <MuiLink
          component={Link}
          href="/forgot-password"
          variant="body2"
          color="primary"
        >
          Forgot Password?
        </MuiLink>
      </Box>
    </Box>
  )
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontWeight: 'bold' }}
          >
            MasjidConnect
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }}>
            Don&apos;t have an account?{' '}
            <MuiLink component={Link} href="/signup" color="primary">
              Sign up
            </MuiLink>
          </Typography>

          <Suspense fallback={<CircularProgress />}>
            <LoginForm />
          </Suspense>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4, textAlign: 'center' }}
          >
            © MasjidConnect {new Date().getFullYear()}
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
} 