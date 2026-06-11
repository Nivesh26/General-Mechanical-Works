import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus, HiOutlineTruck } from 'react-icons/hi2'
import { PAGE_GUTTER } from '../lib/layoutClasses'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  clearCart,
  fetchMyCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItemDto,
} from '../lib/api'
import { productImageUrl } from '../lib/products'

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

const itemCountLabel = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`

const TAX_RATE = 0.13

const MIN_QTY = 1

type DisplayCartItem = {
  id: number
  productId: number
  name: string
  priceLabel: string
  priceValue: number
  image: string | null
  maxQuantity: number
  size: string | null
}

const toDisplayItem = (row: CartItemDto): DisplayCartItem => ({
  id: row.id,
  productId: row.productId,
  name: row.productName,
  priceLabel: formatRs(Number(row.price)),
  priceValue: Number(row.price),
  image: productImageUrl(row.imagePaths[0] ?? null),
  maxQuantity: row.maxQuantity,
  size: row.size,
})

const Cart = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { refreshCart } = useCart()
  const [items, setItems] = useState<DisplayCartItem[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [clearing, setClearing] = useState(false)

  const loadCart = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const rows = await fetchMyCart(token)
      const display = rows.map(toDisplayItem)
      setItems(display)
      setQuantities(Object.fromEntries(rows.map((r) => [r.id, r.quantity])))
      setSelectedIds(display.map((d) => d.id))
      await refreshCart()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load cart.')
      setItems([])
      setQuantities({})
      setSelectedIds([])
    } finally {
      setLoading(false)
    }
  }, [token, refreshCart])

  useEffect(() => {
    void loadCart()
  }, [loadCart])

  const toggleProduct = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const removeItem = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) return
    setBusyId(id)
    try {
      await removeCartItem(token, id)
      setItems((prev) => prev.filter((p) => p.id !== id))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setQuantities((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      await refreshCart()
      toast.success('Item removed from cart.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove item.')
    } finally {
      setBusyId(null)
    }
  }

  const setQuantity = async (item: DisplayCartItem, qty: number) => {
    if (!token) return
    const next = Math.min(item.maxQuantity, Math.max(MIN_QTY, qty))
    const prevQty = quantities[item.id] ?? 1
    if (next === prevQty) return
    setQuantities((q) => ({ ...q, [item.id]: next }))
    setBusyId(item.id)
    try {
      await updateCartItemQuantity(token, item.id, next)
      await refreshCart()
    } catch (err) {
      setQuantities((q) => ({ ...q, [item.id]: prevQty }))
      toast.error(err instanceof Error ? err.message : 'Could not update quantity.')
    } finally {
      setBusyId(null)
    }
  }

  const allSelected = items.length > 0 && selectedIds.length === items.length

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : items.map((p) => p.id))
  }

  const deleteAllItems = async () => {
    if (!token || items.length === 0) return
    setClearing(true)
    try {
      await clearCart(token)
      setItems([])
      setSelectedIds([])
      setQuantities({})
      await refreshCart()
      toast.success('Cart cleared.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not clear cart.')
    } finally {
      setClearing(false)
    }
  }

  const selectedItems = items.filter((p) => selectedIds.includes(p.id))
  const lineTotal = (p: DisplayCartItem) => p.priceValue * (quantities[p.id] ?? 1)
  const subtotal = selectedItems.reduce((sum, p) => sum + lineTotal(p), 0)
  const taxAmount = Math.round(subtotal * TAX_RATE)
  const total = subtotal + taxAmount

  const goToCheckout = () => {
    if (selectedItems.length === 0) return

    navigate('/checkout', {
      state: {
        selectedItems: selectedItems.map((item) => ({
          id: item.productId,
          cartLineId: item.id,
          name: item.name,
          priceValue: item.priceValue,
          quantity: quantities[item.id] ?? 1,
          image: item.image,
          size: item.size,
        })),
        subtotal,
        taxAmount,
        total,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className={`flex-1 ${PAGE_GUTTER} py-8 sm:py-10`}>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              <span className="text-primary font-sec">Cart</span>
            </h1>
            <p className="text-sm text-gray-500 whitespace-nowrap">
              Review items, then checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/ordertracking')}
            className="inline-flex items-center gap-2 shrink-0 px-6 py-3 rounded-lg border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <HiOutlineTruck className="w-5 h-5 shrink-0" aria-hidden />
            Order Tracking
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-16">Loading your cart…</p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <section className="flex-1 w-full min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    disabled={items.length === 0}
                    className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary shrink-0 disabled:opacity-50"
                  />
                  Select all
                  <span className="text-gray-500 font-normal">
                    {' '}
                    ({itemCountLabel(items.length)})
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => void deleteAllItems()}
                  disabled={items.length === 0 || clearing}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                  aria-label="Delete all items"
                >
                  <HiOutlineTrash className="w-4 h-4 shrink-0" />
                  Delete
                </button>
              </div>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-200 rounded-xl">
                    <p className="mb-3">Your cart is empty.</p>
                    <Link to="/products" className="text-primary font-medium hover:underline">
                      Browse products
                    </Link>
                  </div>
                ) : (
                  items.map((item) => {
                    const qty = quantities[item.id] ?? 1
                    const isBusy = busyId === item.id
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                          selectedIds.includes(item.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <label className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleProduct(item.id)}
                            className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary shrink-0"
                          />
                          <div className="w-20 h-20 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 p-2">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">No image</span>
                            )}
                          </div>
                          <div className="flex flex-1 min-w-0 flex-col gap-2 sm:gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              {item.size ? (
                                <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                              ) : null}
                              <p className="text-primary font-semibold mt-1">{item.priceLabel}</p>
                            </div>
                            <div
                              className="flex flex-col gap-1 shrink-0 w-fit max-w-full"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                            >
                              <span className="text-xs text-gray-500">Amount</span>
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    void setQuantity(item, qty - 1)
                                  }}
                                  disabled={qty <= MIN_QTY || isBusy}
                                  className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  aria-label="Decrease quantity"
                                >
                                  <HiOutlineMinus className="w-4 h-4" />
                                </button>
                                <span className="min-w-8 text-center text-sm font-semibold text-gray-900 tabular-nums">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    void setQuantity(item, qty + 1)
                                  }}
                                  disabled={qty >= item.maxQuantity || isBusy}
                                  className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  aria-label="Increase quantity"
                                >
                                  <HiOutlinePlus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </label>
                        <button
                          type="button"
                          onClick={(e) => void removeItem(item.id, e)}
                          disabled={isBusy}
                          className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Remove ${item.name}`}
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-2 text-gray-600">
                    <span className="shrink-0">Selected</span>
                    <span className="text-gray-900 font-medium text-right">
                      {selectedItems.length === 0
                        ? '—'
                        : selectedItems.length === 1
                          ? selectedItems[0].name
                          : itemCountLabel(selectedItems.length)}
                    </span>
                  </div>
                  {selectedItems.length > 1 && (
                    <ul className="text-xs text-gray-500 pl-2 border-l-2 border-primary/30 space-y-1">
                      {selectedItems.map((p) => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      {selectedItems.length > 0 ? formatRs(subtotal) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (13%)</span>
                    <span className="text-gray-900 font-medium">
                      {selectedItems.length > 0 ? formatRs(taxAmount) : '—'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {selectedItems.length > 0 ? formatRs(total) : '—'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={goToCheckout}
                  className="w-full mt-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedItems.length === 0}
                >
                  Proceed to checkout
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Cart
