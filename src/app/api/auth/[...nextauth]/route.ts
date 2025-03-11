import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import NextAuth from 'next-auth/next'
import { User } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  debug: false,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login?signOut=true',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            masjidId: true,
          },
        })

        if (!user?.password) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role,
          masjidId: user.masjidId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.masjidId = user.masjidId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as User['role']
        session.user.masjidId = token.masjidId as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful login
      if (url.includes('/login')) {
        return `${baseUrl}/dashboard`
      }
      
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Default to the base URL
      return baseUrl
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 