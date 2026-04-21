import type { CSSProperties, FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { FiPlus, FiPrinter, FiTrash2 } from 'react-icons/fi'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import GMWLogo from '../assets/GMWlogo.png'

type InvoiceLine = {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

type Invoice = {
  id: string
  invoiceNumber: string
  issuedAt: string
  dueAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  lines: InvoiceLine[]
  /** 0–100; omit or 0 = no discount */
  discountPercent?: number
  paymentTerms: string
}

const TAX_RATE = 0.13

const COMPANY = {
  name: 'General Mechanical Works',
  tagline: 'Motorcycle & automotive parts · Service · Repairs',
  address: 'Kathmandu Valley, Nepal',
  phone: '+977 1-XXXXXXX',
  email: 'generalmechanicalworks46@gmail.com',
  vatPan: 'VAT / PAN: 60XXXXXXX',
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatRs(n: number) {
  return `Rs. ${Math.round(n).toLocaleString('en-IN')}`
}

function lineAmount(line: InvoiceLine) {
  return Math.max(0, line.quantity) * Math.max(0, line.unitPrice)
}

function invoiceSubtotal(inv: Invoice) {
  return inv.lines.reduce((s, l) => s + lineAmount(l), 0)
}

function clampDiscountPercent(pct: number) {
  if (!Number.isFinite(pct) || pct < 0) return 0
  return Math.min(100, pct)
}

function invoiceDiscountPercent(inv: Invoice) {
  return clampDiscountPercent(inv.discountPercent ?? 0)
}

function invoiceDiscountAmount(inv: Invoice) {
  const sub = invoiceSubtotal(inv)
  const pct = invoiceDiscountPercent(inv)
  if (pct <= 0) return 0
  return Math.round(sub * (pct / 100))
}

function invoiceAmountAfterDiscount(inv: Invoice) {
  return Math.max(0, invoiceSubtotal(inv) - invoiceDiscountAmount(inv))
}

function invoiceVat(inv: Invoice) {
  return Math.round(invoiceAmountAfterDiscount(inv) * TAX_RATE)
}

function invoiceGrandTotal(inv: Invoice) {
  return invoiceAmountAfterDiscount(inv) + invoiceVat(inv)
}

const emptyLine = (): InvoiceLine => ({
  id: uid(),
  description: '',
  quantity: 1,
  unitPrice: 0,
})

const borderNormal = '1px solid #e2e8f0'
const inputSm: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '13px',
  boxSizing: 'border-box',
  outline: 'none',
}

const btnPrimary: CSSProperties = {
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  backgroundColor: '#bd162c',
  border: '1px solid #991b1b',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
}

const btnGhost: CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
  backgroundColor: '#fff',
  border: borderNormal,
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

const AdminBill = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const selected = invoices.find((i) => i.id === selectedId) ?? null

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return invoices
    return invoices.filter((inv) => {
      const blob = [
        inv.invoiceNumber,
        inv.customerName,
        inv.customerEmail,
        inv.customerPhone,
        ...inv.lines.map((l) => l.description),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [invoices, search])

  const nextInvoiceNumber = useMemo(() => {
    const nums = invoices.map((i) => {
      const m = i.invoiceNumber.match(/INV-(\d{4})-(\d+)/)
      if (!m) return 0
      return parseInt(m[2], 10) || 0
    })
    const max = nums.length ? Math.max(...nums) : 0
    const year = new Date().getFullYear()
    return `INV-${year}-${String(max + 1).padStart(4, '0')}`
  }, [invoices])

  const patchSelected = (patch: Partial<Invoice>) => {
    if (!selectedId) return
    setInvoices((prev) => prev.map((i) => (i.id === selectedId ? { ...i, ...patch } : i)))
  }

  const patchLine = (lineId: string, patch: Partial<InvoiceLine>) => {
    if (!selected) return
    setInvoices((prev) =>
      prev.map((i) =>
        i.id !== selectedId
          ? i
          : {
              ...i,
              lines: i.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
            }
      )
    )
  }

  const addLine = () => {
    if (!selectedId) return
    setInvoices((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, lines: [...i.lines, emptyLine()] } : i))
    )
  }

  const removeLine = (lineId: string) => {
    if (!selected || selected.lines.length <= 1) return
    setInvoices((prev) =>
      prev.map((i) =>
        i.id !== selectedId ? i : { ...i, lines: i.lines.filter((l) => l.id !== lineId) }
      )
    )
  }

  const createInvoice = () => {
    const today = new Date().toISOString().slice(0, 10)
    const due = new Date()
    due.setDate(due.getDate() + 15)
    const newInv: Invoice = {
      id: uid(),
      invoiceNumber: nextInvoiceNumber,
      issuedAt: today,
      dueAt: due.toISOString().slice(0, 10),
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      lines: [emptyLine()],
      paymentTerms: 'Net 15',
    }
    setInvoices((prev) => [newInv, ...prev])
    setSelectedId(newInv.id)
  }

  const deleteInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id)
    if (!inv) return
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber}? This cannot be undone.`)) return
    const next = invoices.filter((i) => i.id !== id)
    setInvoices(next)
    if (selectedId === id) {
      const q = search.trim().toLowerCase()
      const matchesFilter = (i: Invoice) => {
        if (!q) return true
        const blob = [
          i.invoiceNumber,
          i.customerName,
          i.customerEmail,
          i.customerPhone,
          ...i.lines.map((l) => l.description),
        ]
          .join(' ')
          .toLowerCase()
        return blob.includes(q)
      }
      const candidates = next.filter(matchesFilter)
      setSelectedId(candidates[0]?.id ?? next[0]?.id ?? null)
    }
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
  }

  const printInvoice = () => {
    window.print()
  }

  const subtotal = selected ? invoiceSubtotal(selected) : 0
  const discountPct = selected ? invoiceDiscountPercent(selected) : 0
  const discountAmt = selected ? invoiceDiscountAmount(selected) : 0
  const tax = selected ? invoiceVat(selected) : 0
  const total = selected ? invoiceGrandTotal(selected) : 0

  return (
    <div className="admin-bill-page">
      <style>{`
        @media print {
          .admin-bill-no-print { display: none !important; }
          .admin-bill-print-only { display: block !important; }
          .admin-bill-print-only-inline { display: inline !important; }
          .admin-bill-page aside { display: none !important; }
          .admin-bill-page main {
            margin-left: 0 !important;
            padding: 12px 16px !important;
            max-height: none !important;
            overflow: visible !important;
            background: #fff !important;
          }
          .admin-bill-invoice-sheet {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            padding: 24px !important;
          }
          .admin-bill-invoice-sheet input,
          .admin-bill-invoice-sheet textarea {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 2px 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .admin-bill-invoice-sheet textarea {
            overflow: hidden !important;
          }
        }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <AdminNavbar />
        <main style={ADMIN_MAIN_SCROLL}>
          <div
            className="admin-bill-no-print"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            <div>
              <h1 style={ADMIN_PAGE_TITLE}>Invoices</h1>
              <p style={ADMIN_PAGE_SUBTITLE}>Create, edit, and print professional bills for customers.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <form onSubmit={onSearch}>
                <input
                  type="search"
                  placeholder="Search invoices…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ ...inputSm, minWidth: '200px' }}
                />
              </form>
              <button type="button" style={btnPrimary} onClick={createInvoice}>
                <FiPlus size={18} />
                New invoice
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <aside
              className="admin-bill-no-print"
              style={{
                width: '280px',
                flex: '0 0 auto',
                maxHeight: 'calc(100vh - 180px)',
                overflowY: 'auto',
                border: borderNormal,
                borderRadius: '12px',
                backgroundColor: '#fff',
                padding: '12px',
                boxSizing: 'border-box',
              }}
            >
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                All invoices ({filteredList.length})
              </p>
              {filteredList.length === 0 ? (
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  {invoices.length === 0
                    ? 'No invoices yet. Click New invoice to create one.'
                    : 'No matches for your search.'}
                </p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {filteredList.map((inv) => {
                    const active = inv.id === selectedId
                    return (
                      <li key={inv.id} style={{ marginBottom: '8px' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '4px',
                            alignItems: 'stretch',
                            padding: '10px 10px 10px 12px',
                            borderRadius: '8px',
                            border: active ? '1px solid #fecaca' : borderNormal,
                            backgroundColor: active ? '#fef2f2' : '#f8fafc',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedId(inv.id)}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              textAlign: 'left',
                              padding: 0,
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              font: 'inherit',
                              color: 'inherit',
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                              {inv.invoiceNumber}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                              {inv.customerName || 'No customer'}
                            </div>
                            <div style={{ marginTop: '8px', textAlign: 'right' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                                {formatRs(invoiceGrandTotal(inv))}
                              </span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteInvoice(inv.id)}
                            aria-label={`Delete invoice ${inv.invoiceNumber}`}
                            title="Delete invoice"
                            style={{
                              flex: '0 0 auto',
                              alignSelf: 'flex-start',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '36px',
                              height: '36px',
                              marginTop: '-2px',
                              marginRight: '-2px',
                              border: 'none',
                              borderRadius: '6px',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: '#94a3b8',
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </aside>

            <div style={{ flex: '1 1 480px', minWidth: 0 }}>
              {!selected ? (
                <p style={{ color: '#64748b' }}>
                  {invoices.length === 0
                    ? 'Create a new invoice to get started — customer details and line items are filled in here.'
                    : 'Select an invoice from the list, or create a new one.'}
                </p>
              ) : (
                <>
                  <div
                    className="admin-bill-no-print"
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}
                  >
                    <button type="button" style={{ ...btnGhost, borderColor: '#cbd5e1' }} onClick={printInvoice}>
                      <FiPrinter size={16} />
                      Print / Save PDF
                    </button>
                  </div>

                  <article
                    className="admin-bill-invoice-sheet"
                    style={{
                      backgroundColor: '#fff',
                      border: borderNormal,
                      borderRadius: '12px',
                      padding: '36px 40px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      boxSizing: 'border-box',
                    }}
                  >
                    <header
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '24px',
                        flexWrap: 'wrap',
                        paddingBottom: '24px',
                        borderBottom: '2px solid #0f172a',
                        marginBottom: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img
                          src={GMWLogo}
                          alt=""
                          style={{ width: '100px', height: '62px', objectFit: 'contain' }}
                        />
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                            {COMPANY.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{COMPANY.tagline}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.5 }}>
                            {COMPANY.address}
                            <br />
                            {COMPANY.phone} · {COMPANY.email}
                            <br />
                            {COMPANY.vatPan}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            color: '#bd162c',
                            marginBottom: '6px',
                          }}
                        >
                          TAX INVOICE
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                          {selected.invoiceNumber}
                        </div>
                        <div className="admin-bill-no-print" style={{ marginTop: '10px' }}>
                          <input
                            type="text"
                            value={selected.invoiceNumber}
                            onChange={(e) => patchSelected({ invoiceNumber: e.target.value })}
                            style={{ ...inputSm, maxWidth: '200px', marginLeft: 'auto', display: 'block' }}
                            aria-label="Invoice number"
                          />
                        </div>
                      </div>
                    </header>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginBottom: '28px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: '#64748b',
                            marginBottom: '10px',
                          }}
                        >
                          BILL TO
                        </div>
                        <div className="admin-bill-no-print" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Customer name"
                            value={selected.customerName}
                            onChange={(e) => patchSelected({ customerName: e.target.value })}
                            style={inputSm}
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={selected.customerEmail}
                            onChange={(e) => patchSelected({ customerEmail: e.target.value })}
                            style={inputSm}
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={selected.customerPhone}
                            onChange={(e) => patchSelected({ customerPhone: e.target.value })}
                            style={inputSm}
                          />
                          <textarea
                            placeholder="Address"
                            value={selected.customerAddress}
                            onChange={(e) => patchSelected({ customerAddress: e.target.value })}
                            rows={3}
                            style={{ ...inputSm, resize: 'vertical', fontFamily: 'inherit' }}
                          />
                        </div>
                        <div className="admin-bill-print-only" style={{ display: 'none', fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>
                          <strong>{selected.customerName || '—'}</strong>
                          <br />
                          {selected.customerEmail}
                          <br />
                          {selected.customerPhone}
                          <br />
                          {selected.customerAddress}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: '#64748b',
                            marginBottom: '10px',
                          }}
                        >
                          INVOICE DETAILS
                        </div>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '6px 0', color: '#64748b' }}>Issue date</td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>
                                <span className="admin-bill-no-print">
                                  <input
                                    type="date"
                                    value={selected.issuedAt}
                                    onChange={(e) => patchSelected({ issuedAt: e.target.value })}
                                    style={inputSm}
                                  />
                                </span>
                                <span className="admin-bill-print-only admin-bill-print-only-inline" style={{ display: 'none' }}>
                                  {selected.issuedAt}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '6px 0', color: '#64748b' }}>Due date</td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>
                                <span className="admin-bill-no-print">
                                  <input
                                    type="date"
                                    value={selected.dueAt}
                                    onChange={(e) => patchSelected({ dueAt: e.target.value })}
                                    style={inputSm}
                                  />
                                </span>
                                <span className="admin-bill-print-only admin-bill-print-only-inline" style={{ display: 'none' }}>
                                  {selected.dueAt}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '6px 0', color: '#64748b' }}>Payment terms</td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>
                                <span className="admin-bill-no-print">
                                  <input
                                    type="text"
                                    value={selected.paymentTerms}
                                    onChange={(e) => patchSelected({ paymentTerms: e.target.value })}
                                    style={inputSm}
                                  />
                                </span>
                                <span className="admin-bill-print-only admin-bill-print-only-inline" style={{ display: 'none' }}>
                                  {selected.paymentTerms}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '8px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, color: '#475569' }}>
                            Description
                          </th>
                          <th style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 700, color: '#475569', width: '72px' }}>
                            Qty
                          </th>
                          <th style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 700, color: '#475569', width: '110px' }}>
                            Rate
                          </th>
                          <th style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 700, color: '#475569', width: '120px' }}>
                            Amount
                          </th>
                          <th className="admin-bill-no-print" style={{ width: '44px' }} aria-hidden />
                        </tr>
                      </thead>
                      <tbody>
                        {selected.lines.map((line) => (
                          <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px', verticalAlign: 'top' }}>
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => patchLine(line.id, { description: e.target.value })}
                                placeholder="Line description"
                                style={{ ...inputSm, border: '1px solid transparent', backgroundColor: '#fafafa' }}
                              />
                            </td>
                            <td style={{ padding: '10px', verticalAlign: 'top' }}>
                              <input
                                type="number"
                                min={0}
                                step={1}
                                value={line.quantity || ''}
                                onChange={(e) =>
                                  patchLine(line.id, { quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })
                                }
                                style={{ ...inputSm, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '10px', verticalAlign: 'top' }}>
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={line.unitPrice || ''}
                                onChange={(e) =>
                                  patchLine(line.id, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })
                                }
                                style={{ ...inputSm, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, verticalAlign: 'top' }}>
                              {formatRs(lineAmount(line))}
                            </td>
                            <td className="admin-bill-no-print" style={{ padding: '10px', verticalAlign: 'top' }}>
                              <button
                                type="button"
                                onClick={() => removeLine(line.id)}
                                disabled={selected.lines.length <= 1}
                                aria-label="Remove line"
                                style={{
                                  padding: '8px',
                                  border: borderNormal,
                                  borderRadius: '6px',
                                  background: '#fff',
                                  cursor: selected.lines.length <= 1 ? 'not-allowed' : 'pointer',
                                  opacity: selected.lines.length <= 1 ? 0.4 : 1,
                                }}
                              >
                                <FiTrash2 size={16} color="#64748b" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="admin-bill-no-print" style={{ marginBottom: '20px' }}>
                      <button type="button" style={btnGhost} onClick={addLine}>
                        <FiPlus size={16} />
                        Add line
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '28px',
                      }}
                    >
                      <div style={{ width: 'min(100%, 280px)' }}>
                        <div className="admin-bill-no-print" style={{ marginBottom: '12px' }}>
                          <label
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#64748b',
                            }}
                          >
                            Discount (%){' '}
                            <span style={{ fontWeight: 500, color: '#94a3b8' }}>Optional — leave empty for none</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              placeholder="0"
                              value={discountPct === 0 ? '' : discountPct}
                              onChange={(e) => {
                                const raw = e.target.value
                                if (raw === '') {
                                  patchSelected({ discountPercent: 0 })
                                  return
                                }
                                const n = clampDiscountPercent(parseFloat(raw) || 0)
                                patchSelected({ discountPercent: n })
                              }}
                              style={{ ...inputSm, width: '100%' }}
                            />
                          </label>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            fontSize: '13px',
                            color: '#64748b',
                          }}
                        >
                          <span>Subtotal</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRs(subtotal)}</span>
                        </div>
                        {discountAmt > 0 ? (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '8px 0',
                              fontSize: '13px',
                              color: '#64748b',
                            }}
                          >
                            <span>Discount ({discountPct}%)</span>
                            <span style={{ fontWeight: 600, color: '#b91c1c' }}>−{formatRs(discountAmt)}</span>
                          </div>
                        ) : null}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            fontSize: '13px',
                            color: '#64748b',
                          }}
                        >
                          <span>VAT ({Math.round(TAX_RATE * 100)}%)</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRs(tax)}</span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 0 0',
                            marginTop: '8px',
                            borderTop: '2px solid #0f172a',
                            fontSize: '16px',
                            fontWeight: 800,
                            color: '#0f172a',
                          }}
                        >
                          <span>Total due</span>
                          <span style={{ color: '#bd162c' }}>{formatRs(total)}</span>
                        </div>
                      </div>
                    </div>

                    <footer
                      style={{
                        marginTop: '32px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e2e8f0',
                        fontSize: '11px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        lineHeight: 1.6,
                      }}
                    >
                      Thank you for choosing {COMPANY.name}. If you have any questions about this invoice, please
                      contact us at {COMPANY.email}.
                    </footer>
                  </article>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminBill
