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
import AdminReviews from './AdminPages/AdminReviews'
import AdminMessage from './AdminPages/AdminMessage'
import AdminAppointments from './AdminPages/AdminAppointments'
import AdminService from './AdminPages/AdminService'
import AdminBlog from './AdminPages/AdminBlog'
import AdminOffer from './AdminPages/AdminOffer'
import AdminServiceReviews from './AdminPages/AdminServiceReviews'
import AdminPayments from './AdminPages/AdminPayments'
import ChatbotWidget from './UserComponent/ChatbotWidget'



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
      <Route path="/adminorders" element={withFade(<AdminOrders />)} />
      <Route path="/adminproducts" element={withFade(<AdminProducts />)} />
      <Route path="/adminusers" element={withFade(<AdminUsers />)} />
      <Route path="/adminsettings" element={withFade(<AdminSetting />)} />
      <Route path="/adminreviews" element={withFade(<AdminReviews />)} />
      <Route path="/adminmessages" element={withFade(<AdminMessage />)} />
      <Route path="/adminappointments" element={withFade(<AdminAppointments />)} />
      <Route path="/adminservices" element={withFade(<AdminService />)} />
      <Route path="/adminblogs" element={withFade(<AdminBlog />)} />
      <Route path="/adminoffers" element={withFade(<AdminOffer />)} />
      <Route path="/adminservicereviews" element={withFade(<AdminServiceReviews />)} />
      <Route path="/adminpaymentsinvoices" element={withFade(<AdminPayments />)} />
    </Routes>
  )
}

function ChatbotOnUserPages() {
  const { pathname } = useLocation()
  const isAdminPage = pathname.startsWith('/admin')

  if (isAdminPage) return null
  return <ChatbotWidget />
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <ChatbotOnUserPages />
    </BrowserRouter>
  )
}

export default App