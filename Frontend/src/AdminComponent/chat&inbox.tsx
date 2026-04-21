import { Link } from 'react-router-dom'

export type InboxChatPreviewRow = {
  name: string
  snippet: string
  time: string
  unread: boolean
}

/** Default chats for the Chats & Inbox card; replace with API data when available. */
export const defaultInboxChatsPreview: InboxChatPreviewRow[] = [
  { name: 'Alex Rivera', snippet: 'Thanks for confirming the maintenance slot.', time: '12m ago', unread: true },
  { name: 'Metro Dynamics', snippet: 'Can we reschedule to next Thursday?', time: '1h ago', unread: true },
  { name: 'Nova Engineering', snippet: 'Invoice looks good on our side.', time: 'Yesterday', unread: false },
]

type ChatInboxProps = {
  inboxChatsPreview?: InboxChatPreviewRow[]
}

const ChatInbox = ({ inboxChatsPreview = defaultInboxChatsPreview }: ChatInboxProps) => {
  return (
    <article
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '1.2rem',
        boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Chats & Inbox</h2>
        <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '14px' }}>
          Latest customer conversations and replies.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gap: '0.65rem',
          marginTop: '1rem',
          flex: 1,
          minHeight: 0,
          alignContent: 'start',
        }}
      >
        {inboxChatsPreview.map((chat) => (
          <div
            key={chat.name + chat.time}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '0.7rem 0.85rem',
              backgroundColor: chat.unread ? '#f8fafc' : '#fff',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '0.84rem' }}>{chat.name}</p>
              <p
                style={{
                  margin: '0.2rem 0 0',
                  color: '#64748b',
                  fontSize: '0.78rem',
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {chat.snippet}
              </p>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{chat.time}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.95rem',
        }}
      >
        <Link
          to="/adminmessages"
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1d4ed8',
            padding: '0.55rem 0.9rem',
            borderRadius: 10,
            border: '1px solid #93c5fd',
            backgroundColor: '#eff6ff',
          }}
        >
          Open inbox
        </Link>
      </div>
    </article>
  )
}

export default ChatInbox

