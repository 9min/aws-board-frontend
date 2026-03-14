import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { tokenStorage } from '@/lib/tokenStorage'
import type { AuthUser, LoginResponse } from '@/types/auth'
import { decodeJwtPayload } from '@/utils/jwtDecode'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = tokenStorage.getAccessToken()
    if (token) {
      const payload = decodeJwtPayload(token)
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({ id: payload.sub, email: payload.email })
      } else {
        tokenStorage.clearTokens()
      }
    }
    setIsLoading(false)
  }, [])

  const login = (response: LoginResponse) => {
    tokenStorage.setAccessToken(response.accessToken)
    const payload = decodeJwtPayload(response.accessToken)
    if (payload) {
      setUser({ id: payload.sub, email: payload.email })
    }
  }

  const logout = () => {
    tokenStorage.clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  }
  return context
}
