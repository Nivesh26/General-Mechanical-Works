import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiOutlineHeart } from 'react-icons/hi2'
import { toast } from 'react-toastify'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import {
  createAdminBlog,
  deleteAdminBlog,
  fetchAdminBlogs,
  updateAdminBlog,
  type BlogPost,
} from '../lib/api'
import { blogImageUrl } from '../lib/blogs'

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
  const { token } = useAuth()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'title' | 'body' | 'dateLabel' | 'image', string>>>({})
  const [searchInput, setSearchInput] = useState('')

  const loadBlogs = useCallback(async () => {
    if (!token) {
      setBlogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await fetchAdminBlogs(token)
      setBlogs(list)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load blogs')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadBlogs()
  }, [loadBlogs])

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
    () => (editingId != null ? blogs.find((b) => b.id === editingId) : undefined),
    [blogs, editingId],
  )

  const previewSrc =
    objectUrl ?? (editingBlog ? blogImageUrl(editingBlog.imagePath) : null)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setUploadFile(null)
    setFileInputKey((k) => k + 1)
    setFieldErrors({})
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
    const needsImage = editingId == null && !uploadFile
    if (needsImage) e.image = 'Add one cover image.'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!token || !validate()) return

    setSaving(true)
    try {
      const fields = {
        title: form.title.trim(),
        dateLabel: form.dateLabel.trim(),
        body: form.body.trim(),
      }
      if (editingId != null) {
        await updateAdminBlog(token, editingId, fields, uploadFile)
        toast.success('Blog updated.')
      } else {
        if (!uploadFile) return
        await createAdminBlog(token, fields, uploadFile)
        toast.success('Blog published.')
      }
      await loadBlogs()
      resetForm()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save blog')
    } finally {
      setSaving(false)
    }
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

  const onDelete = async (post: BlogPost) => {
    if (!token || !window.confirm('Delete this blog post?')) return
    try {
      await deleteAdminBlog(token, post.id)
      toast.success('Blog deleted.')
      if (editingId === post.id) resetForm()
      await loadBlogs()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete blog')
    }
  }

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return blogs
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.body.toLowerCase().includes(q) ||
        b.dateLabel.toLowerCase().includes(q),
    )
  }, [blogs, searchInput])

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <h1 style={ADMIN_PAGE_TITLE}>Blog</h1>
          <p style={ADMIN_PAGE_SUBTITLE}>
            Create posts with one cover image. They appear on the home page and open as full articles.
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
            {editingId != null ? 'Edit blog' : 'Add blog'}
          </h2>
          <form onSubmit={(e) => void onSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                placeholder="Article body (use blank lines between paragraphs)"
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
                Cover image (1){editingId != null ? ' — leave empty to keep current' : ''}
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
              <button type="submit" style={btnPrimary} disabled={saving}>
                {saving ? 'Saving…' : editingId != null ? 'Save changes' : 'Publish'}
              </button>
              {editingId != null && (
                <button type="button" onClick={resetForm} style={btnGhost} disabled={saving}>
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
              flexWrap: 'nowrap',
              gap: '8px',
              alignItems: 'center',
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
                width: '220px',
                maxWidth: 'min(280px, 42vw)',
                minWidth: '120px',
                padding: '10px 12px',
                border: borderNormal,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                flex: '0 1 auto',
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
          <div className="admin-table-wrap">
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
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>
                      Loading blogs…
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((post) => {
                    const thumb = blogImageUrl(post.imagePath)
                    return (
                      <tr key={post.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={tdStyle}>
                          {thumb ? (
                            <img
                              src={thumb}
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
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                          )}
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
                            {post.likeCount.toLocaleString('en-IN')}
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
                            <button type="button" onClick={() => void onDelete(post)} style={btnDelete}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>
                      {blogs.length === 0 ? 'No blog posts yet.' : 'No blog posts match your search.'}
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
