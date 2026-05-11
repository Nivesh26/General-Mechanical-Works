import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  authFetchProfile,
  authLogin,
  type UserProfile,
  type AuthResponse,
} from '../lib/api'

/** Tab/session scoped: cleared when the browser tab is closed (unlike localStorage). */
const TOKEN_KEY = 'gmw_auth_token'

function readStoredToken(): string | null {
	const fromSession = sessionStorage.getItem(TOKEN_KEY)
	if (fromSession) return fromSession
	const legacy = localStorage.getItem(TOKEN_KEY)
	if (legacy) {
		sessionStorage.setItem(TOKEN_KEY, legacy)
		localStorage.removeItem(TOKEN_KEY)
		return legacy
	}
	return null
}

type AuthContextValue = {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  logout: () => void
  refreshUser: () => Promise<void>
  /** Call after email change so the JWT subject matches the new address. */
  replaceToken: (accessToken: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken())
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(() => Boolean(readStoredToken()))

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    authFetchProfile(token)
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, logout])

  const applySession = useCallback((auth: AuthResponse) => {
    sessionStorage.setItem(TOKEN_KEY, auth.accessToken)
    localStorage.removeItem(TOKEN_KEY)
    setToken(auth.accessToken)
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      const auth = await authLogin(email.trim(), password)
      applySession(auth)
      return auth
    },
    [applySession],
  )

  const refreshUser = useCallback(async () => {
    const t = readStoredToken() ?? token
    if (!t) return
    const profile = await authFetchProfile(t)
    setUser(profile)
  }, [token])

  const replaceToken = useCallback((accessToken: string) => {
    sessionStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.removeItem(TOKEN_KEY)
    setToken(accessToken)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      refreshUser,
      replaceToken,
    }),
    [user, token, loading, login, logout, refreshUser, replaceToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
