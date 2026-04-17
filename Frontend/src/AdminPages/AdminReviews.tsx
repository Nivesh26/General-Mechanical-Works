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
  borderRadius: '16px',
  border: '1px solid #e8ecf0',
  padding: '24px',
  marginBottom: '20px',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 28px rgba(15, 23, 42, 0.07)',
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
                      gap: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <img
                        src={review.userPhoto}
                        alt={`${review.name} profile`}
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 0 1px #e2e8f0, 0 4px 12px rgba(15, 23, 42, 0.08)',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                        <p
                          style={{
                            margin: '0 0 4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: '#94a3b8',
                          }}
                        >
                          Reviewer
                        </p>
                        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                          {review.name}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <HiStar
                              key={i}
                              style={{
                                width: 17,
                                height: 17,
                                color: i <= review.rating ? '#fbbf24' : '#e5e7eb',
                                fill: i <= review.rating ? '#fbbf24' : '#e5e7eb',
                              }}
                            />
                          ))}
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#94a3b8',
                              marginLeft: '4px',
                              paddingLeft: '8px',
                              borderLeft: '1px solid #e2e8f0',
                            }}
                          >
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => toggleAdminLike(review.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: adminLiked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                          backgroundColor: adminLiked ? '#eff6ff' : '#fafafa',
                          color: adminLiked ? '#1d4ed8' : '#475569',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease',
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
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          border:
                            replyOpenId === review.id ? '1px solid #fecaca' : '1px solid #e2e8f0',
                          backgroundColor: replyOpenId === review.id ? '#fef2f2' : '#fafafa',
                          color: replyOpenId === review.id ? '#bd162c' : '#475569',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease',
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

                  <p
                    style={{
                      margin: '0 0 16px',
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: '#475569',
                    }}
                  >
                    {review.comment}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: replyOpenId === review.id ? '12px' : '0' }}>
                    {customerLiked ? (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#1d4ed8',
                          backgroundColor: '#eff6ff',
                          padding: '5px 11px',
                          borderRadius: '8px',
                          border: '1px solid #dbeafe',
                        }}
                      >
                        Customer marked helpful
                      </span>
                    ) : null}
                  </div>

                  {replyOpenId === review.id ? (
                    <div style={{ marginBottom: '20px' }}>
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

                  <div
                    style={{
                      marginTop: '20px',
                      marginLeft: '-24px',
                      marginRight: '-24px',
                      marginBottom: '-24px',
                      padding: '22px 24px 24px',
                      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderTop: '1px solid #e8ecf0',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 14px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#64748b',
                      }}
                    >
                      Reviewed product
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          width: '132px',
                          height: '132px',
                          borderRadius: '14px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '14px',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={review.productImage}
                          alt={review.productName}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.35,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {review.productName}
                        </p>
                        <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.5, color: '#64748b' }}>
                          This review is linked to the product shown above.
                        </p>
                      </div>
                    </div>
                  </div>
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
