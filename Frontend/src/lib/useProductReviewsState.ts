import { useCallback, useSyncExternalStore } from 'react'
import EngineOil from '../assets/EngineOil.png'
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

const OIL_PRODUCT_DETAIL =
  'Full synthetic formulation for four-stroke motorcycles: reduces wear, improves high-temperature stability, and supports extended drain intervals where the manufacturer allows. JASO MA2–style wet-clutch compatibility for many bikes—always confirm viscosity (e.g. 10W-40) and spec in your owner manual before use. Same listing as on the public product detail page; long descriptions are truncated here for a clean layout.'

/** Pre-seeded company reply on one review for product detail / admin demo. */
const SEED_ADMIN_REPLY_REV_RAJ =
  'Thank you for the detailed feedback, Nivesh. We are glad the synthetic blend has been working well for your riding. If you ever need help choosing the right grade for seasonal changes, our team is happy to help—ride safe from General Mechanical Works.'

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
    productId: DEMO_PRODUCT_ID,
    productName: 'Premium Synthetic Engine Oil',
    productDetail: OIL_PRODUCT_DETAIL,
    productImage: EngineOil,
    userPhoto: AalokaImg,
    name: 'Aaloka',
    rating: 5,
    comment:
      'Switched from mineral to this synthetic and the engine feels noticeably smoother on cold starts. Will stock up again.',
    date: '1 week ago',
  },
  {
    id: 'rev-amit',
    productId: DEMO_PRODUCT_ID,
    productName: 'Premium Synthetic Engine Oil',
    productDetail: OIL_PRODUCT_DETAIL,
    productImage: EngineOil,
    userPhoto: BabuRajImg,
    name: 'BabuRaj',
    rating: 4,
    comment:
      'Good value for money. No leaks after the change and oil pressure looks steady on my gauge. Happy with the purchase.',
    date: '2 weeks ago',
  },
]

/** Demo baseline like totals (shown on product page; toggles add/remove 1 for this shopper). */
function initialReviewLikeCounts(): Record<string, number> {
  const byId: Record<string, number> = {}
  const defaults = [14, 7, 3]
  PRODUCT_REVIEWS_SEED.forEach((r, i) => {
    byId[r.id] = defaults[i] ?? 0
  })
  return byId
}

function initialAdminReplyLikeCounts(): Record<string, number> {
  const byId: Record<string, number> = {}
  PRODUCT_REVIEWS_SEED.forEach((r) => {
    byId[r.id] = r.id === 'rev-raj' ? 5 : 0
  })
  return byId
}

type StoreSnapshot = {
  userLikedReviewIds: string[]
  /** Shoppers who tapped Like on the public company reply for that review (same id as review). */
  userLikedAdminReplyReviewIds: string[]
  /** Admin-only “helpful” flag in the reviews dashboard (not shown on product page). */
  adminLikedReviewIds: string[]
  /** Aggregate like totals for the review (demo — replace with API). */
  reviewLikeCountById: Record<string, number>
  /** Aggregate like totals for the company reply on that review id (demo). */
  adminReplyLikeCountById: Record<string, number>
  adminReplyByReviewId: Record<string, string>
  /** Review ids hidden in UI (demo — replace with API delete later). */
  removedReviewIds: string[]
}

function emptyStore(): StoreSnapshot {
  return {
    userLikedReviewIds: [],
    userLikedAdminReplyReviewIds: [],
    adminLikedReviewIds: [],
    reviewLikeCountById: initialReviewLikeCounts(),
    adminReplyLikeCountById: initialAdminReplyLikeCounts(),
    adminReplyByReviewId: {
      'rev-raj': SEED_ADMIN_REPLY_REV_RAJ,
    },
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
  const {
    userLikedReviewIds,
    userLikedAdminReplyReviewIds,
    adminLikedReviewIds,
    reviewLikeCountById,
    adminReplyLikeCountById,
    adminReplyByReviewId,
    removedReviewIds,
  } =
    useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const visibleReviews = PRODUCT_REVIEWS_SEED.filter((r) => !removedReviewIds.includes(r.id))

  const toggleUserLike = useCallback((reviewId: string) => {
    const s = getSnapshot()
    const wasLiked = s.userLikedReviewIds.includes(reviewId)
    const nextIds = wasLiked
      ? s.userLikedReviewIds.filter((id) => id !== reviewId)
      : [...s.userLikedReviewIds, reviewId]
    const prev = s.reviewLikeCountById[reviewId] ?? 0
    const nextCount = Math.max(0, wasLiked ? prev - 1 : prev + 1)
    setStore({
      ...s,
      userLikedReviewIds: nextIds,
      reviewLikeCountById: { ...s.reviewLikeCountById, [reviewId]: nextCount },
    })
  }, [])

  const toggleUserLikeAdminReply = useCallback((reviewId: string) => {
    const s = getSnapshot()
    const wasLiked = s.userLikedAdminReplyReviewIds.includes(reviewId)
    const next = wasLiked
      ? s.userLikedAdminReplyReviewIds.filter((id) => id !== reviewId)
      : [...s.userLikedAdminReplyReviewIds, reviewId]
    const prev = s.adminReplyLikeCountById[reviewId] ?? 0
    const nextCount = Math.max(0, wasLiked ? prev - 1 : prev + 1)
    setStore({
      ...s,
      userLikedAdminReplyReviewIds: next,
      adminReplyLikeCountById: { ...s.adminReplyLikeCountById, [reviewId]: nextCount },
    })
  }, [])

  const toggleAdminLike = useCallback((reviewId: string) => {
    const s = getSnapshot()
    const next = s.adminLikedReviewIds.includes(reviewId)
      ? s.adminLikedReviewIds.filter((id) => id !== reviewId)
      : [...s.adminLikedReviewIds, reviewId]
    setStore({ ...s, adminLikedReviewIds: next })
  }, [])

  const setAdminReply = useCallback((reviewId: string, text: string) => {
    const s = getSnapshot()
    const nextReply = { ...s.adminReplyByReviewId, [reviewId]: text }
    const nextAdminLikes = { ...s.adminReplyLikeCountById }
    if (nextAdminLikes[reviewId] === undefined) nextAdminLikes[reviewId] = 0
    setStore({
      ...s,
      adminReplyByReviewId: nextReply,
      adminReplyLikeCountById: nextAdminLikes,
    })
  }, [])

  const clearAdminReply = useCallback((reviewId: string) => {
    const s = getSnapshot()
    const next = { ...s.adminReplyByReviewId }
    delete next[reviewId]
    const nextAdminLikes = { ...s.adminReplyLikeCountById }
    delete nextAdminLikes[reviewId]
    setStore({
      ...s,
      adminReplyByReviewId: next,
      userLikedAdminReplyReviewIds: s.userLikedAdminReplyReviewIds.filter((id) => id !== reviewId),
      adminReplyLikeCountById: nextAdminLikes,
    })
  }, [])

  const removeReview = useCallback((reviewId: string) => {
    const s = getSnapshot()
    if (!PRODUCT_REVIEWS_SEED.some((r) => r.id === reviewId)) return
    if (s.removedReviewIds.includes(reviewId)) return
    const nextAdminReplies = { ...s.adminReplyByReviewId }
    delete nextAdminReplies[reviewId]
    const nextReviewLikes = { ...s.reviewLikeCountById }
    delete nextReviewLikes[reviewId]
    const nextAdminReplyLikes = { ...s.adminReplyLikeCountById }
    delete nextAdminReplyLikes[reviewId]
    setStore({
      ...s,
      removedReviewIds: [...s.removedReviewIds, reviewId],
      userLikedReviewIds: s.userLikedReviewIds.filter((id) => id !== reviewId),
      userLikedAdminReplyReviewIds: s.userLikedAdminReplyReviewIds.filter((id) => id !== reviewId),
      adminLikedReviewIds: s.adminLikedReviewIds.filter((id) => id !== reviewId),
      adminReplyByReviewId: nextAdminReplies,
      reviewLikeCountById: nextReviewLikes,
      adminReplyLikeCountById: nextAdminReplyLikes,
    })
  }, [])

  return {
    reviews: visibleReviews,
    userLikedReviewIds,
    userLikedAdminReplyReviewIds,
    adminLikedReviewIds,
    reviewLikeCountById,
    adminReplyLikeCountById,
    adminReplyByReviewId,
    toggleUserLike,
    toggleUserLikeAdminReply,
    toggleAdminLike,
    setAdminReply,
    clearAdminReply,
    removeReview,
  }
}
