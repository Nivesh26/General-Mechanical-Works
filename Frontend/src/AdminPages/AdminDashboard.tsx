import { useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { Link } from 'react-router-dom'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { FiBell } from 'react-icons/fi'

function bookingDonutSlicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  sweepAngle: number,
): string {
  if (sweepAngle <= 0) return ''
  const endAngle = startAngle + sweepAngle
  const largeArc = sweepAngle > Math.PI ? 1 : 0
  const x0 = cx + rOuter * Math.cos(startAngle)
  const y0 = cy + rOuter * Math.sin(startAngle)
  const x1 = cx + rOuter * Math.cos(endAngle)
  const y1 = cy + rOuter * Math.sin(endAngle)
  const x2 = cx + rInner * Math.cos(endAngle)
  const y2 = cy + rInner * Math.sin(endAngle)
  const x3 = cx + rInner * Math.cos(startAngle)
  const y3 = cy + rInner * Math.sin(startAngle)
  return `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1} ${y1} L ${x2} ${y2} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x3} ${y3} Z`
}

const dashboardChartTooltipBox: CSSProperties = {
  position: 'absolute',
  zIndex: 20,
  minWidth: 120,
  maxWidth: 220,
  padding: '0.45rem 0.6rem',
  borderRadius: 8,
  backgroundColor: '#0f172a',
  color: '#f8fafc',
  fontSize: '0.72rem',
  lineHeight: 1.45,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.22)',
  pointerEvents: 'none',
}

const getStatChangeStyle = (changeText: string): CSSProperties => {
  const normalized = changeText.toLowerCase()
  if (normalized.startsWith('-') || normalized.includes('down') || normalized.includes('decline')) {
    return {
      color: '#b91c1c',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
    }
  }
  if (normalized.startsWith('+')) {
    return {
      color: '#166534',
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
    }
  }
  return {
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
  }
}

const getStatAccentColor = (changeText: string): string => {
  const normalized = changeText.toLowerCase()
  if (normalized.startsWith('-') || normalized.includes('down') || normalized.includes('decline')) return '#dc2626'
  if (normalized.startsWith('+')) return '#16a34a'
  return '#2563eb'
}

const AdminDashboard = () => {
  const bookingPieWrapRef = useRef<HTMLDivElement>(null)
  const [bookingPieTip, setBookingPieTip] = useState<{ label: string; value: number; pct: number } | null>(null)
  const [bookingPieTipPos, setBookingPieTipPos] = useState({ x: 0, y: 0 })

  const [salesChartIdx, setSalesChartIdx] = useState<number | null>(null)
  const [salesChartTipPos, setSalesChartTipPos] = useState({ x: 0, y: 0 })

  const syncBookingPieTipPos = (e: ReactMouseEvent) => {
    const el = bookingPieWrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setBookingPieTipPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const notificationCount = 3
  const monthlySales = [18000, 22000, 21000, 28000, 32000, 36000]
  const monthlyUsers = [120, 135, 148, 170, 182, 205]
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const maxSales = Math.max(...monthlySales)
  const maxUsers = Math.max(...monthlyUsers)
  const minSales = Math.min(...monthlySales)
  const totalSales = monthlySales.reduce((sum, value) => sum + value, 0)
  const averageSales = Math.round(totalSales / monthlySales.length)

  const userTrendCoordinates = monthlyUsers.map((value, index) => {
    const x = (index / (monthlyUsers.length - 1)) * 100
    const y = 86 - ((value - Math.min(...monthlyUsers)) / (maxUsers - Math.min(...monthlyUsers) || 1)) * 56
    return { x, y }
  })

  const createSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length < 2) return ''
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1]
      const curr = points[i]
      const controlX = (prev.x + curr.x) / 2
      path += ` C ${controlX} ${prev.y}, ${controlX} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return path
  }

  const trendLinePath = createSmoothPath(userTrendCoordinates)
  const trendAreaPath = `${trendLinePath} L 100 100 L 0 100 Z`

  const stats = [
    {
      label: 'Total Sales',
      value: 'NRP 157,000',
      change: '+14.2% from last month',
      color: '#0f172a',
    },
    {
      label: 'Total Orders',
      value: '1,284',
      change: '-8.4% from last month',
      color: '#0f172a',
    },
    {
      label: 'Active Users',
      value: '492',
      change: '+5.1% from last month',
      color: '#0f172a',
    },
    {
      label: 'Total Bookings',
      value: '246',
      change: '+11.6% from last month',
      color: '#0f172a',
    },
    {
      label: 'Bookings Today',
      value: '19',
      change: '-3 in last 2 hours',
      color: '#0f172a',
    },
  ]

  const recentOrders = [
    { id: '#ORD-1021', customer: 'Nova Engineering', status: 'Delivered' },
    { id: '#ORD-1022', customer: 'Apex Mechanics', status: 'Processing' },
    { id: '#ORD-1023', customer: 'Titan Works', status: 'Shipped' },
    { id: '#ORD-1024', customer: 'Prime Automations', status: 'Pending' },
  ]

  const inboxChatsPreview = [
    { name: 'Alex Rivera', snippet: 'Thanks for confirming the maintenance slot.', time: '12m ago', unread: true },
    { name: 'Metro Dynamics', snippet: 'Can we reschedule to next Thursday?', time: '1h ago', unread: true },
    { name: 'Nova Engineering', snippet: 'Invoice looks good on our side.', time: 'Yesterday', unread: false },
  ]

  const dashboardQuickLinks = [
    { label: 'Orders', to: '/adminorders', blurb: 'Search and update fulfilment status' },
    { label: 'Products', to: '/adminproducts', blurb: 'Manage catalog, prices, and stock' },
    { label: 'Appointments', to: '/adminappointments', blurb: 'Confirm slots and calendars' },
    { label: 'Invoices', to: '/adminbills', blurb: 'Create and print customer bills' },
  ]

  const orderStatusStyles: Record<string, { color: string; border: string; backgroundColor: string }> = {
    Delivered: { color: '#166534', border: '#86efac', backgroundColor: '#f0fdf4' },
    Processing: { color: '#1d4ed8', border: '#93c5fd', backgroundColor: '#eff6ff' },
    Shipped: { color: '#7c3aed', border: '#c4b5fd', backgroundColor: '#f5f3ff' },
    Pending: { color: '#9a3412', border: '#fdba74', backgroundColor: '#fff7ed' },
  }

  const bookingStatus = [
    { label: 'Confirmed', value: 124, color: '#15803d' },
    { label: 'Pending Approval', value: 63, color: '#d97706' },
    { label: 'Rescheduled', value: 41, color: '#1d4ed8' },
    { label: 'Cancelled', value: 18, color: '#b91c1c' },
  ]

  const bookingDonutOuterR = 88
  const bookingDonutInnerR = 56
  const bookingTotal = bookingStatus.reduce((sum, s) => sum + s.value, 0)
  const bookingPieSlices: Array<{ label: string; value: number; color: string; d: string; pct: number }> = []
  let bookingPieAngle = -Math.PI / 2
  for (const status of bookingStatus) {
    const sweep = bookingTotal > 0 ? (status.value / bookingTotal) * 2 * Math.PI : 0
    bookingPieSlices.push({
      ...status,
      d: bookingDonutSlicePath(100, 100, bookingDonutOuterR, bookingDonutInnerR, bookingPieAngle, sweep),
      pct: bookingTotal > 0 ? Math.round((status.value / bookingTotal) * 1000) / 10 : 0,
    })
    bookingPieAngle += sweep
  }

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
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <section style={{ width: '100%', boxSizing: 'border-box' }}>
          <header
            style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
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
                  position: 'relative',
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '1rem 1rem 0.95rem',
                  boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)',
                  overflow: 'hidden',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${getStatAccentColor(item.change)} 0%, ${getStatAccentColor(item.change)}cc 100%)`,
                  }}
                />
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>{item.label}</p>
                <h3
                  style={{
                    margin: '0.42rem 0 0.62rem',
                    color: '#0f172a',
                    fontSize: '1.75rem',
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.value}
                </h3>
                <p
                  style={{
                    ...getStatChangeStyle(item.change),
                    margin: 0,
                    width: 'fit-content',
                    maxWidth: '100%',
                    fontSize: '0.71rem',
                    fontWeight: 700,
                    padding: '0.22rem 0.54rem',
                    borderRadius: 999,
                    lineHeight: 1.35,
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  {item.change}
                </p>
              </article>
            ))}
          </section>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '1rem',
              marginBottom: '1rem',
              alignItems: 'start',
            }}
          >
            <article
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '1.2rem',
                boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
                minHeight: 430,
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Sales and Users (Last 6 Months)</h2>
                <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '14px' }}>
                  Compare monthly sales with user activity in one view.
                </p>
              </div>

              <div
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  if (!r.width) return
                  const px = (e.clientX - r.left) / r.width
                  const idx = Math.round(px * (monthLabels.length - 1))
                  const clamped = Math.max(0, Math.min(monthLabels.length - 1, idx))
                  setSalesChartIdx(clamped)
                  setSalesChartTipPos({ x: e.clientX - r.left, y: e.clientY - r.top })
                }}
                onMouseLeave={() => setSalesChartIdx(null)}
                style={{
                  position: 'relative',
                  height: 220,
                  margin: '1rem 0 0.8rem',
                  border: '1px solid #dbeafe',
                  borderRadius: 14,
                  overflow: 'visible',
                  background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 13,
                    overflow: 'hidden',
                    background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
                  }}
                >
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
                  {monthLabels.map((month, index) => {
                    const x = (index / (monthLabels.length - 1)) * 100
                    return (
                      <line
                        key={`${month}-gridline`}
                        x1={x}
                        y1="8"
                        x2={x}
                        y2="100"
                        stroke="#e2e8f0"
                        strokeWidth="0.45"
                        vectorEffect="non-scaling-stroke"
                      />
                    )
                  })}
                  <path d={trendAreaPath} fill="url(#salesTrendArea)" />
                  <path
                    d={trendLinePath}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.45"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <defs>
                    <linearGradient id="salesTrendArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                </svg>
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                  }}
                >
                  {userTrendCoordinates.map((point, index) => {
                    const active = salesChartIdx === index
                    return (
                      <span
                        key={`${monthLabels[index]}-trend-dot`}
                        style={{
                          position: 'absolute',
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                          width: active ? 11 : 9,
                          height: active ? 11 : 9,
                          transform: 'translate(-50%, -50%)',
                          borderRadius: '50%',
                          backgroundColor: '#1d4ed8',
                          border: '2px solid #ffffff',
                          boxSizing: 'border-box',
                          boxShadow: active
                            ? '0 0 0 2px rgba(37, 99, 235, 0.55), 0 2px 8px rgba(37, 99, 235, 0.35)'
                            : '0 0 0 1px rgba(37, 99, 235, 0.35)',
                          transition: 'width 0.12s ease, height 0.12s ease, box-shadow 0.12s ease',
                        }}
                      />
                    )
                  })}
                </div>
                </div>
                {salesChartIdx !== null && (
                  <div
                    style={{
                      ...dashboardChartTooltipBox,
                      left: salesChartTipPos.x + 12,
                      top: salesChartTipPos.y + 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{monthLabels[salesChartIdx]}</div>
                    <div style={{ color: '#e2e8f0' }}>
                      Sales: <span style={{ color: '#fff', fontWeight: 600 }}>NRP {(monthlySales[salesChartIdx] / 1000).toFixed(0)}k</span>
                    </div>
                    <div style={{ color: '#e2e8f0', marginTop: '0.1rem' }}>
                      Users: <span style={{ color: '#93c5fd', fontWeight: 600 }}>{monthlyUsers[salesChartIdx]}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
                {monthLabels.map((month, index) => (
                  <div key={month} style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{month}</p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.35 }}>
                      NRP {(monthlySales[index] / 1000).toFixed(0)}k
                    </p>
                    <p style={{ margin: '0.08rem 0 0', fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>
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
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                    NRP {(totalSales / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem' }}>Average / Month</p>
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                    NRP {(averageSales / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.74rem' }}>Range</p>
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
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
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Booking Status</h2>
              <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '14px' }}>
                Current distribution of your service bookings.
              </p>
              <div
                ref={bookingPieWrapRef}
                onMouseLeave={() => setBookingPieTip(null)}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.1rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    padding: '0.5rem',
                    borderRadius: 18,
                    background: 'linear-gradient(155deg, #f8fafc 0%, #ffffff 42%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 1px 2px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <svg
                    width={200}
                    height={200}
                    viewBox="0 0 200 200"
                    role="img"
                    aria-label="Booking status distribution"
                  >
                    <title>Booking status distribution</title>
                    <defs>
                      <filter id="adminBookingDonutShadow" x="-25%" y="-25%" width="150%" height="150%">
                        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.11" />
                      </filter>
                    </defs>
                    <circle cx={100} cy={100} r={bookingDonutOuterR + 2} fill="#f1f5f9" opacity={0.65} />
                    <g filter="url(#adminBookingDonutShadow)">
                      {bookingPieSlices.map((slice) =>
                        slice.d ? (
                          <path
                            key={slice.label}
                            d={slice.d}
                            fill={slice.color}
                            stroke="#ffffff"
                            strokeWidth={2.25}
                            strokeLinejoin="round"
                            style={{
                              cursor: 'pointer',
                              opacity: bookingPieTip && bookingPieTip.label !== slice.label ? 0.4 : 1,
                              transition: 'opacity 0.18s ease',
                            }}
                            onMouseEnter={(e) => {
                              setBookingPieTip({ label: slice.label, value: slice.value, pct: slice.pct })
                              syncBookingPieTipPos(e)
                            }}
                            onMouseMove={(e) => syncBookingPieTipPos(e)}
                          />
                        ) : null,
                      )}
                    </g>
                    <circle cx={100} cy={100} r={bookingDonutInnerR - 2.5} fill="#ffffff" stroke="#e2e8f0" strokeWidth={1} />
                    <g
                      transform="translate(100 100)"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
                    >
                      <text
                        y={-20}
                        fill="#64748b"
                        style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}
                      >
                        TOTAL
                      </text>
                      <text y={4} fill="#0f172a" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em' }}>
                        {bookingTotal}
                      </text>
                      <text y={23} fill="#94a3b8" style={{ fontSize: '10.5px', fontWeight: 500 }}>
                        bookings
                      </text>
                    </g>
                  </svg>
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    flex: '1 1 180px',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  {bookingPieSlices.map((slice) => {
                    const rowDimmed = Boolean(bookingPieTip && bookingPieTip.label !== slice.label)
                    return (
                      <li
                        key={slice.label}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '4px 1fr auto',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.55rem 0.7rem',
                          borderRadius: 10,
                          border: '1px solid #e8eef4',
                          backgroundColor: rowDimmed ? '#fafbfc' : '#f8fafc',
                          boxShadow: rowDimmed ? 'none' : '0 1px 0 rgba(255, 255, 255, 0.8) inset',
                          cursor: 'pointer',
                          opacity: rowDimmed ? 0.72 : 1,
                          transition: 'opacity 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease',
                        }}
                        onMouseEnter={(e) => {
                          setBookingPieTip({ label: slice.label, value: slice.value, pct: slice.pct })
                          syncBookingPieTipPos(e)
                        }}
                        onMouseMove={(e) => syncBookingPieTipPos(e)}
                      >
                        <span
                          style={{
                            width: 4,
                            alignSelf: 'stretch',
                            minHeight: 36,
                            borderRadius: 999,
                            backgroundColor: slice.color,
                            boxShadow: 'inset 0 0 0 1px rgba(15, 23, 42, 0.06)',
                          }}
                          aria-hidden
                        />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, color: '#1e293b', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.35 }}>
                            {slice.label}
                          </p>
                          <p style={{ margin: '0.12rem 0 0', color: '#64748b', fontSize: '0.72rem', fontWeight: 500 }}>
                            {slice.pct}% of total
                          </p>
                        </div>
                        <span
                          style={{
                            color: '#0f172a',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {slice.value}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {bookingPieTip && (
                  <div
                    style={{
                      ...dashboardChartTooltipBox,
                      left: bookingPieTipPos.x + 10,
                      top: bookingPieTipPos.y + 10,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{bookingPieTip.label}</div>
                    <div style={{ color: '#e2e8f0' }}>
                      Bookings:{' '}
                      <span style={{ color: '#fff', fontWeight: 600 }}>{bookingPieTip.value}</span>
                    </div>
                    <div style={{ color: '#e2e8f0', marginTop: '0.1rem' }}>
                      Share:{' '}
                      <span style={{ color: '#93c5fd', fontWeight: 600 }}>{bookingPieTip.pct}%</span>
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  marginTop: '1.1rem',
                  paddingTop: '1rem',
                }}
              >
                <Link
                  to="/adminappointments"
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
                  View All
                </Link>
              </div>
            </article>
          </section>

          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '1rem',
                alignItems: 'stretch',
              }}
            >
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
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Recent Orders</h2>
                <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '14px' }}>
                  Latest order updates from key customers.
                </p>
                <div style={{ display: 'grid', gap: '0.7rem', flex: 1, minHeight: 0, alignContent: 'start' }}>
                  {recentOrders.map((order) => {
                    const statusStyle = orderStatusStyles[order.status] ?? {
                      color: '#334155',
                      border: '#cbd5e1',
                      backgroundColor: '#f8fafc',
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
                  })}
                </div>
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                  }}
                >
                  <Link
                    to="/adminorders"
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
                    View All
                  </Link>
                </div>
              </article>

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
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Upcoming Bookings</h2>
              <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '14px' }}>
                Scheduled field and workshop bookings for your team.
              </p>
              <div style={{ display: 'grid', gap: '0.7rem', flex: 1, minHeight: 0, alignContent: 'start' }}>
                {upcomingBookings.map((booking) => {
                  const bookingStyle = bookingBadgeStyles[booking.status] ?? {
                    color: '#334155',
                    border: '#cbd5e1',
                    backgroundColor: '#f8fafc',
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
                })}
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '1rem',
                }}
              >
                <Link
                  to="/adminappointments"
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
                  View All
                </Link>
              </div>
            </article>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '1rem',
                alignItems: 'stretch',
              }}
            >
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
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {chat.time}
                      </span>
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
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Quick links</h2>
              <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '14px' }}>
                Shortcuts to common admin areas.
              </p>
              <div style={{ display: 'grid', gap: '0.65rem', flex: 1, minHeight: 0, alignContent: 'start' }}>
                {dashboardQuickLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '0.7rem 0.85rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '0.84rem' }}>{item.label}</p>
                        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.78rem', lineHeight: 1.35 }}>
                          {item.blurb}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '0.95rem',
                }}
              >
                <Link
                  to="/adminsettings"
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
                  Settings
                </Link>
              </div>
            </article>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
} 

export default AdminDashboard