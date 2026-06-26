import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { useAuth } from '../context/AuthContext'
import {
  fetchMyAppointments,
  type ServiceAppointmentItem,
  type ServiceAppointmentStatus,
} from '../lib/api'
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineNoSymbol,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2'

type FilterTab = 'all' | ServiceAppointmentStatus

function formatBookingDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatSubmittedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function StatusBadge({ status }: { status: ServiceAppointmentStatus }) {
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
        <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden />
        Accepted
      </span>
    )
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-200/80">
        <HiOutlineNoSymbol className="h-3.5 w-3.5" aria-hidden />
        Declined
      </span>
    )
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200/80">
        <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden />
        Completed
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

function ModeBadge({ mode }: { mode: ServiceAppointmentItem['mode'] }) {
  const label = mode === 'pickup' ? 'Pickup' : 'Workshop'
  return (
    <span className="inline-flex shrink-0 items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
      {label}
    </span>
  )
}

function BookingCard({ booking }: { booking: ServiceAppointmentItem }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Booking ID</p>
          <p className="font-mono text-sm font-bold text-gray-900">{booking.appointmentNumber}</p>
          <p className="mt-1 text-xs text-gray-500">Booked {formatSubmittedAt(booking.submittedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={booking.mode} />
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Services</p>
          <p className="font-semibold text-gray-900">{booking.serviceTitle}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Bike</p>
          <p className="font-semibold text-gray-900">{booking.bikeLabel}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Date</p>
          <p className="font-semibold text-gray-900">{formatBookingDate(booking.date)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Time slot</p>
          <p className="font-semibold text-gray-900">{booking.slot}</p>
        </div>
      </div>

      {booking.notes?.trim() ? (
        <div className="mt-3 rounded-xl border border-dashed border-gray-200 px-3 py-2.5 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Notes: </span>
          {booking.notes}
        </div>
      ) : null}
    </article>
  )
}

const BookingHistory = () => {
  const { token } = useAuth()
  const [bookings, setBookings] = useState<ServiceAppointmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')

  const loadBookings = useCallback(async () => {
    if (!token) {
      setBookings([])
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const data = await fetchMyAppointments(token)
      setBookings(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load your bookings.')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  const counts = useMemo(() => {
    const c = {
      all: bookings.length,
      pending: 0,
      accepted: 0,
      declined: 0,
      completed: 0,
    }
    for (const b of bookings) {
      c[b.status] += 1
    }
    return c
  }, [bookings])

  const visible = useMemo(() => {
    const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
    return [...filtered].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  }, [bookings, filter])

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <Header />

      <main className="flex-1 px-4 sm:px-10 lg:px-[80px] py-10 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              <span className="text-primary font-sec">My bookings</span>
            </h1>
            <p className="text-sm text-gray-500">
              Your workshop visits and service appointments—track pending, accepted, and completed bookings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(
              [
                { key: 'all' as const, label: 'All' },
                { key: 'pending' as const, label: 'Pending' },
                { key: 'accepted' as const, label: 'Accepted' },
                { key: 'declined' as const, label: 'Declined' },
                { key: 'completed' as const, label: 'Completed' },
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
                <span className="ml-1.5 opacity-80 tabular-nums">({counts[key]})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Loading your bookings…
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-800 font-medium mb-4">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadBookings()}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <HiOutlineCalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" aria-hidden />
              <p className="text-gray-700 font-medium mb-1">No bookings yet</p>
              <p className="text-sm text-gray-500 mb-6">
                {filter === 'all'
                  ? 'Book a workshop visit to see your service history here.'
                  : `No ${filter} bookings right now.`}
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                <HiOutlineWrenchScrewdriver className="h-4 w-4" aria-hidden />
                Book a service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default BookingHistory
