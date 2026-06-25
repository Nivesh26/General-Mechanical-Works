import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import EngineOil from '../assets/EngineOil.png'
import { useAuth } from '../context/AuthContext'
import {
  cancelMyOrderLine,
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
  image: string
  sku: string
  qty: number
  unitPrice: number
  status: ProductLineStatus
  orderedOn: string
  placedAtIso: string
  paymentMethod: PaymentMethod
  canCancel: boolean
  /** Shown when pending */
  estimatedDelivery?: string
  /** Shown when confirmed */
  confirmedOn?: string
  /** Shown when shipped */
  shippedOn?: string
  /** Shown when delivered */
  deliveredOn?: string
  /** Shown when cancelled */
  cancelledOn?: string
  description: string
}

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

/** Shared sizing for detail grid cells (SKU, price, delivered, review, etc.). */
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
      const sizePart = item.sizeLabel?.trim() ? ` Size: ${item.sizeLabel.trim()}.` : ''
      lines.push({
        id: String(item.id ?? `${order.id}-${index}`),
        shopOrderId: order.id,
        orderId: order.orderNumber,
        productId: item.productId,
        name: item.productName,
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

function ProductLineCard({
  line,
  expanded,
  onToggle,
  onCancelProduct,
  cancelling,
}: {
  line: TrackedProductLine
  expanded: boolean
  onToggle: () => void
  onCancelProduct?: () => void
  cancelling?: boolean
}) {
  const lineTotal = line.unitPrice * line.qty
  const canCancel = line.canCancel && onCancelProduct

  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl bg-linear-to-br from-gray-50 to-slate-100 p-2 ring-1 ring-black/5">
            <img src={line.image} alt={line.name} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900 leading-snug min-w-0 flex-1 pr-1">
                {line.name}
              </h2>
              <div className="shrink-0 pt-0.5">
                <StatusBadge status={line.status} />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Qty <span className="font-medium text-gray-900">{line.qty}</span>
              <span className="mx-2 text-gray-300">·</span>
              {formatRs(lineTotal)}
              {line.qty > 1 && (
                <span className="text-gray-400"> ({formatRs(line.unitPrice)} each)</span>
              )}
            </p>
            {canCancel && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onCancelProduct}
                  disabled={cancelling}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling…' : 'Cancel product'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-500">
            <span>
              Order <span className="font-mono font-medium text-gray-700">{line.orderId}</span>
            </span>
            <span className="mx-1.5 text-gray-300">·</span>
            <span>Ordered {line.orderedOn}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-medium text-gray-500">Payment</span>
            <PaymentMethodBadge method={line.paymentMethod} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/80 py-2.5 text-sm font-medium text-primary hover:bg-gray-100/80 transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Hide details
            <HiOutlineChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            Product details
            <HiOutlineChevronDown className="h-4 w-4" />
          </>
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-white px-4 sm:px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">About this product</p>
            <p className="text-sm text-gray-600 leading-relaxed">{line.description}</p>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm items-stretch">
            <div className={`${detailCellClass} bg-gray-50`}>
              <dt className="text-xs text-gray-500">SKU</dt>
              <dd className="font-mono text-gray-900 mt-0.5">{line.sku}</dd>
            </div>
            <div className={`${detailCellClass} bg-gray-50`}>
              <dt className="text-xs text-gray-500">Unit price</dt>
              <dd className="font-medium text-gray-900 mt-0.5 tabular-nums">{formatRs(line.unitPrice)}</dd>
            </div>
            <div className={`${detailCellClass} bg-gray-50`}>
              <dt className="text-xs text-gray-500">Line total</dt>
              <dd className="font-semibold text-primary mt-0.5 tabular-nums">{formatRs(lineTotal)}</dd>
            </div>
            <div className={`${detailCellClass} bg-gray-50`}>
              <dt className="text-xs text-gray-500">Payment method</dt>
              <dd className="mt-1">
                <PaymentMethodBadge method={line.paymentMethod} />
              </dd>
            </div>
            {line.status === 'pending' && (
              <div className={`${detailCellClass} bg-amber-50/80 ring-1 ring-amber-100`}>
                <dt className="text-xs text-amber-800/90 flex items-center gap-1">
                  <HiOutlineTruck className="h-3.5 w-3.5" />
                  Estimated delivery
                </dt>
                <dd className="font-medium text-amber-950 mt-0.5">{line.estimatedDelivery ?? '—'}</dd>
              </div>
            )}
            {line.status === 'confirmed' && (
              <div className={`${detailCellClass} bg-sky-50/80 ring-1 ring-sky-100`}>
                <dt className="text-xs text-sky-800/90 flex items-center gap-1">
                  <HiOutlineClipboardDocumentCheck className="h-3.5 w-3.5" />
                  Confirmed on
                </dt>
                <dd className="font-medium text-sky-950 mt-0.5">{line.confirmedOn ?? '—'}</dd>
                <dd className="text-xs text-sky-800/80 mt-1">
                  Est. delivery: {line.estimatedDelivery ?? '—'}
                </dd>
              </div>
            )}
            {line.status === 'shipped' && (
              <div className={`${detailCellClass} bg-violet-50/80 ring-1 ring-violet-100`}>
                <dt className="text-xs text-violet-800/90 flex items-center gap-1">
                  <HiOutlineTruck className="h-3.5 w-3.5" />
                  Shipped on
                </dt>
                <dd className="font-medium text-violet-950 mt-0.5">{line.shippedOn ?? '—'}</dd>
                <dd className="text-xs text-violet-800/80 mt-1">
                  Est. delivery: {line.estimatedDelivery ?? '—'}
                </dd>
              </div>
            )}
            {line.status === 'delivered' && (
              <>
                <div className={`${detailCellClass} bg-emerald-50/80 ring-1 ring-emerald-100`}>
                  <dt className="text-xs text-emerald-800/90 flex items-center gap-1">
                    <HiOutlineCheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Delivered on
                  </dt>
                  <dd className="font-medium text-emerald-950 mt-0.5">{line.deliveredOn ?? '—'}</dd>
                </div>
                {Number.isFinite(line.productId) && line.productId > 0 ? (
                  <Link
                    to={`/productdetail/${line.productId}#reviews`}
                    className={`${detailCellClass} bg-emerald-50/80 ring-1 ring-emerald-100 hover:bg-emerald-100/80 transition-colors`}
                  >
                    <span className="text-xs text-emerald-800/90 flex items-center gap-1">
                      <HiOutlinePencilSquare className="h-3.5 w-3.5 shrink-0" />
                      Review
                    </span>
                    <span className="mt-0.5 min-h-[1.25rem] block" aria-hidden />
                  </Link>
                ) : (
                  <div className={`${detailCellClass} bg-emerald-50/40 ring-1 ring-emerald-100/60 hidden sm:flex`} aria-hidden />
                )}
              </>
            )}
            {line.status === 'cancelled' && (
              <div className={`${detailCellClass} bg-gray-100 ring-1 ring-gray-200`}>
                <dt className="text-xs text-gray-600 flex items-center gap-1">
                  <HiOutlineNoSymbol className="h-3.5 w-3.5" />
                  Cancelled on
                </dt>
                <dd className="font-medium text-gray-900 mt-0.5">{line.cancelledOn ?? '—'}</dd>
              </div>
            )}
          </dl>
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
  const [cancellingLineId, setCancellingLineId] = useState<string | null>(null)

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

  const counts = useMemo(() => {
    const pending = lines.filter((l) => l.status === 'pending').length
    const confirmed = lines.filter((l) => l.status === 'confirmed').length
    const shipped = lines.filter((l) => l.status === 'shipped').length
    const delivered = lines.filter((l) => l.status === 'delivered').length
    const cancelled = lines.filter((l) => l.status === 'cancelled').length
    return { all: lines.length, pending, confirmed, shipped, delivered, cancelled }
  }, [lines])

  const visible = useMemo(() => {
    const filtered = filter === 'all' ? lines : lines.filter((l) => l.status === filter)
    return [...filtered].sort((a, b) => {
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
      if (a.status !== 'cancelled' && b.status === 'cancelled') return -1
      return b.placedAtIso.localeCompare(a.placedAtIso)
    })
  }, [lines, filter])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const cancelProduct = async (line: TrackedProductLine) => {
    if (!token) return
    if (
      !window.confirm(
        `Cancel "${line.name}" from order ${line.orderId}? This cannot be undone.`,
      )
    ) {
      return
    }
    setCancellingLineId(line.id)
    try {
      await cancelMyOrderLine(token, line.shopOrderId, Number(line.id))
      toast.success('Product cancelled.')
      await loadOrders()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel product.')
    } finally {
      setCancellingLineId(null)
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
                'No products in this view.'
              )}
            </div>
          ) : (
            <ul className="space-y-4">
              {visible.map((line) => (
                <li key={line.id}>
                  <ProductLineCard
                    line={line}
                    expanded={expandedIds.has(line.id)}
                    onToggle={() => toggleExpand(line.id)}
                    onCancelProduct={
                      line.canCancel ? () => void cancelProduct(line) : undefined
                    }
                    cancelling={cancellingLineId === line.id}
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
