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
}

/** Demo product id used on the product detail page and for seeded reviews. */
export const DEMO_PRODUCT_ID = 'premium-engine-oil'

export const PRODUCT_REVIEWS_SEED: ProductReview[] = [
  {
    id: 'rev-raj',
    productId: DEMO_PRODUCT_ID,
    productName: 'Premium Synthetic Engine Oil',
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
    productImage: EngineOil,
    userPhoto: AalokaImg,
    name: 'Aaloka',
    rating: 5,
    comment: 'Quality product. Bike runs much smoother after the change. Will buy again.',
    date: '1 week ago',
  },
  {
    id: 'rev-amit',
    productId: DEMO_PRODUCT_ID,
    productName: 'Premium Synthetic Engine Oil',
    productImage: EngineOil,
    userPhoto: BabuRajImg,
    name: 'BabuRaj',
    rating: 4,
    comment: 'Good value for money. No complaints so far.',
    date: '2 weeks ago',
  },
]

type StoreSnapshot = {
  userLikedReviewIds: string[]
  adminLikedReviewIds: string[]
  adminReplyByReviewId: Record<string, string>
}

function emptyStore(): StoreSnapshot {
  return {
    userLikedReviewIds: [],
    adminLikedReviewIds: [],
    adminReplyByReviewId: {},
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
  const { userLikedReviewIds, adminLikedReviewIds, adminReplyByReviewId } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

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

  return {
    reviews: PRODUCT_REVIEWS_SEED,
    userLikedReviewIds,
    adminLikedReviewIds,
    adminReplyByReviewId,
    toggleUserLike,
    toggleAdminLike,
    setAdminReply,
    clearAdminReply,
  }
}
