import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { AdminDashboardInboxChat } from '../lib/api'
import { toAbsoluteApiUrl } from '../lib/api'
import { readAdminChatSeenMap } from '../lib/adminChatUnread'
import { avatarColorForUserId, formatRelativeChatTime } from '../lib/chat'

export type InboxChatPreviewRow = {
  userId: number
  name: string
  snippet: string
  time: string
  unread: boolean
  online: boolean
  avatarUrl: string | null
  avatarColor: string
}

function mapInboxChat(chat: AdminDashboardInboxChat, adminId: number | undefined): InboxChatPreviewRow {
  const seenMap = adminId ? readAdminChatSeenMap(adminId) : {}
  const lastSeen = seenMap[String(chat.userId)] ?? 0
  const unread =
    chat.lastMessageSender === 'USER' && chat.lastMessageId > lastSeen

  return {
    userId: chat.userId,
    name: chat.userName,
    snippet: chat.snippet || 'No messages yet',
    time: formatRelativeChatTime(chat.lastMessageAt),
    unread,
    online: chat.online,
    avatarUrl: chat.profilePicture ? toAbsoluteApiUrl(chat.profilePicture) : null,
    avatarColor: avatarColorForUserId(chat.userId),
  }
}

type ChatInboxProps = {
  inboxChats?: AdminDashboardInboxChat[]
}

const ChatInbox = ({ inboxChats = [] }: ChatInboxProps) => {
  const { user } = useAuth()
  const rows = inboxChats.map((chat) => mapInboxChat(chat, user?.id))

  return (
    <article className="flex h-full min-h-0 flex-col rounded-[14px] border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_5px_18px_rgba(15,23,42,0.06)]">
      <div className="min-w-0">
        <h2 className="m-0 text-base sm:text-lg font-bold text-slate-800">Chats & Inbox</h2>
        <p className="mt-1 mb-0 text-sm text-slate-500">
          Latest customer conversations and replies.
        </p>
      </div>

      <div className="mt-4 flex flex-1 min-h-0 flex-col gap-2.5 sm:gap-3">
        {rows.length === 0 ? (
          <p className="m-0 text-sm text-slate-500">No customer chats yet.</p>
        ) : (
          rows.map((chat) => (
            <Link
              key={chat.userId}
              to={`/adminmessages?user=${chat.userId}`}
              state={{ selectUserId: String(chat.userId) }}
              className={`flex items-start gap-3 rounded-[10px] border px-3 py-2.5 sm:px-3.5 sm:py-3 no-underline transition-colors hover:border-primary/30 hover:bg-slate-50 ${
                chat.unread
                  ? 'border-primary/20 bg-primary/[0.03]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="relative shrink-0">
                {chat.avatarUrl ? (
                  <img
                    src={chat.avatarUrl}
                    alt=""
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold text-white"
                    style={{ backgroundColor: chat.avatarColor }}
                    aria-hidden
                  >
                    {chat.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? '')
                      .join('')}
                  </div>
                )}
                {chat.online ? (
                  <span
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                    aria-label="Online"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="m-0 truncate text-sm font-semibold text-slate-900">{chat.name}</p>
                  <span className="shrink-0 text-[11px] sm:text-xs font-semibold text-slate-400 whitespace-nowrap">
                    {chat.time}
                  </span>
                </div>
                <p className="mt-0.5 mb-0 truncate text-xs sm:text-[13px] leading-snug text-slate-500">
                  {chat.snippet}
                </p>
              </div>

              {chat.unread ? (
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
                  aria-label="Unread"
                />
              ) : null}
            </Link>
          ))
        )}
      </div>

      <div className="mt-4 pt-1 sm:mt-auto sm:pt-3">
        <Link
          to="/adminmessages"
          className="block w-full rounded-[10px] border border-blue-300 bg-blue-50 px-3.5 py-2.5 text-center text-sm font-semibold text-blue-700 no-underline transition-colors hover:bg-blue-100"
        >
          Open inbox
        </Link>
      </div>
    </article>
  )
}

export default ChatInbox
