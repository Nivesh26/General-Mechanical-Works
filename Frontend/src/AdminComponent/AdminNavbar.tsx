import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import {
  FiBookOpen,
  FiBox,
  FiCalendar,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiTag,
  FiPackage,
  FiCreditCard,
  FiFileText,
  FiSettings,
  FiStar,
  FiThumbsUp,
  FiTool,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import GMWLogo from '../assets/GMWlogo.png'

const AdminNavbar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navScrollRef = useRef<HTMLElement | null>(null)
  const navScrollStorageKey = 'admin-navbar-scroll-top'

  useBodyScrollLock(sidebarOpen)

  const navItems = [
    { label: 'Dashboard', to: '/admindashboard', icon: FiGrid },
    { label: 'Messages', to: '/adminmessages', icon: FiMessageSquare, badge: '1' },
    { label: 'Products', to: '/adminproducts', icon: FiBox },
    { label: 'Orders', to: '/adminorders', icon: FiPackage },
    { label: 'Reviews', to: '/adminreviews', icon: FiStar },
    { label: 'Appointments', to: '/adminappointments', icon: FiCalendar },
    { label: 'Service', to: '/adminservice', icon: FiTool },
    { label: 'Bill', to: '/adminbills', icon: FiFileText },
    { label: 'Blogs', to: '/adminblogs', icon: FiBookOpen },
    { label: 'Offers', to: '/adminoffers', icon: FiTag },
    { label: 'Service Reviews', to: '/adminservicereviews', icon: FiThumbsUp },
    { label: 'Payments & Invoices', to: '/adminpaymentsinvoices', icon: FiCreditCard },
    { label: 'Users', to: '/adminusers', icon: FiUsers },
    { label: 'Settings', to: '/adminsettings', icon: FiSettings },
  ]

  useEffect(() => {
    const navElement = navScrollRef.current
    if (!navElement) return
    const savedScrollTop = window.sessionStorage.getItem(navScrollStorageKey)
    if (savedScrollTop) {
      navElement.scrollTop = Number(savedScrollTop)
    }
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  const closeSidebar = () => setSidebarOpen(false)

  const handleLogout = () => {
    toast.error('Logged out.')
    logout()
    navigate('/login', { replace: true })
  }

  const sidebarContent = (
    <>
      <div className="flex flex-col items-center justify-center mb-4 shrink-0">
        <img
          src={GMWLogo}
          alt="General Mechanical Works"
          className="w-[110px] sm:w-[130px] h-16 sm:h-20 object-contain"
        />
        <p className="m-0 mt-1 text-xs text-center text-slate-600">
          General Mechanical Works Admin
        </p>
      </div>

      <nav
        ref={navScrollRef}
        onScroll={(event) => {
          window.sessionStorage.setItem(
            navScrollStorageKey,
            String((event.currentTarget as HTMLElement).scrollTop),
          )
        }}
        className="flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin"
        aria-label="Admin"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 mb-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${
                isActive
                  ? 'bg-red-100 text-red-700'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`
            }
          >
            <item.icon size={16} className="shrink-0" />
            <span className="flex-1 min-w-0">{item.label}</span>
            {item.badge ? (
              <span className="min-w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[11px] font-bold inline-flex items-center justify-center px-1.5">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full mt-2 px-3 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:border-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer shrink-0"
      >
        <span className="flex items-center justify-center gap-2">
          <FiLogOut size={16} />
          Logout
        </span>
      </button>
    </>
  )

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center gap-3 px-4 bg-slate-100 border-b border-slate-200">
        <button
          type="button"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-200"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((o) => !o)}
        >
          {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
        <img src={GMWLogo} alt="" className="h-9 w-auto object-contain" />
        <span className="text-sm font-semibold text-slate-800 truncate">Admin</span>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/40 top-14"
          aria-label="Close sidebar"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-14 lg:top-0 left-0 z-50 flex flex-col w-[min(280px,85vw)] max-w-[280px] h-[calc(100vh-3.5rem)] lg:h-full bg-slate-100 text-slate-900 px-3.5 pt-3.5 pb-4 border-r border-slate-200 box-border transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:pt-5`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

export default AdminNavbar
