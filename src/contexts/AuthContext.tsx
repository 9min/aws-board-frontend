import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/authService'
import { tokenStorage } from '@/lib/tokenStorage'
import type { AuthUser, LoginResponse } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (response: LoginResponse) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = tokenStorage.getAccessToken()
    if (token) {
      authService
        .getMe()
        .then((me) =>
          setUser({
            id: me.id,
            email: me.email,
            nickname: me.nickname,
            isAdmin: me.isAdmin,
            createdAt: me.createdAt,
          }),
        )
        .catch(() => tokenStorage.clearTokens())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (response: LoginResponse): Promise<void> => {
    tokenStorage.setAccessToken(response.accessToken)
    const me = await authService.getMe()
    setUser({
      id: me.id,
      email: me.email,
      nickname: me.nickname,
      isAdmin: me.isAdmin,
      createdAt: me.createdAt,
    })
  }

  const logout = () => {
    tokenStorage.clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        isAdmin: user?.isAdmin === true,
        login,
        logout,
      }}
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
