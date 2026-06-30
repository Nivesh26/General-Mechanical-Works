import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import {
  ADMIN_CHAT_UNREAD_SYNC_EVENT,
  fetchAdminChatUnreadCount,
} from '../lib/adminChatUnread'
import type { ApiChatMessage, ApiChatMessageDeleted } from '../lib/chat'

export function useAdminChatUnread() {
  const { token, user } = useAuth()
  const adminId = user?.id ?? null
  const [unreadCount, setUnreadCount] = useState(0)

  const reload = useCallback(async () => {
    if (!token || !adminId) {
      setUnreadCount(0)
      return
    }
    try {
      const count = await fetchAdminChatUnreadCount(token, adminId)
      setUnreadCount(count)
    } catch {
      setUnreadCount(0)
    }
  }, [adminId, token])

  const handleIncomingMessage = useCallback(
    (message: ApiChatMessage) => {
      if (!adminId) return
      if (message.sender === 'USER') {
        void reload()
      }
    },
    [adminId, reload],
  )

  const handleMessageDeleted = useCallback((deleted: ApiChatMessageDeleted) => {
    if (deleted.scope !== 'EVERYONE') return
    void reload()
  }, [reload])

  useChatWebSocket(token, handleIncomingMessage, handleMessageDeleted)

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const onSync = () => {
      void reload()
    }
    window.addEventListener(ADMIN_CHAT_UNREAD_SYNC_EVENT, onSync)
    window.addEventListener('focus', onSync)
    return () => {
      window.removeEventListener(ADMIN_CHAT_UNREAD_SYNC_EVENT, onSync)
      window.removeEventListener('focus', onSync)
    }
  }, [reload])

  return { unreadCount, reload }
}
