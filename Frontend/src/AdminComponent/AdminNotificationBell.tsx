import { useEffect, useRef, useState } from 'react'
import { FiBell } from 'react-icons/fi'
import AdminNotificationsList from './AdminNotificationsList'
import type { AdminNotificationItem } from '../lib/api'

const SEEN_TOTAL_KEY = 'gmw-admin-notifications-seen-total'

function readSeenTotal(): number {
  try {
    const raw = sessionStorage.getItem(SEEN_TOTAL_KEY)
    if (!raw) return 0
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 ? value : 0
  } catch {
    return 0
  }
}

function writeSeenTotal(total: number) {
  try {
    sessionStorage.setItem(SEEN_TOTAL_KEY, String(total))
  } catch {
    /* ignore storage errors */
  }
}

type AdminNotificationBellProps = {
  count: number
  notifications: AdminNotificationItem[]
}

const AdminNotificationBell = ({ count, notifications }: AdminNotificationBellProps) => {
  const [open, setOpen] = useState(false)
  const [seenTotal, setSeenTotal] = useState(readSeenTotal)
  const wrapRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(count)

  useEffect(() => {
    if (count < seenTotal) {
      setSeenTotal(count)
      writeSeenTotal(count)
    }
  }, [count, seenTotal])

  useEffect(() => {
    if (count > prevCountRef.current) {
      setSeenTotal((current) => Math.min(current, count))
    }
    prevCountRef.current = count
  }, [count])

  const unreadCount = count > 0 ? Math.max(0, count - seenTotal) : 0
  const showBadge = unreadCount > 0

  const markNotificationsSeen = () => {
    setSeenTotal(count)
    writeSeenTotal(count)
  }

  const handleToggle = () => {
    setOpen((current) => {
      const next = !current
      if (next) markNotificationsSeen()
      return next
    })
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="View notifications"
        aria-expanded={open}
        onClick={handleToggle}
        style={{
          border: '1px solid #e2e8f0',
          backgroundColor: open ? '#f8fafc' : '#fff',
          borderRadius: 12,
          width: 44,
          height: 44,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: '0 5px 14px rgba(15, 23, 42, 0.06)',
        }}
      >
        <FiBell size={19} color="#0f172a" />
        {showBadge && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              minWidth: 20,
              height: 20,
              padding: '0 0.35rem',
              borderRadius: 999,
              display: 'grid',
              placeItems: 'center',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#fff',
              backgroundColor: '#ef4444',
              border: '2px solid #fff',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            width: 'min(360px, calc(100vw - 2rem))',
            maxHeight: 420,
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
            zIndex: 40,
            padding: '0.85rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>Notifications</h2>
            {count > 0 && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#b91c1c',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 999,
                  padding: '0.15rem 0.5rem',
                }}
              >
                {count} pending
              </span>
            )}
          </div>
          <AdminNotificationsList
            notifications={notifications}
            compact
            onNavigate={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

export default AdminNotificationBell
