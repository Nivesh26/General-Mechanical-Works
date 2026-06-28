import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAdminNavBadges, type AdminNavBadges } from '../lib/api'
import {
  getUnreadNavBadgeCount,
  markNavBadgeSeen,
  syncSeenNavBadgeTotal,
  type AdminNavBadgeKey,
} from '../lib/adminNavBadges'

const EMPTY_BADGES: AdminNavBadges = {
  pendingOrders: 0,
  pendingAppointments: 0,
  newReviews: 0,
}

export function useAdminNavBadges() {
  const { token } = useAuth()
  const [badges, setBadges] = useState<AdminNavBadges>(EMPTY_BADGES)
  const [seenVersion, setSeenVersion] = useState(0)

  const reload = useCallback(async () => {
    if (!token) {
      setBadges(EMPTY_BADGES)
      return
    }
    try {
      const data = await fetchAdminNavBadges(token)
      setBadges(data)
      syncSeenNavBadgeTotal('orders', data.pendingOrders)
      syncSeenNavBadgeTotal('appointments', data.pendingAppointments)
      syncSeenNavBadgeTotal('reviews', data.newReviews)
    } catch {
      setBadges(EMPTY_BADGES)
    }
  }, [token])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const onFocus = () => {
      void reload()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [reload])

  const unreadOrders = useMemo(
    () => getUnreadNavBadgeCount('orders', badges.pendingOrders),
    [badges.pendingOrders, seenVersion],
  )
  const unreadAppointments = useMemo(
    () => getUnreadNavBadgeCount('appointments', badges.pendingAppointments),
    [badges.pendingAppointments, seenVersion],
  )
  const unreadReviews = useMemo(
    () => getUnreadNavBadgeCount('reviews', badges.newReviews),
    [badges.newReviews, seenVersion],
  )

  const markSeen = useCallback(
    (key: AdminNavBadgeKey) => {
      const total =
        key === 'orders'
          ? badges.pendingOrders
          : key === 'appointments'
            ? badges.pendingAppointments
            : badges.newReviews
      markNavBadgeSeen(key, total)
      setSeenVersion((value) => value + 1)
    },
    [badges.pendingAppointments, badges.pendingOrders, badges.newReviews],
  )

  return {
    badges,
    unreadOrders,
    unreadAppointments,
    unreadReviews,
    markSeen,
    reload,
  }
}
