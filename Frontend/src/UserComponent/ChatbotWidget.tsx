import { useCallback, useEffect, useRef, useState } from 'react'
import { FiCornerUpLeft, FiImage, FiTrash2, FiX } from 'react-icons/fi'
import { HiOutlineChatBubbleBottomCenterText, HiXMark } from 'react-icons/hi2'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import {
  countUnreadAdminChatMessages,
  canDeleteChatForEveryone,
  deleteMyChatMessage,
  fetchMyChatMessages,
  formatChatTime,
  maxChatMessageId,
  readChatLastSeenMessageId,
  sendMyChatMessage,
  sendMyChatMessageWithFile,
  writeChatLastSeenMessageId,
  type ApiChatAttachmentType,
  type ApiChatMessage,
  type ApiChatMessageDeleted,
  type ChatDeleteScope,
} from '../lib/chat'
import { prepareChatUploadFile } from '../lib/chatImage'
import { scrollChatToBottom } from '../lib/chatScroll'
import { linkifyChatText } from '../lib/chatLinkify'
import {
  buildProductEnquiryMessage,
  fetchProductImageAsFile,
  type ProductEnquiryRequest,
} from '../lib/productEnquiry'
import GMWLogo from '../assets/GMWlogo.png'
import ChatMessageAttachment from './ChatMessageAttachment'

type ChatReplyPreview = {
  sender: 'user' | 'admin' | 'assistant'
  text?: string
  attachmentType?: ApiChatAttachmentType | null
  attachmentUrl?: string | null
}

type UiMessage = {
  id: string
  sender: 'user' | 'admin' | 'assistant'
  text: string
  time: string
  attachmentUrl?: string | null
  attachmentType?: ApiChatAttachmentType | null
  attachmentName?: string | null
  replyToId?: number | null
  replyTo?: ChatReplyPreview
  pending?: boolean
}

function mapApiSenderToUi(sender: ApiChatMessage['sender']): UiMessage['sender'] {
  if (sender === 'USER') return 'user'
  if (sender === 'ASSISTANT') return 'assistant'
  return 'admin'
}

function replyPreviewFromApi(message: ApiChatMessage): ChatReplyPreview {
  return {
    sender: mapApiSenderToUi(message.sender),
    text: message.body || undefined,
    attachmentType: message.attachmentType,
    attachmentUrl: message.attachmentUrl,
  }
}

function replyPreviewFromUi(message: UiMessage): ChatReplyPreview {
  return {
    sender: message.sender,
    text: message.text || undefined,
    attachmentType: message.attachmentType,
    attachmentUrl: message.attachmentUrl,
  }
}

function replyPreviewLabel(reply: ChatReplyPreview): string {
  if (reply.text?.trim()) {
    const text = reply.text.trim()
    return text.length > 72 ? `${text.slice(0, 72)}…` : text
  }
  if (reply.attachmentType === 'PDF') return 'PDF file'
  if (reply.attachmentType === 'IMAGE' || reply.attachmentUrl) return 'Photo'
  return 'Message'
}

function replySenderLabel(sender: 'user' | 'admin' | 'assistant'): string {
  if (sender === 'user') return 'You'
  if (sender === 'assistant') return 'AI Assistant'
  return 'General Mechanical Works'
}

function mapApiMessagesToUi(messages: ApiChatMessage[]): UiMessage[] {
  const byId = new Map(messages.map((message) => [message.id, message]))
  return messages.map((message) => {
    const ui: UiMessage = {
      id: String(message.id),
      sender: mapApiSenderToUi(message.sender),
      text: message.body,
      time: formatChatTime(message.createdAt),
      attachmentUrl: message.attachmentUrl,
      attachmentType: message.attachmentType,
      attachmentName: message.attachmentName,
      replyToId: message.replyToId,
    }
    if (message.replyToId != null) {
      const parent = byId.get(message.replyToId)
      if (parent) ui.replyTo = replyPreviewFromApi(parent)
    }
    return ui
  })
}

function attachReplyPreviewsToUi(messages: UiMessage[]): UiMessage[] {
  const byId = new Map<number, UiMessage>()
  for (const message of messages) {
    const id = Number(message.id)
    if (Number.isFinite(id)) byId.set(id, message)
  }
  return messages.map((message) => {
    if (message.replyToId == null) return message
    const parent = byId.get(message.replyToId)
    return parent ? { ...message, replyTo: replyPreviewFromUi(parent) } : message
  })
}

function mapApiMessage(message: ApiChatMessage): UiMessage {
  return {
    id: String(message.id),
    sender: mapApiSenderToUi(message.sender),
    text: message.body,
    time: formatChatTime(message.createdAt),
    attachmentUrl: message.attachmentUrl,
    attachmentType: message.attachmentType,
    attachmentName: message.attachmentName,
    replyToId: message.replyToId,
  }
}

const ChatbotWidget = () => {
  const { token, user } = useAuth()
  const { registerProductEnquiryHandler } = useChat()
  const location = useLocation()
  const isLoggedIn = Boolean(token && user)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [replyTarget, setReplyTarget] = useState<UiMessage | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: UiMessage } | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [aiTyping, setAiTyping] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingSendIdRef = useRef<string | null>(null)
  const pendingPreviewUrlRef = useRef<string | null>(null)
  const sendingRef = useRef(false)
  const pendingEnquiryRef = useRef<ProductEnquiryRequest | null>(null)
  const sendingEnquiryRef = useRef(false)
  const openRef = useRef(open)
  const notifiedAdminMessageIdsRef = useRef<Set<number>>(new Set())
  openRef.current = open

  const markChatAsRead = useCallback(
    (apiMessages: Pick<ApiChatMessage, 'id'>[]) => {
      if (!user?.id) return
      const maxId = maxChatMessageId(apiMessages)
      if (maxId > 0) {
        writeChatLastSeenMessageId(user.id, maxId)
      }
      apiMessages.forEach((m) => notifiedAdminMessageIdsRef.current.add(m.id))
      setUnreadCount(0)
    },
    [user?.id],
  )

  const finalizeSentMessage = useCallback((message: ApiChatMessage) => {
    setMessages((prev) => {
      const mapped = mapApiMessage(message)
      const withoutOwnPending =
        message.sender === 'USER' ? prev.filter((m) => !(m.pending && m.sender === 'user')) : prev

      let next: UiMessage[]
      if (withoutOwnPending.some((m) => m.id === mapped.id)) {
        pendingSendIdRef.current = null
        if (pendingPreviewUrlRef.current) {
          URL.revokeObjectURL(pendingPreviewUrlRef.current)
          pendingPreviewUrlRef.current = null
        }
        next = withoutOwnPending
      } else {
        pendingSendIdRef.current = null
        if (pendingPreviewUrlRef.current) {
          URL.revokeObjectURL(pendingPreviewUrlRef.current)
          pendingPreviewUrlRef.current = null
        }
        next = [...withoutOwnPending, mapped]
      }
      return attachReplyPreviewsToUi(next)
    })
  }, [])

  const appendMessage = useCallback(
    (message: ApiChatMessage) => {
      const isShopReply = message.sender === 'ADMIN' || message.sender === 'ASSISTANT'
      if (isShopReply) {
        setAiTyping(false)
      }
      if (message.sender === 'ADMIN' && !openRef.current && user?.id) {
        if (!notifiedAdminMessageIdsRef.current.has(message.id)) {
          notifiedAdminMessageIdsRef.current.add(message.id)
          const lastSeen = readChatLastSeenMessageId(user.id)
          if (message.id > lastSeen) {
            setUnreadCount((count) => count + 1)
          }
        }
      }
      if (message.sender === 'ASSISTANT' && !openRef.current && user?.id) {
        if (!notifiedAdminMessageIdsRef.current.has(message.id)) {
          notifiedAdminMessageIdsRef.current.add(message.id)
          const lastSeen = readChatLastSeenMessageId(user.id)
          if (message.id > lastSeen) {
            setUnreadCount((count) => count + 1)
          }
        }
      }
      if (openRef.current || message.sender === 'USER') {
        finalizeSentMessage(message)
      }
    },
    [finalizeSentMessage, user?.id],
  )

  const handleMessageDeleted = useCallback((deleted: ApiChatMessageDeleted) => {
    if (deleted.scope !== 'EVERYONE') return
    setMessages((prev) => prev.filter((m) => m.id !== String(deleted.messageId)))
  }, [])

  useChatWebSocket(isLoggedIn ? token : null, appendMessage, handleMessageDeleted)

  useEffect(() => {
    if (!isLoggedIn || !token || !user?.id) {
      setUnreadCount(0)
      notifiedAdminMessageIdsRef.current.clear()
      return
    }
    let cancelled = false
    fetchMyChatMessages(token)
      .then((data) => {
        if (cancelled || openRef.current) return
        data.forEach((m) => notifiedAdminMessageIdsRef.current.add(m.id))
        const lastSeen = readChatLastSeenMessageId(user.id)
        setUnreadCount(countUnreadAdminChatMessages(data, lastSeen))
      })
      .catch(() => {
        /* ignore background unread sync */
      })
    return () => {
      cancelled = true
    }
  }, [isLoggedIn, token, user?.id])

  useEffect(() => {
    if (!open || !isLoggedIn || !token) return
    let cancelled = false
    setLoading(true)
    fetchMyChatMessages(token)
      .then((data) => {
        if (cancelled) return
        setMessages(mapApiMessagesToUi(data))
        markChatAsRead(data)
      })
      .catch((err) => {
        if (cancelled) return
        toast.error(err instanceof Error ? err.message : 'Could not load chat.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, token, isLoggedIn, markChatAsRead])

  useEffect(() => {
    if (!open || loading || !user?.id) return
    const apiMessages = messages
      .filter((m) => /^\d+$/.test(m.id))
      .map((m) => ({ id: Number(m.id) }))
    markChatAsRead(apiMessages)
  }, [open, loading, messages, markChatAsRead, user?.id])

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

  const resetFileSelection = () => {
    setSelectedFile(null)
    setFilePreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const clearSelectedFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
    resetFileSelection()
  }

  const handleFilePick = (file: File | undefined) => {
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isImage && !isPdf) {
      toast.error('Use an image or PDF file.')
      return
    }
    clearSelectedFile()
    setSelectedFile(file)
    if (isImage) setFilePreviewUrl(URL.createObjectURL(file))
  }

  useEffect(() => {
    if (!aiTyping) return
    const timer = window.setTimeout(() => setAiTyping(false), 90_000)
    return () => window.clearTimeout(timer)
  }, [aiTyping])

  useEffect(() => {
    if (!open || loading) return
    scrollChatToBottom(listRef.current)
  }, [open, loading, messages, aiTyping])

  useEffect(() => {
    const list = listRef.current
    if (!list || !open) return

    const trapScroll = (event: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = list
      const atTop = scrollTop <= 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      if ((atTop && event.deltaY < 0) || (atBottom && event.deltaY > 0)) {
        event.preventDefault()
      }
    }

    list.addEventListener('wheel', trapScroll, { passive: false })
    return () => list.removeEventListener('wheel', trapScroll)
  }, [open, messages.length])

  const handleDeleteMessage = async (message: UiMessage, scope: ChatDeleteScope) => {
    if (message.pending || !token || !/^\d+$/.test(message.id)) return
    setContextMenu(null)
    setDeletingMessageId(message.id)
    try {
      await deleteMyChatMessage(token, Number(message.id), scope)
      setMessages((prev) => prev.filter((m) => m.id !== message.id))
      if (replyTarget?.id === message.id) setReplyTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete message.')
    } finally {
      setDeletingMessageId(null)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if ((!text && !selectedFile) || !token || sendingRef.current) return

    sendingRef.current = true
    const fileToSend = selectedFile
    const textToSend = text
    const savedReplyTarget = replyTarget
    const replyToId =
      savedReplyTarget && /^\d+$/.test(savedReplyTarget.id) ? Number(savedReplyTarget.id) : null
    const isPdf =
      fileToSend != null &&
      (fileToSend.type === 'application/pdf' || fileToSend.name.toLowerCase().endsWith('.pdf'))
    const localPreviewUrl =
      filePreviewUrl ??
      (fileToSend && fileToSend.type.startsWith('image/') ? URL.createObjectURL(fileToSend) : null)
    const tempId = `pending-${Date.now()}`
    pendingSendIdRef.current = tempId
    pendingPreviewUrlRef.current = localPreviewUrl

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: 'user',
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachmentUrl: localPreviewUrl,
        attachmentType: fileToSend ? (isPdf ? 'PDF' : 'IMAGE') : null,
        attachmentName: fileToSend?.name ?? null,
        replyToId,
        replyTo: savedReplyTarget ? replyPreviewFromUi(savedReplyTarget) : undefined,
        pending: true,
      },
    ])
    setInput('')
    resetFileSelection()
    setReplyTarget(null)

    try {
      const uploadFile = fileToSend ? await prepareChatUploadFile(fileToSend) : null
      const sent = uploadFile
        ? await sendMyChatMessageWithFile(token, uploadFile, textToSend || undefined, replyToId)
        : await sendMyChatMessage(token, textToSend, replyToId)
      finalizeSentMessage(sent)
      setAiTyping(true)
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      pendingSendIdRef.current = null
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current)
        pendingPreviewUrlRef.current = null
      }
      setInput(textToSend)
      setReplyTarget(savedReplyTarget)
      if (fileToSend) {
        setSelectedFile(fileToSend)
        if (fileToSend.type.startsWith('image/')) {
          setFilePreviewUrl(URL.createObjectURL(fileToSend))
        }
      }
      toast.error(err instanceof Error ? err.message : 'Could not send message.')
    } finally {
      sendingRef.current = false
    }
  }

  const sendProductEnquiry = useCallback(
    async (request: ProductEnquiryRequest, authToken: string) => {
      if (sendingEnquiryRef.current) return
      sendingEnquiryRef.current = true

      const textToSend = buildProductEnquiryMessage(request)
      let fileToSend: File | null = null
      if (request.imageUrl) {
        fileToSend = await fetchProductImageAsFile(request.imageUrl, request.name)
      }

      const tempId = `pending-enquiry-${Date.now()}`
      const localPreviewUrl =
        fileToSend && fileToSend.type.startsWith('image/')
          ? URL.createObjectURL(fileToSend)
          : request.imageUrl

      pendingSendIdRef.current = tempId
      pendingPreviewUrlRef.current =
        localPreviewUrl && localPreviewUrl.startsWith('blob:') ? localPreviewUrl : null

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender: 'user',
          text: textToSend,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachmentUrl: localPreviewUrl,
          attachmentType: fileToSend ? 'IMAGE' : null,
          attachmentName: fileToSend?.name ?? null,
          pending: true,
        },
      ])

      try {
        const uploadFile = fileToSend ? await prepareChatUploadFile(fileToSend) : null
        const sent = uploadFile
          ? await sendMyChatMessageWithFile(authToken, uploadFile, textToSend, undefined)
          : await sendMyChatMessage(authToken, textToSend, null)
        finalizeSentMessage(sent)
        setAiTyping(true)
        toast.success('Your product enquiry has been sent.')
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        pendingSendIdRef.current = null
        if (pendingPreviewUrlRef.current) {
          URL.revokeObjectURL(pendingPreviewUrlRef.current)
          pendingPreviewUrlRef.current = null
        }
        toast.error(err instanceof Error ? err.message : 'Could not send your enquiry.')
      } finally {
        sendingEnquiryRef.current = false
      }
    },
    [finalizeSentMessage],
  )

  const handleProductEnquiryRequest = useCallback(
    (request: ProductEnquiryRequest) => {
      setOpen(true)
      if (!token) {
        pendingEnquiryRef.current = request
        toast.info('Please log in to send your product enquiry.')
        return
      }
      void sendProductEnquiry(request, token)
    },
    [token, sendProductEnquiry],
  )

  useEffect(() => {
    return registerProductEnquiryHandler(handleProductEnquiryRequest)
  }, [registerProductEnquiryHandler, handleProductEnquiryRequest])

  useEffect(() => {
    if (!token || !pendingEnquiryRef.current) return
    const request = pendingEnquiryRef.current
    pendingEnquiryRef.current = null
    void sendProductEnquiry(request, token)
  }, [token, sendProductEnquiry])

  return (
    <>
      {open ? (
        <div
          className="fixed right-4 bottom-20 sm:right-6 sm:bottom-24 z-[70] w-[min(100vw-2rem,360px)] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ height: 'min(70vh, 480px)' }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 min-w-0">
              <img src={GMWLogo} alt="" className="w-10 h-10 object-contain shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">General Mechanical Works</div>
                {!isLoggedIn ? (
                  <div className="text-xs text-slate-500 font-medium">Log in to message our team</div>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer"
              aria-label="Close chat"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {isLoggedIn ? (
            <>
              <div
                ref={listRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 bg-slate-50 space-y-3"
              >
                {loading ? (
                  <p className="text-sm text-slate-500 text-center">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center">
                    Say hello — our AI assistant will reply here.
                  </p>
                ) : (
                  <>
                  {messages.map((message) => {
                    const isUser = message.sender === 'user'
                    const isAssistant = message.sender === 'assistant'
                    const linkClass = isUser
                      ? 'underline text-white hover:text-red-100'
                      : isAssistant
                        ? 'underline text-violet-700 hover:text-violet-900'
                        : 'underline text-primary hover:text-primary/80'
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          onContextMenu={(event) => {
                            if (message.pending) return
                            event.preventDefault()
                            setContextMenu({ x: event.clientX, y: event.clientY, message })
                          }}
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            isUser
                              ? 'bg-primary text-white rounded-br-md'
                              : isAssistant
                                ? 'bg-violet-50 border border-violet-200 text-slate-800 rounded-bl-md'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                          } ${message.pending ? 'opacity-70' : ''}`}
                        >
                          {!isUser ? (
                            <div className={`text-[10px] font-semibold mb-1 ${isAssistant ? 'text-violet-600' : 'text-slate-500'}`}>
                              {isAssistant ? 'AI Assistant' : 'Team'}
                            </div>
                          ) : null}
                          {message.replyTo ? (
                            <div
                              className={`mb-2 rounded-lg border-l-[3px] px-2 py-1.5 ${
                                isUser
                                  ? 'border-white/70 bg-white/10'
                                  : 'border-primary/40 bg-slate-50'
                              }`}
                            >
                              <div
                                className={`text-[10px] font-semibold ${
                                  isUser ? 'text-red-100' : 'text-slate-500'
                                }`}
                              >
                                {replySenderLabel(message.replyTo.sender)}
                              </div>
                              <div
                                className={`text-xs truncate ${
                                  isUser ? 'text-white/90' : 'text-slate-600'
                                }`}
                              >
                                {replyPreviewLabel(message.replyTo)}
                              </div>
                            </div>
                          ) : null}
                          {message.attachmentUrl && message.attachmentType ? (
                            <ChatMessageAttachment
                              attachmentUrl={message.attachmentUrl}
                              attachmentType={message.attachmentType}
                              attachmentName={message.attachmentName}
                              onPreviewImage={setPreviewImageUrl}
                              maxImageWidth={message.sender === 'assistant' ? 96 : 200}
                            />
                          ) : null}
                          {message.text ? (
                            <div className="whitespace-pre-line break-words leading-relaxed">
                              {linkifyChatText(message.text, linkClass)}
                            </div>
                          ) : null}
                          <div
                            className={`text-[10px] mt-1 ${isUser ? 'text-red-100' : 'text-slate-400'}`}
                          >
                            {message.time}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {aiTyping ? (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md px-3 py-2 text-sm bg-violet-50 border border-violet-200 text-violet-700">
                        <div className="text-[10px] font-semibold mb-1 text-violet-600">AI Assistant</div>
                        <div className="text-xs">Typing…</div>
                      </div>
                    </div>
                  ) : null}
                  </>
                )}
              </div>

              <div className="p-3 border-t border-slate-200 bg-white">
                {replyTarget ? (
                  <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <FiCornerUpLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Replying to {replySenderLabel(replyTarget.sender)}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-600">
                        {replyPreviewLabel(replyPreviewFromUi(replyTarget))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-800 cursor-pointer"
                      aria-label="Cancel reply"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : null}
                {selectedFile ? (
                  <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    {filePreviewUrl ? (
                      <img src={filePreviewUrl} alt="" className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="text-xs font-semibold text-slate-600 px-2">PDF</div>
                    )}
                    <div className="min-w-0 flex-1 text-xs text-slate-700 truncate">{selectedFile.name}</div>
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      className="p-1 rounded cursor-pointer text-slate-500 hover:text-slate-800"
                      aria-label="Remove file"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSend()
                      if (e.key === 'Escape' && replyTarget) setReplyTarget(null)
                    }}
                    placeholder={replyTarget ? 'Write your reply…' : 'Type your message…'}
                    className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary"
                  />
                  <label
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 cursor-pointer shrink-0"
                    aria-label="Attach image or PDF"
                    title="Attach image or PDF"
                  >
                    <FiImage size={18} />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        handleFilePick(e.target.files?.[0])
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold border border-red-900 cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-50">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <HiOutlineChatBubbleBottomCenterText className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Please log in to chat</p>
                <p className="text-sm text-slate-500 mt-2 max-w-[240px]">
                  Sign in to send messages to our admin team and get help with orders, bookings, and
                  more.
                </p>
              </div>
              <Link
                to="/login"
                state={{ from: location.pathname }}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold border border-red-900 cursor-pointer hover:opacity-95"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {previewImageUrl ? (
        <div
          className="fixed inset-0 z-[80] bg-slate-900/75 flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <img
            src={previewImageUrl}
            alt="Preview"
            className="max-w-[92vw] max-h-[88vh] rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}

      {contextMenu ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default bg-transparent"
            aria-label="Close message menu"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-[81] min-w-[148px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setReplyTarget(contextMenu.message)
                setContextMenu(null)
                window.setTimeout(() => inputRef.current?.focus(), 0)
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <FiCornerUpLeft className="h-4 w-4 text-primary" aria-hidden />
              Reply
            </button>
            <div className="my-1 border-t border-slate-100" role="separator" />
            <button
              type="button"
              role="menuitem"
              disabled={deletingMessageId === contextMenu.message.id}
              onClick={() => void handleDeleteMessage(contextMenu.message, 'self')}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              <FiTrash2 className="h-4 w-4 text-slate-500" aria-hidden />
              Delete for me
            </button>
            {canDeleteChatForEveryone(contextMenu.message.sender, 'user') ? (
              <button
                type="button"
                role="menuitem"
                disabled={deletingMessageId === contextMenu.message.id}
                onClick={() => void handleDeleteMessage(contextMenu.message, 'everyone')}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
              >
                <FiTrash2 className="h-4 w-4" aria-hidden />
                Delete for everyone
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[70]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white cursor-pointer shadow-[0_10px_28px_rgba(189,22,44,0.42)] ring-1 ring-white/25 transition-all duration-200 ease-out hover:scale-[1.04] hover:shadow-[0_14px_32px_rgba(189,22,44,0.48)] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={
            unreadCount > 0 && !open
              ? `Open support chat, ${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`
              : open
                ? 'Close support chat'
                : 'Open support chat'
          }
        >
          {unreadCount > 0 && !open ? (
            <span
              className="absolute inset-0 rounded-full bg-primary/25 animate-ping pointer-events-none"
              aria-hidden
            />
          ) : null}
          <span className="relative flex items-center justify-center">
            <HiOutlineChatBubbleBottomCenterText className="w-7 h-7" strokeWidth={1.75} aria-hidden />
          </span>
          {unreadCount > 0 && !open ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold leading-none text-primary shadow-[0_2px_10px_rgba(15,23,42,0.18)] ring-2 ring-primary pointer-events-none tabular-nums">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </button>
      </div>
    </>
  )
}

export default ChatbotWidget
