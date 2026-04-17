import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Productsuggestion from '../UserComponent/Productsuggestion'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import Battery from '../assets/Battery.png'
import Tyre from '../assets/Tyre.png'
import { HiOutlineCheck, HiStar, HiOutlineHandThumbUp, HiOutlineChatBubbleLeft } from 'react-icons/hi2'
import { DEMO_PRODUCT_ID, useProductReviewsState } from '../lib/useProductReviewsState'

const productImages = [EngineOil, Brakes, Battery, Tyre]
const productSizes = ['S', 'L', 'XL', 'XXL']
/** Units available for this product (replace with API data when wired). */
const PRODUCT_STOCK = 24

type SessionReply = { id: string; text: string; at: string }

const Productdetail = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<'S' | 'L' | 'XL' | 'XXL'>('L')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [replyOpenForId, setReplyOpenForId] = useState<string | null>(null)
  const [replyDraftByReviewId, setReplyDraftByReviewId] = useState<Record<string, string>>({})
  /** In-memory only — cleared on reload (not persisted). */
  const [sessionRepliesByReviewId, setSessionRepliesByReviewId] = useState<
    Record<string, SessionReply[]>
  >({})
  const { reviews, userLikedReviewIds, adminReplyByReviewId, toggleUserLike } = useProductReviewsState()

  const appendSessionReply = (reviewId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const entry: SessionReply = {
      id: `session-${reviewId}-${Date.now()}`,
      text: trimmed,
      at: new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    }
    setSessionRepliesByReviewId((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] ?? []), entry],
    }))
  }

  const productReviews = reviews.filter((r) => r.productId === DEMO_PRODUCT_ID)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className="mx-[80px] py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span aria-hidden>/</span>
              <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
              <span aria-hidden>/</span>
              <span className="text-gray-900 font-medium">Product detail</span>
            </nav>
          </div>
        </div>

        <div className="mx-[80px] py-10 lg:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 md:p-12 border border-gray-100 mb-3">
                  <img
                    src={productImages[selectedImageIndex]}
                    alt="Product view"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3]
                    .filter((i) => i !== selectedImageIndex)
                    .map((index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className="flex-1 aspect-square max-w-[120px] rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2 hover:border-primary transition-colors cursor-pointer"
                      >
                        <img
                          src={productImages[index]}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                </div>
              </div>

              <div className="lg:pt-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-2">
                  Engine Oil
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  Premium Synthetic Engine Oil
                </h1>
                <p className="text-primary text-2xl font-semibold mb-2">Rs. 3,500</p>
                <p className="text-sm font-normal text-gray-600 mb-4">
                  <span className="text-gray-800">Stock:</span>{' '}
                  <span className="text-gray-900 tabular-nums">{PRODUCT_STOCK}</span>
                  <span className="text-gray-500"> units available</span>
                </p>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {productSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size as 'S' | 'L' | 'XL' | 'XXL')}
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

                <p className="text-gray-600 leading-relaxed mb-8">
                  High-quality synthetic engine oil designed for peak performance and engine longevity.
                  Ideal for modern motorcycles and ensures smooth operation in all conditions.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Full synthetic formulation',
                    'Enhanced thermal stability',
                    'Reduced wear and friction',
                    'Extended drain intervals',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-700">
                      <HiOutlineCheck className="w-5 h-5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer bg-primary text-white hover:opacity-90"
                  >
                    Add to cart
                  </button>
                  <Link
                    to="/"
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold text-center hover:bg-gray-50 transition-colors"
                  >
                    Enquire now
                  </Link>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <section className="mt-16 pt-10 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>

              {/* Rate and review — login required */}
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
                  <button
                    type="button"
                    className="inline-block px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                 Post
                  </button>
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-6">
                {productReviews.map((review) => {
                  const adminReply = adminReplyByReviewId[review.id]
                  const publicThread = sessionRepliesByReviewId[review.id] ?? []
                  const liked = userLikedReviewIds.includes(review.id)
                  const replyOpen = replyOpenForId === review.id
                  const replyDraft = replyDraftByReviewId[review.id] ?? ''
                  return (
                    <div key={review.id} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <HiStar
                                key={i}
                                className={`w-4 h-4 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                      {adminReply ? (
                        <div className="mb-3 rounded-lg border border-primary/20 bg-white px-3 py-2.5">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                            GMW reply
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">{adminReply}</p>
                        </div>
                      ) : null}
                      {publicThread.length > 0 ? (
                        <div className="mb-3 space-y-2">
                          <p className="text-xs font-medium text-gray-500">Replies</p>
                          {publicThread.map((r) => (
                            <div
                              key={r.id}
                              className="ml-0.5 border-l-2 border-gray-200 pl-3 py-1 rounded-r-md bg-white/60"
                            >
                              <p className="text-xs text-gray-400">{r.at}</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleUserLike(review.id)}
                          className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
                            liked ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <HiOutlineHandThumbUp className="w-4 h-4" />
                          {liked ? 'Liked' : 'Like'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReplyOpenForId((prev) => (prev === review.id ? null : review.id))
                          }
                          className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
                            replyOpen ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <HiOutlineChatBubbleLeft className="w-4 h-4" />
                          {replyOpen ? 'Close' : 'Reply'}
                        </button>
                      </div>
                      {replyOpen ? (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          <label
                            htmlFor={`reply-${review.id}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Your reply
                          </label>
                          <textarea
                            id={`reply-${review.id}`}
                            rows={3}
                            value={replyDraft}
                            onChange={(e) =>
                              setReplyDraftByReviewId((d) => ({ ...d, [review.id]: e.target.value }))
                            }
                            placeholder="Join the conversation…"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                appendSessionReply(review.id, replyDraft)
                                setReplyDraftByReviewId((d) => {
                                  const next = { ...d }
                                  delete next[review.id]
                                  return next
                                })
                                setReplyOpenForId(null)
                              }}
                              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                            >
                              Post reply
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyOpenForId(null)
                                setReplyDraftByReviewId((d) => {
                                  const next = { ...d }
                                  delete next[review.id]
                                  return next
                                })
                              }}
                              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>

        <Productsuggestion />
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Productdetail
