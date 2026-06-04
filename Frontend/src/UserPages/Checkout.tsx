import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { HiOutlineBanknotes } from 'react-icons/hi2'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import EsewaLogo from '../assets/E-sewa.png'
import KhaltiLogo from '../assets/Khalti.png'

type PaymentMethod = 'cod' | 'esewa' | 'khalti'

type CheckoutItem = {
  id: number
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

const fallbackItems: CheckoutProduct[] = [
  { id: 1, name: 'Engine Oil', priceValue: 3500, quantity: 1, image: EngineOil },
  { id: 2, name: 'Brake Service Kit', priceValue: 5200, quantity: 1, image: Brakes },
]

const Checkout = () => {
  const location = useLocation()
  const state = (location.state as CheckoutState | null) ?? null
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')

  const selectedItems = useMemo<CheckoutProduct[]>(() => {
    if (!state?.selectedItems?.length) return fallbackItems
    return state.selectedItems.map((item) => ({
      ...item,
      image: item.image ?? productImageById[item.id] ?? EngineOil,
    }))
  }, [state])

  const subtotal = useMemo(
    () => (state?.subtotal ?? selectedItems.reduce((sum, item) => sum + item.priceValue * item.quantity, 0)),
    [selectedItems, state?.subtotal]
  )
  const taxAmount = useMemo(
    () => (state?.taxAmount ?? Math.round(subtotal * TAX_RATE)),
    [state?.taxAmount, subtotal]
  )
  const total = useMemo(() => (state?.total ?? subtotal + taxAmount), [state?.total, subtotal, taxAmount])

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label
                className={`h-20 flex items-center gap-3 rounded-xl border px-4 cursor-pointer transition-colors ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-primary focus:ring-primary"
                />
                <HiOutlineBanknotes className="h-7 w-7 text-gray-700" />
                <div>
                  <p className="font-semibold text-gray-900">COD</p>
                </div>
              </label>

              <label
                className={`h-20 flex items-center gap-3 rounded-xl border px-4 cursor-pointer transition-colors ${
                  paymentMethod === 'esewa' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'esewa'}
                  onChange={() => setPaymentMethod('esewa')}
                  className="text-primary focus:ring-primary"
                />
                <img src={EsewaLogo} alt="E-sewa" className="h-10 w-auto object-contain" />
              </label>

              <label
                className={`h-20 flex items-center gap-3 rounded-xl border px-4 cursor-pointer transition-colors ${
                  paymentMethod === 'khalti' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'khalti'}
                  onChange={() => setPaymentMethod('khalti')}
                  className="text-primary focus:ring-primary"
                />
                <img src={KhaltiLogo} alt="Khalti" className="h-10 w-auto object-contain" />
              </label>
            </div>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Checkout</h2>
            <div className="space-y-3 mb-5">
              {selectedItems.map((item) => {
                const lineTotal = item.priceValue * item.quantity
                return (
                  <article key={item.id} className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 p-3">
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
              className="mt-6 w-full rounded-lg bg-primary py-3 text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Place Order
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