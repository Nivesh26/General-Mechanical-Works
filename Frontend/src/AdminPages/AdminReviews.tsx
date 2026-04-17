import { useState, type CSSProperties } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL } from '../AdminComponent/adminMainStyles'
import {
  HiStar,
  HiOutlineHandThumbUp,
  HiHandThumbUp,
  HiOutlineChatBubbleLeft,
  HiChatBubbleLeft,
} from 'react-icons/hi2'
import { useProductReviewsState } from '../lib/useProductReviewsState'

const cardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  marginBottom: '16px',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
}

const AdminReviews = () => {
  const {
    reviews,
    userLikedReviewIds,
    adminLikedReviewIds,
    adminReplyByReviewId,
    toggleAdminLike,
    setAdminReply,
    clearAdminReply,
  } = useProductReviewsState()

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null)

  const replyValue = (reviewId: string) =>
    drafts[reviewId] !== undefined ? drafts[reviewId] : (adminReplyByReviewId[reviewId] ?? '')

  const commitReply = (reviewId: string) => {
    const text = replyValue(reviewId).trim()
    if (text) setAdminReply(reviewId, text)
    else clearAdminReply(reviewId)
    setDrafts((d) => {
      const next = { ...d }
      delete next[reviewId]
      return next
    })
  }

  const handleReplyIconClick = (reviewId: string) => {
    setReplyOpenId((prev) => {
      if (prev === reviewId) {
        commitReply(reviewId)
        return null
      }
      if (prev) commitReply(prev)
      return reviewId
    })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Product reviews</h1>
          <p style={{ margin: '8px 0 24px', fontSize: '14px', color: '#64748b' }}>View reviews</p>

          {reviews.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#64748b' }}>No product reviews yet.</p>
          ) : (
            reviews.map((review) => {
              const adminLiked = adminLikedReviewIds.includes(review.id)
              const customerLiked = userLikedReviewIds.includes(review.id)
              return (
                <article key={review.id} style={cardStyle}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: '#bd162c',
                          backgroundColor: '#fef2f2',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          marginBottom: '8px',
                        }}
                      >
                        {review.productName}
                      </span>
                      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                        {review.name}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <HiStar
                            key={i}
                            style={{
                              width: 16,
                              height: 16,
                              color: i <= review.rating ? '#fbbf24' : '#e5e7eb',
                              fill: i <= review.rating ? '#fbbf24' : '#e5e7eb',
                            }}
                          />
                        ))}
                        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => toggleAdminLike(review.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: adminLiked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                          backgroundColor: adminLiked ? '#eff6ff' : '#ffffff',
                          color: adminLiked ? '#1d4ed8' : '#475569',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {adminLiked ? (
                          <HiHandThumbUp style={{ width: 18, height: 18 }} />
                        ) : (
                          <HiOutlineHandThumbUp style={{ width: 18, height: 18 }} />
                        )}
                        {adminLiked ? 'Liked' : 'Like'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReplyIconClick(review.id)}
                        aria-label={replyOpenId === review.id ? 'Close reply editor' : 'Write a reply'}
                        title={replyOpenId === review.id ? 'Close' : 'Reply'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          border:
                            replyOpenId === review.id ? '1px solid #fecaca' : '1px solid #e2e8f0',
                          backgroundColor: replyOpenId === review.id ? '#fef2f2' : '#ffffff',
                          color: replyOpenId === review.id ? '#bd162c' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {replyOpenId === review.id ? (
                          <HiChatBubbleLeft style={{ width: 20, height: 20 }} />
                        ) : (
                          <HiOutlineChatBubbleLeft style={{ width: 20, height: 20 }} />
                        )}
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
                    {review.comment}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    {customerLiked ? (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#1d4ed8',
                          backgroundColor: '#eff6ff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        Customer marked helpful
                      </span>
                    ) : null}
                  </div>

                  {replyOpenId === review.id ? (
                    <div style={{ marginTop: '4px' }}>
                      <textarea
                        id={`admin-reply-${review.id}`}
                        value={replyValue(review.id)}
                        onChange={(e) => setDrafts((d) => ({ ...d, [review.id]: e.target.value }))}
                        onBlur={() => commitReply(review.id)}
                        rows={4}
                        placeholder="Your reply (shown on product page)…"
                        aria-label="Admin reply, shown on product page"
                        autoFocus
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          fontSize: '14px',
                          lineHeight: 1.5,
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          commitReply(review.id)
                          setReplyOpenId(null)
                        }}
                        style={{
                          marginTop: '10px',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#bd162c',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Post
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminReviews
