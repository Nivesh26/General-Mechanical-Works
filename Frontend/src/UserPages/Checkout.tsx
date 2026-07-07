import { useEffect, useMemo, useState } from 'react'
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
import CheckoutProcessingSpinner from '../UserComponent/CheckoutProcessingSpinner'
import { esewaLaunchUrl, fetchMyCart, initEsewaPayment, initKhaltiPayment, placeOrder } from '../lib/api'
import { isCartItemCheckoutBlocked } from '../lib/cartAvailability'
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

type PaymentChoice = 'COD' | 'ESEWA' | 'KHALTI'

const TAX_RATE = 0.13
const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

const productImageById: Record<number, string> = {
  1: EngineOil,
  2: Brakes,
}

const Checkout = () => {
  const routerLocation = useLocation()
  const navigate = useNavigate()
  const { token, user, loading: authLoading } = useAuth()
  const state = (routerLocation.state as CheckoutState | null) ?? null
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>('COD')
  const [cartValidated, setCartValidated] = useState(false)
  const [cartValid, setCartValid] = useState(true)

  const hasDeliveryLocation = Boolean(user?.location?.trim())

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

  useEffect(() => {
    if (!token || cartLineIds.length === 0) {
      setCartValidated(true)
      setCartValid(cartLineIds.length > 0)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const rows = await fetchMyCart(token)
        if (cancelled) return

        const byId = new Map(rows.map((row) => [row.id, row]))
        const missing = cartLineIds.filter((id) => !byId.has(id))
        const blocked = cartLineIds.filter((id) => {
          const row = byId.get(id)
          if (!row) return false
          return isCartItemCheckoutBlocked({
            active: row.active,
            stock: row.stock,
            quantity: row.quantity,
          })
        })

        if (missing.length > 0) {
          toast.warn('Some items were removed from your cart.')
          navigate('/cart', { replace: true })
          return
        }
        if (blocked.length > 0) {
          toast.error('Some items in your cart are unavailable. Please review your cart.')
          navigate('/cart', { replace: true })
          return
        }

        setCartValid(true)
      } catch (err) {
        if (!cancelled) {
          setCartValid(false)
          toast.error(err instanceof Error ? err.message : 'Could not verify cart.')
        }
      } finally {
        if (!cancelled) setCartValidated(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, cartLineIds, navigate])

  const canPlaceOrder =
    Boolean(token) &&
    cartLineIds.length > 0 &&
    selectedItems.length > 0 &&
    hasDeliveryLocation &&
    cartValidated &&
    cartValid

  const handlePlaceOrder = async () => {
    if (!token) {
      toast.error('Please sign in to place an order.')
      navigate('/login')
      return
    }
    if (!hasDeliveryLocation) {
      toast.error('Please add your delivery location in your profile before placing an order.')
      return
    }
    if (cartLineIds.length === 0) {
      toast.error('Add items from your cart before checkout.')
      navigate('/cart')
      return
    }
    if (!cartValid) {
      toast.error('Some items in your cart are unavailable. Please review your cart.')
      navigate('/cart')
      return
    }

    const confirmMessage =
      paymentMethod === 'COD'
        ? `Place this order for ${formatRs(total)} with Cash on Delivery (COD)? You can track it from Order Tracking after confirmation.`
        : paymentMethod === 'ESEWA'
          ? `Pay ${formatRs(total)} with eSewa and place this order? You will be redirected to eSewa to complete payment.`
          : `Pay ${formatRs(total)} with Khalti and place this order? You will be redirected to Khalti to complete payment.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    setSubmitting(true)
    try {
      if (paymentMethod === 'COD') {
        const order = await placeOrder(token, {
          cartLineIds,
          paymentMethod: 'COD',
        })
        navigate(
          `/payment/cod/result?status=success&orderNumber=${encodeURIComponent(order.orderNumber)}`,
          { replace: true },
        )
        return
      }

      if (paymentMethod === 'ESEWA') {
        const payment = await initEsewaPayment(token, {
          cartLineIds,
          paymentMethod: 'ESEWA',
        })
        window.location.href = esewaLaunchUrl(payment.orderId, token)
        return
      }

      const khaltiPayment = await initKhaltiPayment(token, {
        cartLineIds,
        paymentMethod: 'KHALTI',
      })
      window.location.href = khaltiPayment.paymentUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not place order.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      {submitting && paymentMethod === 'COD' ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            <CheckoutProcessingSpinner title="Placing your order…" />
          </div>
        </div>
      ) : null}
      <main className="flex-1 px-4 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`h-20 w-full flex items-center gap-3 rounded-xl border-2 px-4 text-left cursor-pointer transition-colors ${
                  paymentMethod === 'COD'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                aria-pressed={paymentMethod === 'COD'}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    paymentMethod === 'COD' ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'COD' ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : null}
                </span>
                <HiOutlineBanknotes className="h-7 w-7 text-gray-700 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-500">Pay when your order arrives.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ESEWA')}
                className={`h-20 w-full flex items-center gap-3 rounded-xl border-2 px-4 text-left cursor-pointer transition-colors ${
                  paymentMethod === 'ESEWA'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                aria-pressed={paymentMethod === 'ESEWA'}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    paymentMethod === 'ESEWA' ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'ESEWA' ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : null}
                </span>
                <img src={EsewaLogo} alt="eSewa" className="h-8 w-auto shrink-0 object-contain" />
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('KHALTI')}
                className={`h-20 w-full flex items-center gap-3 rounded-xl border-2 px-4 text-left cursor-pointer transition-colors ${
                  paymentMethod === 'KHALTI'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                aria-pressed={paymentMethod === 'KHALTI'}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    paymentMethod === 'KHALTI' ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'KHALTI' ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : null}
                </span>
                <img src={KhaltiLogo} alt="Khalti" className="h-8 w-auto shrink-0 object-contain" />
              </button>
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
            {!authLoading && !hasDeliveryLocation ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-950">
                  We need your delivery location before you can place an order. Please add it in your profile first.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="mt-3 w-full rounded-lg border border-primary bg-white py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  Go to profile
                </button>
              </div>
            ) : null}
            {!cartValidated ? (
              <p className="mt-5 text-sm text-gray-500">Verifying cart items…</p>
            ) : null}
            {cartValidated && !cartValid ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  Some items are unavailable or out of stock. Return to your cart to fix them.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="mt-3 w-full rounded-lg border border-red-300 bg-white py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Back to cart
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void handlePlaceOrder()}
              disabled={!canPlaceOrder || submitting || authLoading}
              className="mt-6 w-full rounded-lg bg-primary py-3 text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && paymentMethod === 'COD'
                ? 'Placing order…'
                : paymentMethod === 'COD'
                  ? 'Place Order'
                  : paymentMethod === 'ESEWA'
                    ? 'Pay with eSewa'
                    : 'Pay with Khalti'}
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
