import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL } from '../AdminComponent/adminMainStyles'
import { FiBell } from 'react-icons/fi'

const AdminDashboard = () => {
  const notificationCount = 3
  const monthlySales = [18000, 22000, 21000, 28000, 32000, 36000]
  const monthlyUsers = [120, 135, 148, 170, 182, 205]
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const maxSales = Math.max(...monthlySales)
  const maxUsers = Math.max(...monthlyUsers)
  const minSales = Math.min(...monthlySales)
  const totalSales = monthlySales.reduce((sum, value) => sum + value, 0)
  const averageSales = Math.round(totalSales / monthlySales.length)
  const growthPercent = Math.round(((monthlySales[monthlySales.length - 1] - monthlySales[0]) / monthlySales[0]) * 100)

  const userTrendPoints = monthlyUsers
    .map((sale, index) => {
      const x = (index / (monthlySales.length - 1)) * 100
      const y = 100 - (sale / maxUsers) * 100
      return `${x},${y}`
    })
    .join(' ')

  const stats = [
    {
      label: 'Total Sales',
      value: 'NRP 157,000',
      change: '+14.2% from last month',
      color: '#2563eb',
    },
    {
      label: 'Total Orders',
      value: '1,284',
      change: '+8.4% from last month',
      color: '#0d9488',
    },
    {
      label: 'Active Users',
      value: '492',
      change: '+5.1% from last month',
      color: '#9333ea',
    },
    {
      label: 'Pending Deliveries',
      value: '37',
      change: '-2.7% from last month',
      color: '#f59e0b',
    },
    {
      label: 'Total Bookings',
      value: '246',
      change: '+11.6% from last month',
      color: '#0891b2',
    },
    {
      label: 'Bookings Today',
      value: '19',
      change: '+3 new in last 2 hours',
      color: '#16a34a',
    },
  ]

  const recentOrders = [
    { id: '#ORD-1021', customer: 'Nova Engineering', status: 'Delivered' },
    { id: '#ORD-1022', customer: 'Apex Mechanics', status: 'Processing' },
    { id: '#ORD-1023', customer: 'Titan Works', status: 'Shipped' },
    { id: '#ORD-1024', customer: 'Prime Automations', status: 'Pending' },
  ]

  const orderStatusStyles: Record<string, { color: string; border: string; backgroundColor: string }> = {
    Delivered: { color: '#166534', border: '#86efac', backgroundColor: '#f0fdf4' },
    Processing: { color: '#1d4ed8', border: '#93c5fd', backgroundColor: '#eff6ff' },
    Shipped: { color: '#7c3aed', border: '#c4b5fd', backgroundColor: '#f5f3ff' },
    Pending: { color: '#9a3412', border: '#fdba74', backgroundColor: '#fff7ed' },
  }

  const bookingStatus = [
    { label: 'Confirmed', value: 124, color: '#16a34a' },
    { label: 'Pending Approval', value: 63, color: '#f59e0b' },
    { label: 'Rescheduled', value: 41, color: '#2563eb' },
    { label: 'Cancelled', value: 18, color: '#dc2626' },
  ]

  const upcomingBookings = [
    {
      id: 'BK-2201',
      client: 'Orbit Fabricators',
      slot: 'Today, 3:30 PM',
      service: 'Machine Installation',
      status: 'Confirmed',
    },
    {
      id: 'BK-2202',
      client: 'Metro Dynamics',
      slot: 'Tomorrow, 10:00 AM',
      service: 'Maintenance Visit',
      status: 'Pending',
    },
    {
      id: 'BK-2203',
      client: 'SteelCore Pvt Ltd',
      slot: 'Thu, 1:15 PM',
      service: 'Safety Inspection',
      status: 'Rescheduled',
    },
    {
      id: 'BK-2204',
      client: 'Rapid Gears',
      slot: 'Fri, 9:45 AM',
      service: 'Repair Consultation',
      status: 'Cancelled',
    },
  ]

  const bookingBadgeStyles: Record<string, { color: string; border: string; backgroundColor: string }> = {
    Confirmed: { color: '#166534', border: '#86efac', backgroundColor: '#f0fdf4' },
    Pending: { color: '#9a3412', border: '#fdba74', backgroundColor: '#fff7ed' },
    Rescheduled: { color: '#1d4ed8', border: '#93c5fd', backgroundColor: '#eff6ff' },
    Cancelled: { color: '#991b1b', border: '#fca5a5', backgroundColor: '#fef2f2' },
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Geist, sans-serif' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
          <header
            style={{
              marginBottom: '1.4rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.8rem',
            }}
          >
            <div>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem' }}>Admin Dashboard</h1>
              <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>
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

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            {stats.map((item) => (
              <article
                key={item.label}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '1rem',
                  boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
                }}
              >
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{item.label}</p>
                <h3 style={{ margin: '0.3rem 0', color: '#0f172a', fontSize: '1.4rem' }}>{item.value}</h3>
                <p style={{ margin: 0, color: item.color, fontSize: '0.8rem', fontWeight: 600 }}>{item.change}</p>
              </article>
            ))}
          </section>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <article
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '1.2rem',
                boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Sales and Users (Last 6 Months)</h2>
                  <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.86rem' }}>
                    Compare monthly sales with user activity in one view.
                  </p>
                </div>
                <div
                  style={{
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    borderRadius: 10,
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  +{growthPercent}% growth
                </div>
              </div>

              <div style={{ height: 220, margin: '1rem 0 0.8rem' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[20, 40, 60, 80].map((lineY) => (
                    <line
                      key={lineY}
                      x1="0"
                      y1={lineY}
                      x2="100"
                      y2={lineY}
                      stroke="#e2e8f0"
                      strokeWidth="0.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {monthlySales.map((sale, index) => {
                    const x = (index / (monthlySales.length - 1)) * 100
                    const y = 100 - (sale / maxSales) * 100
                    const barWidth = 9
                    return (
                      <g key={`${monthLabels[index]}-${sale}-bar`}>
                        <rect
                          x={Math.max(0, x - barWidth / 2)}
                          y={y}
                          width={barWidth}
                          height={100 - y}
                          rx="1.8"
                          fill="#bfdbfe"
                        />
                      </g>
                    )
                  })}
                  <polyline
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2.4"
                    points={userTrendPoints}
                    vectorEffect="non-scaling-stroke"
                  />
                  {monthlyUsers.map((users, index) => {
                    const x = (index / (monthlyUsers.length - 1)) * 100
                    const y = 100 - (users / maxUsers) * 100
                    return <circle key={`${monthLabels[index]}-${users}-user`} cx={x} cy={y} r="1.7" fill="#6d28d9" />
                  })}
                </svg>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
                {monthLabels.map((month, index) => (
                  <div key={month} style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{month}</p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.35 }}>
                      NRP {(monthlySales[index] / 1000).toFixed(0)}k
                    </p>
                    <p style={{ margin: '0.08rem 0 0', fontSize: '0.7rem', color: '#6d28d9', fontWeight: 600 }}>
                      {monthlyUsers[index]} users
                    </p>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: '0.95rem',
                  paddingTop: '0.8rem',
                  borderTop: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem' }}>Total</p>
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '0.86rem', fontWeight: 700 }}>
                    NRP {(totalSales / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem' }}>Average / Month</p>
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '0.86rem', fontWeight: 700 }}>
                    NRP {(averageSales / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem' }}>Range</p>
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '0.86rem', fontWeight: 700 }}>
                    NRP {(minSales / 1000).toFixed(0)}k - NRP {(maxSales / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            </article>

            <article
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '1.2rem',
                boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
              }}
            >
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Booking Status</h2>
              <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '0.86rem' }}>
                Current distribution of your service bookings.
              </p>
              {bookingStatus.map((status) => (
                <div key={status.label} style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <p style={{ margin: 0, color: '#1e293b', fontWeight: 600, fontSize: '0.84rem' }}>{status.label}</p>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.82rem' }}>{status.value}</p>
                  </div>
                  <div style={{ height: 7, backgroundColor: '#e2e8f0', borderRadius: 999 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max((status.value / 140) * 100, 12)}%`,
                        backgroundColor: status.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </article>
          </section>

          <section
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '1.2rem',
              boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
            }}
          >
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Recent Orders</h2>
            <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '0.86rem' }}>
              Latest order updates from key customers.
            </p>
            <div style={{ display: 'grid', gap: '0.7rem' }}>
              {recentOrders.map((order) => (
                (() => {
                  const statusStyle = orderStatusStyles[order.status] ?? {
                    color: '#0f172a',
                    border: '#cbd5e1',
                    backgroundColor: '#fff',
                  }
                  return (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '0.7rem 0.9rem',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>{order.id}</p>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.78rem' }}>{order.customer}</p>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: statusStyle.color,
                      fontWeight: 600,
                      padding: '0.25rem 0.55rem',
                      borderRadius: 999,
                      border: `1px solid ${statusStyle.border}`,
                      backgroundColor: statusStyle.backgroundColor,
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                  )
                })()
              ))}
            </div>
          </section>

          <section
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '1.2rem',
              boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
              marginTop: '1rem',
            }}
          >
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Upcoming Bookings</h2>
            <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '0.86rem' }}>
              Scheduled field and workshop bookings for your team.
            </p>
            <div style={{ display: 'grid', gap: '0.7rem' }}>
              {upcomingBookings.map((booking) => (
                (() => {
                  const bookingStyle = bookingBadgeStyles[booking.status] ?? {
                    color: '#0f172a',
                    border: '#cbd5e1',
                    backgroundColor: '#fff',
                  }
                  return (
                <div
                  key={booking.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.8rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '0.75rem 0.9rem',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.83rem' }}>
                      {booking.id} - {booking.client}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.78rem' }}>{booking.service}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {booking.slot}
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: bookingStyle.color,
                        fontWeight: 600,
                        padding: '0.24rem 0.58rem',
                        borderRadius: 999,
                        border: `1px solid ${bookingStyle.border}`,
                        backgroundColor: bookingStyle.backgroundColor,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
                  )
                })()
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  )
} 

export default AdminDashboard