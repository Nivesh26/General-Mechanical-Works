import { useCallback, useEffect, useRef, useState } from 'react'
import { FiImage, FiX } from 'react-icons/fi'
import { HiOutlineChatBubbleBottomCenterText, HiXMark } from 'react-icons/hi2'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import {
  fetchMyChatMessages,
  formatChatTime,
  sendMyChatMessage,
  sendMyChatMessageWithFile,
  type ApiChatAttachmentType,
  type ApiChatMessage,
} from '../lib/chat'
import { prepareChatUploadFile } from '../lib/chatImage'
import GMWLogo from '../assets/GMWlogo.png'
import ChatMessageAttachment from './ChatMessageAttachment'

type UiMessage = {
  id: string
  sender: 'user' | 'admin'
  text: string
  time: string
  attachmentUrl?: string | null
  attachmentType?: ApiChatAttachmentType | null
  attachmentName?: string | null
  pending?: boolean
}

function mapApiMessage(message: ApiChatMessage): UiMessage {
  return {
    id: String(message.id),
    sender: message.sender === 'ADMIN' ? 'admin' : 'user',
    text: message.body,
    time: formatChatTime(message.createdAt),
    attachmentUrl: message.attachmentUrl,
    attachmentType: message.attachmentType,
    attachmentName: message.attachmentName,
  }
}

const ChatbotWidget = () => {
  const { token, user } = useAuth()
  const location = useLocation()
  const isLoggedIn = Boolean(token && user)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingSendIdRef = useRef<string | null>(null)
  const pendingPreviewUrlRef = useRef<string | null>(null)

  const finalizeSentMessage = useCallback((message: ApiChatMessage) => {
    setMessages((prev) => {
      const mapped = mapApiMessage(message)
      const withoutOwnPending =
        message.sender === 'USER' ? prev.filter((m) => !(m.pending && m.sender === 'user')) : prev

      if (withoutOwnPending.some((m) => m.id === mapped.id)) {
        pendingSendIdRef.current = null
        if (pendingPreviewUrlRef.current) {
          URL.revokeObjectURL(pendingPreviewUrlRef.current)
          pendingPreviewUrlRef.current = null
        }
        return withoutOwnPending
      }

      pendingSendIdRef.current = null
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current)
        pendingPreviewUrlRef.current = null
      }
      return [...withoutOwnPending, mapped]
    })
  }, [])

  const appendMessage = useCallback(
    (message: ApiChatMessage) => {
      finalizeSentMessage(message)
    },
    [finalizeSentMessage],
  )

  useChatWebSocket(isLoggedIn ? token : null, appendMessage)

  useEffect(() => {
    if (!open || !isLoggedIn || !token) return
    let cancelled = false
    setLoading(true)
    fetchMyChatMessages(token)
      .then((data) => {
        if (cancelled) return
        setMessages(data.map(mapApiMessage))
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
  }, [open, token, isLoggedIn])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTop = list.scrollHeight
  }, [messages.length, open])

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

  const handleSend = async () => {
    const text = input.trim()
    if ((!text && !selectedFile) || !token) return

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
        pending: true,
      },
    ])
    setInput('')
    resetFileSelection()

    try {
      const uploadFile = fileToSend ? await prepareChatUploadFile(fileToSend) : null
      const sent = uploadFile
        ? await sendMyChatMessageWithFile(token, uploadFile, textToSend || undefined)
        : await sendMyChatMessage(token, textToSend)
      finalizeSentMessage(sent)
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      pendingSendIdRef.current = null
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current)
        pendingPreviewUrlRef.current = null
      }
      setInput(textToSend)
      if (fileToSend) {
        setSelectedFile(fileToSend)
        if (fileToSend.type.startsWith('image/')) {
          setFilePreviewUrl(URL.createObjectURL(fileToSend))
        }
      }
      toast.error(err instanceof Error ? err.message : 'Could not send message.')
    }
  }

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
              <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto p-4 bg-slate-50 space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-500 text-center">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center">
                    Type a message — our team will reply here.
                  </p>
                ) : (
                  messages.map((message) => {
                    const isUser = message.sender === 'user'
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            isUser
                              ? 'bg-primary text-white rounded-br-md'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                          } ${message.pending ? 'opacity-70' : ''}`}
                        >
                          {message.attachmentUrl && message.attachmentType ? (
                            <ChatMessageAttachment
                              attachmentUrl={message.attachmentUrl}
                              attachmentType={message.attachmentType}
                              attachmentName={message.attachmentName}
                              onPreviewImage={setPreviewImageUrl}
                              maxImageWidth={200}
                            />
                          ) : null}
                          {message.text ? <div>{message.text}</div> : null}
                          <div
                            className={`text-[10px] mt-1 ${isUser ? 'text-red-100' : 'text-slate-400'}`}
                          >
                            {message.time}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-3 border-t border-slate-200 bg-white">
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
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSend()
                    }}
                    placeholder="Type your message…"
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
          className="fixed inset-0 z-[80] bg-slate-900/75 flex items-center justify-center p-4 cursor-zoom-out"
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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[70] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-red-900/30 cursor-pointer"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
      >
        <HiOutlineChatBubbleBottomCenterText className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </>
  )
}

export default ChatbotWidget
