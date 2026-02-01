import { NavLink } from 'react-router-dom'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import GMWlogo from '../assets/GMWlogo.png'

const Header = () => {
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about-us', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/products', label: 'Products' },
    { to: '/contactus', label: 'Contact Us' },
  ]

  return (
    <header className="bg-white border-t-[3px] py-2">
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
                className={({ isActive }) =>
                  `text-sm font-medium text-black hover:text-[#b91c1c] transition-colors ${
                    isActive ? "text-[#b91c1c]" : ""
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

          {/* Login button */}
          <NavLink
            to="/login"
            className="flex-shrink-0 px-6 py-2.5 rounded-full bg-[#b91c1c] text-white text-sm font-medium hover:bg-[#991b1b] transition-colors"
          >
            Login
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export default Header
