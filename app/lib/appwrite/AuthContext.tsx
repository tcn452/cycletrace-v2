'use client'

import { Models } from 'appwrite'
import { useRouter } from 'next/navigation'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  getCurrentAppwriteUser,
  signInWithAppwrite,
  signOutFromAppwrite,
} from './auth'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  loading: boolean
  login: (email: string, password: string) => Promise<Models.Session>
  logout: () => Promise<void>
  refresh: () => Promise<Models.User<Models.Preferences> | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const currentUser = await getCurrentAppwriteUser()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await signInWithAppwrite(email, password)
      await refresh()
      return session
    },
    [refresh]
  )

  const logout = useCallback(async () => {
    try {
      await signOutFromAppwrite()
    } catch (error) {
      console.error('Sign out error', error)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
