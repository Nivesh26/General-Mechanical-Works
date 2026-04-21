import type { CSSProperties } from 'react'

export type DashboardStatItem = {
  label: string
  value: string
  change: string
  color: string
}

/** Default KPI copy for the admin dashboard top row; replace with API data when available. */
export const defaultDashboardTopStats: DashboardStatItem[] = [
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

type DashboardtopProps = {
  /** When omitted, uses `defaultDashboardTopStats`. */
  stats?: DashboardStatItem[]
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

const Dashboardtop = ({ stats = defaultDashboardTopStats }: DashboardtopProps) => {
  return (
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
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
  )
}

export default Dashboardtop
