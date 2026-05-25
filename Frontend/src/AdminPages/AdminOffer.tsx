import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import {
  createAdminOffer,
  deleteAdminOffer,
  fetchAdminOffers,
  type OfferItem,
} from '../lib/api'
import { offerImageUrl } from '../lib/offers'

const MAX_FILE_BYTES = 2.5 * 1024 * 1024
const borderNormal = '1px solid #cbd5e1'
const borderError = '1px solid #dc2626'

const AdminOffer = () => {
  const { token } = useAuth()
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [description, setDescription] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [fieldErrors, setFieldErrors] = useState<{ poster?: string; description?: string }>({})
  const [lightboxId, setLightboxId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const lightboxOffer = lightboxId != null ? offers.find((o) => o.id === lightboxId) : undefined

  const loadOffers = useCallback(async () => {
    if (!token) {
      setOffers([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await fetchAdminOffers(token)
      setOffers(list)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load offers')
      setOffers([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadOffers()
  }, [loadOffers])

  useEffect(() => {
    if (!uploadFile) {
      setPreviewUrl(null)
      return
    }
    const u = URL.createObjectURL(uploadFile)
    setPreviewUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [uploadFile])

  useEffect(() => {
    if (!lightboxOffer) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [lightboxOffer])

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFieldErrors((prev) => {
      const n = { ...prev }
      delete n.poster
      return n
    })
    if (!file) {
      setUploadFile(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({ ...prev, poster: 'Please choose an image file.' }))
      setUploadFile(null)
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFieldErrors((prev) => ({ ...prev, poster: 'Image must be 2.5 MB or smaller.' }))
      setUploadFile(null)
      return
    }
    setUploadFile(file)
  }

  const resetForm = () => {
    setDescription('')
    setUploadFile(null)
    setFileInputKey((k) => k + 1)
    setFieldErrors({})
  }

  const onSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const err: { poster?: string; description?: string } = {}
    if (!uploadFile) err.poster = 'Choose one poster image from your computer.'
    const trimmed = description.trim()
    if (!trimmed) err.description = 'Enter an image description.'
    setFieldErrors(err)
    if (Object.keys(err).length > 0) return

    setSaving(true)
    try {
      await createAdminOffer(token, trimmed, uploadFile!)
      toast.success('Offer added.')
      resetForm()
      await loadOffers()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add offer')
    } finally {
      setSaving(false)
    }
  }

  const onRemove = async (id: number) => {
    if (!token || !window.confirm('Remove this poster from the list?')) return
    try {
      await deleteAdminOffer(token, id)
      toast.success('Offer removed.')
      if (lightboxId === id) setLightboxId(null)
      await loadOffers()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove offer')
    }
  }

  const lightboxSrc = lightboxOffer ? offerImageUrl(lightboxOffer.imagePath) : null

  const lightbox =
    lightboxOffer &&
    lightboxSrc &&
    createPortal(
      <div
        className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
        onClick={() => setLightboxId(null)}
        role="dialog"
        aria-modal="true"
        aria-label="View poster"
      >
        <button
          type="button"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white border-2 border-gray-300 flex items-center justify-center text-gray-700 cursor-pointer"
          onClick={() => setLightboxId(null)}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div
          className="relative max-w-7xl w-full max-h-[95vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={lightboxSrc}
            alt={lightboxOffer.description}
            className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="admin-page-root">
      {lightbox}
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <h1 style={ADMIN_PAGE_TITLE}>Offers</h1>
          <p style={{ ...ADMIN_PAGE_SUBTITLE, maxWidth: '560px' }}>
            These posters match what visitors see under <strong>Latest Offers</strong> on the home page.
          </p>
        </div>

        <section
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '28px 32px',
            marginBottom: '24px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ margin: '0 0 28px', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Add Offer</h2>
          <form onSubmit={(e) => void onSubmitAdd(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                gap: '12px 16px',
              }}
            >
              <div style={{ flex: '0 1 320px', minWidth: 0 }}>
                <label style={labelStyle}>
                  Poster
                  <input
                    key={fileInputKey}
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onPickFile}
                    style={{ fontSize: '16px', color: '#475569', marginTop: '10px' }}
                  />
                  {fieldErrors.poster && <span style={errStyle}>{fieldErrors.poster}</span>}
                </label>
                {previewUrl && (
                  <div
                    style={{
                      marginTop: '10px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: borderNormal,
                      padding: '8px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      maxWidth: '220px',
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt=""
                      style={{
                        maxWidth: '100%',
                        width: 'auto',
                        maxHeight: '120px',
                        objectFit: 'contain',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                )}
              </div>

              <label
                style={{
                  ...labelStyle,
                  flex: '0 0 280px',
                  minWidth: '200px',
                  maxWidth: '100%',
                }}
              >
                Image description
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setFieldErrors((prev) => {
                      const n = { ...prev }
                      delete n.description
                      return n
                    })
                  }}
                  placeholder="Short description for accessibility"
                  style={{
                    ...inputStyleCompact,
                    width: '100%',
                    maxWidth: 'none',
                    border: fieldErrors.description ? borderError : borderNormal,
                  }}
                />
                {fieldErrors.description && <span style={errStyle}>{fieldErrors.description}</span>}
              </label>
            </div>

            <button type="submit" disabled={saving} style={btnAddOffer}>
              {saving ? 'Saving…' : 'Add Offer'}
            </button>
          </form>
        </section>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <p style={{ padding: '24px', color: '#64748b', margin: 0 }}>Loading offers…</p>
          ) : offers.length === 0 ? (
            <p style={{ padding: '24px', color: '#64748b', margin: 0 }}>No offers yet. Add a poster above.</p>
          ) : (
            <div className="admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={thStyle}>Poster</th>
                    <th style={thStyle}>Image description</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((row) => {
                    const thumbSrc = offerImageUrl(row.imagePath)
                    return (
                      <tr key={row.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={tdStyle}>
                          <button
                            type="button"
                            onClick={() => setLightboxId(row.id)}
                            aria-label={`View larger: ${row.description}`}
                            style={{
                              padding: 0,
                              margin: 0,
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              display: 'block',
                              lineHeight: 0,
                            }}
                          >
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt=""
                                style={{
                                  width: '120px',
                                  height: '72px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                  display: 'block',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '120px',
                                  height: '72px',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#f1f5f9',
                                }}
                              />
                            )}
                          </button>
                        </td>
                        <td style={{ ...tdStyle, color: '#334155' }}>{row.description}</td>
                        <td style={tdStyle}>
                          <button type="button" onClick={() => void onRemove(row.id)} style={btnDelete}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '15px',
  fontWeight: 600,
  color: '#334155',
}

const inputStyleCompact: CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '320px',
  height: '40px',
  fontFamily: 'inherit',
}

const errStyle: CSSProperties = { fontSize: '13px', color: '#dc2626', fontWeight: 500 }

const btnAddOffer: CSSProperties = {
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  backgroundColor: '#bd162c',
  border: '1px solid #991b1b',
  borderRadius: '8px',
  cursor: 'pointer',
  alignSelf: 'flex-start',
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
}

const tdStyle: CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#475569',
  verticalAlign: 'middle',
}

export default AdminOffer
