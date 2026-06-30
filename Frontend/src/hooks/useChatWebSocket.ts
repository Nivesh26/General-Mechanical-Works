import { useEffect, useRef } from 'react'
import {
  getWsChatUrl,
  parseChatWsEvent,
  type ApiChatMessage,
  type ApiChatMessageDeleted,
} from '../lib/chat'

/** WebSocket is only for receiving live messages — sending uses REST for instant delivery. */
export function useChatWebSocket(
  token: string | null,
  onMessage: (message: ApiChatMessage) => void,
  onMessageDeleted?: (deleted: ApiChatMessageDeleted) => void,
) {
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const onMessageDeletedRef = useRef(onMessageDeleted)
  onMessageRef.current = onMessage
  onMessageDeletedRef.current = onMessageDeleted

  useEffect(() => {
    if (!token) {
      wsRef.current?.close()
      wsRef.current = null
      return
    }

    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      if (cancelled) return
      const ws = new WebSocket(getWsChatUrl(token))
      wsRef.current = ws

      ws.onmessage = (event) => {
        const parsed = parseChatWsEvent(String(event.data))
        if (parsed?.event === 'message') {
          onMessageRef.current(parsed.message)
        } else if (parsed?.event === 'message_deleted') {
          onMessageDeletedRef.current?.(parsed.deleted)
        }
      }

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null
        }
        if (!cancelled) {
          retryTimer = setTimeout(connect, 2000)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      const ws = wsRef.current
      wsRef.current = null
      if (ws) {
        ws.onmessage = null
        ws.onclose = null
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
    }
  }, [token])
}
