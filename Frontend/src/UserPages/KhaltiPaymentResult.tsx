import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { useCart } from '../context/CartContext'

const KhaltiPaymentResult = () => {
  const [searchParams] = useSearchParams()
  const { refreshCart } = useCart()
  const status = searchParams.get('status')
  const orderNumber = searchParams.get('orderNumber')
  const message = searchParams.get('message')

  useEffect(() => {
    if (status === 'success') {
      void refreshCart()
    }
  }, [refreshCart, status])

  const isSuccess = status === 'success'
  const isFailure = status === 'failure'
  const isError = status === 'error'

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 px-4 py-16">
        <div className="max-w-lg mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          {isSuccess ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
              <p className="mt-3 text-gray-600">
                {orderNumber
                  ? `Your order ${orderNumber} has been placed and paid via Khalti.`
                  : 'Your Khalti payment was completed successfully.'}
              </p>
            </>
          ) : null}

          {isFailure ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Payment cancelled</h1>
              <p className="mt-3 text-gray-600">
                {orderNumber
                  ? `Payment for ${orderNumber} was not completed. Your cart items are still available.`
                  : 'Khalti payment was not completed. You can try again from checkout.'}
              </p>
            </>
          ) : null}

          {isError ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Payment verification failed</h1>
              <p className="mt-3 text-gray-600">
                {message ?? 'We could not verify your Khalti payment. Please contact support if amount was deducted.'}
              </p>
            </>
          ) : null}

          {!isSuccess && !isFailure && !isError ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Payment result</h1>
              <p className="mt-3 text-gray-600">No payment status was provided.</p>
            </>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {isSuccess ? (
              <Link
                to="/ordertracking"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                View order tracking
              </Link>
            ) : (
              <Link
                to="/checkout"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                Back to checkout
              </Link>
            )}
            <Link
              to="/cart"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 cursor-pointer"
            >
              Go to cart
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default KhaltiPaymentResult
