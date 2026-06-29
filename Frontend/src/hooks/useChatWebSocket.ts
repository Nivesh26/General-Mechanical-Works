import { useCallback, useEffect, useRef, useState } from 'react'
import { getWsChatUrl, parseChatWsEvent, type ApiChatMessage } from '../lib/chat'

export function useChatWebSocket(
  token: string | null,
  onMessage: (message: ApiChatMessage) => void,
) {
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const [ready, setReady] = useState(false)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!token) {
      wsRef.current?.close()
      wsRef.current = null
      setReady(false)
      return
    }

    let cancelled = false
    const ws = new WebSocket(getWsChatUrl(token))
    wsRef.current = ws

    ws.onopen = () => {
      if (!cancelled) setReady(true)
    }

    ws.onmessage = (event) => {
      const parsed = parseChatWsEvent(String(event.data))
      if (parsed?.event === 'message') {
        onMessageRef.current(parsed.message)
      }
    }

    ws.onclose = () => {
      if (!cancelled) setReady(false)
      if (wsRef.current === ws) {
        wsRef.current = null
      }
    }

    return () => {
      cancelled = true
      setReady(false)
      ws.onopen = null
      ws.onmessage = null
      ws.onclose = null
      if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
      if (wsRef.current === ws) {
        wsRef.current = null
      }
    }
  }, [token])

  const getSocket = useCallback(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return null
    return ws
  }, [ready])

  return { getSocket, ready }
}
