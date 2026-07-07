import type { CSSProperties } from 'react'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import {
  fetchAdminOrders,
  toAbsoluteApiUrl,
  updateAdminOrderStatus,
  type AdminOrder as ApiAdminOrder,
  type ApiOrderStatus,
} from '../lib/api'
/** Product photos from `Frontend/src/assets` (fallback when order has no image). */
import EngineOil from '../assets/EngineOil.png'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

type PaymentMethod = 'COD' | 'ESEWA' | 'KHALTI'

const API_TO_UI_STATUS: Record<ApiOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

const UI_TO_API_STATUS: Record<Exclude<OrderStatus, 'cancelled'>, ApiOrderStatus> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
}

type OrderLine = {
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  sizeLabel: string | null
  cancelled: boolean
  cancelledAt?: string | null
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
  paymentMethod: PaymentMethod
  items: OrderLine[]
}

function mapApiOrder(order: ApiAdminOrder): Order {
  return {
    id: String(order.id),
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    phone: order.phone ?? '—',
    address: order.address,
    placedAt: order.placedAt,
    status: API_TO_UI_STATUS[order.status],
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      sizeLabel: item.sizeLabel?.trim() ? item.sizeLabel.trim() : null,
      cancelled: Boolean(item.cancelled),
      cancelledAt: item.cancelledAt ?? null,
      imageUrl: toAbsoluteApiUrl(item.imagePath) ?? EngineOil,
    })),
  }
}

function activeLines(order: Order) {
  return order.items.filter((line) => !line.cancelled)
}

function cancelledLineCount(order: Order) {
  return order.items.filter((line) => line.cancelled).length
}

function lineSummaryLabel(line: OrderLine) {
  const sizePart = line.sizeLabel ? ` (${line.sizeLabel})` : ''
  return `${line.productName}${sizePart} ×${line.quantity}`
}

function itemsSummary(order: Order) {
  const cancelled = cancelledLineCount(order)
  if (order.items.length === 1) {
    const line = order.items[0]
    const base = lineSummaryLabel(line)
    return line.cancelled ? `${base} (cancelled)` : base
  }
  if (cancelled > 0) {
    return `${order.items.length} items · ${cancelled} cancelled`
  }
  return `${order.items.length} items`
}

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

const lineTotal = (line: OrderLine) => line.quantity * line.unitPrice

const orderTotal = (order: Order) => activeLines(order).reduce((sum, line) => sum + lineTotal(line), 0)

const ORDER_TAX_RATE = 0.13

function orderTaxAmount(subtotal: number) {
  return Math.round(subtotal * ORDER_TAX_RATE)
}

function orderGrandTotal(order: Order) {
  const sub = orderTotal(order)
  return sub + orderTaxAmount(sub)
}

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

function listSortRank(status: OrderStatus): number {
  if (status === 'cancelled') return 2
  if (status === 'delivered') return 1
  return 0
}

function statusRank(status: OrderStatus): number | null {
  if (status === 'cancelled') return null
  return STATUS_ORDER[status]
}

function statusChoicesForOrder(current: OrderStatus): OrderStatus[] {
  if (current === 'cancelled') return []
  const rank = statusRank(current)!
  return ADMIN_STATUS_OPTIONS.filter((s) => STATUS_ORDER[s] >= rank)
}

function LineStatusBadge({ line, orderStatus }: { line: OrderLine; orderStatus: OrderStatus }) {
  if (line.cancelled || orderStatus === 'cancelled') {
    return (
      <span
        style={{
          display: 'inline-block',
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: 700,
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
        }}
      >
        Cancelled
      </span>
    )
  }
  return <StatusBadge status={orderStatus} />
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

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const styles: Record<PaymentMethod, { bg: string; color: string; label: string }> = {
    COD: { bg: '#f1f5f9', color: '#475569', label: 'COD' },
    ESEWA: { bg: '#dcfce7', color: '#166534', label: 'eSewa' },
    KHALTI: { bg: '#ede9fe', color: '#5b21b6', label: 'Khalti' },
  }
  const s = styles[method]
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
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    if (!token) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await fetchAdminOrders(token)
      setOrders(list.map(mapApiOrder))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load orders.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const filteredOrders = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    const filtered = orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.phone,
        order.paymentMethod,
        ...order.items.map((i) => `${i.productName} ${i.sku} ${i.sizeLabel ?? ''}`),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
    return [...filtered].sort((a, b) => {
      const rankDiff = listSortRank(a.status) - listSortRank(b.status)
      if (rankDiff !== 0) return rankDiff
      return b.placedAt.localeCompare(a.placedAt)
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

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const current = orders.find((o) => o.id === orderId)?.status
    if (current == null || !token) return
    if (nextStatus === 'cancelled') return
    if (current === 'cancelled') return
    const rCur = statusRank(current)
    const rNext = statusRank(nextStatus)
    if (rCur == null || rNext == null) return
    if (rNext < rCur) return
    try {
      const updated = await updateAdminOrderStatus(token, Number(orderId), UI_TO_API_STATUS[nextStatus])
      setOrders((prev) => prev.map((o) => (o.id === orderId ? mapApiOrder(updated) : o)))
      if (statusFilter !== 'all' && nextStatus !== statusFilter) {
        setStatusFilter(nextStatus)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update order status.')
    }
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <h1 style={ADMIN_PAGE_TITLE}>Orders</h1>
            <p style={ADMIN_PAGE_SUBTITLE}>Customer orders — search and update fulfilment status.</p>
          </div>
          <form
            onSubmit={onSearchSubmit}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '8px',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Order"
              autoComplete="off"
              style={{
                width: '220px',
                maxWidth: 'min(280px, 42vw)',
                minWidth: '120px',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                flex: '0 1 auto',
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
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Products</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      Loading orders…
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                  const subtotal = orderTotal(order)
                  const tax = orderTaxAmount(subtotal)
                  const grandTotal = orderGrandTotal(order)
                  const summary = itemsSummary(order)
                  const sortedLines = [...order.items].sort((a, b) => {
                    if (a.cancelled && !b.cancelled) return 1
                    if (!a.cancelled && b.cancelled) return -1
                    return 0
                  })
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
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{order.customerName}</span>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{order.customerEmail}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '13px', color: '#475569', maxWidth: '240px' }}>{summary}</div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>{order.placedAt}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRs(grandTotal)}</span>
                        </td>
                        <td style={tdStyle}>
                          <PaymentBadge method={order.paymentMethod} />
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
                                onChange={(e) => void updateStatus(order.id, e.target.value as OrderStatus)}
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
                          <td colSpan={8} style={{ padding: '0', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ padding: '16px 20px' }}>
                              <div style={{ marginBottom: '14px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Shipping address</div>
                                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                                  {order.address}, {order.phone}
                                </p>
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
                                    <th style={{ textAlign: 'left', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Size</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Unit</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Line</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedLines.map((line, idx) => (
                                    <tr
                                      key={`${order.id}-line-${idx}`}
                                      style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        opacity: line.cancelled ? 0.65 : 1,
                                      }}
                                    >
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
                                        <span style={line.cancelled ? { textDecoration: 'line-through' } : undefined}>
                                          {line.productName}
                                        </span>
                                      </td>
                                      <td style={{ padding: '12px 0', fontFamily: 'monospace', color: '#334155', verticalAlign: 'middle' }}>
                                        {line.sku}
                                      </td>
                                      <td style={{ padding: '12px 0', color: '#334155', verticalAlign: 'middle' }}>
                                        {line.sizeLabel ?? '—'}
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
                                      <td style={{ padding: '12px 0', textAlign: 'right', verticalAlign: 'middle' }}>
                                        <LineStatusBadge line={line} orderStatus={order.status} />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {cancelledLineCount(order) > 0 && cancelledLineCount(order) < order.items.length ? (
                                <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#64748b' }}>
                                  Totals below exclude cancelled items.
                                </p>
                              ) : null}
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
                  })
                )}
                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
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
