import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import EngineOil from '../assets/EngineOil.png'
import { HiOutlineCheck, HiOutlineTruck, HiOutlineShieldCheck } from 'react-icons/hi2'

const Productdetail = () => {
  const [addedToCart, setAddedToCart] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className="mx-[80px] py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span aria-hidden>/</span>
              <span className="text-gray-900 font-medium">Product detail</span>
            </nav>
          </div>
        </div>

        <div className="mx-[80px] py-10 lg:py-14">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 md:p-12 border border-gray-100">
                <img
                  src={EngineOil}
                  alt="Premium synthetic engine oil"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="lg:pt-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-2">
                  Engine Oil
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-sec tracking-tight">
                  Premium Synthetic Engine Oil
                </h1>
                <p className="text-primary text-2xl font-semibold mb-6">Rs. 3,500</p>
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
                    onClick={() => setAddedToCart(true)}
                    disabled={addedToCart}
                    className={`flex-1 sm:flex-none px-8 py-3.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      addedToCart
                        ? 'bg-gray-200 text-gray-500 cursor-default'
                        : 'bg-primary text-white hover:opacity-90'
                    }`}
                  >
                    {addedToCart ? 'Added to cart' : 'Add to cart'}
                  </button>
                  <Link
                    to="/contactus"
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold text-center hover:bg-gray-50 transition-colors"
                  >
                    Enquire now
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <HiOutlineTruck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Available at workshop</h3>
                    <p className="text-sm text-gray-600">Pick up or get it fitted by our technicians.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <HiOutlineShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Genuine product</h3>
                    <p className="text-sm text-gray-600">Quality assured for your vehicle.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Productdetail
