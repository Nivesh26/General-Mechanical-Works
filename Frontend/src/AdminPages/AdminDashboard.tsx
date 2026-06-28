import { useEffect, useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import Dashboardtop from '../AdminComponent/Dashboardtop'
import RecentOrder from '../AdminComponent/RecentOrder'
import Upcomingbooking from '../AdminComponent/Upcomingbooking'
import ChatInbox from '../AdminComponent/chat&inbox'
import SalesGraph from '../AdminComponent/SalesGraph'
import ServiceAvailabilityCard from '../AdminComponent/ServiceAvailabilityCard'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import { fetchAdminDashboard, type AdminDashboardData } from '../lib/api'
import { FiBell } from 'react-icons/fi'

const AdminDashboard = () => {
  const { token } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setDashboard(null)
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchAdminDashboard(token)
        if (!cancelled) setDashboard(data)
      } catch (err) {
        if (!cancelled) {
          setDashboard(null)
          setError(err instanceof Error ? err.message : 'Could not load dashboard')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  const notificationCount = dashboard?.notificationCount ?? 0

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <section style={{ width: '100%', boxSizing: 'border-box' }}>
          <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <h1 style={ADMIN_PAGE_TITLE}>Admin Dashboard</h1>
              <p style={ADMIN_PAGE_SUBTITLE}>
                Monitor sales performance, customer activity, and order progress in one place.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                aria-label="View notifications"
                style={{
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#fff',
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
                {notificationCount > 0 && (
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
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {error && (
            <p
              style={{
                margin: '0 0 1rem',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                fontSize: '0.875rem',
              }}
              role="alert"
            >
              {error}
            </p>
          )}

          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem' }}>Loading dashboard…</p>
          ) : (
            <>
              <Dashboardtop stats={dashboard?.stats} />

              <section style={{ marginBottom: '1rem' }}>
                <SalesGraph
                  monthlySales={dashboard?.monthlySales}
                  monthlyUsers={dashboard?.monthlyUsers}
                  monthLabels={dashboard?.monthLabels}
                />
              </section>

              <section
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  <RecentOrder orders={dashboard?.recentOrders ?? []} />
                  <Upcomingbooking bookings={dashboard?.upcomingBookings ?? []} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  <ChatInbox />
                  <ServiceAvailabilityCard availability={dashboard?.serviceAvailability ?? []} />
                </div>
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard
