import AdminNavbar from '../AdminComponent/AdminNavbar'

const AdminDashboard = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={{ marginLeft: '280px', padding: '24px' }}>
        this is admin dashboard
      </main>
    </div>
  )
}

export default AdminDashboard