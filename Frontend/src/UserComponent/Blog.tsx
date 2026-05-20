import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowRight } from 'react-icons/hi2'
import { fetchBlogs, type BlogSummary } from '../lib/api'
import { blogImageUrl } from '../lib/blogs'

const VISIBLE_COUNT = 3
const ROTATE_INTERVAL_MS = 10_000

const Blog = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchBlogs()
      .then((list) => {
        if (!cancelled) {
          setPosts(list)
          setStartIndex(0)
        }
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

  const canRotate = posts.length >= VISIBLE_COUNT

  const visiblePosts = useMemo(() => {
    if (posts.length === 0) return []
    if (posts.length <= VISIBLE_COUNT) return posts
    return Array.from({ length: VISIBLE_COUNT }, (_, i) => posts[(startIndex + i) % posts.length])
  }, [posts, startIndex])

  const goToPrev = () => {
    if (!canRotate) return
    setStartIndex((prev) => (prev - 1 + posts.length) % posts.length)
  }

  const goToNext = () => {
    if (!canRotate) return
    setStartIndex((prev) => (prev + 1) % posts.length)
  }

  useEffect(() => {
    if (!canRotate) return
    const id = window.setInterval(() => {
      setStartIndex((prev) => (prev + 1) % posts.length)
    }, ROTATE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [canRotate, posts.length])

  const openBlogDetail = (blogId: number) => {
    navigate(`/blogs/${blogId}`)
  }

  return (
    <section className="w-full py-12 sm:py-16 bg-white overflow-hidden">
      <h2 className="text-center text-primary text-2xl sm:text-3xl font-sec font-bold tracking-[4px] uppercase mb-10 sm:mb-12">
        Latest News / Blogs
      </h2>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading blogs…</p>
        ) : error ? (
          <p className="text-center text-red-600 py-12">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No blog posts yet.</p>
        ) : (
          <>
            {canRotate && (
              <button
                type="button"
                onClick={goToPrev}
                className="absolute -left-9 sm:-left-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                aria-label="Previous blogs"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {canRotate && (
              <button
                type="button"
                onClick={goToNext}
                className="absolute -right-9 sm:-right-11 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                aria-label="Next blogs"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visiblePosts.map((post) => {
                const imageSrc = blogImageUrl(post.imagePath)
                return (
                  <article
                    key={post.id}
                    className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg flex flex-col"
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
                      <h3
                        className="text-primary font-bold text-sm sm:text-base uppercase leading-snug line-clamp-2 break-words"
                        title={post.title}
                      >
                        {post.title}
                      </h3>
                    </div>
                    <div className="px-4 pt-0 pb-4 flex-1 overflow-hidden">
                      <p className="text-black text-sm leading-relaxed line-clamp-6 break-words cursor-pointer">
                        {post.description}
                      </p>
                    </div>
                    <div className="px-4 pb-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-black font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <HiOutlineArrowRight className="w-4 h-4 text-white" />
                        </span>
                        Read More
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Blog
