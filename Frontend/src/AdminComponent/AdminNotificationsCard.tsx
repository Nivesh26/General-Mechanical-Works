import AdminNotificationsList from './AdminNotificationsList'
import type { AdminNotificationItem } from '../lib/api'

type AdminNotificationsCardProps = {
  count: number
  notifications: AdminNotificationItem[]
}

const AdminNotificationsCard = ({ count, notifications }: AdminNotificationsCardProps) => {
  return (
    <article
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '1.2rem',
        boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Notifications</h2>
          <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '14px' }}>
            New orders and appointments that need your attention.
          </p>
        </div>
        {count > 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#b91c1c',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 999,
              padding: '0.25rem 0.6rem',
              whiteSpace: 'nowrap',
            }}
          >
            {count} pending
          </span>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <AdminNotificationsList notifications={notifications} />
      </div>
    </article>
  )
}

export default AdminNotificationsCard
