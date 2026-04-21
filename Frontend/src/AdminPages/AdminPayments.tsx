import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'

const AdminPayments = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <h1 style={ADMIN_PAGE_TITLE}>Payments & Invoices</h1>
        </div>
      </main>
    </div>
  )
}

export default AdminPayments