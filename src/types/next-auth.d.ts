import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'USER'
    masjidId: string
  }

  interface Session {
    user: User & {
      role: 'ADMIN' | 'USER'
      masjidId: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'USER'
    masjidId: string
  }
} 