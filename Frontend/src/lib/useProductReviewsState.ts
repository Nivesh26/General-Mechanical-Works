import { useCallback, useSyncExternalStore } from 'react'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import Battery from '../assets/Battery.png'
import NiveshImg from '../assets/Nivesh.png'
import AalokaImg from '../assets/aalokapoudel.jpg'
import BabuRajImg from '../assets/baburaja.jpg'

export type ProductReview = {
  id: string
  productId: string
  productName: string
  /** Product photo (e.g. from CDN or bundled asset URL). */
  productImage: string
  /** Reviewer profile photo URL. */
  userPhoto: string
  name: string
  rating: number
  comment: string
  date: string
  /** Short product copy for admin (clamped to ~2 lines in UI). */
  productDetail: string
}

/** Demo product id — matches the engine oil product detail page filter. */
export const DEMO_PRODUCT_ID = 'premium-engine-oil'

const DEMO_BRAKE_PRODUCT_ID = 'brake-service-kit'
const DEMO_BATTERY_PRODUCT_ID = 'motorcycle-battery'

const OIL_PRODUCT_DETAIL =
  'Full synthetic formulation for four-stroke motorcycles: reduces wear, improves high-temperature stability, and supports extended drain intervals where the manufacturer allows. JASO MA2–style wet-clutch compatibility for many bikes—always confirm viscosity (e.g. 10W-40) and spec in your owner manual before use. Same listing as on the public product detail page; long descriptions are truncated here for a clean layout.'

const BRAKE_PRODUCT_DETAIL =
  'Complete brake service kit including pads, shims, and hardware where supplied. Designed for common commuter and sport-touring motorcycles—verify disc diameter, caliper type, and model year against the fitment chart before ordering. Bedding-in procedure and torque values are listed in the included sheet; follow them for safe stopping performance and even pad wear.'

const BATTERY_PRODUCT_DETAIL =
  'Sealed AGM-style motorcycle battery with strong cold-cranking performance for electric start bikes. Check terminal polarity (left/right positive), physical dimensions, and Ah rating against your OEM spec. Includes hold-down notes for tight battery boxes; register the battery with your charger if it has been stored—see the product sheet for storage and winter tips.'

export const PRODUCT_REVIEWS_SEED: ProductReview[] = [
  {
    id: 'rev-raj',
    productId: DEMO_PRODUCT_ID,
    productName: 'Premium Synthetic Engine Oil',
    productDetail: OIL_PRODUCT_DETAIL,
    productImage: EngineOil,
    userPhoto: NiveshImg,
    name: 'Nivesh',
    rating: 5,
    comment:
      'Great oil, smooth engine performance. Using it for the last 6 months with no issues. Recommended.',
    date: '2 days ago',
  },
  {
    id: 'rev-sita',
    productId: DEMO_BRAKE_PRODUCT_ID,
    productName: 'Brake Service Kit',
    productDetail: BRAKE_PRODUCT_DETAIL,
    productImage: Brakes,
    userPhoto: AalokaImg,
    name: 'Aaloka',
    rating: 5,
    comment:
      'Brake kit fit perfectly and stopping power feels much more confident. Install took about an hour with basic tools.',
    date: '1 week ago',
  },
  {
    id: 'rev-amit',
    productId: DEMO_BATTERY_PRODUCT_ID,
    productName: 'Battery',
    productDetail: BATTERY_PRODUCT_DETAIL,
    productImage: Battery,
    userPhoto: BabuRajImg,
    name: 'BabuRaj',
    rating: 4,
    comment: 'Battery dropped in without issues; bike starts instantly now. Good value for the price.',
    date: '2 weeks ago',
  },
]

type StoreSnapshot = {
  userLikedReviewIds: string[]
  adminLikedReviewIds: string[]
  adminReplyByReviewId: Record<string, string>
  /** Review ids hidden in UI (demo — replace with API delete later). */
  removedReviewIds: string[]
}

function emptyStore(): StoreSnapshot {
  return {
    userLikedReviewIds: [],
    adminLikedReviewIds: [],
    adminReplyByReviewId: {},
    removedReviewIds: [],
  }
}

const listeners = new Set<() => void>()

let store: StoreSnapshot = emptyStore()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): StoreSnapshot {
  return store
}

function getServerSnapshot(): StoreSnapshot {
  return emptyStore()
}

function setStore(next: StoreSnapshot) {
  store = next
  listeners.forEach((l) => l())
}

export function useProductReviewsState() {
  const { userLikedReviewIds, adminLikedReviewIds, adminReplyByReviewId, removedReviewIds } =
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const visibleReviews = PRODUCT_REVIEWS_SEED.filter((r) => !removedReviewIds.includes(r.id))

  const toggleUserLike = useCallback((reviewId: string) => {
    const s = getSnapshot()
    const nextIds = s.userLikedReviewIds.includes(reviewId)
      ? s.userLikedReviewIds.filter((id) => id !== reviewId)
      : [...s.userLikedReviewIds, reviewId]
    setStore({ ...s, userLikedReviewIds: nextIds })
  }, [])

  const toggleAdminLike = useCallback((reviewId: string) => {
    const s = getSnapshot()
    const nextIds = s.adminLikedReviewIds.includes(reviewId)
      ? s.adminLikedReviewIds.filter((id) => id !== reviewId)
      : [...s.adminLikedReviewIds, reviewId]
    setStore({ ...s, adminLikedReviewIds: nextIds })
  }, [])

  const setAdminReply = useCallback((reviewId: string, text: string) => {
    const s = getSnapshot()
    setStore({
      ...s,
      adminReplyByReviewId: { ...s.adminReplyByReviewId, [reviewId]: text },
    })
  }, [])

  const clearAdminReply = useCallback((reviewId: string) => {
    const s = getSnapshot()
    const next = { ...s.adminReplyByReviewId }
    delete next[reviewId]
    setStore({ ...s, adminReplyByReviewId: next })
  }, [])

  const removeReview = useCallback((reviewId: string) => {
    const s = getSnapshot()
    if (!PRODUCT_REVIEWS_SEED.some((r) => r.id === reviewId)) return
    if (s.removedReviewIds.includes(reviewId)) return
    const nextReplies = { ...s.adminReplyByReviewId }
    delete nextReplies[reviewId]
    setStore({
      ...s,
      removedReviewIds: [...s.removedReviewIds, reviewId],
      userLikedReviewIds: s.userLikedReviewIds.filter((id) => id !== reviewId),
      adminLikedReviewIds: s.adminLikedReviewIds.filter((id) => id !== reviewId),
      adminReplyByReviewId: nextReplies,
    })
  }, [])

  return {
    reviews: visibleReviews,
    userLikedReviewIds,
    adminLikedReviewIds,
    adminReplyByReviewId,
    toggleUserLike,
    toggleAdminLike,
    setAdminReply,
    clearAdminReply,
    removeReview,
  }
}
