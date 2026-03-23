import { type ReactNode, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './UserPages/Home'
import Aboutus from './UserPages/Aboutus'
import Service from './UserPages/Service'
import Products from './UserPages/Products'
import Contactus from './UserPages/Contactus'
import Profile from './UserPages/Profile'
import Vehicles from './UserPages/ProfileVehicles'
import ProfileSecurity from './UserPages/ProfileSecurity'
import Login from './Logins-Signup/Login'
import Signup from './Logins-Signup/Signup'
import Forgetpassword from './Logins-Signup/Forgetpassword'
import Productdetail from './UserPages/Productdetail'
import Cart from './UserPages/Cart'
import Ordertracking from './UserPages/Ordertracking'
import Blogs from './UserPages/Blogsdetail'
import './App.css'
import AdminDashboard from './AdminPages/AdminDashboard'
import AdminOrders from './AdminPages/AdminOrders'
import AdminProducts from './AdminPages/AdminProducts'
import AdminUsers from './AdminPages/AdminUsers'
import AdminSetting from './AdminPages/AdminSetting'



/** Scroll to top on every navigation so new pages don’t open mid-page. */
function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search])

  return null
}

const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [location.pathname])

  return (
    <div className={`page-fade ${visible ? 'page-fade-in' : ''}`}>
      {children}
    </div>
  )
}

function AppRoutes() {
  const withFade = (node: ReactNode) => <PageTransition>{node}</PageTransition>

  return (
    <Routes>
      {/* User */}
      <Route path="/" element={withFade(<Home />)} />
      <Route path="/aboutus" element={withFade(<Aboutus />)} />
      <Route path="/services" element={withFade(<Service />)} />
      <Route path="/products" element={withFade(<Products />)} />
      <Route path="/contactus" element={withFade(<Contactus />)} />
      <Route path="/profile" element={withFade(<Profile />)} />
      <Route path="/profile/vehicles" element={withFade(<Vehicles />)} />
      <Route path="/profile/security" element={withFade(<ProfileSecurity />)} />
      <Route path="/productdetail" element={withFade(<Productdetail />)} />
      <Route path="/cart" element={withFade(<Cart />)} />
      <Route path="/ordertracking" element={withFade(<Ordertracking />)} />
      <Route path="/blogs" element={withFade(<Blogs />)} />

      {/* Login and Signup */}
      <Route path="/login" element={withFade(<Login />)} />
      <Route path="/signup" element={withFade(<Signup />)} />
      <Route path="/forgetpassword" element={withFade(<Forgetpassword />)} />

      {/* Admin */}
      <Route path="/admindashboard" element={withFade(<AdminDashboard />)} />
      <Route path="/admin/orders" element={withFade(<AdminOrders />)} />
      <Route path="/admin/products" element={withFade(<AdminProducts />)} />
      <Route path="/admin/users" element={withFade(<AdminUsers />)} />
      <Route path="/admin/settings" element={withFade(<AdminSetting />)} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App