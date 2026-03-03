import React, { useState } from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import productImage from '../assets/TRX.png'

type ProductCategory = 'All' | 'Service' | 'Brakes' | 'Tyres' | 'Electrical' | 'Detailing'

const PRICE_MIN = 0
const PRICE_MAX = 15000
const PRICE_STEP = 500

const products = [
  {
    id: 1,
    name: 'Engine Oil Change Package',
    description: 'Premium synthetic oil with filter change and basic inspection.',
    price: 'Rs. 3,500',
    priceValue: 3500,
    category: 'Brakes' as ProductCategory,
    image: productImage,
  },
  {
    id: 2,
    name: 'Brake Service Kit',
    description: 'Front and rear brake pads with rotor resurfacing.',
    price: 'Rs. 5,200',
    priceValue: 5200,
    category: 'Brakes' as ProductCategory,
    image: productImage,
  },
  {
    id: 3,
    name: 'Battery Replacement',
    description: 'High-performance battery with installation and testing.',
    price: 'Rs. 6,800',
    priceValue: 6800,
    category: 'Electrical' as ProductCategory,
    image: productImage,
  },
  {
    id: 4,
    name: 'Full Service Package',
    description: 'Complete 40-point check, fluids top-up, and wash.',
    price: 'Rs. 7,500',
    priceValue: 7500,
    category: 'Brakes' as ProductCategory,
    image: productImage,
  },
  {
    id: 5,
    name: 'Tyre & Alignment Combo',
    description: 'Wheel alignment, balancing, and tyre rotation.',
    price: 'Rs. 3,200',
    priceValue: 3200,
    category: 'Tyres' as ProductCategory,
    image: productImage,
  },
  {
    id: 6,
    name: 'AC Service',
    description: 'AC gas refill, leak check, and cabin filter replacement.',
    price: 'Rs. 4,900',
    priceValue: 4900,
    category: 'Service' as ProductCategory,
    image: productImage,
  },
  {
    id: 7,
    name: 'Clutch Overhaul Kit',
    description: 'Clutch plate, pressure plate, and release bearing replacement.',
    price: 'Rs. 12,000',
    priceValue: 12000,
    category: 'Brakes' as ProductCategory,
    image: productImage,
  },
  {
    id: 8,
    name: 'Detailing & Polishing',
    description: 'Interior deep clean with exterior polish and wax.',
    price: 'Rs. 5,800',
    priceValue: 5800,
    category: 'Detailing' as ProductCategory,
    image: productImage,
  },
  {
    id: 9,
    name: 'Electrical Diagnosis',
    description: 'Computerized scan and diagnosis of electrical issues.',
    price: 'Rs. 2,500',
    priceValue: 2500,
    category: 'Electrical' as ProductCategory,
    image: productImage,
  },
]

const categories: ProductCategory[] = ['All', 'Brakes', 'Tyres', 'Electrical', 'Detailing']

const formatPrice = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

type PriceSort = 'default' | 'lowToHigh' | 'highToLow'

const sortOptions: { value: PriceSort; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'lowToHigh', label: 'Price: Low to High' },
  { value: 'highToLow', label: 'Price: High to Low' },
]

const Products = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('All')
  const [priceMin, setPriceMin] = useState(PRICE_MIN)
  const [priceMax, setPriceMax] = useState(PRICE_MAX)
  const [sortBy, setSortBy] = useState<PriceSort>('default')

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesPrice = product.priceValue >= priceMin && product.priceValue <= priceMax
    return matchesCategory && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'lowToHigh') return a.priceValue - b.priceValue
    if (sortBy === 'highToLow') return b.priceValue - a.priceValue
    return 0
  })

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 mx-[80px] py-10">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workshop Products</h1>
            <p className="text-gray-600 text-sm max-w-2xl">
              Browse our most popular service packages and workshop products. Use the filters to
              quickly find what you need, then proceed to booking in the next steps.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-8 md:flex-row">
          {/* Left filters */}
          <aside className="md:w-64 w-full border border-gray-200 rounded-xl bg-gray-50 p-4">
            <h2 className="text-sm font-semibold mb-4">Filters</h2>

            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Category</h3>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as ProductCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Price range</h3>
              <p className="text-xs text-gray-600 mb-2">
                {formatPrice(priceMin)} – {formatPrice(priceMax)}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Min</label>
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    value={priceMin}
                    onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                    className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Max</label>
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    value={priceMax}
                    onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                    className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Sort by</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as PriceSort)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                {sortOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* Products grid */}
          <section className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col overflow-hidden"
                >
                  <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                      {product.category}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary font-semibold">{product.price}</span>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
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

export default Products