import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineBuildingStorefront,
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlineTruck,
} from 'react-icons/hi2'
import { fetchBlogs, fetchProducts, type BlogSummary, type ProductItem } from '../lib/api'
import { blogImageUrl } from '../lib/blogs'
import { productImageUrl } from '../lib/products'

const MAX_PRODUCT_RESULTS = 6
const MAX_BLOG_RESULTS = 4

type HeaderProductSearchProps = {
  className?: string
  inputClassName?: string
  /** Wider dropdown for the narrow desktop header field */
  dropdownAlign?: 'left' | 'right' | 'stretch'
  onNavigate?: () => void
}

type ServiceSearchItem = {
  id: 'workshop' | 'pickup'
  title: string
  description: string
  keywords: string[]
  to: string
  Icon: ComponentType<{ className?: string }>
}

const SERVICE_ITEMS: ServiceSearchItem[] = [
  {
    id: 'workshop',
    title: 'Workshop visit',
    description: 'Bring your bike to our garage',
    keywords: ['workshop', 'visit', 'garage', 'service', 'book', 'appointment'],
    to: '/services?mode=workshop',
    Icon: HiOutlineBuildingStorefront,
  },
  {
    id: 'pickup',
    title: 'Pickup service',
    description: 'We collect and return your bike',
    keywords: ['pickup', 'pick up', 'collect', 'delivery', 'service', 'book', 'appointment'],
    to: '/services?mode=pickup',
    Icon: HiOutlineTruck,
  },
]

type SearchHit =
  | { kind: 'service'; item: ServiceSearchItem }
  | { kind: 'product'; item: ProductItem }
  | { kind: 'blog'; item: BlogSummary }
  | { kind: 'blogsPage' }

function matchesProduct(product: ProductItem, needle: string): boolean {
  return (
    product.name.toLowerCase().includes(needle) ||
    product.sku.toLowerCase().includes(needle) ||
    product.category.toLowerCase().includes(needle)
  )
}

function matchesService(service: ServiceSearchItem, needle: string): boolean {
  if (service.title.toLowerCase().includes(needle)) return true
  if (service.description.toLowerCase().includes(needle)) return true
  return service.keywords.some((k) => k.includes(needle) || needle.includes(k))
}

function matchesBlog(blog: BlogSummary, needle: string): boolean {
  return (
    blog.title.toLowerCase().includes(needle) ||
    blog.description.toLowerCase().includes(needle) ||
    blog.dateLabel.toLowerCase().includes(needle)
  )
}

function matchesBlogsPage(needle: string): boolean {
  return (
    'blog'.includes(needle) ||
    'blogs'.includes(needle) ||
    needle.includes('blog') ||
    needle.includes('news')
  )
}

const formatPrice = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

export default function HeaderProductSearch({
  className = '',
  inputClassName = '',
  dropdownAlign = 'stretch',
  onNavigate,
}: HeaderProductSearchProps) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [blogs, setBlogs] = useState<BlogSummary[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [blogsLoaded, setBlogsLoaded] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingBlogs, setLoadingBlogs] = useState(false)

  const loadCatalog = useCallback(async () => {
    if (!productsLoaded && !loadingProducts) {
      setLoadingProducts(true)
      try {
        const list = await fetchProducts()
        setProducts(list.filter((p) => p.active !== false))
        setProductsLoaded(true)
      } catch {
        setProducts([])
        setProductsLoaded(true)
      } finally {
        setLoadingProducts(false)
      }
    }

    if (!blogsLoaded && !loadingBlogs) {
      setLoadingBlogs(true)
      try {
        const list = await fetchBlogs()
        setBlogs(list)
        setBlogsLoaded(true)
      } catch {
        setBlogs([])
        setBlogsLoaded(true)
      } finally {
        setLoadingBlogs(false)
      }
    }
  }, [productsLoaded, loadingProducts, blogsLoaded, loadingBlogs])

  const results = useMemo((): SearchHit[] => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []

    const services: SearchHit[] = SERVICE_ITEMS.filter((s) => matchesService(s, needle)).map(
      (item) => ({ kind: 'service' as const, item }),
    )
    const productHits: SearchHit[] = products
      .filter((p) => matchesProduct(p, needle))
      .slice(0, MAX_PRODUCT_RESULTS)
      .map((item) => ({ kind: 'product' as const, item }))
    const blogHits: SearchHit[] = blogs
      .filter((b) => matchesBlog(b, needle))
      .slice(0, MAX_BLOG_RESULTS)
      .map((item) => ({ kind: 'blog' as const, item }))
    const blogsPage: SearchHit[] = matchesBlogsPage(needle) ? [{ kind: 'blogsPage' }] : []

    return [...services, ...blogsPage, ...blogHits, ...productHits]
  }, [products, blogs, query])

  const showDropdown = open && query.trim().length > 0
  const stillLoading =
    (loadingProducts && !productsLoaded) || (loadingBlogs && !blogsLoaded)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const finishNavigate = (to: string) => {
    setQuery('')
    setOpen(false)
    onNavigate?.()
    navigate(to)
  }

  const goToHit = (hit: SearchHit) => {
    if (hit.kind === 'service') {
      finishNavigate(hit.item.to)
      return
    }
    if (hit.kind === 'blogsPage') {
      finishNavigate('/blogs')
      return
    }
    if (hit.kind === 'blog') {
      finishNavigate(`/blogs/${hit.item.id}`)
      return
    }
    finishNavigate(`/productdetail/${hit.item.id}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (results.length > 0) {
      goToHit(results[0])
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            setOpen(true)
            void loadCatalog()
          }}
          placeholder="Search..."
          className={
            inputClassName ||
            'w-full h-9 pl-3 pr-9 text-sm rounded-full bg-gray-100 border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200'
          }
          aria-label="Search"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="header-product-search-results"
          aria-autocomplete="list"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center justify-center">
          <HiOutlineMagnifyingGlass className="w-4 h-4 shrink-0" aria-hidden />
        </span>
      </form>

      {showDropdown ? (
        <div
          id="header-product-search-results"
          role="listbox"
          className={`absolute top-[calc(100%+6px)] z-50 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg ${
            dropdownAlign === 'left'
              ? 'left-0 right-auto w-[min(22rem,calc(100vw-2rem))]'
              : dropdownAlign === 'right'
                ? 'right-0 left-auto w-[min(22rem,calc(100vw-2rem))]'
                : 'left-0 right-0'
          }`}
        >
          {stillLoading ? (
            <p className="px-3 py-3 text-sm text-gray-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-500">No products, services, or blogs found.</p>
          ) : (
            <ul className="py-1">
              {results.map((hit) => {
                if (hit.kind === 'service') {
                  const { item } = hit
                  return (
                    <li key={`service-${item.id}`} role="option">
                      <button
                        type="button"
                        onClick={() => goToHit(hit)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-primary/5">
                          <item.Icon className="h-5 w-5 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {item.title}
                          </span>
                          <span className="block text-xs text-gray-500">{item.description}</span>
                        </span>
                      </button>
                    </li>
                  )
                }

                if (hit.kind === 'blogsPage') {
                  return (
                    <li key="blogs-page" role="option">
                      <button
                        type="button"
                        onClick={() => goToHit(hit)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-primary/5">
                          <HiOutlineDocumentText className="h-5 w-5 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            All blogs
                          </span>
                          <span className="block text-xs text-gray-500">
                            Browse latest news and articles
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                }

                if (hit.kind === 'blog') {
                  const blog = hit.item
                  const image = blogImageUrl(blog.imagePath)
                  return (
                    <li key={`blog-${blog.id}`} role="option">
                      <button
                        type="button"
                        onClick={() => goToHit(hit)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          {image ? (
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <HiOutlineDocumentText className="h-5 w-5 text-primary" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {blog.title}
                          </span>
                          <span className="block text-xs text-gray-500">
                            Blog{blog.dateLabel ? ` · ${blog.dateLabel}` : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                }

                const product = hit.item
                const image = productImageUrl(product.imagePaths[0] ?? null)
                return (
                  <li key={`product-${product.id}`} role="option">
                    <button
                      type="button"
                      onClick={() => goToHit(hit)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        {image ? (
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400">No img</span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">
                          {product.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {formatPrice(Number(product.price))}
                          {product.category ? ` · ${product.category}` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
