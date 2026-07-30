import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import EngineOil from '../assets/EngineOil.png'
import { useAuth } from '../context/AuthContext'
import {
  cancelMyOrder,
  fetchMyOrders,
  toAbsoluteApiUrl,
  type AdminOrder as ApiOrder,
  type AdminOrderLine as ApiOrderLine,
  type ApiOrderStatus,
} from '../lib/api'
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineNoSymbol,
  HiOutlineClipboardDocumentCheck,
  HiOutlinePencilSquare,
} from 'react-icons/hi2'

type ProductLineStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

type PaymentMethod = 'COD' | 'Esewa' | 'Khalti'

const API_TO_UI_STATUS: Record<ApiOrderStatus, ProductLineStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

type TrackedProductLine = {
  id: string
  shopOrderId: number
  orderId: string
  productId: number
  name: string
  sizeLabel: string | null
  image: string
  sku: string
  qty: number
  unitPrice: number
  status: ProductLineStatus
  orderedOn: string
  placedAtIso: string
  paymentMethod: PaymentMethod
  canCancel: boolean
  estimatedDelivery?: string
  confirmedOn?: string
  shippedOn?: string
  deliveredOn?: string
  cancelledOn?: string
  description: string
}

type TrackedOrder = {
  key: string
  shopOrderId: number
  orderId: string
  orderedOn: string
  placedAtIso: string
  paymentMethod: PaymentMethod
  status: ProductLineStatus
  canCancel: boolean
  estimatedDelivery?: string
  confirmedOn?: string
  shippedOn?: string
  deliveredOn?: string
  lines: TrackedProductLine[]
}

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

const detailCellClass =
  'rounded-lg px-3 py-2 min-h-[4.5rem] h-full flex flex-col justify-start'

function formatOrderDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatEstimatedDelivery(placedAt: string) {
  const date = new Date(`${placedAt}T12:00:00`)
  if (Number.isNaN(date.getTime())) return undefined
  date.setDate(date.getDate() + 3)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function lineStatus(order: ApiOrder, item: ApiOrderLine): ProductLineStatus {
  if (item.cancelled || order.status === 'CANCELLED') return 'cancelled'
  return API_TO_UI_STATUS[order.status]
}

function mapOrdersToLines(orders: ApiOrder[]): TrackedProductLine[] {
  const lines: TrackedProductLine[] = []
  for (const order of orders) {
    const orderedOn = formatOrderDate(order.placedAt)
    const estimatedDelivery = formatEstimatedDelivery(order.placedAt)
    const paymentMethod: PaymentMethod =
      order.paymentMethod === 'ESEWA'
        ? 'Esewa'
        : order.paymentMethod === 'KHALTI'
          ? 'Khalti'
          : 'COD'
    const orderCanCancel = order.status === 'PENDING' || order.status === 'CONFIRMED'

    order.items.forEach((item, index) => {
      const status = lineStatus(order, item)
      const sizeLabel = item.sizeLabel?.trim() ? item.sizeLabel.trim() : null
      const sizePart = sizeLabel ? ` Size: ${sizeLabel}.` : ''
      lines.push({
        id: String(item.id ?? `${order.id}-${index}`),
        shopOrderId: order.id,
        orderId: order.orderNumber,
        productId: item.productId,
        name: item.productName,
        sizeLabel,
        image: toAbsoluteApiUrl(item.imagePath) ?? EngineOil,
        sku: item.sku,
        qty: item.quantity,
        unitPrice: Number(item.unitPrice),
        status,
        orderedOn,
        placedAtIso: order.placedAt,
        paymentMethod,
        canCancel: orderCanCancel && !item.cancelled,
        cancelledOn: item.cancelledAt ?? undefined,
        confirmedOn:
          status === 'confirmed' || status === 'shipped'
            ? (order.confirmedAt ?? undefined)
            : undefined,
        shippedOn: status === 'shipped' ? (order.shippedAt ?? undefined) : undefined,
        deliveredOn: status === 'delivered' ? (order.deliveredAt ?? undefined) : undefined,
        estimatedDelivery:
          status === 'pending' || status === 'confirmed' || status === 'shipped'
            ? estimatedDelivery
            : undefined,
        description: `${item.productName}.${sizePart} Ordered on ${orderedOn}.`,
      })
    })
  }
  return lines
}

function orderDisplayStatus(lines: TrackedProductLine[]): ProductLineStatus {
  const active = lines.filter((l) => l.status !== 'cancelled')
  if (active.length === 0) return 'cancelled'
  return active[0].status
}

function groupLinesIntoOrders(lines: TrackedProductLine[]): TrackedOrder[] {
  const byOrder = new Map<string, TrackedProductLine[]>()
  for (const line of lines) {
    const key = String(line.shopOrderId)
    const bucket = byOrder.get(key)
    if (bucket) bucket.push(line)
    else byOrder.set(key, [line])
  }

  const orders: TrackedOrder[] = []
  for (const [key, orderLines] of byOrder) {
    const sortedLines = [...orderLines].sort((a, b) => {
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
      if (a.status !== 'cancelled' && b.status === 'cancelled') return -1
      return 0
    })
    const first = sortedLines[0]
    const status = orderDisplayStatus(sortedLines)
    orders.push({
      key,
      shopOrderId: first.shopOrderId,
      orderId: first.orderId,
      orderedOn: first.orderedOn,
      placedAtIso: first.placedAtIso,
      paymentMethod: first.paymentMethod,
      status,
      canCancel: sortedLines.some((l) => l.canCancel),
      estimatedDelivery: first.estimatedDelivery,
      confirmedOn: first.confirmedOn,
      shippedOn: first.shippedOn,
      deliveredOn: first.deliveredOn,
      lines: sortedLines,
    })
  }

  return orders.sort((a, b) => {
    if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
    if (a.status !== 'cancelled' && b.status === 'cancelled') return -1
    return b.placedAtIso.localeCompare(a.placedAtIso)
  })
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const styles: Record<PaymentMethod, string> = {
    COD: 'border-gray-300 bg-gray-100 text-gray-900',
    Esewa: 'border-green-300 bg-green-100 text-green-900',
    Khalti: 'border-purple-300 bg-purple-100 text-purple-900',
  }
  const labels: Record<PaymentMethod, string> = {
    COD: 'COD',
    Esewa: 'eSewa',
    Khalti: 'Khalti',
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-2.5 py-1 text-xs font-bold ${styles[method]}`}
    >
      {labels[method]}
    </span>
  )
}

type FilterTab = 'all' | ProductLineStatus

function StatusBadge({ status }: { status: ProductLineStatus }) {
  if (status === 'delivered') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
        <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden />
        Delivered
      </span>
    )
  }
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900 ring-1 ring-sky-200/80">
        <HiOutlineClipboardDocumentCheck className="h-3.5 w-3.5" aria-hidden />
        Confirmed
      </span>
    )
  }
  if (status === 'shipped') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-900 ring-1 ring-violet-200/80">
        <HiOutlineTruck className="h-3.5 w-3.5" aria-hidden />
        Shipped
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-200/80">
        <HiOutlineNoSymbol className="h-3.5 w-3.5" aria-hidden />
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
      <HiOutlineClock className="h-3.5 w-3.5" aria-hidden />
      Pending
    </span>
  )
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onCancelOrder,
  cancelling,
}: {
  order: TrackedOrder
  expanded: boolean
  onToggle: () => void
  onCancelOrder?: () => void
  cancelling?: boolean
}) {
  const itemCount = order.lines.length
  const orderTotal = order.lines
    .filter((l) => l.status !== 'cancelled')
    .reduce((sum, l) => sum + l.unitPrice * l.qty, 0)

  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-slate-50/70 px-4 sm:px-5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-gray-900">
              Order <span className="font-mono">{order.orderId}</span>
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-600">Ordered {order.orderedOn}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-600">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Payment</span>
            <PaymentMethodBadge method={order.paymentMethod} />
            {orderTotal > 0 ? (
              <span className="text-xs text-gray-500">
                Total <span className="font-semibold text-gray-800 tabular-nums">{formatRs(orderTotal)}</span>
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <StatusBadge status={order.status} />
          {order.canCancel && onCancelOrder ? (
            <button
              type="button"
              onClick={onCancelOrder}
              disabled={cancelling}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
          ) : null}
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {order.lines.map((line) => {
          const lineTotal = line.unitPrice * line.qty
          const cancelled = line.status === 'cancelled'
          return (
            <li
              key={line.id}
              className={`flex gap-4 p-4 sm:p-5 ${cancelled ? 'bg-gray-50/80 opacity-75' : ''}`}
            >
              <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-linear-to-br from-gray-50 to-slate-100 p-2 ring-1 ring-black/5">
                <img src={line.image} alt={line.name} className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2
                    className={`text-base font-semibold leading-snug min-w-0 flex-1 ${
                      cancelled ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}
                  >
                    {line.name}
                  </h2>
                  {cancelled ? <StatusBadge status="cancelled" /> : null}
                </div>
                <p className="mt-1.5 text-sm text-gray-600">
                  {line.sizeLabel ? (
                    <>
                      Size <span className="font-medium text-gray-900">{line.sizeLabel}</span>
                      <span className="mx-2 text-gray-300">·</span>
                    </>
                  ) : null}
                  Qty <span className="font-medium text-gray-900">{line.qty}</span>
                  <span className="mx-2 text-gray-300">·</span>
                  {formatRs(lineTotal)}
                  {line.qty > 1 && (
                    <span className="text-gray-400"> ({formatRs(line.unitPrice)} each)</span>
                  )}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/80 py-2.5 text-sm font-medium text-primary hover:bg-gray-100/80 transition-colors cursor-pointer"
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Hide details
            <HiOutlineChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            Order details
            <HiOutlineChevronDown className="h-4 w-4" />
          </>
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-white px-4 sm:px-5 pb-5 pt-4 space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm items-stretch">
            <div className={`${detailCellClass} bg-gray-50`}>
              <dt className="text-xs text-gray-500">Payment method</dt>
              <dd className="mt-1">
                <PaymentMethodBadge method={order.paymentMethod} />
              </dd>
            </div>
            {order.status === 'pending' && (
              <div className={`${detailCellClass} bg-amber-50/80 ring-1 ring-amber-100`}>
                <dt className="text-xs text-amber-800/90 flex items-center gap-1">
                  <HiOutlineTruck className="h-3.5 w-3.5" />
                  Estimated delivery
                </dt>
                <dd className="font-medium text-amber-950 mt-0.5">{order.estimatedDelivery ?? '—'}</dd>
              </div>
            )}
            {order.status === 'confirmed' && (
              <div className={`${detailCellClass} bg-sky-50/80 ring-1 ring-sky-100`}>
                <dt className="text-xs text-sky-800/90 flex items-center gap-1">
                  <HiOutlineClipboardDocumentCheck className="h-3.5 w-3.5" />
                  Confirmed on
                </dt>
                <dd className="font-medium text-sky-950 mt-0.5">{order.confirmedOn ?? '—'}</dd>
                <dd className="text-xs text-sky-800/80 mt-1">
                  Est. delivery: {order.estimatedDelivery ?? '—'}
                </dd>
              </div>
            )}
            {order.status === 'shipped' && (
              <div className={`${detailCellClass} bg-violet-50/80 ring-1 ring-violet-100`}>
                <dt className="text-xs text-violet-800/90 flex items-center gap-1">
                  <HiOutlineTruck className="h-3.5 w-3.5" />
                  Shipped on
                </dt>
                <dd className="font-medium text-violet-950 mt-0.5">{order.shippedOn ?? '—'}</dd>
                <dd className="text-xs text-violet-800/80 mt-1">
                  Est. delivery: {order.estimatedDelivery ?? '—'}
                </dd>
              </div>
            )}
            {order.status === 'delivered' && (
              <div className={`${detailCellClass} bg-emerald-50/80 ring-1 ring-emerald-100`}>
                <dt className="text-xs text-emerald-800/90 flex items-center gap-1">
                  <HiOutlineCheckCircle className="h-3.5 w-3.5 shrink-0" />
                  Delivered on
                </dt>
                <dd className="font-medium text-emerald-950 mt-0.5">{order.deliveredOn ?? '—'}</dd>
              </div>
            )}
          </dl>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Items in this order</p>
            {order.lines.map((line) => {
              const lineTotal = line.unitPrice * line.qty
              return (
                <div
                  key={`detail-${line.id}`}
                  className={`rounded-xl border border-gray-100 p-3 sm:p-4 ${
                    line.status === 'cancelled' ? 'bg-gray-50 opacity-80' : 'bg-white'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{line.name}</p>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{line.description}</p>
                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm items-stretch">
                    <div className={`${detailCellClass} bg-gray-50`}>
                      <dt className="text-xs text-gray-500">SKU</dt>
                      <dd className="font-mono text-gray-900 mt-0.5">{line.sku}</dd>
                    </div>
                    {line.sizeLabel ? (
                      <div className={`${detailCellClass} bg-gray-50`}>
                        <dt className="text-xs text-gray-500">Size</dt>
                        <dd className="font-medium text-gray-900 mt-0.5">{line.sizeLabel}</dd>
                      </div>
                    ) : null}
                    <div className={`${detailCellClass} bg-gray-50`}>
                      <dt className="text-xs text-gray-500">Unit price</dt>
                      <dd className="font-medium text-gray-900 mt-0.5 tabular-nums">{formatRs(line.unitPrice)}</dd>
                    </div>
                    <div className={`${detailCellClass} bg-gray-50`}>
                      <dt className="text-xs text-gray-500">Line total</dt>
                      <dd className="font-semibold text-primary mt-0.5 tabular-nums">{formatRs(lineTotal)}</dd>
                    </div>
                    {line.status === 'cancelled' && (
                      <div className={`${detailCellClass} bg-gray-100 ring-1 ring-gray-200`}>
                        <dt className="text-xs text-gray-600 flex items-center gap-1">
                          <HiOutlineNoSymbol className="h-3.5 w-3.5" />
                          Cancelled on
                        </dt>
                        <dd className="font-medium text-gray-900 mt-0.5">{line.cancelledOn ?? '—'}</dd>
                      </div>
                    )}
                    {line.status === 'delivered' &&
                    Number.isFinite(line.productId) &&
                    line.productId > 0 ? (
                      <Link
                        to={`/productdetail/${line.productId}#reviews`}
                        className={`${detailCellClass} bg-emerald-50/80 ring-1 ring-emerald-100 hover:bg-emerald-100/80 transition-colors`}
                      >
                        <span className="text-xs text-emerald-800/90 flex items-center gap-1">
                          <HiOutlinePencilSquare className="h-3.5 w-3.5 shrink-0" />
                          Leave a review
                        </span>
                      </Link>
                    ) : null}
                  </dl>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}

const Ordertracking = () => {
  const { token } = useAuth()
  const [lines, setLines] = useState<TrackedProductLine[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    if (!token) {
      setLines([])
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const orders = await fetchMyOrders(token)
      setLines(mapOrdersToLines(orders))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load your orders.')
      setLines([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const allOrders = useMemo(() => groupLinesIntoOrders(lines), [lines])

  const counts = useMemo(() => {
    const pending = allOrders.filter((o) => o.status === 'pending').length
    const confirmed = allOrders.filter((o) => o.status === 'confirmed').length
    const shipped = allOrders.filter((o) => o.status === 'shipped').length
    const delivered = allOrders.filter((o) => o.status === 'delivered').length
    const cancelled = allOrders.filter((o) => o.status === 'cancelled').length
    return { all: allOrders.length, pending, confirmed, shipped, delivered, cancelled }
  }, [allOrders])

  const visible = useMemo(() => {
    if (filter === 'all') return allOrders
    return allOrders.filter((o) => o.status === filter)
  }, [allOrders, filter])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const cancelOrder = async (order: TrackedOrder) => {
    if (!token) return
    const itemLabel =
      order.lines.length === 1
        ? `"${order.lines[0].name}"`
        : `all ${order.lines.length} products`
    if (
      !window.confirm(
        `Cancel ${itemLabel} in order ${order.orderId}? This cannot be undone.`,
      )
    ) {
      return
    }
    setCancellingOrderId(order.key)
    try {
      await cancelMyOrder(token, order.shopOrderId)
      toast.success('Order cancelled.')
      await loadOrders()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel order.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <Header />

      <main className="flex-1 px-4 sm:px-10 lg:px-[80px] py-10 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              <span className="text-primary font-sec">My orders</span>
            </h1>
            <p className="text-sm text-gray-500">
              All your orders and product updates in one place—filter by status or open details below.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(
              [
                { key: 'all' as const, label: 'All' },
                { key: 'pending' as const, label: 'Pending' },
                { key: 'confirmed' as const, label: 'Confirmed' },
                { key: 'shipped' as const, label: 'Shipped' },
                { key: 'delivered' as const, label: 'Delivered' },
                { key: 'cancelled' as const, label: 'Cancelled' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  filter === key
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {label}
                <span className="ml-1.5 opacity-80 tabular-nums">
                  (
                  {key === 'all'
                    ? counts.all
                    : key === 'pending'
                      ? counts.pending
                      : key === 'confirmed'
                        ? counts.confirmed
                        : key === 'shipped'
                          ? counts.shipped
                          : key === 'delivered'
                            ? counts.delivered
                            : counts.cancelled}
                  )
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <p className="rounded-2xl border border-gray-200 bg-white/80 py-12 text-center text-sm text-gray-500">
              Loading your orders…
            </p>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 py-12 text-center text-sm text-red-700">
              <p>{loadError}</p>
              <button
                type="button"
                onClick={() => void loadOrders()}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 py-12 text-center text-sm text-gray-500">
              {filter === 'all' ? (
                <>
                  <p>You have not placed any orders yet.</p>
                  <Link
                    to="/products"
                    className="mt-3 inline-block font-medium text-primary hover:underline"
                  >
                    Browse products
                  </Link>
                </>
              ) : (
                'No orders in this view.'
              )}
            </div>
          ) : (
            <ul className="space-y-4">
              {visible.map((order) => (
                <li key={order.key}>
                  <OrderCard
                    order={order}
                    expanded={expandedIds.has(order.key)}
                    onToggle={() => toggleExpand(order.key)}
                    onCancelOrder={
                      order.canCancel ? () => void cancelOrder(order) : undefined
                    }
                    cancelling={cancellingOrderId === order.key}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-center text-xs text-gray-500">
            Questions about an order?{' '}
            <Link to="/contactus" className="font-medium text-primary hover:underline">
              Contact us
            </Link>
            {' · '}
            <Link to="/products" className="font-medium text-primary hover:underline">
              Shop more parts
            </Link>
          </p>
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Ordertracking
