export type AdminNavBadgeKey = 'orders' | 'appointments' | 'reviews'

const SEEN_KEYS: Record<AdminNavBadgeKey, string> = {
  orders: 'gmw-admin-seen-orders',
  appointments: 'gmw-admin-seen-appointments',
  reviews: 'gmw-admin-seen-reviews',
}

export function readSeenNavBadgeTotal(key: AdminNavBadgeKey): number {
  try {
    const raw = sessionStorage.getItem(SEEN_KEYS[key])
    if (!raw) return 0
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 ? value : 0
  } catch {
    return 0
  }
}

export function writeSeenNavBadgeTotal(key: AdminNavBadgeKey, total: number) {
  try {
    sessionStorage.setItem(SEEN_KEYS[key], String(total))
  } catch {
    /* ignore storage errors */
  }
}

export function getUnreadNavBadgeCount(key: AdminNavBadgeKey, total: number): number {
  if (total <= 0) return 0
  const seen = readSeenNavBadgeTotal(key)
  return Math.max(0, total - seen)
}

export function markNavBadgeSeen(key: AdminNavBadgeKey, total: number) {
  writeSeenNavBadgeTotal(key, total)
}

export function syncSeenNavBadgeTotal(key: AdminNavBadgeKey, total: number) {
  const seen = readSeenNavBadgeTotal(key)
  if (total < seen) {
    writeSeenNavBadgeTotal(key, total)
  }
}
