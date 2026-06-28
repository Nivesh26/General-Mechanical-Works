import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HiOutlineCheck } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import CheckoutProcessingSpinner from '../UserComponent/CheckoutProcessingSpinner'
import { useCart } from '../context/CartContext'

type PaymentResultPageProps = {
  providerName: string
  /** COD uses order copy instead of payment copy. */
  variant?: 'payment' | 'order'
}

const PaymentResultPage = ({ providerName, variant = 'payment' }: PaymentResultPageProps) => {
  const [searchParams] = useSearchParams()
  const { refreshCart } = useCart()
  const status = searchParams.get('status')
  const orderNumber = searchParams.get('orderNumber')
  const message = searchParams.get('message')

  const isSuccess = status === 'success'
  const isFailure = status === 'failure'
  const isError = status === 'error'

  const [verifying, setVerifying] = useState(isSuccess)
  const [showTick, setShowTick] = useState(false)

  useEffect(() => {
    if (!isSuccess) {
      setVerifying(false)
      return
    }

    let cancelled = false
    const run = async () => {
      await refreshCart()
      if (cancelled) return
      setVerifying(false)
      requestAnimationFrame(() => setShowTick(true))
    }

    const timer = setTimeout(() => {
      void run()
    }, 1200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isSuccess, refreshCart])

  const isOrder = variant === 'order'
  const verifyingTitle = isOrder ? 'Confirming your order…' : 'Confirming your payment…'
  const successTitle = isOrder ? 'Order placed' : 'Payment successful'
  const successMessage = orderNumber
    ? isOrder
      ? `Your order ${orderNumber} has been placed with Cash on Delivery.`
      : `Your order ${orderNumber} has been placed and paid via ${providerName}.`
    : isOrder
      ? 'Your Cash on Delivery order was placed successfully.'
      : `Your ${providerName} payment was completed successfully.`

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 px-4 py-16">
        <div className="max-w-lg mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          {isSuccess && verifying ? (
            <CheckoutProcessingSpinner title={verifyingTitle} />
          ) : null}

          {isSuccess && !verifying ? (
            <div className="py-4">
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 transition-all duration-500 ease-out ${
                  showTick ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                }`}
              >
                <HiOutlineCheck
                  className={`h-11 w-11 text-green-600 transition-all duration-500 delay-150 ${
                    showTick ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                  strokeWidth={2.5}
                  aria-hidden
                />
              </div>
              <h1
                className={`mt-6 text-2xl font-bold text-gray-900 transition-opacity duration-500 ${
                  showTick ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {successTitle}
              </h1>
              <p
                className={`mt-3 text-gray-600 transition-opacity duration-500 delay-100 ${
                  showTick ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {successMessage}
              </p>
              <Link
                to="/ordertracking"
                className={`mt-8 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all duration-500 delay-200 cursor-pointer ${
                  showTick ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                Go to order tracking
              </Link>
            </div>
          ) : null}

          {isFailure ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Payment cancelled</h1>
              <p className="mt-3 text-gray-600">
                {orderNumber
                  ? `Payment for ${orderNumber} was not completed. Your cart items are still available.`
                  : `${providerName} payment was not completed. You can try again from checkout.`}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/checkout"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
                >
                  Back to checkout
                </Link>
                <Link
                  to="/cart"
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
                >
                  Go to cart
                </Link>
              </div>
            </>
          ) : null}

          {isError ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Payment verification failed</h1>
              <p className="mt-3 text-gray-600">
                {message ??
                  `We could not verify your ${providerName} payment. Please contact support if amount was deducted.`}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/checkout"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
                >
                  Back to checkout
                </Link>
                <Link
                  to="/cart"
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
                >
                  Go to cart
                </Link>
              </div>
            </>
          ) : null}

          {!isSuccess && !isFailure && !isError ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Payment result</h1>
              <p className="mt-3 text-gray-600">No payment status was provided.</p>
              <Link
                to="/ordertracking"
                className="mt-8 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                Go to order tracking
              </Link>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default PaymentResultPage
