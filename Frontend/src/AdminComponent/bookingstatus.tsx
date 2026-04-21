import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { Link } from 'react-router-dom'

export type BookingStatusRow = {
  label: string
  value: number
  color: string
}

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

const bookingDonutOuterR = 88
const bookingDonutInnerR = 56

/** Default segments for the Booking Status donut; replace with API data when available. */
export const defaultBookingStatusRows: BookingStatusRow[] = [
  { label: 'Confirmed', value: 124, color: '#15803d' },
  { label: 'Pending Approval', value: 63, color: '#d97706' },
  { label: 'Rescheduled', value: 41, color: '#1d4ed8' },
  { label: 'Cancelled', value: 18, color: '#b91c1c' },
]

type BookingStatusProps = {
  bookingStatus?: BookingStatusRow[]
}

const BookingStatus = ({ bookingStatus = defaultBookingStatusRows }: BookingStatusProps) => {
  const bookingPieWrapRef = useRef<HTMLDivElement>(null)
  const [bookingPieTip, setBookingPieTip] = useState<{ label: string; value: number; pct: number } | null>(null)
  const [bookingPieTipPos, setBookingPieTipPos] = useState({ x: 0, y: 0 })

  const syncBookingPieTipPos = (e: ReactMouseEvent) => {
    const el = bookingPieWrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setBookingPieTipPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const bookingTotal = useMemo(() => bookingStatus.reduce((sum, s) => sum + s.value, 0), [bookingStatus])

  const bookingPieSlices = useMemo(() => {
    const slices: Array<{ label: string; value: number; color: string; d: string; pct: number }> = []
    let angle = -Math.PI / 2
    for (const status of bookingStatus) {
      const sweep = bookingTotal > 0 ? (status.value / bookingTotal) * 2 * Math.PI : 0
      slices.push({
        ...status,
        d: bookingDonutSlicePath(100, 100, bookingDonutOuterR, bookingDonutInnerR, angle, sweep),
        pct: bookingTotal > 0 ? Math.round((status.value / bookingTotal) * 1000) / 10 : 0,
      })
      angle += sweep
    }
    return slices
  }, [bookingStatus, bookingTotal])

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
      <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Booking Status</h2>
      <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '14px' }}>
        Current distribution of your service bookings.
      </p>
      <div
        ref={bookingPieWrapRef}
        onMouseLeave={() => setBookingPieTip(null)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          gap: '0.85rem',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '0.45rem',
            borderRadius: 18,
            background: 'linear-gradient(155deg, #f8fafc 0%, #ffffff 42%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <svg width={168} height={168} viewBox="0 0 200 200" role="img" aria-label="Booking status distribution">
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
            <g transform="translate(100 100)" fontFamily="system-ui, -apple-system, Segoe UI, sans-serif">
              <text
                x={0}
                y={-18}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#64748b"
                style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}
              >
                TOTAL
              </text>
              <text
                x={0}
                y={2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#0f172a"
                style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em' }}
              >
                {bookingTotal}
              </text>
              <text
                x={0}
                y={22}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#94a3b8"
                style={{ fontSize: '10.5px', fontWeight: 500 }}
              >
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
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.38rem',
            justifyContent: 'center',
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
              Bookings: <span style={{ color: '#fff', fontWeight: 600 }}>{bookingPieTip.value}</span>
            </div>
            <div style={{ color: '#e2e8f0', marginTop: '0.1rem' }}>
              Share: <span style={{ color: '#93c5fd', fontWeight: 600 }}>{bookingPieTip.pct}%</span>
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
  )
}

export default BookingStatus
