import { useState, type CSSProperties } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL } from '../AdminComponent/adminMainStyles'
import {
  HiStar,
  HiOutlineHandThumbUp,
  HiHandThumbUp,
  HiOutlineChatBubbleLeft,
  HiChatBubbleLeft,
  HiOutlineTrash,
} from 'react-icons/hi2'
import { useProductReviewsState } from '../lib/useProductReviewsState'

const pageHeader: CSSProperties = {
  marginBottom: '28px',
  paddingBottom: '22px',
  borderBottom: '1px solid #e2e8f0',
}

const cardShell: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  border: '1px solid #e8ecf0',
  marginBottom: '20px',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06)',
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
    removeReview,
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

  const handleRemoveReview = (reviewId: string) => {
    if (!window.confirm('Remove this review from the list? It will disappear here and on the product page until you reload.')) {
      return
    }
    if (replyOpenId === reviewId) setReplyOpenId(null)
    removeReview(reviewId)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <AdminNavbar />
      <main style={{ ...ADMIN_MAIN_SCROLL, backgroundColor: '#f1f5f9' }}>
        <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <header style={pageHeader}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '12px 16px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                }}
              >
                Product reviews
              </h1>
              {reviews.length > 0 ? (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                    backgroundColor: '#e2e8f0',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              ) : null}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>View reviews</p>
          </header>

          {reviews.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#64748b' }}>No product reviews yet.</p>
          ) : (
            reviews.map((review, index) => {
              const adminLiked = adminLikedReviewIds.includes(review.id)
              const customerLiked = userLikedReviewIds.includes(review.id)
              return (
                <article key={review.id} style={cardShell}>
                  {/* Card header */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '22px 26px',
                      background: 'linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)',
                      borderBottom: '1px solid #eef2f6',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flex: 1, minWidth: 0 }}>
                      <img
                        src={review.userPhoto}
                        alt={`${review.name} profile`}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 0 1px #e2e8f0, 0 6px 16px rgba(15, 23, 42, 0.08)',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                        <p
                          style={{
                            margin: '0 0 6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#94a3b8',
                          }}
                        >
                          Customer review · #{index + 1}
                        </p>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#0f172a',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.25,
                          }}
                        >
                          {review.name}
                        </h2>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '10px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <HiStar
                                key={i}
                                style={{
                                  width: 18,
                                  height: 18,
                                  color: i <= review.rating ? '#f59e0b' : '#e5e7eb',
                                  fill: i <= review.rating ? '#f59e0b' : '#e5e7eb',
                                }}
                              />
                            ))}
                          </div>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#475569',
                            }}
                          >
                            {review.rating} out of 5
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#94a3b8',
                              paddingLeft: '10px',
                              borderLeft: '1px solid #e2e8f0',
                            }}
                          >
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px',
                        borderRadius: '12px',
                        border: '1px solid #e8ecf0',
                        backgroundColor: '#ffffff',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAdminLike(review.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '8px 14px',
                          borderRadius: '9px',
                          border: 'none',
                          backgroundColor: adminLiked ? '#eff6ff' : 'transparent',
                          color: adminLiked ? '#1d4ed8' : '#64748b',
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
                      <div style={{ width: '1px', height: '22px', backgroundColor: '#e8ecf0' }} aria-hidden />
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
                          borderRadius: '9px',
                          border: 'none',
                          backgroundColor: replyOpenId === review.id ? '#fef2f2' : 'transparent',
                          color: replyOpenId === review.id ? '#bd162c' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {replyOpenId === review.id ? (
                          <HiChatBubbleLeft style={{ width: 20, height: 20 }} />
                        ) : (
                          <HiOutlineChatBubbleLeft style={{ width: 20, height: 20 }} />
                        )}
                      </button>
                      <div style={{ width: '1px', height: '22px', backgroundColor: '#e8ecf0' }} aria-hidden />
                      <button
                        type="button"
                        onClick={() => handleRemoveReview(review.id)}
                        aria-label="Remove review"
                        title="Remove review"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          borderRadius: '9px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        <HiOutlineTrash style={{ width: 20, height: 20 }} />
                      </button>
                    </div>
                  </div>

                  {/* Review body */}
                  <div style={{ padding: '22px 26px 18px' }}>
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                      }}
                    >
                      Review text
                    </p>
                    <blockquote
                      style={{
                        margin: 0,
                        padding: '16px 18px 16px 20px',
                        borderLeft: '3px solid #bd162c',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0 12px 12px 0',
                        fontSize: '15px',
                        lineHeight: 1.65,
                        color: '#334155',
                      }}
                    >
                      {review.comment}
                    </blockquote>
                  </div>

                  <div style={{ padding: '0 26px 18px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {customerLiked ? (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#1e40af',
                          backgroundColor: '#eff6ff',
                          padding: '6px 12px',
                          borderRadius: '999px',
                          border: '1px solid #dbeafe',
                        }}
                      >
                        Marked helpful by customer
                      </span>
                    ) : null}
                  </div>

                  {replyOpenId === review.id ? (
                    <div style={{ padding: '0 26px 22px' }}>
                      <p
                        style={{
                          margin: '0 0 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: '#94a3b8',
                        }}
                      >
                        Your reply
                      </p>
                      <textarea
                        id={`admin-reply-${review.id}`}
                        value={replyValue(review.id)}
                        onChange={(e) => setDrafts((d) => ({ ...d, [review.id]: e.target.value }))}
                        onBlur={() => commitReply(review.id)}
                        rows={4}
                        placeholder="Write a professional response. This text appears on the product page."
                        aria-label="Admin reply, shown on product page"
                        autoFocus
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          fontSize: '15px',
                          lineHeight: 1.55,
                          color: '#0f172a',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          minHeight: '120px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          backgroundColor: '#fafbfc',
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
                          marginTop: '12px',
                          padding: '10px 22px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#bd162c',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 600,
                          letterSpacing: '0.03em',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(189, 22, 44, 0.25)',
                        }}
                      >
                        Post reply
                      </button>
                    </div>
                  ) : null}

                  {/* Product reference */}
                  <div
                    style={{
                      marginTop: replyOpenId === review.id ? 0 : '4px',
                      padding: '22px 26px 26px',
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
                      Linked product
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '22px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '14px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
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
                        <p
                          style={{
                            margin: '10px 0 0',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: '#94a3b8',
                          }}
                        >
                          Product detail
                        </p>
                        <p
                          title={review.productDetail}
                          style={{
                            margin: '6px 0 0',
                            fontSize: '13px',
                            lineHeight: 1.55,
                            color: '#64748b',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                          }}
                        >
                          {review.productDetail}
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
