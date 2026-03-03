import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Productsuggestion from '../UserComponent/Productsuggestion'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import Battery from '../assets/Battery.png'
import Tyre from '../assets/Tyre.png'
import { HiOutlineCheck, HiStar, HiOutlineHandThumbUp } from 'react-icons/hi2'

const productImages = [EngineOil, Brakes, Battery, Tyre]
const productSizes = ['S', 'L', 'XL', 'XXL']

const reviews = [
  { name: 'Raj K.', rating: 5, comment: 'Great oil, smooth engine performance. Using it for the last 6 months with no issues. Recommended.', date: '2 days ago' },
  { name: 'Sita M.', rating: 5, comment: 'Quality product. Bike runs much smoother after the change. Will buy again.', date: '1 week ago' },
  { name: 'Amit P.', rating: 4, comment: 'Good value for money. No complaints so far.', date: '2 weeks ago' },
]

const Productdetail = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<'S' | 'L' | 'XL' | 'XXL'>('L')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set())

  const toggleLike = (index: number) => {
    setLikedReviews((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

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
                <p className="text-primary text-2xl font-semibold mb-4">Rs. 3,500</p>

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
                {reviews.map((review, index) => (
                  <div key={index} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
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
                    <button
                      type="button"
                      onClick={() => toggleLike(index)}
                      className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
                        likedReviews.has(index) ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <HiOutlineHandThumbUp className="w-4 h-4" />
                      {likedReviews.has(index) ? 'Liked' : 'Like'}
                    </button>
                  </div>
                ))}
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
