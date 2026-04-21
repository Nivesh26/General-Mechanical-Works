import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import Poster1 from '../assets/Poster1.png'
import Poster2 from '../assets/Poster2.png'
import Poster3 from '../assets/Poster3.png'

type OfferRow = {
  id: string
  image: string
  alt: string
}

const initialOffers: OfferRow[] = [
  { id: '1', image: Poster1, alt: 'Shreshtho - 40% discount on motorcycles' },
  { id: '2', image: Poster2, alt: 'Zemech - We can fix everything' },
  { id: '3', image: Poster3, alt: 'Garage on Call - Bike repair service at doorstep' },
]

const MAX_FILE_BYTES = 2.5 * 1024 * 1024
const borderNormal = '1px solid #cbd5e1'
const borderError = '1px solid #dc2626'

const AdminOffer = () => {
  const [offers, setOffers] = useState<OfferRow[]>(() => [...initialOffers])
  const [description, setDescription] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [fieldErrors, setFieldErrors] = useState<{ poster?: string; description?: string }>({})
  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const lightboxOffer = lightboxId ? offers.find((o) => o.id === lightboxId) : undefined

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

  const onSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const err: { poster?: string; description?: string } = {}
    if (!uploadFile) err.poster = 'Choose one poster image from your computer.'
    const trimmed = description.trim()
    if (!trimmed) err.description = 'Enter an image description.'
    setFieldErrors(err)
    if (Object.keys(err).length > 0) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return
      setOffers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          image: dataUrl,
          alt: trimmed,
        },
      ])
      resetForm()
    }
    reader.readAsDataURL(uploadFile!)
  }

  const onRemove = (id: string) => {
    if (!window.confirm('Remove this poster from the list?')) return
    setOffers((prev) => prev.filter((o) => o.id !== id))
  }

  const lightbox =
    lightboxOffer &&
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
            src={lightboxOffer.image}
            alt={lightboxOffer.alt}
            className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>,
      document.body
    )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {lightbox}
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
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
          <form onSubmit={onSubmitAdd} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

            <button type="submit" style={btnAddOffer}>
              Add Offer
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thStyle}>Poster</th>
                  <th style={thStyle}>Image description</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => setLightboxId(row.id)}
                        aria-label={`View larger: ${row.alt}`}
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
                        <img
                          src={row.image}
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
                      </button>
                    </td>
                    <td style={{ ...tdStyle, color: '#334155' }}>{row.alt}</td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => onRemove(row.id)} style={btnDelete}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
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
  gap: '8px',
  fontSize: '15px',
  fontWeight: 600,
  color: '#334155',
}

/** Compact single-line description field */
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

/** Same as Admin Blog Publish */
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
