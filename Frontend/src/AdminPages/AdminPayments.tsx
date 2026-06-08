import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'

type PaymentSource = 'service' | 'ecommerce'
type PaymentMethod = 'COD' | 'eSewa' | 'Khalti'
type PaymentStatus = 'paid' | 'pending' | 'failed'

type PaymentRecord = {
  id: string
  reference: string
  source: PaymentSource
  customerName: string
  customerEmail: string
  date: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  note: string
}

const PAYMENT_ROWS: PaymentRecord[] = [
  {
    id: 'pay-001',
    reference: 'SRV-2026-0001',
    source: 'service',
    customerName: 'Ramesh KC',
    customerEmail: 'ramesh.kc@example.com',
    date: '2026-05-02',
    amount: 2400,
    method: 'COD',
    status: 'pending',
    note: 'Workshop service booking payment pending at counter.',
  },
  {
    id: 'pay-002',
    reference: 'ORD-2026-0142',
    source: 'ecommerce',
    customerName: 'Anita Sharma',
    customerEmail: 'anita.s@example.com',
    date: '2026-05-03',
    amount: 9800,
    method: 'eSewa',
    status: 'paid',
    note: 'Order paid online via eSewa.',
  },
  {
    id: 'pay-003',
    reference: 'ORD-2026-0143',
    source: 'ecommerce',
    customerName: 'Bikash Thapa',
    customerEmail: 'bikash.t@example.com',
    date: '2026-05-03',
    amount: 5200,
    method: 'Khalti',
    status: 'paid',
    note: 'Spare parts purchase settled from Khalti wallet.',
  },
  {
    id: 'pay-004',
    reference: 'SRV-2026-0002',
    source: 'service',
    customerName: 'Sita Gurung',
    customerEmail: 'sita.gurung@example.com',
    date: '2026-05-04',
    amount: 1800,
    method: 'Khalti',
    status: 'paid',
    note: 'Tyre repair pickup service paid through Khalti.',
  },
  {
    id: 'pay-005',
    reference: 'ORD-2026-0144',
    source: 'ecommerce',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    date: '2026-05-04',
    amount: 3500,
    method: 'COD',
    status: 'pending',
    note: 'Cash on delivery to be collected at delivery.',
  },
  {
    id: 'pay-006',
    reference: 'SRV-2026-0003',
    source: 'service',
    customerName: 'Diya Patel',
    customerEmail: 'diya.patel@example.com',
    date: '2026-05-05',
    amount: 4600,
    method: 'eSewa',
    status: 'failed',
    note: 'eSewa transaction failed. Customer asked for retry.',
  },
]

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

function SourceBadge({ source }: { source: PaymentSource }) {
  const map: Record<PaymentSource, { label: string; bg: string; color: string }> = {
    service: { label: 'Service', bg: '#e0f2fe', color: '#075985' },
    ecommerce: { label: 'E-commerce', bg: '#eef2ff', color: '#4338ca' },
  }
  const s = map[source]
  return (
    <span style={{ ...chipBaseStyle, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const map: Record<PaymentMethod, { bg: string; color: string }> = {
    COD: { bg: '#f1f5f9', color: '#475569' },
    eSewa: { bg: '#dcfce7', color: '#166534' },
    Khalti: { bg: '#ede9fe', color: '#5b21b6' },
  }
  const m = map[method]
  return (
    <span style={{ ...chipBaseStyle, backgroundColor: m.bg, color: m.color }}>
      {method}
    </span>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; bg: string; color: string }> = {
    paid: { label: 'Paid', bg: '#dcfce7', color: '#166534' },
    pending: { label: 'Pending', bg: '#fef3c7', color: '#b45309' },
    failed: { label: 'Failed', bg: '#fee2e2', color: '#b91c1c' },
  }
  const s = map[status]
  return (
    <span style={{ ...chipBaseStyle, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

const AdminPayments = () => {
  const [searchInput, setSearchInput] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | PaymentSource>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all')

  const filteredRows = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    return PAYMENT_ROWS.filter((row) => {
      if (sourceFilter !== 'all' && row.source !== sourceFilter) return false
      if (methodFilter !== 'all' && row.method !== methodFilter) return false
      if (!q) return true
      const haystack = [row.reference, row.customerName, row.customerEmail, row.source, row.method, row.status, row.note]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [searchInput, sourceFilter, methodFilter])

  const totals = useMemo(() => {
    const paidAmount = filteredRows.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0)
    const pendingAmount = filteredRows.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)
    const totalAmount = filteredRows.reduce((sum, r) => sum + r.amount, 0)
    return {
      totalCount: filteredRows.length,
      totalAmount,
      paidAmount,
      pendingAmount,
    }
  }, [filteredRows])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={ADMIN_PAGE_TITLE}>Payments</h1>
          <p style={ADMIN_PAGE_SUBTITLE}>
            All payment details from Service and E-commerce orders, including COD, eSewa, and Khalti.
          </p>
        </div>

        <div style={cardStyle}>
          <form
            onSubmit={onSearchSubmit}
            style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'minmax(220px, 1fr) minmax(160px, 220px) minmax(160px, 220px)',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by reference, customer, method..."
              style={inputStyle}
            />
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as 'all' | PaymentSource)} style={inputStyle}>
              <option value="all">All sources</option>
              <option value="service">Service</option>
              <option value="ecommerce">E-commerce</option>
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as 'all' | PaymentMethod)} style={inputStyle}>
              <option value="all">All methods</option>
              <option value="COD">COD</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
            </select>
          </form>
        </div>

        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', marginBottom: '14px' }}>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Records</p>
            <p style={metricValueStyle}>{totals.totalCount}</p>
          </div>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Total amount</p>
            <p style={metricValueStyle}>{formatRs(totals.totalAmount)}</p>
          </div>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Paid amount</p>
            <p style={{ ...metricValueStyle, color: '#166534' }}>{formatRs(totals.paidAmount)}</p>
          </div>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Pending amount</p>
            <p style={{ ...metricValueStyle, color: '#b45309' }}>{formatRs(totals.pendingAmount)}</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thStyle}>Reference</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                        {row.reference}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <SourceBadge source={row.source} />
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.customerName}</span>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{row.customerEmail}</div>
                    </td>
                    <td style={tdStyle}>{row.date}</td>
                    <td style={tdStyle}>
                      <MethodBadge method={row.method} />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{formatRs(row.amount)}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No payments match your filters.
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

const cardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '14px',
  marginBottom: '14px',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
}

const metricCardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '12px',
}

const metricLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: '#64748b',
  fontWeight: 600,
}

const metricValueStyle: CSSProperties = {
  margin: '6px 0 0',
  fontSize: '20px',
  color: '#0f172a',
  fontWeight: 800,
}

const chipBaseStyle: CSSProperties = {
  display: 'inline-block',
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: '13px',
  color: '#334155',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '12px 14px',
  fontSize: '14px',
  color: '#475569',
  verticalAlign: 'top',
}

export default AdminPayments