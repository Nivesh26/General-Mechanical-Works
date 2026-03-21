import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import Battery from '../assets/Battery.png'
import Tyre from '../assets/Tyre.png'
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineNoSymbol,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2'

type ProductLineStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

type TrackedProductLine = {
  id: string
  orderId: string
  name: string
  image: string
  sku: string
  qty: number
  unitPrice: number
  status: ProductLineStatus
  orderedOn: string
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

/** Demo data — replace with API (user’s orders) */
const MOCK_LINES: TrackedProductLine[] = [
  {
    id: 'line-1',
    orderId: 'GMW-2025-001234',
    name: 'Premium Synthetic Engine Oil',
    image: EngineOil,
    sku: 'GMW-OIL-SYN-1L',
    qty: 1,
    unitPrice: 3500,
    status: 'pending',
    orderedOn: '28 Feb 2025',
    estimatedDelivery: '8 Mar 2025',
    description:
      'Full synthetic 4-stroke engine oil. Suitable for modern motorcycles. API SN, JASO MA2.',
  },
  {
    id: 'line-2',
    orderId: 'GMW-2025-001234',
    name: 'Brake Service Kit',
    image: Brakes,
    sku: 'GMW-BRK-KIT-STD',
    qty: 1,
    unitPrice: 5200,
    status: 'confirmed',
    orderedOn: '28 Feb 2025',
    confirmedOn: '28 Feb 2025, 4:20 PM',
    estimatedDelivery: '10 Mar 2025',
    description:
      'Complete front brake pad and hardware kit. OEM-style fit for common commuter bikes.',
  },
  {
    id: 'line-3',
    orderId: 'GMW-2025-007700',
    name: 'Battery 12V maintenance-free',
    image: Battery,
    sku: 'GMW-BAT-12V-7AH',
    qty: 1,
    unitPrice: 8900,
    status: 'shipped',
    orderedOn: '10 Feb 2025',
    shippedOn: '11 Feb 2025',
    estimatedDelivery: '14 Feb 2025',
    description:
      'Sealed lead-acid battery, 12V 7Ah. Packed and handed to courier; tracking updates by SMS.',
  },
  {
    id: 'line-4',
    orderId: 'GMW-2025-008100',
    name: 'All-weather tyre 100/90-17',
    image: Tyre,
    sku: 'GMW-TYR-10090-17',
    qty: 1,
    unitPrice: 12500,
    status: 'delivered',
    orderedOn: '2 Jan 2025',
    deliveredOn: '6 Jan 2025',
    description: 'Tubeless rear tyre with wet-grip compound. Delivered and signed at your address.',
  },
  {
    id: 'line-5',
    orderId: 'GMW-2025-006600',
    name: 'Chain lubricant spray',
    image: EngineOil,
    sku: 'GMW-CHAIN-LUBE',
    qty: 1,
    unitPrice: 1200,
    status: 'cancelled',
    orderedOn: '5 Feb 2025',
    cancelledOn: '7 Feb 2025',
    description: 'Order cancelled before packing; refund issued to your original payment method.',
  },
]

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

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
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
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
}: {
  line: TrackedProductLine
  expanded: boolean
  onToggle: () => void
  onCancelProduct?: () => void
}) {
  const lineTotal = line.unitPrice * line.qty
  const canCancel =
    (line.status === 'pending' || line.status === 'confirmed') && onCancelProduct

  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
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
            <p className="mt-1 text-xs text-gray-500">
              Order <span className="font-mono font-medium text-gray-700">{line.orderId}</span>
              <span className="mx-1.5 text-gray-300">·</span>
              Ordered {line.orderedOn}
            </p>
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
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                >
                  Cancel product
                </button>
              </div>
            )}
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
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <dt className="text-xs text-gray-500">SKU</dt>
              <dd className="font-mono text-gray-900 mt-0.5">{line.sku}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <dt className="text-xs text-gray-500">Unit price</dt>
              <dd className="font-medium text-gray-900 mt-0.5 tabular-nums">{formatRs(line.unitPrice)}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <dt className="text-xs text-gray-500">Line total</dt>
              <dd className="font-semibold text-primary mt-0.5 tabular-nums">{formatRs(lineTotal)}</dd>
            </div>
            {line.status === 'pending' && (
              <div className="rounded-lg bg-amber-50/80 px-3 py-2 ring-1 ring-amber-100">
                <dt className="text-xs text-amber-800/90 flex items-center gap-1">
                  <HiOutlineTruck className="h-3.5 w-3.5" />
                  Estimated delivery
                </dt>
                <dd className="font-medium text-amber-950 mt-0.5">{line.estimatedDelivery ?? '—'}</dd>
              </div>
            )}
            {line.status === 'confirmed' && (
              <div className="rounded-lg bg-sky-50/80 px-3 py-2 ring-1 ring-sky-100">
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
              <div className="rounded-lg bg-violet-50/80 px-3 py-2 ring-1 ring-violet-100">
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
              <div className="rounded-lg bg-emerald-50/80 px-3 py-2 ring-1 ring-emerald-100">
                <dt className="text-xs text-emerald-800/90 flex items-center gap-1">
                  <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                  Delivered on
                </dt>
                <dd className="font-medium text-emerald-950 mt-0.5">{line.deliveredOn ?? '—'}</dd>
              </div>
            )}
            {line.status === 'cancelled' && (
              <div className="rounded-lg bg-gray-100 px-3 py-2 ring-1 ring-gray-200">
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
  const [lines, setLines] = useState<TrackedProductLine[]>(MOCK_LINES)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const counts = useMemo(() => {
    const pending = lines.filter((l) => l.status === 'pending').length
    const confirmed = lines.filter((l) => l.status === 'confirmed').length
    const shipped = lines.filter((l) => l.status === 'shipped').length
    const delivered = lines.filter((l) => l.status === 'delivered').length
    const cancelled = lines.filter((l) => l.status === 'cancelled').length
    return { all: lines.length, pending, confirmed, shipped, delivered, cancelled }
  }, [lines])

  const visible = useMemo(() => {
    if (filter === 'all') return lines
    return lines.filter((l) => l.status === filter)
  }, [lines, filter])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const cancelProduct = (id: string) => {
    if (
      !window.confirm(
        'Cancel this product? It will be removed from your order (including confirmed items). This cannot be undone.'
      )
    ) {
      return
    }
    setLines((prev) => prev.filter((l) => l.id !== id))
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
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

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-white/80 py-12 text-center text-sm text-gray-500">
              No products in this view.
            </p>
          ) : (
            <ul className="space-y-4">
              {visible.map((line) => (
                <li key={line.id}>
                  <ProductLineCard
                    line={line}
                    expanded={expandedIds.has(line.id)}
                    onToggle={() => toggleExpand(line.id)}
                    onCancelProduct={
                      line.status === 'pending' || line.status === 'confirmed'
                        ? () => cancelProduct(line.id)
                        : undefined
                    }
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
