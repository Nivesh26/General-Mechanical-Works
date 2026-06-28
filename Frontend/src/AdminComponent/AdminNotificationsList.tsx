import { Link } from 'react-router-dom'
import { FiCalendar, FiPackage } from 'react-icons/fi'
import type { AdminNotificationItem } from '../lib/api'

function formatRelativeTime(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

type AdminNotificationsListProps = {
  notifications: AdminNotificationItem[]
  compact?: boolean
  onNavigate?: () => void
}

const AdminNotificationsList = ({
  notifications,
  compact = false,
  onNavigate,
}: AdminNotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <p style={{ margin: 0, color: '#64748b', fontSize: compact ? '0.8125rem' : '0.875rem' }}>
        No new orders or appointments waiting for action.
      </p>
    )
  }

  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gap: compact ? '0.45rem' : '0.65rem',
      }}
    >
      {notifications.map((item) => {
        const Icon = item.type === 'order' ? FiPackage : FiCalendar
        const accent = item.type === 'order' ? '#1d4ed8' : '#b45309'
        const bg = item.type === 'order' ? '#eff6ff' : '#fffbeb'
        const border = item.type === 'order' ? '#bfdbfe' : '#fde68a'

        return (
          <li key={item.id}>
            <Link
              to={item.linkPath}
              onClick={onNavigate}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '0.65rem',
                alignItems: 'start',
                padding: compact ? '0.65rem 0.7rem' : '0.75rem 0.85rem',
                borderRadius: 10,
                border: `1px solid ${border}`,
                backgroundColor: bg,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: '#fff',
                  border: `1px solid ${border}`,
                  color: accent,
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: compact ? '0.78rem' : '0.8125rem',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.15rem',
                    fontSize: compact ? '0.72rem' : '0.78rem',
                    color: '#475569',
                    lineHeight: 1.45,
                  }}
                >
                  {item.message}
                </span>
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#64748b',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatRelativeTime(item.createdAt)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default AdminNotificationsList
