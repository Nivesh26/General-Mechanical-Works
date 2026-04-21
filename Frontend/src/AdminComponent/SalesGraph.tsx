import { useMemo, useState, type CSSProperties } from 'react'

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

export const defaultMonthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export const defaultMonthlySales = [18000, 22000, 21000, 28000, 32000, 36000]

export const defaultMonthlyUsers = [120, 135, 148, 170, 182, 205]

function createSmoothPath(points: Array<{ x: number; y: number }>) {
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

type SalesGraphProps = {
  monthlySales?: number[]
  monthlyUsers?: number[]
  monthLabels?: string[]
}

const SalesGraph = ({
  monthlySales = defaultMonthlySales,
  monthlyUsers = defaultMonthlyUsers,
  monthLabels = defaultMonthLabels,
}: SalesGraphProps) => {
  const [salesChartIdx, setSalesChartIdx] = useState<number | null>(null)
  const [salesChartTipPos, setSalesChartTipPos] = useState({ x: 0, y: 0 })

  const maxSales = Math.max(...monthlySales)
  const minSales = Math.min(...monthlySales)
  const maxUsers = Math.max(...monthlyUsers)
  const totalSales = monthlySales.reduce((sum, value) => sum + value, 0)
  const averageSales = Math.round(totalSales / monthlySales.length)

  const userTrendCoordinates = useMemo(() => {
    const minU = Math.min(...monthlyUsers)
    return monthlyUsers.map((value, index) => {
      const x = (index / (monthlyUsers.length - 1)) * 100
      const y = 86 - ((value - minU) / (maxUsers - minU || 1)) * 56
      return { x, y }
    })
  }, [monthlyUsers, maxUsers])

  const trendLinePath = useMemo(() => createSmoothPath(userTrendCoordinates), [userTrendCoordinates])
  const trendAreaPath = useMemo(() => `${trendLinePath} L 100 100 L 0 100 Z`, [trendLinePath])

  return (
    <article
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '1.2rem',
        boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
        minHeight: 392,
      }}
    >
      <div style={{ paddingBottom: '1rem' }}>
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
          height: 182,
          margin: '0.5rem 0 0.65rem',
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
                    width: active ? 10 : 8,
                    height: active ? 10 : 8,
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
              Sales:{' '}
              <span style={{ color: '#fff', fontWeight: 600 }}>NRP {(monthlySales[salesChartIdx] / 1000).toFixed(0)}k</span>
            </div>
            <div style={{ color: '#e2e8f0', marginTop: '0.1rem' }}>
              Users: <span style={{ color: '#93c5fd', fontWeight: 600 }}>{monthlyUsers[salesChartIdx]}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.32rem' }}>
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
  )
}

export default SalesGraph
