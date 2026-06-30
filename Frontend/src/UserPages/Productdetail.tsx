import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Productsuggestion from '../UserComponent/Productsuggestion'
import { PAGE_GUTTER } from '../lib/layoutClasses'
import GMWlogo from '../assets/GMWlogo.png'
import { HiOutlineCheck, HiStar, HiOutlineHandThumbUp, HiHandThumbUp, HiPhoto, HiXMark, HiOutlineTrash } from 'react-icons/hi2'
import { useProductReviewsState } from '../lib/useProductReviewsState'
import {
  addToCart,
  deleteProductReview,
  fetchProduct,
  fetchProductReviews,
  fetchReviewEligibility,
  likeReview,
  submitProductReview,
  unlikeReview,
  toAbsoluteApiUrl,
  type ProductItem,
  type ProductReviewItem,
  type ReviewEligibility,
} from '../lib/api'
import { mapProductImages } from '../lib/products'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useChat } from '../context/ChatContext'

const formatPrice = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`
const MAX_REVIEW_IMAGES = 2
const REVIEW_IMAGE_MAX_BYTES = 2 * 1024 * 1024

function ProductStarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, value - (star - 1)))
        return (
          <span key={star} className="relative inline-flex h-5 w-5 shrink-0">
            <HiStar className="h-5 w-5 text-gray-200" />
            {fill > 0 ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <HiStar className="h-5 w-5 text-amber-400 fill-amber-400" />
              </span>
            ) : null}
          </span>
        )
      })}
    </div>
  )
}

const Productdetail = () => {
  const { id: idParam } = useParams()
  const productId = Number(idParam)
  const navigate = useNavigate()
  const { token } = useAuth()
  const { refreshCart } = useCart()
  const { submitProductEnquiry } = useChat()

  const [product, setProduct] = useState<ProductItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewImageFiles, setReviewImageFiles] = useState<File[]>([])
  const [reviewImageLightbox, setReviewImageLightbox] = useState<string | null>(null)
  const [productReviews, setProductReviews] = useState<ProductReviewItem[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewEligibility, setReviewEligibility] = useState<ReviewEligibility | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [likingReviewId, setLikingReviewId] = useState<number | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null)
  const reviewImageInputRef = useRef<HTMLInputElement>(null)
  const {
    userLikedAdminReplyReviewIds,
    adminReplyLikeCountById,
    toggleUserLikeAdminReply,
  } = useProductReviewsState()

  const reviewImagePreviews = useMemo(
    () => reviewImageFiles.map((file) => URL.createObjectURL(file)),
    [reviewImageFiles],
  )

  const canShowReviewForm = reviewEligibility?.canReview === true

  const reviewSummary = useMemo(() => {
    if (productReviews.length === 0) {
      return { average: 0, count: 0 }
    }
    const total = productReviews.reduce((sum, review) => sum + review.rating, 0)
    return {
      average: total / productReviews.length,
      count: productReviews.length,
    }
  }, [productReviews])

  const images = useMemo(
    () => (product ? mapProductImages(product) : []),
    [product],
  )

  const handleReviewImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.')
      return
    }
    if (file.size > REVIEW_IMAGE_MAX_BYTES) {
      toast.error('Each image must be 2 MB or smaller.')
      return
    }
    if (reviewImageFiles.length >= MAX_REVIEW_IMAGES) {
      toast.error(`You can add up to ${MAX_REVIEW_IMAGES} photos.`)
      return
    }
    setReviewImageFiles((prev) =>
      prev.length >= MAX_REVIEW_IMAGES ? prev : [...prev, file],
    )
  }

  const removeReviewImage = (index: number) => {
    setReviewImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePostReview = async () => {
    const comment = reviewText.trim()
    if (rating < 1) {
      toast.error('Please select a star rating.')
      return
    }
    if (!comment) {
      toast.error('Please write your review.')
      return
    }
    if (!token) {
      toast.info('Please sign in to post a review.')
      navigate('/login', { state: { from: `/productdetail/${productId}` } })
      return
    }
    setSubmittingReview(true)
    try {
      const created = await submitProductReview(token, productId, {
        rating,
        comment,
        images: reviewImageFiles,
      })
      setProductReviews((prev) => [created, ...prev])
      setReviewEligibility({ canReview: false, alreadyReviewed: true, hasDeliveredPurchase: true })
      setReviewText('')
      setRating(0)
      setReviewImageFiles([])
      toast.success('Review posted.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not post review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (review: ProductReviewItem) => {
    if (deletingReviewId === review.id) return
    if (!token) {
      toast.info('Please sign in to manage your review.')
      navigate('/login', { state: { from: `/productdetail/${productId}` } })
      return
    }
    if (!window.confirm('Delete your review? You can post a new one after delivery.')) return
    setDeletingReviewId(review.id)
    try {
      await deleteProductReview(token, review.id)
      setProductReviews((prev) => prev.filter((r) => r.id !== review.id))
      if (reviewEligibility?.hasDeliveredPurchase) {
        setReviewEligibility({ canReview: true, alreadyReviewed: false, hasDeliveredPurchase: true })
      }
      toast.success('Review deleted.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete review.')
    } finally {
      setDeletingReviewId(null)
    }
  }

  const handleToggleReviewLike = async (review: ProductReviewItem) => {
    if (likingReviewId === review.id) return
    if (!token) {
      toast.info('Please sign in to like this review.')
      navigate('/login', { state: { from: `/productdetail/${productId}` } })
      return
    }
    setLikingReviewId(review.id)
    try {
      const updated = review.likedByCurrentUser
        ? await unlikeReview(review.id, token)
        : await likeReview(review.id, token)
      setProductReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update like.')
    } finally {
      setLikingReviewId(null)
    }
  }

  const sizes = product?.sizes ?? []
  const bulletPoints = product?.bulletPoints ?? []

  useEffect(() => {
    if (!Number.isFinite(productId) || productId <= 0) {
      setLoading(false)
      setLoadError('Invalid product.')
      setProduct(null)
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const item = await fetchProduct(productId)
        if (cancelled) return
        setProduct(item)
        setSelectedImageIndex(0)
        setSelectedSize(item.sizes.length > 0 ? item.sizes[0] : null)
      } catch (e) {
        if (!cancelled) {
          setProduct(null)
          setLoadError(e instanceof Error ? e.message : 'Failed to load product')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    if (!Number.isFinite(productId) || productId <= 0) {
      setProductReviews([])
      return
    }
    let cancelled = false
    const loadReviews = async () => {
      setReviewsLoading(true)
      try {
        const data = await fetchProductReviews(productId, token)
        if (!cancelled) setProductReviews(data)
      } catch {
        if (!cancelled) setProductReviews([])
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    }
    void loadReviews()
    return () => {
      cancelled = true
    }
  }, [productId, token])

  useEffect(() => {
    if (!token || !Number.isFinite(productId) || productId <= 0) {
      setReviewEligibility(null)
      return
    }
    let cancelled = false
    const loadEligibility = async () => {
      try {
        const data = await fetchReviewEligibility(token, productId)
        if (!cancelled) setReviewEligibility(data)
      } catch {
        if (!cancelled) setReviewEligibility(null)
      }
    }
    void loadEligibility()
    return () => {
      cancelled = true
    }
  }, [token, productId])

  useEffect(() => {
    return () => {
      reviewImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [reviewImagePreviews])

  useEffect(() => {
    if (!reviewImageLightbox) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [reviewImageLightbox])

  const safeImageIndex = images.length > 0 ? Math.min(selectedImageIndex, images.length - 1) : 0
  const mainImage = images[safeImageIndex] ?? null
  const thumbIndices = images.map((_, i) => i).filter((i) => i !== safeImageIndex)

  const handleAddToCart = async () => {
    if (!product) return
    if (!token) {
      toast.info('Please sign in to add items to your cart.')
      navigate('/login', { state: { from: `/productdetail/${product.id}` } })
      return
    }
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size.')
      return
    }
    setAddingToCart(true)
    try {
      await addToCart(token, {
        productId: product.id,
        quantity: 1,
        size: selectedSize ?? undefined,
      })
      await refreshCart()
      toast.success('Added to cart.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add to cart.')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleEnquireNow = () => {
    if (!product) return
    submitProductEnquiry({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: Number(product.price),
      selectedSize,
      imageUrl: mainImage,
    })
  }

  const reviewImageLightboxPortal =
    reviewImageLightbox &&
    createPortal(
      <div
        className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
        onClick={() => setReviewImageLightbox(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Viewing review photo"
      >
        <button
          type="button"
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white/90 text-gray-700 hover:bg-white cursor-pointer"
          onClick={() => setReviewImageLightbox(null)}
          aria-label="Close"
        >
          <HiXMark className="h-6 w-6" aria-hidden />
        </button>
        <div
          className="relative flex max-h-[95vh] w-full max-w-7xl items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={reviewImageLightbox}
            alt="Enlarged review photo"
            className="max-h-[95vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {reviewImageLightboxPortal}
      <Header />

      <main className="flex-1">
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className={`${PAGE_GUTTER} py-4`}>
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span aria-hidden>/</span>
              <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
              <span aria-hidden>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">
                {product?.name ?? 'Product detail'}
              </span>
            </nav>
          </div>
        </div>

        <div className={`${PAGE_GUTTER} py-8 sm:py-10 lg:py-14`}>
          <div className="max-w-6xl mx-auto">
            {loading && (
              <p className="text-center text-gray-500 py-16">Loading product…</p>
            )}
            {loadError && !loading && (
              <div className="text-center py-16">
                <p className="text-red-600 mb-4">{loadError}</p>
                <Link to="/products" className="text-primary font-medium hover:underline">
                  Back to products
                </Link>
              </div>
            )}

            {!loading && !loadError && product && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                <div>
                  <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 md:p-12 border border-gray-100 mb-3">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">No image</span>
                    )}
                  </div>
                  {thumbIndices.length > 0 && (
                    <div className="flex gap-2">
                      {thumbIndices.map((index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className="flex-1 aspect-square max-w-[120px] rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2 hover:border-primary transition-colors cursor-pointer"
                        >
                          <img
                            src={images[index]}
                            alt={`${product.name} view ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:pt-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-2">
                    {product.category}
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                    {product.name}
                  </h1>
                  <p className="text-primary text-2xl font-semibold mb-2">
                    {formatPrice(Number(product.price))}
                  </p>
                  <div
                    className="mb-3 flex flex-wrap items-center gap-2"
                    aria-label={
                      reviewSummary.count > 0
                        ? `${reviewSummary.average.toFixed(1)} out of 5 stars from ${reviewSummary.count} review${reviewSummary.count === 1 ? '' : 's'}`
                        : 'No reviews yet'
                    }
                  >
                    <ProductStarRating value={reviewSummary.average} />
                    {reviewSummary.count > 0 ? (
                      <>
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {reviewSummary.average.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">No reviews yet</span>
                    )}
                  </div>
                  <p className="text-sm font-normal text-gray-600 mb-4">
                    <span className="text-gray-800">Stock:</span>{' '}
                    <span className="text-gray-900 tabular-nums">{product.stock}</span>
                    <span className="text-gray-500">
                      {product.stock === 1 ? ' unit available' : ' units available'}
                    </span>
                  </p>

                  {sizes.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                              selectedSize === size
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.description ? (
                    <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
                  ) : null}

                  {bulletPoints.length > 0 && (
                    <ul className="space-y-3 mb-8">
                      {bulletPoints.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-gray-700">
                          <HiOutlineCheck className="w-5 h-5 text-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      disabled={product.stock === 0 || addingToCart}
                      onClick={() => void handleAddToCart()}
                      className="flex-1 sm:flex-none px-8 py-3.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.stock === 0
                        ? 'Out of stock'
                        : addingToCart
                          ? 'Adding…'
                          : 'Add to cart'}
                    </button>
                    <button
                      type="button"
                      onClick={handleEnquireNow}
                      className="flex-1 sm:flex-none px-8 py-3.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Enquire now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {!loading && !loadError && product && (
            <section id="reviews" className="mt-16 pt-10 border-t border-gray-100 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>

              {canShowReviewForm && (
              <div className="mb-10 p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 focus:outline-none focus:ring-0"
                          aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          <HiStar
                            className={`w-8 h-8 transition-colors ${
                              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                    <textarea
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write your review..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                    <input
                      ref={reviewImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleReviewImagePick}
                      className="hidden"
                      aria-hidden
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      {reviewImagePreviews.map((src, index) => (
                        <div
                          key={`${index}-${reviewImageFiles[index]?.name ?? index}`}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
                        >
                          <img
                            src={src}
                            alt={`Review upload ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeReviewImage(index)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75 cursor-pointer"
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            <HiXMark className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      ))}
                      {reviewImagePreviews.length < MAX_REVIEW_IMAGES && (
                        <button
                          type="button"
                          onClick={() => reviewImageInputRef.current?.click()}
                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-3 text-gray-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        >
                          <HiPhoto className="h-4 w-4" aria-hidden />
                          <span className="text-xs font-medium">Add photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handlePostReview()}
                    disabled={submittingReview}
                    className="inline-block px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
              )}

              {reviewsLoading ? (
                <p className="text-sm text-gray-500">Loading reviews…</p>
              ) : productReviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
              <div className="space-y-6">
                {productReviews.map((review) => {
                  const reviewId = String(review.id)
                  const adminReply = (review.adminReply ?? '').trim()
                  const reviewerPhoto = review.userPhoto ? toAbsoluteApiUrl(review.userPhoto) : null
                  const reviewLiked = review.likedByCurrentUser
                  const replyLiked = userLikedAdminReplyReviewIds.includes(reviewId)
                  const reviewLikeCount = review.likeCount
                  const replyLikeCount = adminReplyLikeCountById[reviewId] ?? 0
                  const likeBusy = likingReviewId === review.id
                  return (
                    <div key={review.id} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-start gap-3 mb-3">
                        {reviewerPhoto ? (
                          <img
                            src={reviewerPhoto}
                            alt={`${review.userName} profile`}
                            className="w-10 h-10 shrink-0 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600"
                            aria-hidden
                          >
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-gray-900">{review.userName}</p>
                            {review.ownedByCurrentUser ? (
                              <button
                                type="button"
                                onClick={() => void handleDeleteReview(review)}
                                disabled={deletingReviewId === review.id}
                                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                                aria-label="Delete your review"
                              >
                                <HiOutlineTrash className="h-4 w-4" aria-hidden />
                                {deletingReviewId === review.id ? 'Deleting…' : 'Delete'}
                              </button>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <HiStar
                                key={i}
                                className={`w-4 h-4 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{review.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                      {review.reviewImages.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {review.reviewImages.map((path, index) => {
                            const src = toAbsoluteApiUrl(path) ?? path
                            return (
                            <button
                              key={`${review.id}-img-${index}`}
                              type="button"
                              onClick={() => setReviewImageLightbox(src)}
                              className="h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white cursor-pointer transition hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                              aria-label={`View ${review.userName} review photo ${index + 1} larger`}
                            >
                              <img
                                src={src}
                                alt={`${review.userName} review photo ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                            )
                          })}
                        </div>
                      )}
                      <div className="mb-3 flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => void handleToggleReviewLike(review)}
                          disabled={likeBusy}
                          aria-label={
                            reviewLiked
                              ? `Unlike this review, ${reviewLikeCount} total`
                              : `Like this review, ${reviewLikeCount} total`
                          }
                          className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-60 ${
                            reviewLiked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {reviewLiked ? (
                            <HiHandThumbUp className="w-4 h-4" />
                          ) : (
                            <HiOutlineHandThumbUp className="w-4 h-4" />
                          )}
                          <span>{reviewLiked ? 'Liked' : 'Like'}</span>
                          <span className="text-gray-300" aria-hidden>
                            ·
                          </span>
                          <span className="text-xs font-normal tabular-nums text-gray-500">
                            {reviewLikeCount}
                          </span>
                        </button>
                        {review.likedByGmw ? (
                          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary/15 bg-white px-2.5 py-1.5">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1">
                              <img
                                src={GMWlogo}
                                alt=""
                                className="h-full w-full object-contain object-center"
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              Liked by General Mechanical Works
                            </span>
                          </div>
                        ) : null}
                      </div>
                      {adminReply ? (
                        <div className="rounded-lg border border-primary/20 bg-white px-3 py-2.5">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1.5">
                              <img
                                src={GMWlogo}
                                alt=""
                                className="h-full w-full object-contain object-center"
                              />
                            </div>
                            <p className="text-xs font-semibold text-gray-900 tracking-wide m-0">
                              General Mechanical Works
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mb-2">{adminReply}</p>
                          <button
                            type="button"
                            onClick={() => toggleUserLikeAdminReply(reviewId)}
                            aria-label={
                              replyLiked
                                ? `Unlike reply from General Mechanical Works, ${replyLikeCount} total`
                                : `Like reply from General Mechanical Works, ${replyLikeCount} total`
                            }
                            className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
                              replyLiked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {replyLiked ? (
                              <HiHandThumbUp className="w-4 h-4" />
                            ) : (
                              <HiOutlineHandThumbUp className="w-4 h-4" />
                            )}
                            <span>{replyLiked ? 'Liked' : 'Like'}</span>
                            <span className="text-gray-300" aria-hidden>
                              ·
                            </span>
                            <span className="text-xs font-normal tabular-nums text-gray-500">
                              {replyLikeCount}
                            </span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
              )}
            </section>
            )}
          </div>
        </div>

        <Productsuggestion
          excludeProductId={Number.isFinite(productId) && productId > 0 ? productId : undefined}
        />
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Productdetail
