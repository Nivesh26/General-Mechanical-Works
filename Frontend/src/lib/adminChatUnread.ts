import {
  fetchAdminChatConversations,
  fetchAdminChatMessages,
  type ApiChatMessage,
} from './chat'
import { readAdminConversationPrefs } from './adminConversationPrefs'

export const ADMIN_CHAT_UNREAD_SYNC_EVENT = 'gmw-admin-chat-unread-sync'

function adminChatSeenStorageKey(adminId: number): string {
  return `gmw-admin-chat-seen-${adminId}`
}

export function readAdminChatSeenMap(adminId: number): Record<string, number> {
  try {
    const raw = localStorage.getItem(adminChatSeenStorageKey(adminId))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, number>
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

export function writeAdminChatSeenForUser(
  adminId: number,
  userId: number | string,
  messageId: number,
): void {
  if (messageId <= 0) return
  const map = readAdminChatSeenMap(adminId)
  const key = String(userId)
  map[key] = Math.max(map[key] ?? 0, messageId)
  localStorage.setItem(adminChatSeenStorageKey(adminId), JSON.stringify(map))
  window.dispatchEvent(new Event(ADMIN_CHAT_UNREAD_SYNC_EVENT))
}

export function resetAdminChatSeenForUser(
  adminId: number,
  userId: number | string,
  lastMessageId: number,
): void {
  const map = readAdminChatSeenMap(adminId)
  const key = String(userId)
  if (lastMessageId <= 1) {
    delete map[key]
  } else {
    map[key] = lastMessageId - 1
  }
  localStorage.setItem(adminChatSeenStorageKey(adminId), JSON.stringify(map))
  window.dispatchEvent(new Event(ADMIN_CHAT_UNREAD_SYNC_EVENT))
}

export function countUnreadUserChatMessages(
  messages: ApiChatMessage[],
  lastSeenMessageId: number,
): number {
  return messages.filter((m) => m.sender === 'USER' && m.id > lastSeenMessageId).length
}

export function isUserChatMessageUnread(
  message: Pick<ApiChatMessage, 'id' | 'sender' | 'userId'>,
  adminId: number,
): boolean {
  if (message.sender !== 'USER') return false
  const seenMap = readAdminChatSeenMap(adminId)
  const lastSeen = seenMap[String(message.userId)] ?? 0
  return message.id > lastSeen
}

export async function fetchAdminChatUnreadCount(
  token: string,
  adminId: number,
): Promise<number> {
  const seenMap = readAdminChatSeenMap(adminId)
  const mutedIds = new Set(readAdminConversationPrefs(adminId).mutedUserIds)
  const conversations = await fetchAdminChatConversations(token)
  if (conversations.length === 0) return 0

  const counts = await Promise.all(
    conversations.map(async (conversation) => {
      if (mutedIds.has(String(conversation.userId))) return 0
      const messages = await fetchAdminChatMessages(token, conversation.userId)
      const lastSeen = seenMap[String(conversation.userId)] ?? 0
      return countUnreadUserChatMessages(messages, lastSeen)
    }),
  )

  return counts.reduce((sum, count) => sum + count, 0)
}
