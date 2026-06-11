import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { HiOutlineBanknotes } from 'react-icons/hi2'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import EsewaLogo from '../assets/E-sewa.png'
import KhaltiLogo from '../assets/Khalti.png'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { placeOrder } from '../lib/api'
import { productImageUrl } from '../lib/products'

type CheckoutItem = {
  id: number
  cartLineId?: number
  name: string
  priceValue: number
  quantity: number
  image?: string | null
}

type CheckoutState = {
  selectedItems?: CheckoutItem[]
  subtotal?: number
  taxAmount?: number
  total?: number
}

type CheckoutProduct = CheckoutItem & {
  image: string
}

const TAX_RATE = 0.13
const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

const productImageById: Record<number, string> = {
  1: EngineOil,
  2: Brakes,
}

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { refreshCart } = useCart()
  const state = (location.state as CheckoutState | null) ?? null
  const [submitting, setSubmitting] = useState(false)

  const selectedItems = useMemo<CheckoutProduct[]>(() => {
    if (!state?.selectedItems?.length) return []
    return state.selectedItems.map((item) => ({
      ...item,
      image: item.image ?? productImageUrl(productImageById[item.id] ?? null) ?? EngineOil,
    }))
  }, [state])

  const cartLineIds = useMemo(
    () =>
      selectedItems
        .map((item) => item.cartLineId)
        .filter((id): id is number => typeof id === 'number'),
    [selectedItems],
  )

  const subtotal = useMemo(
    () => state?.subtotal ?? selectedItems.reduce((sum, item) => sum + item.priceValue * item.quantity, 0),
    [selectedItems, state?.subtotal],
  )
  const taxAmount = useMemo(
    () => state?.taxAmount ?? Math.round(subtotal * TAX_RATE),
    [state?.taxAmount, subtotal],
  )
  const total = useMemo(() => state?.total ?? subtotal + taxAmount, [state?.total, subtotal, taxAmount])

  const canPlaceOrder = Boolean(token) && cartLineIds.length > 0 && selectedItems.length > 0

  const handlePlaceOrder = async () => {
    if (!token) {
      toast.error('Please sign in to place an order.')
      navigate('/login')
      return
    }
    if (cartLineIds.length === 0) {
      toast.error('Add items from your cart before checkout.')
      navigate('/cart')
      return
    }

    setSubmitting(true)
    try {
      const order = await placeOrder(token, {
        cartLineIds,
        paymentMethod: 'COD',
      })
      await refreshCart()
      toast.success(`Order ${order.orderNumber} placed successfully.`)
      navigate('/ordertracking', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not place order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <div
                className="h-20 flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 px-4 cursor-default"
                aria-current="true"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <HiOutlineBanknotes className="h-7 w-7 text-gray-700 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-500">Pay when your order arrives.</p>
                </div>
              </div>

              <div
                className="h-20 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 opacity-60 cursor-not-allowed"
                aria-disabled="true"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300" />
                <img src={EsewaLogo} alt="eSewa" className="h-8 w-auto shrink-0 object-contain" />
              </div>

              <div
                className="h-20 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 opacity-60 cursor-not-allowed"
                aria-disabled="true"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300" />
                <img src={KhaltiLogo} alt="Khalti" className="h-8 w-auto shrink-0 object-contain" />
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Checkout</h2>
            {selectedItems.length === 0 ? (
              <p className="text-sm text-gray-500 mb-5">
                No items selected. Go to your cart and choose items to checkout.
              </p>
            ) : (
              <div className="space-y-3 mb-5">
                {selectedItems.map((item) => {
                  const lineTotal = item.priceValue * item.quantity
                  return (
                    <article
                      key={item.cartLineId ?? item.id}
                      className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 p-3"
                    >
                      <div className="h-14 w-14 rounded-md border border-gray-200 bg-gray-50 p-1.5 flex items-center justify-center shrink-0">
                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatRs(lineTotal)}</p>
                    </article>
                  )
                })}
              </div>
            )}
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="text-gray-900">{selectedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900">{formatRs(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (13%)</span>
                <span className="text-gray-900">{formatRs(taxAmount)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary">{formatRs(total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handlePlaceOrder()}
              disabled={!canPlaceOrder || submitting}
              className="mt-6 w-full rounded-lg bg-primary py-3 text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
          </aside>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Checkout
