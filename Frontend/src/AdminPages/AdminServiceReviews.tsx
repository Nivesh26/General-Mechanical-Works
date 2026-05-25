import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'

const AdminServiceReviews = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <h1 style={ADMIN_PAGE_TITLE}>Service reviews</h1>
        </div>
      </main>
    </div>
  )
}

export default AdminServiceReviews