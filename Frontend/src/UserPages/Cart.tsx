import React, { useState } from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi2'

type CartItem = {
  id: number
  name: string
  priceLabel: string
  priceValue: number
  image: string
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: 'Engine Oil',
    priceLabel: 'Rs. 3,500',
    priceValue: 3500,
    image: EngineOil,
  },
  {
    id: 2,
    name: 'Brake Service Kit',
    priceLabel: 'Rs. 5,200',
    priceValue: 5200,
    image: Brakes,
  },
]

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

const TAX_RATE = 0.13

const MIN_QTY = 1
const MAX_QTY = 10

const Cart = () => {
  const [items, setItems] = useState<CartItem[]>(initialCartItems)
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2])
  const [quantities, setQuantities] = useState<Record<number, number>>({ 1: 1, 2: 1 })

  const toggleProduct = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const removeItem = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setItems((prev) => prev.filter((p) => p.id !== id))
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    setQuantities((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const setQuantity = (id: number, qty: number) => {
    const next = Math.min(MAX_QTY, Math.max(MIN_QTY, qty))
    setQuantities((prev) => ({ ...prev, [id]: next }))
  }

  const allSelected =
    items.length > 0 && selectedIds.length === items.length

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : items.map((p) => p.id))
  }

  const deleteAllItems = () => {
    setItems([])
    setSelectedIds([])
    setQuantities({})
  }

  const selectedItems = items.filter((p) => selectedIds.includes(p.id))
  const lineTotal = (p: CartItem) => p.priceValue * (quantities[p.id] ?? 1)
  const subtotal = selectedItems.reduce((sum, p) => sum + lineTotal(p), 0)
  const taxAmount = Math.round(subtotal * TAX_RATE)
  const total = subtotal + taxAmount

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 mx-[80px] py-10">
        <div className="mb-8 text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            <span className="text-primary font-sec">Cart</span>
          </h1>
          <p className="text-sm text-gray-500 whitespace-nowrap">
            Review items, then checkout.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left: cart items — multiple selection */}
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
              </label>
              <button
                type="button"
                onClick={deleteAllItems}
                disabled={items.length === 0}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                aria-label="Delete all items"
              >
                <HiOutlineTrash className="w-4 h-4 shrink-0" />
                Delete
              </button>
            </div>
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-200 rounded-xl">
                  Your cart is empty.
                </p>
              ) : (
                items.map((item) => (
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
                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex flex-1 min-w-0 flex-col gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{item.name}</p>
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
                                setQuantity(item.id, (quantities[item.id] ?? 1) - 1)
                              }}
                              disabled={(quantities[item.id] ?? 1) <= MIN_QTY}
                              className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                            >
                              <HiOutlineMinus className="w-4 h-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-gray-900 tabular-nums">
                              {quantities[item.id] ?? 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setQuantity(item.id, (quantities[item.id] ?? 1) + 1)
                              }}
                              disabled={(quantities[item.id] ?? 1) >= MAX_QTY}
                              className="px-2.5 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
                      onClick={(e) => removeItem(item.id, e)}
                      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right: order summary */}
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
                        : `${selectedItems.length} items`}
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
                className="w-full mt-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedItems.length === 0}
              >
                Proceed to checkout
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Cart
