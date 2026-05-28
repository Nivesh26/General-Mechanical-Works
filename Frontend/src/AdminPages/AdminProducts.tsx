import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  setAdminProductActive,
  updateAdminProduct,
  type ProductItem,
} from '../lib/api'
import { mapProductImages, productImageUrl } from '../lib/products'

type EditingImage = { url: string; path: string }

type Product = {
  id: number
  sku: string
  name: string
  description: string
  bulletPoints: string[]
  category: string
  size: string[]
  price: number
  stock: number
  images: string[]
  imagePaths: string[]
  /** When false, product is hidden from storefront / treated as inactive listing. */
  active: boolean
}

type ProductForm = {
  sku: string
  name: string
  description: string
  bulletPoints: string
  category: string
  size: string[]
  price: string
  stock: string
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const defaultCategories = ['Lubricants', 'Brakes', 'Tyres', 'Electrical', 'Accessories']
const sizeOptions = ['XS', 'S', 'L', 'XL', 'XXL', 'XXXL'] as const

const sortSizes = (sizes: string[]) => {
  const order = new Map<string, number>(sizeOptions.map((s, i) => [s, i]))
  return [...sizes].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99))
}

const toUiProduct = (item: ProductItem): Product => ({
  id: item.id,
  sku: item.sku,
  name: item.name,
  description: item.description,
  bulletPoints: item.bulletPoints ?? [],
  category: item.category,
  size: item.sizes ?? [],
  price: Number(item.price),
  stock: item.stock,
  images: mapProductImages(item),
  imagePaths: item.imagePaths ?? [],
  active: item.active,
})

const emptyForm: ProductForm = {
  sku: '',
  name: '',
  description: '',
  bulletPoints: '',
  category: '',
  size: [],
  price: '',
  stock: '',
}

const formatRs = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`

/** Very light red tint for inactive product rows (distinct from active white rows). */
const INACTIVE_ROW_BG = '#fff5f5'
const INACTIVE_ROW_BORDER = '#fecdd3'
const INACTIVE_ROW_ACCENT = '#fb7185'
const INACTIVE_IMG_BORDER = '#fecaca'
const INACTIVE_IMG_BG = '#fff1f2'

type ProductFieldKey = 'name' | 'sku' | 'description' | 'category' | 'price' | 'stock' | 'images'

const borderNormal = '1px solid #d1d5db'
const borderError = '1px solid #dc2626'

const imageRemoveButtonStyle: CSSProperties = {
  position: 'absolute',
  top: '-7px',
  right: '-7px',
  width: '18px',
  height: '18px',
  borderRadius: '999px',
  border: 0,
  background: '#ef4444',
  color: '#fff',
  fontSize: '12px',
  lineHeight: '18px',
  cursor: 'pointer',
  fontWeight: 700,
  padding: 0,
}

const productImageThumbStyle: CSSProperties = {
  width: '68px',
  height: '68px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  background: '#fff',
}

const validateProductForm = (
  form: ProductForm,
  products: Product[],
  editingId: number | null,
  uploadFiles: File[],
  existingImageCount: number
): Partial<Record<ProductFieldKey, string>> => {
  const e: Partial<Record<ProductFieldKey, string>> = {}
  const trimmedSku = form.sku.trim().toUpperCase()
  const trimmedName = form.name.trim()
  const trimmedDescription = form.description.trim()
  const trimmedCategory = form.category.trim()
  const parsedPrice = Number(form.price)
  const parsedStock = Number(form.stock)

  if (!trimmedName) e.name = 'Product name is required.'
  if (!trimmedDescription) e.description = 'Product description is required.'
  if (!trimmedSku) e.sku = 'SKU is required.'
  else if (products.some((p) => p.sku === trimmedSku && p.id !== editingId)) {
    e.sku = 'This SKU is already in use.'
  }

  if (!trimmedCategory) e.category = 'Category is required.'

  if (form.price.trim() === '' || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    e.price = 'Enter a valid price greater than 0.'
  }

  if (form.stock.trim() === '' || !Number.isFinite(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
    e.stock = 'Enter a whole number (0 or more).'
  }

  const imageCount =
    editingId !== null ? existingImageCount + uploadFiles.length : uploadFiles.length
  if (imageCount > 4) e.images = 'You can upload at most 4 images.'

  return e
}

const AdminProducts = () => {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProductFieldKey, string>>>({})
  const [searchInput, setSearchInput] = useState('')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [editingImages, setEditingImages] = useState<EditingImage[]>([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [categorySuggestionsOpen, setCategorySuggestionsOpen] = useState(false)

  const loadProducts = useCallback(async () => {
    if (!token) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await fetchAdminProducts(token)
      setProducts(list.map(toUiProduct))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const categoryChoices = useMemo(() => {
    const set = new Set<string>([...defaultCategories, ...products.map((p) => p.category)])
    if (form.category.trim()) set.add(form.category.trim())
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [products, form.category])

  const categorySuggestionsFiltered = useMemo(() => {
    const q = form.category.trim().toLowerCase()
    if (!q) return categoryChoices
    return categoryChoices.filter((c) => c.toLowerCase().includes(q))
  }, [categoryChoices, form.category])

  const clearFieldError = (key: ProductFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const onInputChange =
    (field: keyof ProductForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
      const errKey: ProductFieldKey | undefined =
        field === 'name' ||
        field === 'sku' ||
        field === 'description' ||
        field === 'category' ||
        field === 'price' ||
        field === 'stock'
          ? field
          : undefined
      if (errKey) clearFieldError(errKey)
    }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setUploadFiles([])
    setEditingImages([])
    setFileInputKey((k) => k + 1)
    setCategorySuggestionsOpen(false)
    setFieldErrors({})
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    if (!nextFile.type.startsWith('image/')) {
      setFieldErrors((prev) => ({ ...prev, images: 'Please choose an image file (JPEG, PNG, WebP, or GIF).' }))
      return
    }

    if (nextFile.size > MAX_IMAGE_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        images: 'Each image must be 5 MB or smaller. Try a smaller file or compress the photo.',
      }))
      return
    }

    const maxTotal = editingId !== null ? 4 - editingImages.length : 4
    if (uploadFiles.length >= maxTotal) {
      setFieldErrors((prev) => ({ ...prev, images: 'You can upload maximum 4 images.' }))
      return
    }

    const alreadyAdded = uploadFiles.some(
      (f) => f.name === nextFile.name && f.size === nextFile.size && f.lastModified === nextFile.lastModified
    )
    if (alreadyAdded) {
      setFieldErrors((prev) => ({ ...prev, images: 'This image is already selected.' }))
      return
    }

    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.images
      return next
    })
    setUploadFiles((prev) => [...prev, nextFile])
  }

  const removeUploadFile = (indexToRemove: number) => {
    setUploadFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    clearFieldError('images')
  }

  const removeEditingImage = (indexToRemove: number) => {
    setEditingImages((prev) => prev.filter((_, index) => index !== indexToRemove))
    clearFieldError('images')
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return

    const existingImageCount = editingId !== null ? editingImages.length : 0

    const errors = validateProductForm(form, products, editingId, uploadFiles, existingImageCount)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      if (editingId !== null) {
        await updateAdminProduct(
          token,
          editingId,
          form,
          uploadFiles,
          editingImages.map((img) => img.path),
        )
        toast.success('Product updated.')
      } else {
        await createAdminProduct(token, form, uploadFiles)
        toast.success('Product added.')
      }
      resetForm()
      await loadProducts()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description,
      bulletPoints: (product.bulletPoints ?? []).join('\n'),
      category: product.category,
      size: product.size,
      price: String(product.price),
      stock: String(product.stock),
    })
    setCategorySuggestionsOpen(false)
    setUploadFiles([])
    setEditingImages(
      product.imagePaths
        .map((path) => {
          const url = productImageUrl(path)
          return url ? { path, url } : null
        })
        .filter((img): img is EditingImage => img !== null),
    )
    setFileInputKey((k) => k + 1)
    setFieldErrors({})
  }

  const onDelete = async (productId: number) => {
    if (!token) return
    const confirmed = window.confirm('Delete this product?')
    if (!confirmed) return

    try {
      await deleteAdminProduct(token, productId)
      toast.success('Product deleted.')
      if (editingId === productId) resetForm()
      await loadProducts()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete product')
    }
  }

  const toggleProductActive = async (productId: number) => {
    if (!token) return
    const product = products.find((p) => p.id === productId)
    if (!product) return

    try {
      await setAdminProductActive(token, productId, !product.active)
      await loadProducts()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update product status')
    }
  }

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault()
  }

  const filteredProducts = products.filter((product) => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return true
    return (
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      (product.bulletPoints ?? []).some((point) => point.toLowerCase().includes(q)) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      (product.size ?? []).some((s) => s.toLowerCase().includes(q)) ||
      String(product.id).includes(q)
    )
  })

  return (
    <div className="admin-page-root">
      <AdminNavbar />

      <main className={`${ADMIN_MAIN_SCROLL_CLASS} overflow-x-hidden`}>
        <div style={{ ...ADMIN_PAGE_HEADER_SPACING, maxWidth: '100%', minWidth: 0 }}>
          <h1 style={ADMIN_PAGE_TITLE}>Admin Products</h1>
          <p style={ADMIN_PAGE_SUBTITLE}>Add, update, and manage product inventory.</p>
        </div>

        <section
          style={{
            background: '#fff',
            border: '1px solid #dbe3ee',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '18px',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {editingId !== null ? 'Edit Product' : 'Add Product'}
          </h2>

          <form onSubmit={onSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '12px' }}>
              <div style={{ gridColumn: 'span 8' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Product Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={onInputChange('name')}
                  placeholder="Enter product name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  style={{
                    width: '100%',
                    border: fieldErrors.name ? borderError : borderNormal,
                    borderRadius: '10px',
                    padding: '11px 12px',
                  }}
                />
                {fieldErrors.name && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#dc2626' }}>{fieldErrors.name}</p>
                )}
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  SKU <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={form.sku}
                  onChange={onInputChange('sku')}
                  placeholder="SKU"
                  aria-invalid={Boolean(fieldErrors.sku)}
                  style={{
                    width: '100%',
                    border: fieldErrors.sku ? borderError : borderNormal,
                    borderRadius: '10px',
                    padding: '11px 12px',
                  }}
                />
                {fieldErrors.sku && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#dc2626' }}>{fieldErrors.sku}</p>
                )}
              </div>

              <div style={{ gridColumn: 'span 12' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Description <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                    clearFieldError('description')
                  }}
                  placeholder="Enter product description"
                  aria-invalid={Boolean(fieldErrors.description)}
                  rows={3}
                  style={{
                    width: '100%',
                    border: fieldErrors.description ? borderError : borderNormal,
                    borderRadius: '10px',
                    padding: '11px 12px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
                {fieldErrors.description && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#dc2626' }}>{fieldErrors.description}</p>
                )}
              </div>

              <div style={{ gridColumn: 'span 12' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Bullet Points <span style={{ color: '#dc2626' }}>*</span>{' '}
                  <span style={{ fontWeight: 400, color: '#475569' }}>(one per line)</span>
                </label>
                <textarea
                  value={form.bulletPoints}
                  onChange={(e) => setForm((prev) => ({ ...prev, bulletPoints: e.target.value }))}
                  placeholder={'e.g.\nLong-lasting performance\nLow maintenance'}
                  rows={3}
                  style={{
                    width: '100%',
                    border: borderNormal,
                    borderRadius: '10px',
                    padding: '11px 12px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Category <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                      setCategorySuggestionsOpen(true)
                      clearFieldError('category')
                    }}
                    onFocus={() => setCategorySuggestionsOpen(true)}
                    onBlur={() => {
                      window.setTimeout(() => setCategorySuggestionsOpen(false), 200)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        setCategorySuggestionsOpen(false)
                      }
                    }}
                    placeholder="Type or pick a category"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={categorySuggestionsOpen}
                    role="combobox"
                    aria-invalid={Boolean(fieldErrors.category)}
                    style={{
                      width: '100%',
                      border: fieldErrors.category ? borderError : borderNormal,
                      borderRadius: '10px',
                      padding: '11px 12px',
                      fontSize: '14px',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                  {categorySuggestionsOpen && categorySuggestionsFiltered.length > 0 && (
                    <ul
                      role="listbox"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '100%',
                        margin: '4px 0 0',
                        padding: 0,
                        listStyle: 'none',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        background: '#fff',
                        zIndex: 40,
                      }}
                    >
                      {categorySuggestionsFiltered.map((opt, index) => (
                        <li
                          key={opt}
                          role="option"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setForm((prev) => ({ ...prev, category: opt }))
                            setCategorySuggestionsOpen(false)
                            clearFieldError('category')
                          }}
                          style={{
                            padding: '10px 12px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            borderBottom:
                              index < categorySuggestionsFiltered.length - 1 ? '1px solid #f3f4f6' : 'none',
                          }}
                        >
                          {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {categorySuggestionsOpen &&
                    form.category.trim().length > 0 &&
                    categorySuggestionsFiltered.length === 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '100%',
                          marginTop: '4px',
                          padding: '10px 12px',
                          fontSize: '13px',
                          color: '#64748b',
                          border: '1px solid #e5e7eb',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          zIndex: 40,
                        }}
                      >
                        No matches — this will be saved as a new category.
                      </div>
                    )}
                </div>
                {fieldErrors.category && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#dc2626' }}>{fieldErrors.category}</p>
                )}
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Size <span style={{ fontWeight: 400, color: '#475569' }}>(optional)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  {sizeOptions.map((option) => {
                    const selected = form.size.includes(option)
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            size: prev.size.includes(option)
                              ? prev.size.filter((s) => s !== option)
                              : [...prev.size, option],
                          }))
                        }}
                        style={{
                          minWidth: '40px',
                          height: '36px',
                          padding: '0 10px',
                          borderRadius: '8px',
                          border: selected ? '2px solid #bd162c' : '1px solid #d1d5db',
                          background: selected ? 'rgba(189, 22, 44, 0.08)' : '#fff',
                          color: selected ? '#bd162c' : '#374151',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          lineHeight: 1,
                          transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                        }}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Price (Rs.) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={form.price}
                  onChange={onInputChange('price')}
                  type="number"
                  min={1}
                  placeholder="Price"
                  aria-invalid={Boolean(fieldErrors.price)}
                  style={{
                    width: '100%',
                    border: fieldErrors.price ? borderError : borderNormal,
                    borderRadius: '10px',
                    padding: '11px 12px',
                  }}
                />
                {fieldErrors.price && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#dc2626' }}>{fieldErrors.price}</p>
                )}
              </div>

              <div style={{ gridColumn: 'span 8' }}>
                <label
                  htmlFor="product-images"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}
                >
                  Product Images (max 4, up to 5 MB each)
                </label>
                <input
                  key={fileInputKey}
                  id="product-images"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  aria-invalid={Boolean(fieldErrors.images)}
                  style={{
                    width: '100%',
                    border: fieldErrors.images ? borderError : borderNormal,
                    borderRadius: '10px',
                    padding: '9px 10px',
                  }}
                />
                {fieldErrors.images && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#dc2626' }}>{fieldErrors.images}</p>
                )}
                {editingId !== null && editingImages.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                      Current images
                      <span style={{ fontWeight: 400, color: '#6b7280' }}>
                        {' '}
                        — click × to remove; save to apply
                      </span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {editingImages.map((img, index) => (
                        <div key={`${img.path}-${index}`} style={{ position: 'relative' }}>
                          <img
                            src={img.url}
                            alt={`Product image ${index + 1}`}
                            style={{ ...productImageThumbStyle, background: '#f3f4f6' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeEditingImage(index)}
                            aria-label={`Remove product image ${index + 1}`}
                            style={imageRemoveButtonStyle}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {editingId !== null && uploadFiles.length === 0 && editingImages.length === 0 && (
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
                    No images on this product. Upload at least one image to save.
                  </p>
                )}
                {uploadFiles.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#374151' }}>
                      Selected: {uploadFiles.length} image{uploadFiles.length === 1 ? '' : 's'} —{' '}
                      <span style={{ wordBreak: 'break-word' }}>
                        {uploadFiles.map((f) => f.name).join(', ')}
                      </span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {uploadFiles.map((file, index) => (
                        <div key={`${file.name}-${file.lastModified}`} style={{ position: 'relative' }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={productImageThumbStyle}
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadFile(index)}
                            aria-label={`Remove ${file.name}`}
                            style={imageRemoveButtonStyle}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Stock <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={form.stock}
                  onChange={onInputChange('stock')}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  aria-invalid={Boolean(fieldErrors.stock)}
                  style={{
                    width: '100%',
                    border: fieldErrors.stock ? borderError : borderNormal,
                    borderRadius: '10px',
                    padding: '11px 12px',
                  }}
                />
                {fieldErrors.stock && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#dc2626' }}>{fieldErrors.stock}</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type="submit" style={btnPrimary} disabled={saving || !token}>
                {saving ? 'Saving…' : editingId !== null ? 'Update product' : 'Add product'}
              </button>
              {editingId !== null && (
                <button type="button" onClick={resetForm} style={btnGhost}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          className="admin-product-list-section"
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              Product List
            </h2>
            <form
              onSubmit={onSearch}
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '8px',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products"
                style={{
                  width: '220px',
                  maxWidth: 'min(260px, 42vw)',
                  minWidth: '120px',
                  flex: '0 1 auto',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '9px 10px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <button type="submit" style={btnPrimary}>
                Search
              </button>
            </form>
          </div>

          <div className="admin-product-list-table-wrap" style={{ padding: '8px 10px 10px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['ID', 'Images', 'SKU', 'Name', 'Description', 'Highlights', 'Category', 'Size', 'Price', 'Stock', 'Status', 'Actions'].map((head) => (
                    <th
                      key={head}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        ...(head === 'Actions' ? { whiteSpace: 'nowrap' as const, minWidth: '310px' } : {}),
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={12} style={{ padding: '18px 14px', textAlign: 'center', color: '#6b7280' }}>
                      Loading products…
                    </td>
                  </tr>
                )}
                {!loading && filteredProducts.map((product) => {
                  const outOfStock = product.stock === 0
                  const listingActive = product.active
                  const inactiveRow = !listingActive
                  return (
                    <tr
                      key={product.id}
                      style={{
                        background: inactiveRow ? INACTIVE_ROW_BG : undefined,
                        boxShadow: inactiveRow ? `inset 4px 0 0 ${INACTIVE_ROW_ACCENT}` : undefined,
                      }}
                    >
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#374151' : '#4b5563',
                          verticalAlign: 'top',
                        }}
                      >
                        {product.id}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          verticalAlign: 'top',
                        }}
                      >
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={`${product.name} preview`}
                            style={{
                              width: '44px',
                              height: '44px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: inactiveRow ? `1px solid ${INACTIVE_IMG_BORDER}` : '1px solid #e5e7eb',
                              background: inactiveRow ? INACTIVE_IMG_BG : '#f9fafb',
                              display: 'block',
                              filter: inactiveRow ? 'brightness(0.96)' : undefined,
                            }}
                          />
                        ) : (
                          <span style={{ color: inactiveRow ? '#9f1239' : '#9ca3af', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#1e293b' : '#111827',
                          fontFamily: 'monospace',
                          verticalAlign: 'top',
                        }}
                      >
                        {product.sku}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#0f172a' : '#111827',
                          fontWeight: 600,
                          verticalAlign: 'top',
                        }}
                      >
                        {product.name}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#334155' : '#4b5563',
                          maxWidth: '260px',
                          verticalAlign: 'top',
                          lineHeight: 1.4,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                          title={product.description}
                        >
                          {product.description}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#334155' : '#4b5563',
                          maxWidth: '260px',
                          verticalAlign: 'top',
                        }}
                      >
                        {(product.bulletPoints ?? []).length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '16px', display: 'grid', gap: '4px' }}>
                            {(product.bulletPoints ?? []).slice(0, 2).map((point) => (
                              <li key={point} style={{ fontSize: '13px', lineHeight: 1.35 }}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#334155' : '#4b5563',
                          verticalAlign: 'top',
                        }}
                      >
                        {product.category}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#334155' : '#4b5563',
                          verticalAlign: 'top',
                        }}
                      >
                        {(product.size ?? []).length > 0 ? (product.size ?? []).join(', ') : '-'}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#0f172a' : '#111827',
                          verticalAlign: 'top',
                        }}
                      >
                        {formatRs(product.price)}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          color: inactiveRow ? '#0f172a' : '#111827',
                          verticalAlign: 'top',
                        }}
                      >
                        {product.stock}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          verticalAlign: 'top',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              borderRadius: '999px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: outOfStock ? '#b91c1c' : '#166534',
                              background: outOfStock ? '#fee2e2' : '#dcfce7',
                            }}
                          >
                            {outOfStock ? 'Out of stock' : 'In stock'}
                          </span>
                          <span
                            style={{
                              display: 'inline-block',
                              borderRadius: '999px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: listingActive ? '#166534' : '#9f1239',
                              background: listingActive ? '#dcfce7' : '#ffe4e6',
                              minWidth: '72px',
                              textAlign: 'center',
                              boxSizing: 'border-box',
                            }}
                          >
                            {listingActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          borderBottom: inactiveRow ? `1px solid ${INACTIVE_ROW_BORDER}` : '1px solid #f3f4f6',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                          minWidth: '310px',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            alignItems: 'stretch',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => onEdit(product)}
                            style={{
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: '#1f2937',
                              background: '#fff',
                              cursor: 'pointer',
                              flexShrink: 0,
                              fontSize: '12px',
                              fontWeight: 600,
                              lineHeight: 1.25,
                              boxSizing: 'border-box',
                              minHeight: '32px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleProductActive(product.id)}
                            aria-label={listingActive ? 'Deactivate product' : 'Activate product'}
                            style={{
                              border: listingActive ? '1px solid #fcd34d' : '1px solid #86efac',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: listingActive ? '#92400e' : '#166534',
                              background: listingActive ? '#fffbeb' : '#f0fdf4',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '12px',
                              flexShrink: 0,
                              lineHeight: 1.25,
                              boxSizing: 'border-box',
                              minWidth: '104px',
                              minHeight: '32px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                            }}
                          >
                            {listingActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(product.id)}
                            style={{
                              border: '1px solid #fecaca',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              color: '#b91c1c',
                              background: '#fff',
                              cursor: 'pointer',
                              flexShrink: 0,
                              fontSize: '12px',
                              fontWeight: 600,
                              lineHeight: 1.25,
                              boxSizing: 'border-box',
                              minHeight: '32px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        padding: '18px 14px',
                        textAlign: 'center',
                        color: '#6b7280',
                        borderBottom: '1px solid #f3f4f6',
                      }}
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

/** Same as Admin Blog Publish / primary actions */
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

export default AdminProducts