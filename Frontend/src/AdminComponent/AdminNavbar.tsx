import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  FiBox,
  FiCalendar,
  FiGrid,
  FiLogOut,
  FiMessageSquare,
  FiPackage,
  FiCreditCard,
  FiSettings,
  FiTool,
  FiUsers,
} from 'react-icons/fi'
import GMWLogo from '../assets/GMWlogo.png'

const AdminNavbar = () => {
  const [isLogoutHovered, setIsLogoutHovered] = useState(false)

  const navItems = [
    { label: 'Dashboard', to: '/admindashboard', icon: FiGrid },
    { label: 'Products', to: '/adminproducts', icon: FiBox },
    { label: 'Orders', to: '/adminorders', icon: FiPackage },
    { label: 'Appointments', to: '/adminappointments', icon: FiCalendar },
    { label: 'Services', to: '/adminservices', icon: FiTool },
    { label: 'Messages', to: '/adminmessages', icon: FiMessageSquare },
    { label: 'Payments & Invoices', to: '/adminpaymentsinvoices', icon: FiCreditCard },
    { label: 'Users', to: '/adminusers', icon: FiUsers },
    { label: 'Settings', to: '/adminsettings', icon: FiSettings },
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
        backgroundColor: '#f1f5f9',
        color: '#111827',
        padding: '20px 14px 16px',
        boxSizing: 'border-box',
        borderRight: '1px solid #dbe2ea',
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
            color: '#475569',
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
              color: isActive ? '#b91c1c' : '#334155',
              backgroundColor: isActive ? '#fee2e2' : 'transparent',
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
        onMouseEnter={() => setIsLogoutHovered(true)}
        onMouseLeave={() => setIsLogoutHovered(false)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          border: isLogoutHovered ? '1px solid #b91c1c' : '1px solid #cbd5e1',
          backgroundColor: isLogoutHovered ? '#fee2e2' : 'transparent',
          color: isLogoutHovered ? '#b91c1c' : '#334155',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
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