import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAGE_GUTTER } from '../lib/layoutClasses'
import { fetchProducts, type ProductItem } from '../lib/api'
import { productImageUrl } from '../lib/products'
import { PRODUCT_SHUFFLE_INTERVAL_MS, shuffleArray } from '../lib/shuffle'

const SUGGESTION_LIMIT = 4

const formatPrice = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

type SuggestionProduct = {
  id: number
  name: string
  price: string
  image: string | null
}

const toSuggestionProduct = (item: ProductItem): SuggestionProduct => ({
  id: item.id,
  name: item.name,
  price: formatPrice(Number(item.price)),
  image: productImageUrl(item.imagePaths[0] ?? null),
})

type ProductsuggestionProps = {
  /** Omit this product from suggestions (e.g. the page being viewed). */
  excludeProductId?: number
}

const Productsuggestion = ({ excludeProductId }: ProductsuggestionProps) => {
  const [items, setItems] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [shuffleTick, setShuffleTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const list = await fetchProducts()
        if (!cancelled) setItems(list)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load products')
          setItems([])
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

  const pool = useMemo(() => {
    if (excludeProductId != null && excludeProductId > 0) {
      return items.filter((p) => p.id !== excludeProductId)
    }
    return items
  }, [items, excludeProductId])

  useEffect(() => {
    if (loading || pool.length === 0) return
    const id = window.setInterval(() => {
      setShuffleTick((t) => t + 1)
    }, PRODUCT_SHUFFLE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [loading, pool.length])

  const suggestions = useMemo(
    () => shuffleArray(pool).slice(0, SUGGESTION_LIMIT).map(toSuggestionProduct),
    [pool, shuffleTick],
  )

  if (!loading && !loadError && suggestions.length === 0) {
    return null
  }

  return (
    <section className="w-full py-12 border-t border-gray-100">
      <div className={PAGE_GUTTER}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Best selling</h2>

        {loading && <p className="text-sm text-gray-500">Loading suggestions…</p>}

        {loadError && !loading && (
          <p className="text-sm text-red-600">{loadError}</p>
        )}

        {!loading && !loadError && suggestions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                to={`/productdetail/${product.id}`}
                className="group border border-gray-200 rounded-xl bg-white p-4 flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-3 mb-3 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-primary font-semibold text-sm">{product.price}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Productsuggestion
