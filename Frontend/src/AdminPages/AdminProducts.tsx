import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import Tyre from '../assets/Tyre.png'

type Product = {
  id: number
  sku: string
  name: string
  category: string
  size: string[]
  price: number
  stock: number
  images: string[]
}

type ProductForm = {
  sku: string
  name: string
  category: string
  size: string[]
  price: string
  stock: string
}

const defaultCategories = ['Lubricants', 'Brakes', 'Tyres', 'Electrical', 'Accessories']
const sizeOptions = ['XS', 'S', 'L', 'XL', 'XXL', 'XXXL'] as const

const sortSizes = (sizes: string[]) => {
  const order = new Map<string, number>(sizeOptions.map((s, i) => [s, i]))
  return [...sizes].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99))
}

const initialProducts: Product[] = [
  {
    id: 1,
    sku: 'SKU-1001',
    name: 'Premium Synthetic Engine Oil',
    category: 'Lubricants',
    size: ['S', 'L'],
    price: 3500,
    stock: 18,
    images: [EngineOil],
  },
  {
    id: 2,
    sku: 'SKU-1002',
    name: 'Brake Service Kit',
    category: 'Brakes',
    size: ['XL'],
    price: 5200,
    stock: 10,
    images: [Brakes],
  },
  {
    id: 3,
    sku: 'SKU-1003',
    name: 'All-weather Tyre 100/90-17',
    category: 'Tyres',
    size: ['XXL', 'XXXL'],
    price: 12500,
    stock: 0,
    images: [Tyre],
  },
]

const emptyForm: ProductForm = {
  sku: '',
  name: '',
  category: '',
  size: [],
  price: '',
  stock: '',
}

const formatRs = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`

type ProductFieldKey = 'name' | 'sku' | 'category' | 'price' | 'stock' | 'images'

const borderNormal = '1px solid #d1d5db'
const borderError = '1px solid #dc2626'

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
  const trimmedCategory = form.category.trim()
  const parsedPrice = Number(form.price)
  const parsedStock = Number(form.stock)

  if (!trimmedName) e.name = 'Product name is required.'
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

  const imageCount = uploadFiles.length > 0 ? uploadFiles.length : existingImageCount
  if (imageCount > 4) e.images = 'You can upload at most 4 images.'

  return e
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProductFieldKey, string>>>({})
  const [searchInput, setSearchInput] = useState('')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [categorySuggestionsOpen, setCategorySuggestionsOpen] = useState(false)

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
        field === 'name' || field === 'sku' || field === 'category' || field === 'price' || field === 'stock'
          ? field
          : undefined
      if (errKey) clearFieldError(errKey)
    }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setUploadFiles([])
    setFileInputKey((k) => k + 1)
    setCategorySuggestionsOpen(false)
    setFieldErrors({})
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    if (uploadFiles.length >= 4) {
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

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const editingProduct = editingId !== null ? products.find((p) => p.id === editingId) : null
    const existingImageCount = editingProduct?.images.length ?? 0

    const errors = validateProductForm(form, products, editingId, uploadFiles, existingImageCount)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const trimmedSku = form.sku.trim().toUpperCase()
    const trimmedName = form.name.trim()
    const trimmedCategory = form.category.trim()
    const finalSizes = sortSizes([...new Set(form.size)])
    const parsedPrice = Number(form.price)
    const parsedStock = Number(form.stock)

    const existingImages = editingProduct?.images ?? []
    const finalImageUrls =
      uploadFiles.length > 0
        ? uploadFiles.map((file) => URL.createObjectURL(file))
        : existingImages

    if (editingId !== null) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                sku: trimmedSku,
                name: trimmedName,
                category: trimmedCategory,
                size: finalSizes,
                price: parsedPrice,
                stock: parsedStock,
                images: finalImageUrls,
              }
            : p
        )
      )
      resetForm()
      return
    }

    setProducts((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
        sku: trimmedSku,
        name: trimmedName,
        category: trimmedCategory,
        size: finalSizes,
        price: parsedPrice,
        stock: parsedStock,
        images: finalImageUrls,
      },
    ])
    resetForm()
  }

  const onEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      size: product.size,
      price: String(product.price),
      stock: String(product.stock),
    })
    setCategorySuggestionsOpen(false)
    setUploadFiles([])
    setFileInputKey((k) => k + 1)
    setFieldErrors({})
  }

  const onDelete = (productId: number) => {
    const confirmed = window.confirm('Delete this product?')
    if (!confirmed) return

    setProducts((prev) => prev.filter((p) => p.id !== productId))
    if (editingId === productId) resetForm()
  }

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault()
  }

  const filteredProducts = products.filter((product) => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return true
    return (
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.size.some((s) => s.toLowerCase().includes(q)) ||
      String(product.id).includes(q)
    )
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />

      <main style={ADMIN_MAIN_SCROLL}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
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
                  Product Images (max 4)
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
                {editingId !== null && uploadFiles.length === 0 && (
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
                    No new files selected. Existing images will be kept.
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
                            style={{
                              width: '68px',
                              height: '68px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              background: '#fff',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadFile(index)}
                            aria-label={`Remove ${file.name}`}
                            style={{
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
                            }}
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
              <button type="submit" style={btnPrimary}>
                {editingId !== null ? 'Update product' : 'Add product'}
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
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              Product List
            </h2>
            <form onSubmit={onSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products"
                style={{
                  width: '260px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '9px 10px',
                  fontSize: '14px',
                }}
              />
              <button type="submit" style={btnPrimary}>
                Search
              </button>
            </form>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['ID', 'Images', 'SKU', 'Name', 'Category', 'Size', 'Price', 'Stock', 'Status', 'Actions'].map((head) => (
                    <th
                      key={head}
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const outOfStock = product.stock === 0
                  return (
                    <tr key={product.id}>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                        #{product.id}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' }}>
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={`${product.name} preview`}
                            style={{
                              width: '44px',
                              height: '44px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              background: '#f9fafb',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827', fontFamily: 'monospace' }}>
                        {product.sku}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827', fontWeight: 600 }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                        {product.category}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                        {product.size.length > 0 ? product.size.join(', ') : '-'}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>
                        {formatRs(product.price)}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>
                        {product.stock}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
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
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                            }}
                          >
                            Edit
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
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
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