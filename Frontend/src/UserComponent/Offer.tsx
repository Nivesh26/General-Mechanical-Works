import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchOffers, type OfferItem } from '../lib/api'
import { offerImageUrl } from '../lib/offers'

const VISIBLE_COUNT = 3
const ROTATE_INTERVAL_MS = 10_000

const Offer = () => {
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchOffers()
      .then((list) => {
        if (!cancelled) {
          setOffers(list)
          setStartIndex(0)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load offers')
          setOffers([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  /** Auto-advance when more than one poster (shows up to 3 at a time). */
  const canRotate = offers.length > 1

  const visibleOffers = useMemo(() => {
    if (offers.length === 0) return []
    const slotCount = Math.min(VISIBLE_COUNT, offers.length)
    return Array.from({ length: slotCount }, (_, i) => offers[(startIndex + i) % offers.length])
  }, [offers, startIndex])

  const goToPrev = () => {
    if (!canRotate) return
    setStartIndex((prev) => (prev - 1 + offers.length) % offers.length)
  }

  const goToNext = () => {
    if (!canRotate) return
    setStartIndex((prev) => (prev + 1) % offers.length)
  }

  useEffect(() => {
    if (!canRotate) return
    const id = window.setInterval(() => {
      setStartIndex((prev) => (prev + 1) % offers.length)
    }, ROTATE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [canRotate, offers.length])

  const selectedOffer = selectedId != null ? offers.find((o) => o.id === selectedId) : undefined
  const selectedImageSrc = selectedOffer ? offerImageUrl(selectedOffer.imagePath) : null

  useEffect(() => {
    if (!selectedOffer) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [selectedOffer])

  const lightbox =
    selectedOffer &&
    selectedImageSrc &&
    createPortal(
      <div
        className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
        onClick={() => setSelectedId(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Viewing offer"
      >
        <button
          type="button"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white border-2 border-gray-300 flex items-center justify-center text-gray-700 cursor-pointer"
          onClick={() => setSelectedId(null)}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div
          className="relative max-w-7xl w-full max-h-[95vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={selectedImageSrc}
            alt={selectedOffer.description}
            className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>,
      document.body,
    )

  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      {lightbox}

      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold italic tracking-[4px] uppercase mb-10 sm:mb-12">
        Latest Offers
      </h2>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading offers…</p>
        ) : error ? (
          <p className="text-center text-red-600 py-12">{error}</p>
        ) : offers.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No offers available right now.</p>
        ) : (
          <>
            {canRotate && (
              <button
                type="button"
                onClick={goToPrev}
                className="absolute -left-9 sm:-left-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                aria-label="Previous offer"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {canRotate && (
              <button
                type="button"
                onClick={goToNext}
                className="absolute -right-9 sm:-right-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                aria-label="Next offer"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleOffers.map((offer) => {
                const imageSrc = offerImageUrl(offer.imagePath)
                return (
                  <div
                    key={offer.id}
                    className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 cursor-pointer"
                    onClick={() => setSelectedId(offer.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedId(offer.id)
                    }}
                    aria-label={`View ${offer.description}`}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={offer.description}
                        className="w-full h-auto object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100" />
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Offer
