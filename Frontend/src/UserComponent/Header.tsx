import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineCalendarDays,
  HiOutlineShoppingCart,
} from 'react-icons/hi2'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import GMWlogo from '../assets/GMWlogo.png'
import { useAuth } from '../context/AuthContext'
import { useProfileAvatar } from '../hooks/useProfileAvatar'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { profileInitialFromName } from '../lib/profileInitial'
import { PAGE_GUTTER } from '../lib/layoutClasses'

const Header = () => {
  const { user, loading, token, refreshUser, logout } = useAuth()
  const { avatarUrl } = useProfileAvatar(user, token, refreshUser)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useBodyScrollLock(menuOpen)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/products', label: 'Products' },
    { to: '/aboutus', label: 'About Us' },
    { to: '/contactus', label: 'Contact' },
  ]

  const showLoggedInActions = Boolean(token)

  const iconNavClass =
    'flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-gray-700 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200'

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium no-underline transition-colors ${
      isActive
        ? 'bg-red-50 text-primary'
        : 'text-gray-800 hover:bg-gray-100'
    }`

  const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-black hover:text-primary'
    }`

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    toast.error('You have been logged out.')
    logout()
    navigate('/login', { replace: true })
  }

  const mobileDrawer = (
    <>
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden top-14 sm:top-16"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}
      <aside
        id="mobile-nav"
        aria-hidden={!menuOpen}
        className={`fixed top-14 sm:top-16 left-0 z-50 flex flex-col w-[min(280px,85vw)] max-w-[280px] h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-xl box-border transition-transform duration-200 ease-out lg:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-3.5 py-4">
          <div className="relative mb-4 pb-4 border-b border-gray-100 shrink-0">
            <input
              type="search"
              placeholder="Search"
              className="w-full h-9 pl-3 pr-9 text-sm rounded-full bg-gray-100 border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Search"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <HiOutlineMagnifyingGlass className="w-4 h-4" />
            </span>
          </div>
          <nav className="flex flex-col" aria-label="Mobile">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={navLinkClass}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          {showLoggedInActions ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FiLogOut size={16} aria-hidden />
              Log out
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={closeMenu}
              className="mt-4 inline-block w-full text-center px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              Login
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className={PAGE_GUTTER}>
          <div className="flex items-center h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4">
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
              <button
                type="button"
                className="lg:hidden flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <FiX size={22} aria-hidden /> : <FiMenu size={22} aria-hidden />}
              </button>

              <NavLink to="/" className="flex-shrink-0" onClick={closeMenu}>
                <img
                  src={GMWlogo}
                  alt="GMW General Mechanical Works"
                  className="h-9 sm:h-11 lg:h-14 w-auto object-contain"
                />
              </NavLink>
            </div>

            <nav
              className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center"
              aria-label="Main"
            >
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'} className={desktopNavLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:block relative w-[11rem] lg:w-[13rem] shrink-0 mx-1 lg:mx-2">
              <input
                type="search"
                placeholder="Search"
                className="w-full h-9 pl-3 pr-9 text-sm rounded-full bg-gray-100 border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-label="Search"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <HiOutlineMagnifyingGlass className="w-4 h-4" aria-hidden />
              </span>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0 ml-auto">
              {!showLoggedInActions ? (
                <NavLink
                  to="/login"
                  className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Login
                </NavLink>
              ) : (
                <>
                  <span
                    className={`${iconNavClass} hidden sm:flex cursor-default select-none`}
                    aria-hidden="true"
                  >
                    <HiOutlineCalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `${iconNavClass}${isActive ? ' text-primary bg-gray-50 border-gray-200' : ''}`
                    }
                    aria-label="Cart"
                    title="Cart"
                  >
                    <HiOutlineShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
                  </NavLink>
                  {loading && !user ? (
                    <span
                      className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 animate-pulse border border-gray-200"
                      aria-hidden
                    />
                  ) : user ? (
                    <NavLink
                      to="/profile"
                      className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-black hover:bg-gray-100 transition-colors overflow-hidden border border-gray-200 bg-gray-50"
                      aria-label="Profile"
                      title="Profile"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span
                          className="text-base sm:text-lg font-bold text-primary select-none"
                          aria-hidden
                        >
                          {profileInitialFromName(user.name)}
                        </span>
                      )}
                    </NavLink>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileDrawer}
    </>
  )
}

export default Header
