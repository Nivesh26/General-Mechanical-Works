import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HiOutlineArrowLeft, HiOutlineHandThumbUp } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { fetchBlog, likeBlog, type BlogPost } from '../lib/api'
import { blogBodyToParagraphs, blogImageUrl } from '../lib/blogs'

const Blogsdetail = () => {
  const { id: idParam } = useParams()
  const blogId = Number.parseInt(idParam ?? '', 10)

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(blogId)) {
      setError('Invalid blog link.')
      setPost(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchBlog(blogId)
      .then((data) => {
        if (!cancelled) setPost(data)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load blog')
          setPost(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [blogId])

  const toggleLike = async () => {
    if (!post || liked || likeBusy) return
    setLikeBusy(true)
    try {
      const updated = await likeBlog(post.id)
      setPost(updated)
      setLiked(true)
    } catch {
      /* ignore — count unchanged */
    } finally {
      setLikeBusy(false)
    }
  }

  const imageSrc = post ? blogImageUrl(post.imagePath) : null
  const paragraphs = post ? blogBodyToParagraphs(post.body) : []
  const likeCount = post?.likeCount ?? 0

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-[80px] py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <HiOutlineArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to home
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading article…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : post ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 break-words leading-snug">
                {post.title}
              </h1>
              <p className="mt-2 text-sm text-gray-500">{post.dateLabel}</p>

              <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={post.title}
                    className="w-full h-72 sm:h-[420px] object-cover"
                  />
                ) : (
                  <div className="w-full h-72 sm:h-[420px] bg-gray-100" />
                )}
                <div className="p-5 sm:p-7 space-y-4">
                  {paragraphs.map((p, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={() => void toggleLike()}
                  disabled={liked || likeBusy}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                    liked
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-pressed={liked}
                  aria-label={liked ? 'Liked' : 'Like blog'}
                >
                  <HiOutlineHandThumbUp
                    className={`h-4 w-4 ${liked ? 'text-primary' : 'text-gray-500'}`}
                  />
                  {liked ? 'Liked' : 'Like'}
                </button>
                <p className="text-sm text-gray-500">
                  {likeCount} like{likeCount === 1 ? '' : 's'}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Blogsdetail
