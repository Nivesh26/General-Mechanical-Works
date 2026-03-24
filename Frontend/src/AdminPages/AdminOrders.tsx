import type { CSSProperties } from 'react'
import { Fragment, useMemo, useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL } from '../AdminComponent/adminMainStyles'
/** Product photos from `Frontend/src/assets` (same as admin catalog). */
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import Tyre from '../assets/Tyre.png'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

type OrderLine = {
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  /** First product image (same as catalog) */
  imageUrl: string
}

type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  phone: string
  address: string
  placedAt: string
  status: OrderStatus
  items: OrderLine[]
}

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

const lineTotal = (line: OrderLine) => line.quantity * line.unitPrice

const orderTotal = (order: Order) => order.items.reduce((sum, line) => sum + lineTotal(line), 0)

const ORDER_TAX_RATE = 0.13

function orderTaxAmount(subtotal: number) {
  return Math.round(subtotal * ORDER_TAX_RATE)
}

function orderGrandTotal(order: Order) {
  const sub = orderTotal(order)
  return sub + orderTaxAmount(sub)
}

const initialOrders: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-2401',
    customerName: 'Nivesh Shrestha',
    customerEmail: 'nivesh@example.com',
    phone: '+977 9841122334',
    address: 'Patan, Lalitpur, Nepal',
    placedAt: '2025-03-24',
    status: 'pending',
    items: [
      {
        productName: 'Premium Synthetic Engine Oil',
        sku: 'SKU-1001',
        quantity: 2,
        unitPrice: 3500,
        imageUrl: EngineOil,
      },
      {
        productName: 'Brake Service Kit',
        sku: 'SKU-1002',
        quantity: 1,
        unitPrice: 5200,
        imageUrl: Brakes,
      },
    ],
  },
  {
    id: 'o2',
    orderNumber: 'ORD-2398',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    phone: '+977 9849925333',
    address: 'Thamel, Kathmandu, Nepal',
    placedAt: '2025-03-22',
    status: 'confirmed',
    items: [
      {
        productName: 'All-weather Tyre 100/90-17',
        sku: 'SKU-1003',
        quantity: 2,
        unitPrice: 12500,
        imageUrl: Tyre,
      },
    ],
  },
  {
    id: 'o3',
    orderNumber: 'ORD-2395',
    customerName: 'Diya Patel',
    customerEmail: 'diya.patel@example.com',
    phone: '+977 9812345678',
    address: 'Biratnagar, Nepal',
    placedAt: '2025-03-20',
    status: 'shipped',
    items: [
      {
        productName: 'Brake Service Kit',
        sku: 'SKU-1002',
        quantity: 1,
        unitPrice: 5200,
        imageUrl: Brakes,
      },
      {
        productName: 'Premium Synthetic Engine Oil',
        sku: 'SKU-1001',
        quantity: 1,
        unitPrice: 3500,
        imageUrl: EngineOil,
      },
    ],
  },
  {
    id: 'o4',
    orderNumber: 'ORD-2388',
    customerName: 'Rohan Verma',
    customerEmail: 'rohan.verma@example.com',
    phone: '+977 9855011223',
    address: 'Lakeside, Pokhara, Nepal',
    placedAt: '2025-03-15',
    status: 'delivered',
    items: [
      {
        productName: 'Premium Synthetic Engine Oil',
        sku: 'SKU-1001',
        quantity: 3,
        unitPrice: 3500,
        imageUrl: EngineOil,
      },
    ],
  },
  {
    id: 'o5',
    orderNumber: 'ORD-2380',
    customerName: 'Neha Singh',
    customerEmail: 'neha.singh@example.com',
    phone: '+977 9849925333',
    address: 'Bhaktapur, Nepal',
    placedAt: '2025-03-10',
    status: 'cancelled',
    items: [
      {
        productName: 'All-weather Tyre 100/90-17',
        sku: 'SKU-1003',
        quantity: 1,
        unitPrice: 12500,
        imageUrl: Tyre,
      },
    ],
  },
]

/** Statuses admins may assign — never `cancelled` (only the customer can cancel). */
const ADMIN_STATUS_OPTIONS: Exclude<OrderStatus, 'cancelled'>[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
]

const STATUS_ORDER: Record<Exclude<OrderStatus, 'cancelled'>, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
}

function statusRank(status: OrderStatus): number | null {
  if (status === 'cancelled') return null
  return STATUS_ORDER[status]
}

/** Forward-only: same stage or later. No reverting to earlier stages. Cancelled is read-only. */
function statusChoicesForOrder(current: OrderStatus): OrderStatus[] {
  if (current === 'cancelled') return []
  const rank = statusRank(current)!
  return ADMIN_STATUS_OPTIONS.filter((s) => STATUS_ORDER[s] >= rank)
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; bg: string; color: string }> = {
    pending: { label: 'Pending', bg: '#fef3c7', color: '#b45309' },
    confirmed: { label: 'Confirmed', bg: '#dbeafe', color: '#1d4ed8' },
    shipped: { label: 'Shipped', bg: '#e0e7ff', color: '#4338ca' },
    delivered: { label: 'Delivered', bg: '#dcfce7', color: '#166534' },
    cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c' },
  }
  const s = map[status]
  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '999px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 700,
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.phone,
        ...order.items.map((i) => `${i.productName} ${i.sku}`),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [orders, searchInput, statusFilter])

  const counts = useMemo(() => {
    const c: Record<OrderStatus | 'all', number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const o of orders) {
      c[o.status] += 1
    }
    return c
  }, [orders])

  const updateStatus = (orderId: string, nextStatus: OrderStatus) => {
    const current = orders.find((o) => o.id === orderId)?.status
    if (current == null) return
    if (nextStatus === 'cancelled') return
    if (current === 'cancelled') return
    const rCur = statusRank(current)
    const rNext = statusRank(nextStatus)
    if (rCur == null || rNext == null) return
    if (rNext < rCur) return
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)))
    if (statusFilter !== 'all' && nextStatus !== statusFilter) {
      setStatusFilter(nextStatus)
    }
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'nowrap',
            marginBottom: '16px',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Orders</h1>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
              Customer orders — search and update fulfilment status. Cancellations are done by customers only.
            </p>
          </div>
          <form
            onSubmit={onSearchSubmit}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'nowrap',
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order #, customer, product, SKU…"
              autoComplete="off"
              style={{
                width: '280px',
                maxWidth: 'min(280px, 36vw)',
                minWidth: '140px',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#bd162c',
                border: '1px solid #991b1b',
                borderRadius: '8px',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Search
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {(
            [
              { key: 'all' as const, label: 'All' },
              { key: 'pending' as const, label: 'Pending' },
              { key: 'confirmed' as const, label: 'Confirmed' },
              { key: 'shipped' as const, label: 'Shipped' },
              { key: 'delivered' as const, label: 'Delivered' },
              { key: 'cancelled' as const, label: 'Cancelled' },
            ] as const
          ).map(({ key, label }) => {
            const active = statusFilter === key
            const count = counts[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: active ? '1px solid #bd162c' : '1px solid #e2e8f0',
                  background: active ? 'rgba(189, 22, 44, 0.08)' : '#fff',
                  color: active ? '#bd162c' : '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Products</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const subtotal = orderTotal(order)
                  const tax = orderTaxAmount(subtotal)
                  const grandTotal = orderGrandTotal(order)
                  const itemsSummary =
                    order.items.length === 1
                      ? `${order.items[0].productName} ×${order.items[0].quantity}`
                      : `${order.items.length} items`
                  const isOpen = expandedId === order.id
                  return (
                    <Fragment key={order.id}>
                      <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                            {order.orderNumber}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.customerName}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{order.customerEmail}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '13px', color: '#475569', maxWidth: '240px' }}>{itemsSummary}</div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>{order.placedAt}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRs(grandTotal)}</span>
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                            <button
                              type="button"
                              onClick={() => setExpandedId(isOpen ? null : order.id)}
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#1e293b',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              {isOpen ? 'Hide details' : 'View details'}
                            </button>
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <select
                                key={`${order.id}-${order.status}`}
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                                aria-label={`Update status for ${order.orderNumber}`}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#fff',
                                  cursor: 'pointer',
                                  minWidth: '132px',
                                }}
                              >
                                {statusChoicesForOrder(order.status).map((s) => (
                                  <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td colSpan={7} style={{ padding: '0', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px',
                                marginBottom: '14px' }}>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Shipping address</div>
                                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                                    {order.address}, {order.phone}
                                  </p>
                                </div>
                              </div>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '8px 8px 8px 0', color: '#64748b', fontWeight: 600 }}>
                                      Image
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>
                                      Product
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>SKU</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Unit</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Line</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((line, idx) => (
                                    <tr key={`${order.id}-line-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '12px 8px 12px 0', verticalAlign: 'middle', width: '56px' }}>
                                        <img
                                          src={line.imageUrl}
                                          alt={line.productName}
                                          style={{
                                            width: '48px',
                                            height: '48px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            background: '#fff',
                                            display: 'block',
                                          }}
                                        />
                                      </td>
                                      <td style={{ padding: '12px 0', color: '#334155', verticalAlign: 'middle' }}>
                                        {line.productName}
                                      </td>
                                      <td style={{ padding: '12px 0', fontFamily: 'monospace', color: '#334155', verticalAlign: 'middle' }}>
                                        {line.sku}
                                      </td>
                                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#334155', verticalAlign: 'middle' }}>
                                        {line.quantity}
                                      </td>
                                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#334155', verticalAlign: 'middle' }}>
                                        {formatRs(line.unitPrice)}
                                      </td>
                                      <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#0f172a', verticalAlign: 'middle' }}>
                                        {formatRs(lineTotal(line))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div
                                style={{
                                  margin: '12px 0 0',
                                  textAlign: 'right',
                                  fontSize: '14px',
                                  color: '#475569',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-end',
                                  gap: '6px',
                                }}
                              >
                                <div>Subtotal: {formatRs(subtotal)}</div>
                                <div>Tax (13%): {formatRs(tax)}</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', paddingTop: '4px' }}>
                                  Order total: {formatRs(grandTotal)}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      No orders match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '13px',
  color: '#334155',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#475569',
  verticalAlign: 'top',
}

export default AdminOrders
