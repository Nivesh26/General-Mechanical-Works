import { NavLink } from 'react-router-dom'
import {
  FiBox,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiUsers,
} from 'react-icons/fi'
import GMWLogo from '../assets/GMWlogo.png'

const AdminNavbar = () => {
  const navItems = [
    { label: 'Dashboard', to: '/admindashboard', icon: FiGrid },
    { label: 'Orders', to: '/admin/orders', icon: FiPackage },
    { label: 'Products', to: '/admin/products', icon: FiBox },
    { label: 'Users', to: '/admin/users', icon: FiUsers },
    { label: 'Settings', to: '/admin/settings', icon: FiSettings },
  ]

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#ffffff',
        color: '#111827',
        padding: '20px 14px 16px',
        boxSizing: 'border-box',
        borderRight: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <img
          src={GMWLogo}
          alt="General Mechanical Works"
          style={{
            width: '130px',
            height: '80px',
            objectFit: 'contain',
          }}
        />
        <p
          style={{
            margin: 0,
            marginTop: '4px',
            fontSize: '12px',
            textAlign: 'center',
            color: '#374151',
          }}
        >
          General Mechanical Works Admin
        </p>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              marginBottom: '6px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive ? '#1d4ed8' : '#374151',
              backgroundColor: isActive ? '#eff6ff' : 'transparent',
              transition: 'background-color 0.2s ease',
            })}
          >
            <item.icon size={16} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          backgroundColor: 'transparent',
          color: '#374151',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        <span
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <FiLogOut size={16} />
          Logout
        </span>
      </button>
    </aside>
  )
}

export default AdminNavbar