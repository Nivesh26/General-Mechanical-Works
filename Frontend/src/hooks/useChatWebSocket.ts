import { useEffect, useRef } from 'react'
import {
  getWsChatUrl,
  parseChatWsEvent,
  type ApiAdminAssistantMessage,
  type ApiChatMessage,
  type ApiChatMessageDeleted,
} from '../lib/chat'

/** WebSocket is only for receiving live messages — sending uses REST for instant delivery. */
export function useChatWebSocket(
  token: string | null,
  onMessage: (message: ApiChatMessage) => void,
  onMessageDeleted?: (deleted: ApiChatMessageDeleted) => void,
  onAdminAssistantMessage?: (message: ApiAdminAssistantMessage) => void,
  onAiSettings?: (aiEnabled: boolean) => void,
) {
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const onMessageDeletedRef = useRef(onMessageDeleted)
  const onAdminAssistantMessageRef = useRef(onAdminAssistantMessage)
  const onAiSettingsRef = useRef(onAiSettings)
  onMessageRef.current = onMessage
  onMessageDeletedRef.current = onMessageDeleted
  onAdminAssistantMessageRef.current = onAdminAssistantMessage
  onAiSettingsRef.current = onAiSettings

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
        } else if (parsed?.event === 'admin_assistant_message') {
          onAdminAssistantMessageRef.current?.(parsed.message)
        } else if (parsed?.event === 'ai_settings') {
          onAiSettingsRef.current?.(parsed.aiEnabled)
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
      if (!ws) return
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      } else if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close()
      }
    }
  }, [token])
}
