import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMyCart } from '../lib/api'
import { useAuth } from './AuthContext'

type CartContextValue = {
  cartCount: number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCartCount(0)
      return
    }
    try {
      const rows = await fetchMyCart(token)
      setCartCount(rows.length)
    } catch {
      setCartCount(0)
    }
  }, [token])

  useEffect(() => {
    void refreshCart()
  }, [refreshCart])

  const value = useMemo(
    () => ({ cartCount, refreshCart }),
    [cartCount, refreshCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
