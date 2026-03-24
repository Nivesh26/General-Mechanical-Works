import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL } from '../AdminComponent/adminMainStyles'

const AdminPayments = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>AdminPayments</main>
    </div>
  )
}

export default AdminPayments