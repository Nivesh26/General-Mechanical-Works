import { Link } from 'react-router-dom'

export type RecentOrderRow = {
  id: string
  customer: string
  status: string
}

const defaultOrderStatusStyles: Record<string, { color: string; border: string; backgroundColor: string }> = {
  Delivered: { color: '#166534', border: '#86efac', backgroundColor: '#f0fdf4' },
  Processing: { color: '#1d4ed8', border: '#93c5fd', backgroundColor: '#eff6ff' },
  Shipped: { color: '#7c3aed', border: '#c4b5fd', backgroundColor: '#f5f3ff' },
  Pending: { color: '#9a3412', border: '#fdba74', backgroundColor: '#fff7ed' },
}

/** Default list for the Recent Orders card; replace with API data when available. */
export const defaultRecentOrders: RecentOrderRow[] = [
  { id: '#ORD-1021', customer: 'Nova Engineering', status: 'Delivered' },
  { id: '#ORD-1022', customer: 'Apex Mechanics', status: 'Processing' },
  { id: '#ORD-1023', customer: 'Titan Works', status: 'Shipped' },
  { id: '#ORD-1024', customer: 'Prime Automations', status: 'Pending' },
]

type RecentOrderProps = {
  orders?: RecentOrderRow[]
  orderStatusStyles?: Record<string, { color: string; border: string; backgroundColor: string }>
}

const RecentOrder = ({
  orders = defaultRecentOrders,
  orderStatusStyles = defaultOrderStatusStyles,
}: RecentOrderProps) => {
  return (
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
      <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '14px' }}>Latest order updates from key customers.</p>
      <div style={{ display: 'grid', gap: '0.7rem', flex: 1, minHeight: 0, alignContent: 'start' }}>
        {orders.map((order) => {
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
  )
}

export default RecentOrder
