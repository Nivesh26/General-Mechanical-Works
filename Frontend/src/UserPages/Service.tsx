import { useState } from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { HiOutlineBuildingStorefront, HiOutlineTruck } from 'react-icons/hi2'

/** Bring bike to the workshop vs we collect from your location */
const bookingModeOptions = [
  {
    id: 'normal' as const,
    title: 'Workshop visit',
    description: 'Bring your bike to our garage for service.',
    Icon: HiOutlineBuildingStorefront,
  },
  {
    id: 'pickup' as const,
    title: 'Pickup service',
    description: 'We pick up your bike, complete the work, and return it.',
    Icon: HiOutlineTruck,
  },
]

const Service = () => {
  const [bookingMode, setBookingMode] = useState<'normal' | 'pickup'>('normal')

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section>
        <div className="mx-[80px] py-12 text-center">
          <h1 className="text-primary font-sec text-3xl sm:text-4xl font-bold tracking-[4px] uppercase">
            Book a service
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Choose whether you’ll visit our workshop or use pickup service—we’ll take care of your bike.
          </p>
        </div>
      </section>

      <main className="flex-1 mx-[80px] py-10">
        <div className="max-w-4xl mx-auto">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Workshop or pickup</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookingModeOptions.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setBookingMode(m.id)}
                  className={`rounded-xl p-4 border-2 text-left flex items-start gap-3 transition-colors ${
                    bookingMode === m.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <m.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{m.title}</p>
                    <p className="text-sm text-gray-600">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Service
