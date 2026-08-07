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
  authGoogle,
  authLogin,
  authResendLoginCode,
  authVerifyLogin,
  type UserProfile,
  type AuthResponse,
  type LoginPendingResponse,
  type Role,
} from '../lib/api'

const TOKEN_KEY = 'gmw_auth_token'

/**
 * USER → localStorage (survives new tabs / browser restart until logout).
 * ADMIN → sessionStorage (this tab/window only; other browsers stay separate).
 */
function writeStoredToken(accessToken: string, role: Role) {
  if (role === 'ADMIN') {
    sessionStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.removeItem(TOKEN_KEY)
  } else {
    localStorage.setItem(TOKEN_KEY, accessToken)
    sessionStorage.removeItem(TOKEN_KEY)
  }
}

function readStoredToken(): string | null {
  // Prefer tab-scoped admin session for this window.
  const fromSession = sessionStorage.getItem(TOKEN_KEY)
  if (fromSession) return fromSession
  return localStorage.getItem(TOKEN_KEY)
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

/** Put token in the correct store for this role (fixes leftover admin tokens in localStorage). */
function rehomeTokenForRole(accessToken: string, role: Role) {
  writeStoredToken(accessToken, role)
}

type AuthContextValue = {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginPendingResponse>
  verifyLogin: (verificationToken: string, code: string) => Promise<AuthResponse>
  resendLoginCode: (verificationToken: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>
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
    clearStoredToken()
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
        if (cancelled) return
        rehomeTokenForRole(token, profile.role)
        setUser(profile)
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

  // Sync USER login/logout across tabs (localStorage only; admin stays tab-local).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== TOKEN_KEY) return
      // Ignore when this tab has an admin session — keep admin isolated.
      if (sessionStorage.getItem(TOKEN_KEY)) return
      const next = e.newValue
      if (!next) {
        setToken(null)
        setUser(null)
        setLoading(false)
        return
      }
      setToken(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const applySession = useCallback((auth: AuthResponse) => {
    writeStoredToken(auth.accessToken, auth.role)
    setToken(auth.accessToken)
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginPendingResponse> => {
      return authLogin(email.trim(), password)
    },
    [],
  )

  const verifyLogin = useCallback(
    async (verificationToken: string, code: string): Promise<AuthResponse> => {
      const auth = await authVerifyLogin(verificationToken, code)
      applySession(auth)
      return auth
    },
    [applySession],
  )

  const resendLoginCode = useCallback(async (verificationToken: string): Promise<void> => {
    await authResendLoginCode(verificationToken)
  }, [])

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<AuthResponse> => {
      const auth = await authGoogle(idToken)
      applySession(auth)
      return auth
    },
    [applySession],
  )

  const refreshUser = useCallback(async () => {
    const t = readStoredToken() ?? token
    if (!t) return
    const profile = await authFetchProfile(t)
    rehomeTokenForRole(t, profile.role)
    setUser(profile)
  }, [token])

  const replaceToken = useCallback(
    (accessToken: string) => {
      const role = user?.role ?? 'USER'
      writeStoredToken(accessToken, role)
      setToken(accessToken)
    },
    [user?.role],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      verifyLogin,
      resendLoginCode,
      loginWithGoogle,
      logout,
      refreshUser,
      replaceToken,
    }),
    [user, token, loading, login, verifyLogin, resendLoginCode, loginWithGoogle, logout, refreshUser, replaceToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
