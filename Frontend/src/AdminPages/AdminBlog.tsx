import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlineHeart } from 'react-icons/hi2'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import Blog1Img from '../assets/Blog1.png'
import Blog2Img from '../assets/Blog2.png'
import Blog3Img from '../assets/Blog3.png'

type BlogPost = {
  id: string
  title: string
  dateLabel: string
  body: string
  imageUrl: string
  likes: number
}

const initialBlogs: BlogPost[] = [
  {
    id: 'b1',
    title: 'R15 V4 RACING INSTINCT - PASSING ON THE "R SERIES" DNA.',
    dateLabel: 'January 22, 2025',
    body: 'The all new R15 V4 is the 4th generation of legendry R15 which shares the same DNA with super sports YZF R1. The R15 V4 is equipped with a Traction Control System in all models and a Quick Shifter in Racing Blue.',
    imageUrl: Blog1Img,
    likes: 128,
  },
  {
    id: 'b2',
    title: 'THE ALL NEW CLASSIC 350 REBORN',
    dateLabel: 'March 1, 2025',
    body: 'After increasing the prices of its entire range a few months back, Royal Enfield has now slashed the price of the Meteor 350 and the Classic 350.',
    imageUrl: Blog2Img,
    likes: 94,
  },
  {
    id: 'b3',
    title: 'YATRI OFFICIALLY LAUNCH IN NEPAL',
    dateLabel: 'April 2, 2025',
    body: 'Coming out as the Nepali prodigy of bikes, Yatri Motorcycles started its journey in 2017, with founder Ashim Pandey and his cousin/business partner Batshal Pandey.',
    imageUrl: Blog3Img,
    likes: 256,
  },
]

type FormState = {
  title: string
  dateLabel: string
  body: string
}

const emptyForm: FormState = {
  title: '',
  dateLabel: '',
  body: '',
}

const borderNormal = '1px solid #cbd5e1'
const borderError = '1px solid #dc2626'

const AdminBlog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'title' | 'body' | 'dateLabel' | 'image', string>>>({})
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (!uploadFile) {
      setObjectUrl(null)
      return
    }
    const u = URL.createObjectURL(uploadFile)
    setObjectUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [uploadFile])

  const editingBlog = useMemo(
    () => (editingId ? blogs.find((b) => b.id === editingId) : undefined),
    [blogs, editingId]
  )

  const previewSrc = objectUrl ?? editingBlog?.imageUrl ?? null

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setUploadFile(null)
    setFileInputKey((k) => k + 1)
    setFieldErrors({})
  }

  const revokeIfBlob = (url: string) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({ ...prev, image: 'Please choose an image file.' }))
      return
    }
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.image
      return next
    })
    setUploadFile(file)
  }

  const validate = (): boolean => {
    const e: Partial<Record<'title' | 'body' | 'dateLabel' | 'image', string>> = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.dateLabel.trim()) e.dateLabel = 'Date is required.'
    if (!form.body.trim()) e.body = 'Content is required.'
    const needsImage = editingId == null ? !uploadFile : false
    if (needsImage) e.image = 'Add one cover image.'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return

    let nextImageUrl: string
    if (uploadFile) {
      if (editingBlog?.imageUrl && editingBlog.imageUrl.startsWith('blob:')) {
        revokeIfBlob(editingBlog.imageUrl)
      }
      nextImageUrl = URL.createObjectURL(uploadFile)
    } else if (editingBlog) {
      nextImageUrl = editingBlog.imageUrl
    } else {
      return
    }

    if (editingId) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? { ...b, title: form.title.trim(), dateLabel: form.dateLabel.trim(), body: form.body.trim(), imageUrl: nextImageUrl }
            : b
        )
      )
    } else {
      const id = `b-${Date.now()}`
      setBlogs((prev) => [
        ...prev,
        {
          id,
          title: form.title.trim(),
          dateLabel: form.dateLabel.trim(),
          body: form.body.trim(),
          imageUrl: nextImageUrl,
          likes: 0,
        },
      ])
    }
    resetForm()
  }

  const onEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setForm({
      title: post.title,
      dateLabel: post.dateLabel,
      body: post.body,
    })
    setUploadFile(null)
    setFileInputKey((k) => k + 1)
    setFieldErrors({})
  }

  const onDelete = (post: BlogPost) => {
    if (!window.confirm('Delete this blog post?')) return
    revokeIfBlob(post.imageUrl)
    setBlogs((prev) => prev.filter((b) => b.id !== post.id))
    if (editingId === post.id) resetForm()
  }

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return blogs
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.body.toLowerCase().includes(q) ||
        b.dateLabel.toLowerCase().includes(q)
    )
  }, [blogs, searchInput])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <h1 style={ADMIN_PAGE_TITLE}>Blog</h1>
          <p style={ADMIN_PAGE_SUBTITLE}>
            Create posts with one cover image, edit or remove them, and view like counts.
          </p>
        </div>

        <section
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            {editingId ? 'Edit blog' : 'Add blog'}
          </h2>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              <label style={labelStyle}>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, title: e.target.value }))
                    setFieldErrors((er) => {
                      const n = { ...er }
                      delete n.title
                      return n
                    })
                  }}
                  placeholder="Post title"
                  style={{ ...inputStyle, border: fieldErrors.title ? borderError : borderNormal }}
                />
                {fieldErrors.title && <span style={errStyle}>{fieldErrors.title}</span>}
              </label>
              <label style={labelStyle}>
                Date (display)
                <input
                  type="text"
                  value={form.dateLabel}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, dateLabel: e.target.value }))
                    setFieldErrors((er) => {
                      const n = { ...er }
                      delete n.dateLabel
                      return n
                    })
                  }}
                  placeholder="e.g. March 24, 2025"
                  style={{ ...inputStyle, border: fieldErrors.dateLabel ? borderError : borderNormal }}
                />
                {fieldErrors.dateLabel && <span style={errStyle}>{fieldErrors.dateLabel}</span>}
              </label>
            </div>

            <label style={labelStyle}>
              Content
              <textarea
                value={form.body}
                onChange={(e) => {
                  setForm((f) => ({ ...f, body: e.target.value }))
                  setFieldErrors((er) => {
                    const n = { ...er }
                    delete n.body
                    return n
                  })
                }}
                placeholder="Article body"
                rows={5}
                style={{
                  ...inputStyle,
                  border: fieldErrors.body ? borderError : borderNormal,
                  resize: 'vertical',
                  minHeight: '100px',
                }}
              />
              {fieldErrors.body && <span style={errStyle}>{fieldErrors.body}</span>}
            </label>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Cover image (1){editingId ? ' — leave empty to keep current' : ''}
              </div>
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ fontSize: '14px', color: '#475569' }}
              />
              {fieldErrors.image && <span style={{ ...errStyle, display: 'block', marginTop: '6px' }}>{fieldErrors.image}</span>}
              {previewSrc && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={previewSrc}
                    alt=""
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" style={btnPrimary}>
                {editingId ? 'Save changes' : 'Publish'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={btnGhost}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>All posts</h2>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'nowrap',
              flexShrink: 0,
            }}
          >
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title or content…"
              autoComplete="off"
              style={{
                width: '280px',
                maxWidth: 'min(280px, 40vw)',
                minWidth: '140px',
                padding: '10px 12px',
                border: borderNormal,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button type="submit" style={btnPrimary}>
              Search
            </button>
          </form>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thStyle}>Image</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Likes</th>
                  <th style={thStyle}>Preview</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((post) => (
                    <tr key={post.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={tdStyle}>
                        <img
                          src={post.imageUrl}
                          alt=""
                          style={{
                            width: '72px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'block',
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#0f172a', maxWidth: '240px' }}>{post.title}</td>
                      <td style={tdStyle}>{post.dateLabel}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 600,
                            color: '#475569',
                            fontSize: '14px',
                          }}
                        >
                          <HiOutlineHeart style={{ color: '#bd162c', fontSize: '18px' }} aria-hidden />
                          {post.likes.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#64748b', fontSize: '13px', maxWidth: '280px' }}>
                        {post.body.length > 100 ? `${post.body.slice(0, 100)}…` : post.body}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => onEdit(post)} style={btnEdit}>
                            Edit
                          </button>
                          <button type="button" onClick={() => onDelete(post)} style={btnDelete}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>
                      No blog posts match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
}

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  border: borderNormal,
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
}

const errStyle: CSSProperties = { fontSize: '12px', color: '#dc2626', fontWeight: 500 }

const btnPrimary: CSSProperties = {
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  backgroundColor: '#bd162c',
  border: '1px solid #991b1b',
  borderRadius: '8px',
  cursor: 'pointer',
}

const btnGhost: CSSProperties = {
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#475569',
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
}

const btnEdit: CSSProperties = {
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#1d4ed8',
  backgroundColor: '#dbeafe',
  border: '1px solid #93c5fd',
  borderRadius: '6px',
  cursor: 'pointer',
}

const btnDelete: CSSProperties = {
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#b91c1c',
  backgroundColor: '#fee2e2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  cursor: 'pointer',
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '13px',
  color: '#334155',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#475569',
  verticalAlign: 'middle',
}

export default AdminBlog
