import { useMemo, useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
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

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
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

  const onInputChange =
    (field: keyof ProductForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setUploadFiles([])
    setFileInputKey((k) => k + 1)
    setCategorySuggestionsOpen(false)
    setError('')
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    if (uploadFiles.length >= 4) {
      setError('You can upload maximum 4 images.')
      return
    }

    const alreadyAdded = uploadFiles.some(
      (f) => f.name === nextFile.name && f.size === nextFile.size && f.lastModified === nextFile.lastModified
    )
    if (alreadyAdded) {
      setError('This image is already selected.')
      return
    }

    setError('')
    setUploadFiles((prev) => [...prev, nextFile])
  }

  const removeUploadFile = (indexToRemove: number) => {
    setUploadFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    setError('')
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedSku = form.sku.trim().toUpperCase()
    const trimmedName = form.name.trim()
    const trimmedCategory = form.category.trim()
    const finalSizes = sortSizes([...new Set(form.size)])
    const parsedPrice = Number(form.price)
    const parsedStock = Number(form.stock)

    if (!trimmedSku || !trimmedName || !trimmedCategory) {
      setError('SKU, name, and category are required.')
      return
    }

    const duplicateSku = products.some((p) => p.sku === trimmedSku && p.id !== editingId)
    if (duplicateSku) {
      setError('SKU already exists. Use a unique SKU.')
      return
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Price must be a valid number greater than 0.')
      return
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      setError('Stock must be a whole number (0 or more).')
      return
    }

    const editingProduct = editingId !== null ? products.find((p) => p.id === editingId) : null
    const existingImages = editingProduct?.images ?? []
    const finalImageUrls =
      uploadFiles.length > 0
        ? uploadFiles.map((file) => URL.createObjectURL(file))
        : existingImages

    if (finalImageUrls.length < 1) {
      setError('Minimum 1 image is required.')
      return
    }

    if (finalImageUrls.length > 4) {
      setError('Maximum 4 images allowed.')
      return
    }

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
      ...prev,
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
    setError('')
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

      <main style={{ marginLeft: '280px', padding: '24px 24px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
          Admin Products
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Add, update, and manage product inventory.
        </p>

        <section
          style={{
            background: '#fff',
            border: '1px solid #dbe3ee',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '18px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {editingId !== null ? 'Edit Product' : 'Add Product'}
          </h2>

          <form onSubmit={onSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '12px' }}>
              <div style={{ gridColumn: 'span 8' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Product Name
                </label>
                <input
                  value={form.name}
                  onChange={onInputChange('name')}
                  placeholder="Enter product name"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '11px 12px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  SKU
                </label>
                <input
                  value={form.sku}
                  onChange={onInputChange('sku')}
                  placeholder="SKU"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '11px 12px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Category
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                      setCategorySuggestionsOpen(true)
                      setError('')
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
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
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
                        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
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
                            setError('')
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
                          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
                          zIndex: 40,
                        }}
                      >
                        No matches — this will be saved as a new category.
                      </div>
                    )}
                </div>
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
                  Price (Rs.)
                </label>
                <input
                  value={form.price}
                  onChange={onInputChange('price')}
                  type="number"
                  min={1}
                  placeholder="Price"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '11px 12px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 8' }}>
                <label
                  htmlFor="product-images"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}
                >
                  Product Images (min 1, max 4)
                </label>
                <input
                  key={fileInputKey}
                  id="product-images"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '9px 10px' }}
                />
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
                  Stock
                </label>
                <input
                  value={form.stock}
                  onChange={onInputChange('stock')}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '11px 12px' }}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: '#dc2626', margin: '10px 0 0', fontSize: '14px' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="submit"
                style={{
                  border: 0,
                  borderRadius: '999px',
                  padding: '11px 20px',
                  fontWeight: 700,
                  color: '#fff',
                  background: '#bd162c',
                  boxShadow: '0 8px 20px rgba(189, 22, 44, 0.28)',
                  letterSpacing: '0.2px',
                  cursor: 'pointer',
                }}
              >
                {editingId !== null ? 'Update product' : 'Add product'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontWeight: 600,
                    color: '#374151',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
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
              <button
                type="submit"
                style={{
                  border: 0,
                  borderRadius: '8px',
                  padding: '9px 14px',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#fff',
                  background: '#111827',
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </form>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['ID', 'SKU', 'Name', 'Category', 'Size', 'Images', 'Price', 'Stock', 'Status', 'Actions'].map((head) => (
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
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>
                        {product.images.length} image{product.images.length === 1 ? '' : 's'}
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

export default AdminProducts