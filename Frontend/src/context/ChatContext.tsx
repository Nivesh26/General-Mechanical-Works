import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import type { ProductEnquiryRequest } from '../lib/productEnquiry'

type ChatContextValue = {
  submitProductEnquiry: (request: ProductEnquiryRequest) => void
  registerProductEnquiryHandler: (
    handler: (request: ProductEnquiryRequest) => void,
  ) => () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((request: ProductEnquiryRequest) => void) | null>(null)
  const queuedRef = useRef<ProductEnquiryRequest | null>(null)

  const registerProductEnquiryHandler = useCallback(
    (handler: (request: ProductEnquiryRequest) => void) => {
      handlerRef.current = handler
      if (queuedRef.current) {
        const queued = queuedRef.current
        queuedRef.current = null
        handler(queued)
      }
      return () => {
        if (handlerRef.current === handler) handlerRef.current = null
      }
    },
    [],
  )

  const submitProductEnquiry = useCallback((request: ProductEnquiryRequest) => {
    if (handlerRef.current) {
      handlerRef.current(request)
    } else {
      queuedRef.current = request
    }
  }, [])

  const value = useMemo(
    () => ({ submitProductEnquiry, registerProductEnquiryHandler }),
    [submitProductEnquiry, registerProductEnquiryHandler],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
