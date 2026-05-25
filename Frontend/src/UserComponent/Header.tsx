import { NavLink } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineCalendarDays,
  HiOutlineShoppingCart,
} from 'react-icons/hi2'
import GMWlogo from '../assets/GMWlogo.png'
import { useAuth } from '../context/AuthContext'
import { useProfileAvatar } from '../hooks/useProfileAvatar'
import { profileInitialFromName } from '../lib/profileInitial'

const Header = () => {
  const { user, loading, token, refreshUser } = useAuth()
  const { avatarUrl } = useProfileAvatar(user, token, refreshUser)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/products', label: 'Products' },
    { to: '/aboutus', label: 'About Us' },
    { to: '/contactus', label: 'Contact' },
  ]

  const showLoggedInActions = Boolean(token)

  const iconNavClass =
    'flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-gray-700 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200'

  return (
    <header className="sticky top-0 z-50 bg-white py-2">
      <div className="mx-[80px]">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Logo */}
          <NavLink to="/" className="flex-shrink-0">
            <img
              src={GMWlogo}
              alt="GMW General Mechanical Works"
              className="h-14 w-auto object-contain"
            />
          </NavLink>

          {/* Navigation links */}
          <nav className="flex items-center gap-8 flex-1 justify-center">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-black hover:text-primary"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Search bar */}
          <div className="relative flex-1 max-w-50">
            <input
              type="search"
              placeholder="Search"
              className="w-full pl-4 pr-10 py-2.5 text-sm rounded-full bg-gray-100 border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Search"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <HiOutlineMagnifyingGlass className="w-5 h-5" />
            </span>
          </div>

          {!showLoggedInActions ? (
            <NavLink
              to="/login"
              className="flex-shrink-0 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Login
            </NavLink>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span
                className={`${iconNavClass} cursor-default select-none`}
                aria-hidden="true"
              >
                <HiOutlineCalendarDays className="w-6 h-6" />
              </span>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `${iconNavClass}${isActive ? ' text-primary bg-gray-50 border-gray-200' : ''}`
                }
                aria-label="Cart"
                title="Cart"
              >
                <HiOutlineShoppingCart className="w-6 h-6" aria-hidden />
              </NavLink>
              {loading && !user ? (
                <span
                  className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 animate-pulse border border-gray-200"
                  aria-hidden
                />
              ) : user ? (
                <NavLink
                  to="/profile"
                  className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-black hover:bg-gray-100 transition-colors overflow-hidden border border-gray-200 bg-gray-50"
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
                    <span className="text-lg font-bold text-primary select-none" aria-hidden>
                      {profileInitialFromName(user.name)}
                    </span>
                  )}
                </NavLink>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
