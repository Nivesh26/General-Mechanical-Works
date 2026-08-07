import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineArrowRight, HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { PAGE_GUTTER } from '../lib/layoutClasses'
import { fetchBlogs, type BlogSummary } from '../lib/api'
import { blogImageUrl } from '../lib/blogs'

type BlogSort = 'newest' | 'oldest'

function blogDateValue(dateLabel: string): number {
  const t = Date.parse(dateLabel.trim())
  return Number.isNaN(t) ? 0 : t
}

const Blogs = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [sortOrder, setSortOrder] = useState<BlogSort>('newest')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchBlogs()
      .then((list) => {
        if (!cancelled) setPosts(list)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load blogs')
          setPosts([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredPosts = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    const matched = !q
      ? posts
      : posts.filter(
          (post) =>
            post.title.toLowerCase().includes(q) ||
            post.description.toLowerCase().includes(q) ||
            post.dateLabel.toLowerCase().includes(q),
        )

    return [...matched].sort((a, b) => {
      const da = blogDateValue(a.dateLabel)
      const db = blogDateValue(b.dateLabel)
      if (da !== db) return sortOrder === 'newest' ? db - da : da - db
      return sortOrder === 'newest' ? b.id - a.id : a.id - b.id
    })
  }, [posts, searchInput, sortOrder])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
  }

  const openBlogDetail = (blogId: number) => {
    navigate(`/blogs/${blogId}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className={`flex-1 ${PAGE_GUTTER} py-10 sm:py-14`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <span aria-hidden>/</span>
                <span className="text-gray-900 font-medium">Blogs</span>
              </nav>
              <h1 className="mt-3 text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase">
                All Blogs
              </h1>
              <p className="mt-2 text-gray-600 text-sm sm:text-base">
                Browse every news update and blog post from General Mechanical Works.
              </p>
            </div>

            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <label htmlFor="blog-sort" className="sr-only">
                Sort blogs
              </label>
              <select
                id="blog-sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as BlogSort)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="newest">Newest to oldest</option>
                <option value="oldest">Oldest to newest</option>
              </select>

              <form
                onSubmit={onSearch}
                className="flex flex-1 sm:flex-initial items-center gap-2"
                role="search"
              >
                <label htmlFor="blog-search" className="sr-only">
                  Search blogs
                </label>
                <div className="relative flex-1 sm:flex-initial">
                  <HiOutlineMagnifyingGlass
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    aria-hidden
                  />
                  <input
                    id="blog-search"
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search blogs…"
                    autoComplete="off"
                    className="w-full sm:w-56 md:w-64 pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-16">Loading blogs…</p>
          ) : error ? (
            <p className="text-center text-red-600 py-16">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 py-16">No blog posts yet.</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              No blog posts match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => {
                const imageSrc = blogImageUrl(post.imagePath)
                return (
                  <article
                    key={post.id}
                    className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg flex flex-col cursor-pointer [&_*]:cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => openBlogDetail(post.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') openBlogDetail(post.id)
                    }}
                  >
                    <div className="px-4 pt-4 cursor-pointer">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt=""
                          className="w-full h-48 sm:h-52 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-48 sm:h-52 rounded-xl bg-gray-100" />
                      )}
                    </div>
                    <p className="text-gray-500 text-sm px-4 pt-3 pb-1">{post.dateLabel}</p>
                    <div className="px-4 pb-3 overflow-hidden">
                      <h2
                        className="text-primary font-bold text-sm sm:text-base uppercase leading-snug line-clamp-2 break-words"
                        title={post.title}
                      >
                        {post.title}
                      </h2>
                    </div>
                    <div className="px-4 pt-0 pb-4 flex-1 overflow-hidden">
                      <p className="text-black text-sm leading-relaxed line-clamp-6 break-words cursor-pointer">
                        {post.description}
                      </p>
                    </div>
                    <div className="px-4 pb-4">
                      <span className="inline-flex items-center gap-2 text-black font-medium text-sm">
                        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <HiOutlineArrowRight className="w-4 h-4 text-white" />
                        </span>
                        Read More
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Blogs
