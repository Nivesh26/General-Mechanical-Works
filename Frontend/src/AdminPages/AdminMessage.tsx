import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { FiCornerUpLeft, FiImage, FiMoreHorizontal, FiTrash2 } from 'react-icons/fi'
import { HiOutlineMagnifyingGlass, HiOutlineShieldCheck } from 'react-icons/hi2'
import { LuBan, LuBell, LuBellOff, LuMailOpen, LuPin, LuPinOff } from 'react-icons/lu'
import { toast } from 'react-toastify'
import { useLocation, useSearchParams } from 'react-router-dom'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_MESSAGES_CLASS, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import { toAbsoluteApiUrl } from '../lib/api'
import { linkifyChatText } from '../lib/chatLinkify'
import {
  avatarColorForUserId,
  canDeleteChatForEveryone,
  deleteAdminChatMessage,
  fetchAdminAssistantMessages,
  fetchAdminChatConversations,
  fetchAdminChatMessages,
  fetchAdminConversationAi,
  formatChatTime,
  chatMessagePreview,
  maxChatMessageId,
  sendAdminAssistantMessage,
  sendAdminChatMessage,
  sendAdminChatMessageWithFile,
  setAdminConversationAi,
  type ApiAdminAssistantMessage,
  type ApiChatAttachmentType,
  type ApiChatMessage,
  type ApiChatMessageDeleted,
  type ChatDeleteScope,
} from '../lib/chat'
import GMWLogo from '../assets/GMWlogo.png'
import ChatMessageAttachment from '../UserComponent/ChatMessageAttachment'
import { prepareChatUploadFile } from '../lib/chatImage'
import { scrollChatToBottom } from '../lib/chatScroll'
import {
  fromPrefSets,
  readAdminConversationPrefs,
  toPrefSets,
  unreadIdsFromMap,
  unreadMapFromIds,
  writeAdminConversationPrefs,
} from '../lib/adminConversationPrefs'
import { resetAdminChatSeenForUser, writeAdminChatSeenForUser } from '../lib/adminChatUnread'

const CHATBOT_USER_ID = 'chatbot'

type ChatUser = {
  id: string
  name: string
  lastMessage: string
  isOnline: boolean
  lastOnline: string
  avatarColor: string
  avatarUrl?: string | null
  isAiAssistant?: boolean
}

type MessageSender = 'admin' | 'user' | 'assistant'

type ChatMessage = {
  id: string
  sender: MessageSender
  text?: string
  imageUrl?: string
  attachmentUrl?: string | null
  attachmentType?: ApiChatAttachmentType | null
  attachmentName?: string | null
  replyTo?: {
    sender: MessageSender
    text?: string
    imageUrl?: string
    attachmentType?: ApiChatAttachmentType | null
  }
  time: string
  pending?: boolean
}

const replySenderLabel = (sender: MessageSender, peerName: string | undefined) => {
  if (sender === 'admin') return 'Admin'
  if (sender === 'assistant') return 'Chatbot'
  return peerName ?? 'User'
}

const conversationMenuItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  width: '100%',
  textAlign: 'left',
  padding: '8px 10px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}

const conversationMenuIconProps = { size: 16, strokeWidth: 2.1 } as const

const CHATBOT_USER: ChatUser = {
  id: CHATBOT_USER_ID,
  name: 'Chatbot',
  lastMessage: 'Ask about bookings, orders, or appointments',
  isOnline: true,
  lastOnline: 'Always available',
  avatarColor: '#6366f1',
  isAiAssistant: true,
}

function mapAdminAssistantMessage(message: ApiAdminAssistantMessage): ChatMessage {
  return {
    id: String(message.id),
    sender: message.sender === 'ADMIN' ? 'admin' : 'assistant',
    text: message.body || undefined,
    time: formatChatTime(message.createdAt),
  }
}

function mergeAdminAssistantMessage(
  existing: ChatMessage[],
  message: ApiAdminAssistantMessage,
  options?: { removePendingId?: string },
): ChatMessage[] {
  const mapped = mapAdminAssistantMessage(message)
  let list = options?.removePendingId
    ? existing.filter((m) => m.id !== options.removePendingId)
    : existing

  if (message.sender === 'ADMIN') {
    list = list.filter((m) => !(m.pending && m.sender === 'admin'))
  }

  if (list.some((m) => m.id === mapped.id)) {
    return list
  }

  return [...list, mapped]
}

function mapApiChatMessage(message: ApiChatMessage): ChatMessage {
  const sender: MessageSender =
    message.sender === 'ADMIN' ? 'admin' : message.sender === 'ASSISTANT' ? 'assistant' : 'user'
  return {
    id: String(message.id),
    sender,
    text: message.body || undefined,
    attachmentUrl: message.attachmentUrl,
    attachmentType: message.attachmentType,
    attachmentName: message.attachmentName,
    imageUrl: message.attachmentType === 'IMAGE' ? message.attachmentUrl ?? undefined : undefined,
    time: formatChatTime(message.createdAt),
  }
}

function conversationToChatUser(conv: {
  userId: number
  userName: string
  lastMessage: string
  lastMessageAt: string
  online: boolean
  profilePicture?: string | null
}): ChatUser {
  return {
    id: String(conv.userId),
    name: conv.userName,
    lastMessage: conv.lastMessage || 'No messages yet',
    isOnline: conv.online,
    lastOnline: conv.lastMessageAt || '—',
    avatarColor: avatarColorForUserId(conv.userId),
    avatarUrl: conv.profilePicture ? toAbsoluteApiUrl(conv.profilePicture) : null,
  }
}

function ChatUserAvatar({
  user,
  size,
  fontSize = 12,
  marginRight,
}: {
  user: Pick<ChatUser, 'name' | 'avatarColor' | 'avatarUrl' | 'isAiAssistant'>
  size: number
  fontSize?: number
  marginRight?: number
}) {
  const label = user.isAiAssistant ? 'AI' : getInitials(user.name)
  const sharedStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '999px',
    flexShrink: 0,
    ...(marginRight != null ? { marginRight: `${marginRight}px` } : {}),
  }

  if (user.avatarUrl && !user.isAiAssistant) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        style={{ ...sharedStyle, objectFit: 'cover', backgroundColor: user.avatarColor }}
      />
    )
  }

  return (
    <div
      style={{
        ...sharedStyle,
        backgroundColor: user.avatarColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${fontSize}px`,
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  )
}

const unreadConversationListDotStyle: CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '999px',
  flexShrink: 0,
  backgroundColor: '#22c55e',
}

const AdminMessage = () => {
  const { token, user } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const resolveInitialUserId = () => {
    const fromQuery = searchParams.get('user')
    if (fromQuery && fromQuery !== CHATBOT_USER_ID) return fromQuery
    const fromState = (location.state as { selectUserId?: string } | null)?.selectUserId
    if (fromState && fromState !== CHATBOT_USER_ID) return fromState
    return CHATBOT_USER_ID
  }
  const [liveUsers, setLiveUsers] = useState<ChatUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState(resolveInitialUserId)
  const [removedUserIds, setRemovedUserIds] = useState<Set<string>>(new Set())
  const [pinnedUserIds, setPinnedUserIds] = useState<string[]>([])
  const [unreadByUserId, setUnreadByUserId] = useState<Record<string, boolean>>({})
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set())
  const [conversationMenuUserId, setConversationMenuUserId] = useState<string | null>(null)
  const [hoveredConversationUserId, setHoveredConversationUserId] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: ChatMessage } | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [aiEnabledByUserId, setAiEnabledByUserId] = useState<Record<string, boolean>>({})
  const [aiToggleLoading, setAiToggleLoading] = useState(false)
  const [assistantTyping, setAssistantTyping] = useState(false)
  const [assistantSending, setAssistantSending] = useState(false)
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const pendingSendIdRef = useRef<string | null>(null)
  const pendingPreviewUrlRef = useRef<string | null>(null)
  const prefsLoadedForAdminRef = useRef<number | null>(null)
  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>({
    [CHATBOT_USER_ID]: [],
  })

  const chatbotUser = useMemo((): ChatUser => {
    const messages = messagesByUser[CHATBOT_USER_ID] ?? []
    const last = messages.at(-1)
    const preview = last?.text?.trim()
      ? last.text.length > 80
        ? `${last.text.slice(0, 80)}…`
        : last.text
      : CHATBOT_USER.lastMessage
    return {
      ...CHATBOT_USER,
      lastMessage: preview,
      lastOnline: last?.time ?? CHATBOT_USER.lastOnline,
    }
  }, [messagesByUser])

  const users = useMemo(() => [chatbotUser, ...liveUsers], [chatbotUser, liveUsers])

  const visibleUsers = useMemo(
    () => users.filter((user) => !removedUserIds.has(user.id)),
    [users, removedUserIds]
  )

  const orderedUsers = useMemo(() => {
    const chatbotUser = visibleUsers.find((u) => u.id === CHATBOT_USER_ID)
    const others = visibleUsers.filter((u) => u.id !== CHATBOT_USER_ID)
    const pinned = pinnedUserIds.filter((id) => others.some((u) => u.id === id))
    const pinnedSet = new Set(pinned)
    const rest = others.filter((u) => !pinnedSet.has(u.id))
    const pinnedUsers = pinned
      .map((id) => others.find((u) => u.id === id))
      .filter((u): u is ChatUser => Boolean(u))
    const orderedRest = [...pinnedUsers, ...rest]
    return chatbotUser ? [chatbotUser, ...orderedRest] : orderedRest
  }, [visibleUsers, pinnedUserIds])

  const selectedUser = orderedUsers.find((user) => user.id === selectedUserId)
  const selectedMessages = messagesByUser[selectedUserId] ?? []
  const isSelectedUserBlocked = blockedUserIds.has(selectedUserId)
  const isRealUserConversation = selectedUserId !== CHATBOT_USER_ID
  const selectedAiEnabled = isRealUserConversation
    ? (aiEnabledByUserId[selectedUserId] ?? true)
    : true
  const lastSelectedMessageId = selectedMessages.at(-1)?.id
  const filteredUsers = orderedUsers.filter((user) => user.name.toLowerCase().includes(userSearch.toLowerCase()))

  const saveConversationPrefs = useCallback(
    (overrides?: {
      pinnedUserIds?: string[]
      mutedUserIds?: Set<string>
      blockedUserIds?: Set<string>
      removedUserIds?: Set<string>
      unreadByUserId?: Record<string, boolean>
    }) => {
      if (!user?.id) return
      const unreadMap = overrides?.unreadByUserId ?? unreadByUserId
      writeAdminConversationPrefs(
        user.id,
        fromPrefSets(
          overrides?.pinnedUserIds ?? pinnedUserIds,
          overrides?.mutedUserIds ?? mutedUserIds,
          overrides?.blockedUserIds ?? blockedUserIds,
          overrides?.removedUserIds ?? removedUserIds,
          unreadIdsFromMap(unreadMap),
        ),
      )
    },
    [user?.id, pinnedUserIds, mutedUserIds, blockedUserIds, removedUserIds, unreadByUserId],
  )

  const loadConversations = useCallback(async () => {
    if (!token) return
    try {
      const conversations = await fetchAdminChatConversations(token)
      setLiveUsers(conversations.map(conversationToChatUser))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load conversations.')
    }
  }, [token])

  const loadAssistantMessages = useCallback(async () => {
    if (!token) return
    try {
      const messages = await fetchAdminAssistantMessages(token)
      setMessagesByUser((prev) => ({
        ...prev,
        [CHATBOT_USER_ID]: messages.map(mapAdminAssistantMessage),
      }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load AI assistant chat.')
    }
  }, [token])

  const loadMessagesForUser = useCallback(
    async (userId: string) => {
      if (!token || userId === CHATBOT_USER_ID) return
      try {
        const messages = await fetchAdminChatMessages(token, Number(userId))
        setMessagesByUser((prev) => ({
          ...prev,
          [userId]: messages.map(mapApiChatMessage),
        }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not load messages.')
      }
    },
    [token],
  )

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!user?.id) {
      prefsLoadedForAdminRef.current = null
      return
    }
    if (prefsLoadedForAdminRef.current === user.id) return
    const prefs = readAdminConversationPrefs(user.id)
    const loaded = toPrefSets(prefs)
    setPinnedUserIds(loaded.pinnedUserIds)
    setMutedUserIds(loaded.mutedUserIds)
    setBlockedUserIds(loaded.blockedUserIds)
    setRemovedUserIds(loaded.removedUserIds)
    setUnreadByUserId(unreadMapFromIds(loaded.unreadUserIds))
    prefsLoadedForAdminRef.current = user.id
  }, [user?.id])

  useEffect(() => {
    const fromQuery = searchParams.get('user')
    const fromState = (location.state as { selectUserId?: string } | null)?.selectUserId
    const target = fromQuery || fromState
    if (target && target !== CHATBOT_USER_ID) {
      setSelectedUserId(target)
    }
  }, [location.state, searchParams])

  useEffect(() => {
    if (selectedUserId === CHATBOT_USER_ID) return
    setUnreadByUserId((prev) => {
      if (!prev[selectedUserId]) return prev
      const next = { ...prev }
      delete next[selectedUserId]
      saveConversationPrefs({ unreadByUserId: next })
      return next
    })
  }, [selectedUserId, saveConversationPrefs])

  useEffect(() => {
    if (selectedUserId === CHATBOT_USER_ID) {
      void loadAssistantMessages()
      return
    }
    void loadMessagesForUser(selectedUserId)
  }, [selectedUserId, loadAssistantMessages, loadMessagesForUser])

  useEffect(() => {
    if (!token || selectedUserId === CHATBOT_USER_ID) return
    let cancelled = false
    fetchAdminConversationAi(token, Number(selectedUserId))
      .then((settings) => {
        if (cancelled) return
        setAiEnabledByUserId((prev) => ({ ...prev, [selectedUserId]: settings.aiEnabled }))
      })
      .catch(() => {
        /* default AI on */
      })
    return () => {
      cancelled = true
    }
  }, [token, selectedUserId])

  const handleAiToggle = async () => {
    if (!token || selectedUserId === CHATBOT_USER_ID) return
    const next = !selectedAiEnabled
    setAiToggleLoading(true)
    try {
      const settings = await setAdminConversationAi(token, Number(selectedUserId), next)
      setAiEnabledByUserId((prev) => ({ ...prev, [selectedUserId]: settings.aiEnabled }))
      toast.success(settings.aiEnabled ? 'AI replies turned on' : 'You are replying — AI is off')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update AI setting.')
    } finally {
      setAiToggleLoading(false)
    }
  }

  useEffect(() => {
    if (selectedUserId === CHATBOT_USER_ID || !user?.id) return
    const messages = messagesByUser[selectedUserId] ?? []
    const numericIds = messages
      .filter((message) => /^\d+$/.test(message.id))
      .map((message) => ({ id: Number(message.id) }))
    const maxId = maxChatMessageId(numericIds)
    if (maxId > 0) {
      writeAdminChatSeenForUser(user.id, selectedUserId, maxId)
    }
  }, [messagesByUser, selectedUserId, user?.id])

  const handleIncomingMessage = useCallback(
    (message: ApiChatMessage) => {
      const userKey = String(message.userId)
      const preview = chatMessagePreview(message)
      const time = formatChatTime(message.createdAt)

      setMessagesByUser((prev) => {
        const existing = prev[userKey] ?? []
        const withoutPending =
          message.sender === 'ADMIN' ? existing.filter((m) => !m.pending) : existing

        if (withoutPending.some((m) => m.id === String(message.id))) {
          if (message.sender === 'ADMIN') {
            if (pendingPreviewUrlRef.current) {
              URL.revokeObjectURL(pendingPreviewUrlRef.current)
              pendingPreviewUrlRef.current = null
            }
            pendingSendIdRef.current = null
          }
          return { ...prev, [userKey]: withoutPending }
        }

        if (message.sender === 'ADMIN') {
          if (pendingPreviewUrlRef.current) {
            URL.revokeObjectURL(pendingPreviewUrlRef.current)
            pendingPreviewUrlRef.current = null
          }
          pendingSendIdRef.current = null
        }

        return {
          ...prev,
          [userKey]: [...withoutPending, mapApiChatMessage(message)],
        }
      })
      setLiveUsers((prev) => {
        const idx = prev.findIndex((u) => u.id === userKey)
        if (idx === -1) {
          return [
            {
              id: userKey,
              name: `User #${message.userId}`,
              lastMessage: preview,
              isOnline: message.sender === 'USER',
              lastOnline: time,
              avatarColor: avatarColorForUserId(message.userId),
            },
            ...prev,
          ]
        }
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          lastMessage: preview,
          lastOnline: time,
          isOnline: message.sender === 'USER' ? true : next[idx].isOnline,
        }
        return next
      })
      if (selectedUserId !== userKey && message.sender === 'USER' && !mutedUserIds.has(userKey)) {
        setUnreadByUserId((prev) => {
          const next = { ...prev, [userKey]: true }
          saveConversationPrefs({ unreadByUserId: next })
          return next
        })
      }
      if (selectedUserId === userKey && message.sender === 'USER' && user?.id) {
        writeAdminChatSeenForUser(user.id, userKey, message.id)
      }
    },
    [selectedUserId, user?.id, mutedUserIds, saveConversationPrefs],
  )

  const handleIncomingAdminAssistantMessage = useCallback((message: ApiAdminAssistantMessage) => {
    if (message.sender === 'ASSISTANT') {
      setAssistantTyping(false)
    }
    setMessagesByUser((prev) => ({
      ...prev,
      [CHATBOT_USER_ID]: mergeAdminAssistantMessage(prev[CHATBOT_USER_ID] ?? [], message),
    }))
  }, [])

  const handleMessageDeleted = useCallback((deleted: ApiChatMessageDeleted) => {
    if (deleted.scope !== 'EVERYONE') return
    const userKey = String(deleted.userId)
    setMessagesByUser((prev) => ({
      ...prev,
      [userKey]: (prev[userKey] ?? []).filter((m) => m.id !== String(deleted.messageId)),
    }))
  }, [])

  useChatWebSocket(token, handleIncomingMessage, handleMessageDeleted, handleIncomingAdminAssistantMessage)

  useEffect(() => {
    if (orderedUsers.length === 0) return
    if (orderedUsers.some((user) => user.id === selectedUserId)) return
    // Deep link from dashboard: keep selection until conversations finish loading.
    if (/^\d+$/.test(selectedUserId)) return
    setSelectedUserId(orderedUsers[0].id)
  }, [orderedUsers, selectedUserId])

  useEffect(() => {
    if (!conversationMenuUserId) return
    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest('[data-conversation-menu]')) {
        setConversationMenuUserId(null)
      }
    }
    document.addEventListener('mousedown', closeOnOutside)
    return () => document.removeEventListener('mousedown', closeOnOutside)
  }, [conversationMenuUserId])

  useEffect(() => {
    scrollChatToBottom(messageListRef.current)
  }, [selectedUserId, selectedMessages.length, lastSelectedMessageId, assistantTyping])

  useEffect(() => {
    if (!contextMenu) return
    const closeMenu = () => setContextMenu(null)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', closeMenu, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', closeMenu, true)
    }
  }, [contextMenu])

  const handleDeleteMessage = async (message: ChatMessage, scope: ChatDeleteScope) => {
    if (message.pending || !token || selectedUserId === CHATBOT_USER_ID || !/^\d+$/.test(message.id)) return
    setContextMenu(null)
    setDeletingMessageId(message.id)
    try {
      await deleteAdminChatMessage(token, Number(selectedUserId), Number(message.id), scope)
      setMessagesByUser((prev) => ({
        ...prev,
        [selectedUserId]: (prev[selectedUserId] ?? []).filter((m) => m.id !== message.id),
      }))
      if (replyTarget?.id === message.id) setReplyTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete message.')
    } finally {
      setDeletingMessageId(null)
    }
  }

  const togglePinConversation = (userId: string) => {
    const nextPinned = pinnedUserIds.includes(userId)
      ? pinnedUserIds.filter((id) => id !== userId)
      : [userId, ...pinnedUserIds.filter((id) => id !== userId)]
    setPinnedUserIds(nextPinned)
    saveConversationPrefs({ pinnedUserIds: nextPinned })
    setConversationMenuUserId(null)
  }

  const deleteConversation = (userId: string) => {
    if (userId === CHATBOT_USER_ID) return
    const nextRemoved = new Set(removedUserIds).add(userId)
    const nextPinned = pinnedUserIds.filter((id) => id !== userId)
    const nextUnread = { ...unreadByUserId }
    delete nextUnread[userId]
    const nextBlocked = new Set(blockedUserIds)
    nextBlocked.delete(userId)
    const nextMuted = new Set(mutedUserIds)
    nextMuted.delete(userId)
    setRemovedUserIds(nextRemoved)
    setConversationMenuUserId(null)
    setPinnedUserIds(nextPinned)
    setUnreadByUserId(nextUnread)
    setBlockedUserIds(nextBlocked)
    setMutedUserIds(nextMuted)
    saveConversationPrefs({
      removedUserIds: nextRemoved,
      pinnedUserIds: nextPinned,
      unreadByUserId: nextUnread,
      blockedUserIds: nextBlocked,
      mutedUserIds: nextMuted,
    })
    if (selectedUserId === userId) {
      setSelectedUserId(CHATBOT_USER_ID)
    }
  }

  const markConversationUnread = (userId: string) => {
    const nextUnread = { ...unreadByUserId, [userId]: true }
    setUnreadByUserId(nextUnread)
    saveConversationPrefs({ unreadByUserId: nextUnread })
    if (user?.id) {
      const messages = messagesByUser[userId] ?? []
      const numericIds = messages
        .filter((message) => /^\d+$/.test(message.id))
        .map((message) => ({ id: Number(message.id) }))
      const maxId = maxChatMessageId(numericIds)
      if (maxId > 0) {
        resetAdminChatSeenForUser(user.id, userId, maxId)
      }
    }
    setConversationMenuUserId(null)
  }

  const toggleBlockConversation = (userId: string) => {
    const nextBlocked = new Set(blockedUserIds)
    if (nextBlocked.has(userId)) nextBlocked.delete(userId)
    else nextBlocked.add(userId)
    setBlockedUserIds(nextBlocked)
    saveConversationPrefs({ blockedUserIds: nextBlocked })
    setConversationMenuUserId(null)
  }

  const toggleMuteConversation = (userId: string) => {
    const nextMuted = new Set(mutedUserIds)
    if (nextMuted.has(userId)) nextMuted.delete(userId)
    else nextMuted.add(userId)
    setMutedUserIds(nextMuted)
    saveConversationPrefs({ mutedUserIds: nextMuted })
    setConversationMenuUserId(null)
  }

  const handleSendMessage = async () => {
    const text = messageInput.trim()
    if (!text && !selectedFile) return

    if (isSelectedUserBlocked && selectedUserId !== CHATBOT_USER_ID) {
      toast.info('Unblock this user before sending messages.')
      return
    }

    if (selectedUserId === CHATBOT_USER_ID) {
      if (!token || assistantSending) return
      if (selectedFile) {
        toast.info('File attachments are not supported in the AI assistant chat yet.')
        return
      }
      const textToSend = text
      const tempId = `pending-assistant-${Date.now()}`
      const optimistic: ChatMessage = {
        id: tempId,
        sender: 'admin',
        text: textToSend || undefined,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pending: true,
      }
      setAssistantSending(true)
      setMessagesByUser((prev) => ({
        ...prev,
        [selectedUserId]: [...(prev[selectedUserId] ?? []), optimistic],
      }))
      setMessageInput('')
      clearSelectedFile()
      setReplyTarget(null)
      setAssistantTyping(true)
      try {
        const saved = await sendAdminAssistantMessage(token, textToSend)
        setMessagesByUser((prev) => ({
          ...prev,
          [selectedUserId]: mergeAdminAssistantMessage(prev[selectedUserId] ?? [], saved, {
            removePendingId: tempId,
          }),
        }))
      } catch (err) {
        setAssistantTyping(false)
        setMessagesByUser((prev) => ({
          ...prev,
          [selectedUserId]: (prev[selectedUserId] ?? []).filter((m) => m.id !== tempId),
        }))
        toast.error(err instanceof Error ? err.message : 'Could not send message to AI assistant.')
      } finally {
        setAssistantSending(false)
      }
      return
    }

    if (!token) return
    const replyToId = replyTarget ? Number(replyTarget.id) : null
    const savedReplyTarget = replyTarget
    const fileToSend = selectedFile
    const textToSend = text
    const isPdf =
      fileToSend != null &&
      (fileToSend.type === 'application/pdf' || fileToSend.name.toLowerCase().endsWith('.pdf'))
    const localPreviewUrl =
      filePreviewUrl ??
      (fileToSend && fileToSend.type.startsWith('image/') ? URL.createObjectURL(fileToSend) : null)
    const tempId = `pending-${Date.now()}`
    pendingSendIdRef.current = tempId
    pendingPreviewUrlRef.current = localPreviewUrl

    const optimistic: ChatMessage = {
      id: tempId,
      sender: 'admin',
      text: textToSend || undefined,
      attachmentUrl: localPreviewUrl,
      attachmentType: fileToSend ? (isPdf ? 'PDF' : 'IMAGE') : null,
      attachmentName: fileToSend?.name ?? null,
      imageUrl: localPreviewUrl ?? undefined,
      replyTo: savedReplyTarget
        ? {
            sender: savedReplyTarget.sender,
            text: savedReplyTarget.text,
            imageUrl: savedReplyTarget.imageUrl,
            attachmentType: savedReplyTarget.attachmentType,
          }
        : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true,
    }

    setMessagesByUser((prev) => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] ?? []), optimistic],
    }))
    setLiveUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === selectedUserId)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        lastMessage: chatMessagePreview({
          body: textToSend,
          attachmentType: optimistic.attachmentType ?? null,
        }),
        lastOnline: optimistic.time,
      }
      return next
    })
    setMessageInput('')
    resetFileSelection()
    setReplyTarget(null)

    try {
      const uploadFile = fileToSend ? await prepareChatUploadFile(fileToSend) : null
      const sent = uploadFile
        ? await sendAdminChatMessageWithFile(
            token,
            Number(selectedUserId),
            uploadFile,
            textToSend || undefined,
            replyToId,
          )
        : await sendAdminChatMessage(token, Number(selectedUserId), textToSend, replyToId)

      pendingSendIdRef.current = null
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current)
        pendingPreviewUrlRef.current = null
      }

      setMessagesByUser((prev) => {
        const existing = prev[selectedUserId] ?? []
        const withoutPending = existing.filter((m) => !m.pending)
        if (withoutPending.some((m) => m.id === String(sent.id))) {
          return { ...prev, [selectedUserId]: withoutPending }
        }
        return {
          ...prev,
          [selectedUserId]: [...withoutPending, mapApiChatMessage(sent)],
        }
      })
    } catch (err) {
      setMessagesByUser((prev) => ({
        ...prev,
        [selectedUserId]: (prev[selectedUserId] ?? []).filter((m) => m.id !== tempId),
      }))
      pendingSendIdRef.current = null
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current)
        pendingPreviewUrlRef.current = null
      }
      setMessageInput(textToSend)
      if (fileToSend) {
        setSelectedFile(fileToSend)
        if (fileToSend.type.startsWith('image/')) {
          setFilePreviewUrl(URL.createObjectURL(fileToSend))
        }
      }
      setReplyTarget(savedReplyTarget)
      toast.error(err instanceof Error ? err.message : 'Could not send message.')
    }
  }

  const resetFileSelection = () => {
    setSelectedFile(null)
    setFilePreviewUrl(null)
  }

  const clearSelectedFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
    resetFileSelection()
  }

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_MESSAGES_CLASS}>
        <div style={{ ...ADMIN_PAGE_HEADER_SPACING, flexShrink: 0 }}>
          <h1 style={ADMIN_PAGE_TITLE}>Messages</h1>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] border border-slate-200 rounded-xl bg-white overflow-hidden">
          <aside
            style={{
              borderRight: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                flexShrink: 0,
                padding: '12px 14px',
                borderBottom: '1px solid #e2e8f0',
                fontWeight: 600,
              }}
            >
              User Conversations
            </div>

            <div
              style={{
                flexShrink: 0,
                padding: '10px 12px',
                borderBottom: '1px solid #e2e8f0',
                position: 'relative',
              }}
            >
              <HiOutlineMagnifyingGlass
                style={{
                  position: 'absolute',
                  left: '22px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
                size={16}
              />
              <input
                type="text"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search user..."
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 34px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'thin',
              }}
            >
              {filteredUsers.map((user) => {
                const isActive = user.id === selectedUserId
                const isPinned = pinnedUserIds.includes(user.id)
                const isBlocked = blockedUserIds.has(user.id)
                const isMuted = mutedUserIds.has(user.id)
                const hasUnread = Boolean(unreadByUserId[user.id]) && !isMuted
                const menuOpen = conversationMenuUserId === user.id
                const isHovered = hoveredConversationUserId === user.id
                const showMuteIconInActionsSlot = isMuted && !menuOpen && !isHovered
                const showThreeDotButton =
                  !user.isAiAssistant && !showMuteIconInActionsSlot && (isHovered || menuOpen)

                return (
                  <div
                    key={user.id}
                    onMouseEnter={() => setHoveredConversationUserId(user.id)}
                    onMouseLeave={(event) => {
                      const next = event.relatedTarget as Node | null
                      if (next && event.currentTarget.contains(next)) return
                      setHoveredConversationUserId((current) => (current === user.id ? null : current))
                    }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#fee2e2' : 'transparent',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id)
                        setUnreadByUserId((prev) => {
                          if (!prev[user.id]) return prev
                          const next = { ...prev }
                          delete next[user.id]
                          saveConversationPrefs({ unreadByUserId: next })
                          return next
                        })
                      }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: 'transparent',
                        padding: '12px 6px 12px 14px',
                        cursor: 'pointer',
                        opacity: isBlocked ? 0.55 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flexShrink: 0 }}>
                          <ChatUserAvatar user={user} size={34} fontSize={12} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: hasUnread ? 700 : 600,
                                color: '#1e293b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {user.name}
                            </span>
                            {isPinned ? (
                              <span
                                title="Pinned"
                                aria-label="Pinned"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  color: '#b45309',
                                  flexShrink: 0,
                                }}
                              >
                                <LuPin size={14} strokeWidth={2.25} aria-hidden />
                              </span>
                            ) : null}
                            {isBlocked ? (
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#b91c1c' }}>Blocked</span>
                            ) : null}
                            {user.isAiAssistant ? (
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1' }}>Assistant</span>
                            ) : null}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: hasUnread ? 700 : 400,
                              color: hasUnread ? '#334155' : '#64748b',
                              marginTop: '3px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {user.lastMessage}
                          </div>
                        </div>
                      </div>
                    </button>

                    <div
                      data-conversation-menu
                      style={{
                        flexShrink: 0,
                        alignSelf: 'center',
                        padding: '0 10px 0 4px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {showMuteIconInActionsSlot ? (
                          <button
                            type="button"
                            aria-label="Muted conversation options"
                            aria-expanded={menuOpen}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConversationMenuUserId((current) => (current === user.id ? null : user.id))
                            }}
                            title="Muted — open options"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748b',
                              flexShrink: 0,
                              minWidth: '30px',
                              minHeight: '30px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              opacity: showMuteIconInActionsSlot ? 1 : 0,
                              pointerEvents: showMuteIconInActionsSlot ? 'auto' : 'none',
                              transition: 'opacity 120ms ease',
                            }}
                          >
                            <LuBellOff size={18} strokeWidth={2.25} aria-hidden />
                          </button>
                        ) : (
                          <button
                            type="button"
                            aria-label="Conversation options"
                            aria-expanded={menuOpen}
                            onClick={(event) => {
                              event.stopPropagation()
                              setConversationMenuUserId((current) => (current === user.id ? null : user.id))
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '999px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                              flexShrink: 0,
                              opacity: showThreeDotButton ? 1 : 0,
                              pointerEvents: showThreeDotButton ? 'auto' : 'none',
                              transition: 'opacity 120ms ease',
                            }}
                          >
                            <FiMoreHorizontal size={16} strokeWidth={2.5} />
                          </button>
                        )}

                        {menuOpen ? (
                          <div
                            role="menu"
                            style={{
                              position: 'absolute',
                              right: '0',
                              top: '100%',
                              marginTop: '6px',
                              minWidth: '168px',
                              padding: '6px',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
                              zIndex: 20,
                            }}
                          >
                          {!hasUnread ? (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => markConversationUnread(user.id)}
                              style={conversationMenuItemStyle}
                            >
                              <span>Mark as unread</span>
                              <LuMailOpen {...conversationMenuIconProps} aria-hidden style={{ flexShrink: 0 }} />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => togglePinConversation(user.id)}
                            style={conversationMenuItemStyle}
                          >
                            <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                            {isPinned ? (
                              <LuPinOff {...conversationMenuIconProps} aria-hidden style={{ flexShrink: 0 }} />
                            ) : (
                              <LuPin {...conversationMenuIconProps} aria-hidden style={{ flexShrink: 0 }} />
                            )}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => toggleMuteConversation(user.id)}
                            style={conversationMenuItemStyle}
                          >
                            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                            {isMuted ? (
                              <LuBell {...conversationMenuIconProps} aria-hidden style={{ flexShrink: 0 }} />
                            ) : (
                              <LuBellOff {...conversationMenuIconProps} aria-hidden style={{ flexShrink: 0 }} />
                            )}
                          </button>
                          {user.isAiAssistant ? null : (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                const ok = window.confirm(
                                  `Delete the conversation with "${user.name}"? This will remove it from your list and cannot be undone.`
                                )
                                if (!ok) return
                                deleteConversation(user.id)
                              }}
                              style={{ ...conversationMenuItemStyle, color: '#b91c1c' }}
                            >
                              <span>Delete</span>
                              <FiTrash2 size={16} strokeWidth={2} aria-hidden style={{ flexShrink: 0 }} />
                            </button>
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => toggleBlockConversation(user.id)}
                            style={conversationMenuItemStyle}
                          >
                            <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                            {isBlocked ? (
                              <HiOutlineShieldCheck size={18} aria-hidden style={{ flexShrink: 0 }} />
                            ) : (
                              <LuBan {...conversationMenuIconProps} aria-hidden style={{ flexShrink: 0 }} />
                            )}
                          </button>
                        </div>
                      ) : null}
                      </div>
                      {hasUnread ? (
                        <span
                          title="Unread messages"
                          aria-label="Unread messages"
                          style={unreadConversationListDotStyle}
                        />
                      ) : null}
                    </div>
                  </div>
                )
              })}
              {filteredUsers.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>No users found.</div>
              ) : null}
            </div>
          </aside>

          <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <header
              style={{
                borderBottom: '1px solid #e2e8f0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {selectedUser ? (
                <ChatUserAvatar user={selectedUser} size={36} fontSize={13} />
              ) : (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '999px',
                    backgroundColor: '#94a3b8',
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                  {selectedUser?.name ?? 'Select a user'}
                </div>
                {selectedUser ? (
                  <div
                    style={{
                      fontSize: '12px',
                      marginTop: '2px',
                      color: selectedUser.isAiAssistant
                        ? '#6366f1'
                        : isRealUserConversation
                          ? selectedAiEnabled
                            ? '#6366f1'
                            : '#059669'
                          : selectedUser.isOnline
                            ? '#059669'
                            : '#94a3b8',
                      fontWeight:
                        selectedUser.isAiAssistant ||
                        selectedUser.isOnline ||
                        (isRealUserConversation && !selectedAiEnabled)
                          ? 600
                          : 500,
                    }}
                  >
                    {selectedUser.isAiAssistant
                      ? 'AI assistant · Ready to help'
                      : isRealUserConversation
                        ? selectedAiEnabled
                          ? 'AI handling replies'
                          : 'Human reply mode'
                        : selectedUser.isOnline
                          ? 'Online'
                          : `Last online on ${selectedUser.lastOnline}`}
                  </div>
                ) : null}
              </div>
              {isRealUserConversation ? (
                <button
                  type="button"
                  onClick={() => void handleAiToggle()}
                  disabled={aiToggleLoading}
                  style={{
                    flexShrink: 0,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: selectedAiEnabled ? '1px solid #c4b5fd' : '1px solid #86efac',
                    backgroundColor: selectedAiEnabled ? '#ede9fe' : '#dcfce7',
                    color: selectedAiEnabled ? '#5b21b6' : '#166534',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: aiToggleLoading ? 'wait' : 'pointer',
                  }}
                >
                  {aiToggleLoading ? 'Saving…' : selectedAiEnabled ? 'AI ON' : 'AI OFF'}
                </button>
              ) : null}
            </header>

            <div
              ref={messageListRef}
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '14px',
                backgroundColor: '#f8fafc',
              }}
            >
              {selectedMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  {(message.sender === 'user' || message.sender === 'assistant') && selectedUser ? (
                    <ChatUserAvatar
                      user={{
                        ...selectedUser,
                        isAiAssistant: message.sender === 'assistant',
                        avatarColor:
                          message.sender === 'assistant' ? '#6366f1' : selectedUser.avatarColor,
                      }}
                      size={30}
                      fontSize={message.sender === 'assistant' ? 9 : 11}
                      marginRight={8}
                    />
                  ) : null}
                  <div
                    onContextMenu={(event) => {
                      if (message.pending || selectedUserId === CHATBOT_USER_ID) return
                      event.preventDefault()
                      setContextMenu({ x: event.clientX, y: event.clientY, message })
                    }}
                    style={{
                      maxWidth: '70%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      opacity: message.pending ? 0.7 : 1,
                      backgroundColor:
                        message.sender === 'admin' ? '#dbeafe' : message.sender === 'assistant' ? '#ede9fe' : '#ffffff',
                      border:
                        message.sender === 'assistant' ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                    }}
                  >
                    {message.replyTo ? (
                      <div
                        style={{
                          borderLeft: '3px solid #94a3b8',
                          paddingLeft: '8px',
                          marginBottom: '8px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                          Reply to {replySenderLabel(message.replyTo.sender, selectedUser?.name)}
                        </div>
                        {message.replyTo.imageUrl ? (
                          <div style={{ fontSize: '11px', color: '#475569' }}>Image</div>
                        ) : null}
                        {message.replyTo.text ? (
                          <div style={{ fontSize: '12px', color: '#475569' }}>{message.replyTo.text}</div>
                        ) : null}
                      </div>
                    ) : null}
                    {message.attachmentUrl && message.attachmentType ? (
                      <ChatMessageAttachment
                        attachmentUrl={message.attachmentUrl}
                        attachmentType={message.attachmentType}
                        attachmentName={message.attachmentName}
                        onPreviewImage={setPreviewImageUrl}
                        maxImageWidth={message.sender === 'assistant' ? 96 : 220}
                      />
                    ) : message.imageUrl ? (
                      <img
                        src={message.imageUrl}
                        alt="Message attachment"
                        onClick={() => setPreviewImageUrl(message.imageUrl ?? null)}
                        style={{
                          maxWidth: '220px',
                          maxHeight: '180px',
                          width: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          display: 'block',
                          marginBottom: message.text ? '8px' : '0',
                          cursor: 'pointer',
                        }}
                      />
                    ) : null}
                    {message.text ? (
                      <div style={{ fontSize: '15px', color: '#334155', whiteSpace: 'pre-line', wordBreak: 'break-word', lineHeight: 1.5 }}>
                        {linkifyChatText(
                          message.text,
                          message.sender === 'assistant'
                            ? 'underline text-violet-700 hover:text-violet-900'
                            : 'underline text-primary hover:text-primary/80',
                        )}
                      </div>
                    ) : null}
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>{message.time}</div>
                  </div>
                  {message.sender === 'admin' && (
                    <img
                      src={GMWLogo}
                      alt="Admin"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        objectFit: 'contain',
                        backgroundColor: '#ffffff',
                        padding: '2px',
                        boxSizing: 'border-box',
                        border: '1px solid #e2e8f0',
                        marginLeft: '8px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))}
              {selectedUserId === CHATBOT_USER_ID && assistantTyping ? (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      maxWidth: '75%',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      backgroundColor: '#ede9fe',
                      border: '1px solid #c4b5fd',
                      color: '#5b21b6',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#6366f1' }}>
                      AI Assistant
                    </div>
                    <div style={{ fontSize: '13px' }}>Typing…</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                padding: '10px 12px',
                flexShrink: 0,
                backgroundColor: '#ffffff',
              }}
            >
              {isSelectedUserBlocked && selectedUserId !== CHATBOT_USER_ID ? (
                <div
                  style={{
                    marginBottom: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  This user is blocked. Unblock them from the conversation menu to send messages.
                </div>
              ) : null}
              {replyTarget ? (
                <div
                  style={{
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '8px 10px',
                    border: '1px solid #dbe2ea',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                      Replying to {replySenderLabel(replyTarget.sender, selectedUser?.name)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      {replyTarget.text ??
                        (replyTarget.attachmentType === 'PDF'
                          ? 'PDF'
                          : replyTarget.imageUrl || replyTarget.attachmentUrl
                            ? 'Image'
                            : 'Message')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTarget(null)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : null}

              {selectedFile ? (
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {filePreviewUrl ? (
                    <img
                      src={filePreviewUrl}
                      alt="Selected attachment"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      PDF
                    </div>
                  )}
                  <span style={{ flex: 1, fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fff1f2',
                      color: '#b91c1c',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  opacity: isSelectedUserBlocked || (selectedUserId === CHATBOT_USER_ID && assistantSending)
                    ? 0.55
                    : 1,
                }}
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleSendMessage()
                  }}
                  placeholder={
                    isSelectedUserBlocked ? 'Unblock user to send messages…' : 'Type your message...'
                  }
                  disabled={
                    isSelectedUserBlocked ||
                    (selectedUserId === CHATBOT_USER_ID && assistantSending)
                  }
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
                <label
                  aria-label="Upload image or PDF"
                  title="Upload image or PDF"
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSelectedUserBlocked ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    opacity: isSelectedUserBlocked ? 0.6 : 1,
                  }}
                >
                  <FiImage size={18} />
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    style={{ display: 'none' }}
                    disabled={isSelectedUserBlocked}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      const isImage = file.type.startsWith('image/')
                      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
                      if (!isImage && !isPdf) {
                        toast.error('Use an image or PDF file.')
                        event.currentTarget.value = ''
                        return
                      }
                      clearSelectedFile()
                      setSelectedFile(file)
                      if (isImage) setFilePreviewUrl(URL.createObjectURL(file))
                      event.currentTarget.value = ''
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={
                    isSelectedUserBlocked ||
                    (selectedUserId === CHATBOT_USER_ID && assistantSending)
                  }
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #991b1b',
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: isSelectedUserBlocked ? 'not-allowed' : 'pointer',
                    opacity: isSelectedUserBlocked ? 0.6 : 1,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {contextMenu ? (
        <>
          <button
            type="button"
            aria-label="Close message menu"
            onClick={() => setContextMenu(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1200,
              border: 'none',
              background: 'transparent',
              cursor: 'default',
            }}
          />
          <div
            role="menu"
            style={{
              position: 'fixed',
              zIndex: 1201,
              left: contextMenu.x,
              top: contextMenu.y,
              minWidth: '180px',
              overflow: 'hidden',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              padding: '4px 0',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)',
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setReplyTarget(contextMenu.message)
                setContextMenu(null)
              }}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                color: '#334155',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <FiCornerUpLeft size={16} color="#bd162c" aria-hidden />
              Reply
            </button>
            <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '4px 0' }} />
            <button
              type="button"
              role="menuitem"
              disabled={deletingMessageId === contextMenu.message.id}
              onClick={() => void handleDeleteMessage(contextMenu.message, 'self')}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                color: '#334155',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <FiTrash2 size={16} aria-hidden />
              Delete for me
            </button>
            {canDeleteChatForEveryone(contextMenu.message.sender, 'admin') ? (
              <button
                type="button"
                role="menuitem"
                disabled={deletingMessageId === contextMenu.message.id}
                onClick={() => void handleDeleteMessage(contextMenu.message, 'everyone')}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <FiTrash2 size={16} aria-hidden />
                Delete for everyone
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      {previewImageUrl ? (
        <div
          onClick={() => setPreviewImageUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={previewImageUrl}
            alt="Image preview"
            onClick={(event) => event.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '88vh',
              borderRadius: '12px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
              backgroundColor: '#ffffff',
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export default AdminMessage