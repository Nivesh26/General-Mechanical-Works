import { getApiBase, toAbsoluteApiUrl } from './api'

export type ApiChatSender = 'USER' | 'ADMIN'
export type ApiChatAttachmentType = 'IMAGE' | 'PDF'

export type ApiChatMessage = {
  id: number
  userId: number
  sender: ApiChatSender
  body: string
  replyToId: number | null
  attachmentUrl: string | null
  attachmentType: ApiChatAttachmentType | null
  attachmentName: string | null
  createdAt: string
}

export type ApiChatConversation = {
  userId: number
  userName: string
  lastMessage: string
  lastMessageAt: string
  online: boolean
  profilePicture: string | null
}

export { toAbsoluteApiUrl }

export function getWsChatUrl(token: string): string {
  const base = getApiBase().replace(/^http/i, 'ws')
  return `${base.replace(/\/+$/, '')}/ws/chat?token=${encodeURIComponent(token)}`
}

export function formatChatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function chatMessagePreview(message: Pick<ApiChatMessage, 'body' | 'attachmentType'>): string {
  const text = message.body?.trim()
  if (text) return text.length > 80 ? `${text.slice(0, 80)}…` : text
  if (message.attachmentType === 'IMAGE') return 'Photo'
  if (message.attachmentType === 'PDF') return 'PDF file'
  return ''
}

const AVATAR_COLORS = ['#dc2626', '#2563eb', '#7c3aed', '#059669', '#ea580c', '#0891b2', '#be123c']

export function avatarColorForUserId(userId: number): string {
  return AVATAR_COLORS[Math.abs(userId) % AVATAR_COLORS.length]
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string }
    if (data?.message) return data.message
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

export async function fetchMyChatMessages(token: string): Promise<ApiChatMessage[]> {
  const res = await fetch(`${getApiBase()}/api/chat/me/messages`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiChatMessage[]>
}

export async function fetchAdminChatConversations(token: string): Promise<ApiChatConversation[]> {
  const res = await fetch(`${getApiBase()}/api/admin/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiChatConversation[]>
}

export async function fetchAdminChatMessages(token: string, userId: number): Promise<ApiChatMessage[]> {
  const res = await fetch(`${getApiBase()}/api/admin/chat/conversations/${userId}/messages`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiChatMessage[]>
}

export async function sendMyChatMessage(
  token: string,
  text: string,
  replyToId?: number | null,
): Promise<ApiChatMessage> {
  const res = await fetch(`${getApiBase()}/api/chat/me/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ text, replyToId: replyToId ?? null }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiChatMessage>
}

export async function sendMyChatMessageWithFile(
  token: string,
  file: File,
  text?: string,
  replyToId?: number | null,
): Promise<ApiChatMessage> {
  const form = new FormData()
  form.append('file', file)
  if (text?.trim()) form.append('text', text.trim())
  if (replyToId != null) form.append('replyToId', String(replyToId))
  const res = await fetch(`${getApiBase()}/api/chat/me/messages/with-file`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: form,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiChatMessage>
}

export async function sendAdminChatMessage(
  token: string,
  userId: number,
  text: string,
  replyToId?: number | null,
): Promise<ApiChatMessage> {
  const res = await fetch(`${getApiBase()}/api/admin/chat/conversations/${userId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ text, replyToId: replyToId ?? null, targetUserId: userId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiChatMessage>
}

export async function sendAdminChatMessageWithFile(
  token: string,
  userId: number,
  file: File,
  text?: string,
  replyToId?: number | null,
): Promise<ApiChatMessage> {
  const form = new FormData()
  form.append('file', file)
  if (text?.trim()) form.append('text', text.trim())
  if (replyToId != null) form.append('replyToId', String(replyToId))
  const res = await fetch(`${getApiBase()}/api/admin/chat/conversations/${userId}/messages/with-file`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: form,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiChatMessage>
}

export type ChatWsEvent =
  | { event: 'connected' }
  | { event: 'message'; message: ApiChatMessage }

export function parseChatWsEvent(raw: string): ChatWsEvent | null {
  try {
    const data = JSON.parse(raw) as ChatWsEvent
    if (data.event === 'connected' || data.event === 'message') return data
  } catch {
    /* ignore */
  }
  return null
}
