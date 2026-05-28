import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { PAGE_GUTTER } from '../lib/layoutClasses'
import { fetchProducts, type ProductItem } from '../lib/api'
import { productImageUrl } from '../lib/products'

const PRICE_MIN = 0
const PRICE_STEP = 500
const DEFAULT_PRICE_MAX = 15000

type StoreProduct = {
  id: number
  name: string
  description: string
  price: string
  priceValue: number
  category: string
  image: string | null
}

const formatPrice = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

type PriceSort = 'default' | 'lowToHigh' | 'highToLow'

const sortOptions: { value: PriceSort; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'lowToHigh', label: 'Price: Low to High' },
  { value: 'highToLow', label: 'Price: High to Low' },
]

const computeCatalogPriceMax = (items: StoreProduct[]) => {
  if (items.length === 0) return DEFAULT_PRICE_MAX
  const highest = items.reduce((max, p) => Math.max(max, p.priceValue), 0)
  return Math.max(PRICE_STEP, Math.ceil(highest / PRICE_STEP) * PRICE_STEP)
}

const toStoreProduct = (item: ProductItem): StoreProduct => ({
  id: item.id,
  name: item.name,
  description: item.description,
  price: formatPrice(Number(item.price)),
  priceValue: Number(item.price),
  category: item.category,
  image: productImageUrl(item.imagePaths[0] ?? null),
})

const Products = () => {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [priceMin, setPriceMin] = useState(PRICE_MIN)
  const [priceMax, setPriceMax] = useState(DEFAULT_PRICE_MAX)
  const [sortBy, setSortBy] = useState<PriceSort>('default')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const list = await fetchProducts()
        if (cancelled) return
        const mapped = list.map(toStoreProduct)
        setProducts(mapped)
        const catalogMax = computeCatalogPriceMax(mapped)
        setPriceMin(PRICE_MIN)
        setPriceMax(catalogMax)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load products')
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const catalogPriceMax = useMemo(() => computeCatalogPriceMax(products), [products])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category))
    return ['All', ...[...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))]
  }, [products])

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

      <main className={`flex-1 ${PAGE_GUTTER} py-8 sm:py-10`}>
        <div className="mb-8 flex justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-primary font-sec">Products</span>
            </h1>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              Browse our most popular workshop products.
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
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                disabled={loading || categories.length <= 1}
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
                    max={catalogPriceMax}
                    step={PRICE_STEP}
                    value={Math.min(priceMin, catalogPriceMax)}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      setPriceMin(Math.min(next, priceMax))
                    }}
                    disabled={loading || catalogPriceMax <= PRICE_MIN}
                    className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-primary disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Max</label>
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={catalogPriceMax}
                    step={PRICE_STEP}
                    value={Math.min(priceMax, catalogPriceMax)}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      setPriceMax(Math.max(next, priceMin))
                    }}
                    disabled={loading || catalogPriceMax <= PRICE_MIN}
                    className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-primary disabled:opacity-50"
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
            {loading && (
              <p className="text-center text-gray-500 py-12">Loading products…</p>
            )}
            {loadError && !loading && (
              <p className="text-center text-red-600 py-12">{loadError}</p>
            )}
            {!loading && !loadError && sortedProducts.length === 0 && (
              <p className="text-center text-gray-500 py-12">No products available yet.</p>
            )}
            {!loading && !loadError && sortedProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group border border-gray-200 rounded-xl shadow-sm bg-white flex flex-col overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02]"
                  >
                    <Link to="/productdetail" className="flex flex-col flex-1">
                      <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden p-2">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">No image</span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
                        {product.description ? (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                        ) : null}
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                          {product.category}
                        </p>
                        <div className="flex-1" />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-semibold">{product.price}</span>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer"
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Products
