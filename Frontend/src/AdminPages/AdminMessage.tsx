import { useEffect, useMemo, useRef, useState } from 'react'
import { FiImage } from 'react-icons/fi'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import GMWLogo from '../assets/GMWlogo.png'

type ChatUser = {
  id: string
  name: string
  lastMessage: string
  isOnline: boolean
  lastOnline: string
  avatarColor: string
}

type ChatMessage = {
  id: string
  sender: 'admin' | 'user'
  text?: string
  imageUrl?: string
  replyTo?: {
    sender: 'admin' | 'user'
    text?: string
    imageUrl?: string
  }
  time: string
}

const AdminMessage = () => {
  const users: ChatUser[] = useMemo(
    () => [
      {
        id: 'u1',
        name: 'Nivesh Shrestha',
        lastMessage: 'Can I book service for tomorrow?',
        isOnline: true,
        lastOnline: 'Today 11:20 AM',
        avatarColor: '#dc2626',
      },
      {
        id: 'u2',
        name: 'Aarav Sharma',
        lastMessage: 'Please update my order status.',
        isOnline: false,
        lastOnline: 'Today 10:58 AM',
        avatarColor: '#2563eb',
      },
      {
        id: 'u3',
        name: 'Diya Patel',
        lastMessage: 'Do you have premium brake kits?',
        isOnline: false,
        lastOnline: 'Yesterday 7:42 PM',
        avatarColor: '#7c3aed',
      },
    ],
    []
  )

  const [selectedUserId, setSelectedUserId] = useState(users[0].id)
  const [userSearch, setUserSearch] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null)
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>({
    u1: [
      { id: 'm1', sender: 'user', text: 'Hello admin, I need servicing help.', time: '10:30 AM' },
      { id: 'm2', sender: 'admin', text: 'Sure. Please share your vehicle model.', time: '10:32 AM' },
      { id: 'm3', sender: 'user', text: 'Can I book service for tomorrow?', time: '10:34 AM' },
    ],
    u2: [
      { id: 'm4', sender: 'user', text: 'Please update my order status.', time: '9:58 AM' },
      { id: 'm5', sender: 'admin', text: 'Your order is packed and will ship today.', time: '10:05 AM' },
    ],
    u3: [{ id: 'm6', sender: 'user', text: 'Do you have premium brake kits?', time: '9:46 AM' }],
  })

  const selectedUser = users.find((user) => user.id === selectedUserId)
  const selectedMessages = messagesByUser[selectedUserId] ?? []
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(userSearch.toLowerCase()))

  useEffect(() => {
    const messageList = messageListRef.current
    if (!messageList) return
    messageList.scrollTop = messageList.scrollHeight
  }, [selectedUserId, selectedMessages.length])

  const handleSendMessage = () => {
    const text = messageInput.trim()
    if (!text && !selectedImageUrl) return

    const newMessage: ChatMessage = {
      id: `${selectedUserId}-${Date.now()}`,
      sender: 'admin',
      text: text || undefined,
      imageUrl: selectedImageUrl || undefined,
      replyTo: replyTarget
        ? {
            sender: replyTarget.sender,
            text: replyTarget.text,
            imageUrl: replyTarget.imageUrl,
          }
        : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessagesByUser((prev) => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] ?? []), newMessage],
    }))
    setMessageInput('')
    setSelectedImageUrl(null)
    setReplyTarget(null)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main
        style={{
          marginLeft: '280px',
          padding: '24px',
          height: '100vh',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1 style={{ margin: '0 0 14px 0', fontSize: '24px', color: '#1e293b' }}>Messages</h1>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <aside style={{ borderRight: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
              User Conversations
            </div>

            <div
              style={{
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

            {filteredUsers.map((user) => {
              const isActive = user.id === selectedUserId
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#fee2e2' : 'transparent',
                    padding: '12px 14px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '999px',
                        backgroundColor: user.avatarColor,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(user.name)}
                    </div>

                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{user.lastMessage}</div>
                    </div>
                  </div>
                </button>
              )
            })}
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>No users found.</div>
            ) : null}
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
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '999px',
                  backgroundColor: selectedUser?.avatarColor ?? '#94a3b8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {getInitials(selectedUser?.name ?? 'U')}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                  {selectedUser?.name ?? 'Select a user'}
                </div>
                {selectedUser ? (
                  <div
                    style={{
                      fontSize: '12px',
                      marginTop: '2px',
                      color: selectedUser.isOnline ? '#059669' : '#94a3b8',
                      fontWeight: selectedUser.isOnline ? 600 : 500,
                    }}
                  >
                    {selectedUser.isOnline ? 'Online' : `Last online on ${selectedUser.lastOnline}`}
                  </div>
                ) : null}
              </div>
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
                  {message.sender === 'user' && (
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '999px',
                        backgroundColor: selectedUser?.avatarColor ?? '#94a3b8',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        marginRight: '8px',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(selectedUser?.name ?? 'U')}
                    </div>
                  )}
                  <div
                    onContextMenu={(event) => {
                      event.preventDefault()
                      setReplyTarget(message)
                    }}
                    style={{
                      maxWidth: '70%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: message.sender === 'admin' ? '#dbeafe' : '#ffffff',
                      border: '1px solid #e2e8f0',
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
                          Reply to {message.replyTo.sender === 'admin' ? 'Admin' : selectedUser?.name}
                        </div>
                        {message.replyTo.imageUrl ? (
                          <div style={{ fontSize: '11px', color: '#475569' }}>Image</div>
                        ) : null}
                        {message.replyTo.text ? (
                          <div style={{ fontSize: '12px', color: '#475569' }}>{message.replyTo.text}</div>
                        ) : null}
                      </div>
                    ) : null}
                    {message.imageUrl ? (
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
                          cursor: 'zoom-in',
                        }}
                      />
                    ) : null}
                    {message.text ? <div style={{ fontSize: '15px', color: '#334155' }}>{message.text}</div> : null}
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
            </div>

            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                padding: '10px 12px',
                flexShrink: 0,
                backgroundColor: '#ffffff',
              }}
            >
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
                      Replying to {replyTarget.sender === 'admin' ? 'Admin' : selectedUser?.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      {replyTarget.text ?? (replyTarget.imageUrl ? 'Image' : 'Message')}
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

              {selectedImageUrl ? (
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={selectedImageUrl}
                    alt="Selected attachment"
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImageUrl(null)}
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
                    Remove image
                  </button>
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSendMessage()
                  }}
                  placeholder="Type your message..."
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
                  aria-label="Upload image"
                  title="Upload image"
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
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <FiImage size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      setSelectedImageUrl(URL.createObjectURL(file))
                      event.currentTarget.value = ''
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #991b1b',
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

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