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
import AdminBill from './AdminPages/AdminBill'
import AdminBlog from './AdminPages/AdminBlog'
import AdminOffer from './AdminPages/AdminOffer'
import AdminServiceReviews from './AdminPages/AdminServiceReviews'
import AdminPayments from './AdminPages/AdminPayments'
import ChatbotWidget from './UserComponent/ChatbotWidget'
import AdminUserProfile from './AdminPages/UserProfile'
import AdminService from './AdminPages/AdminService'
import Checkout from './UserPages/Checkout'
import { AdminPrivateRoute } from './components/AdminPrivateRoute'
import { UserPrivateRoute } from './components/UserPrivateRoute'

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
  const adminPage = (node: ReactNode) =>
    withFade(<AdminPrivateRoute>{node}</AdminPrivateRoute>)
  const userPage = (node: ReactNode) =>
    withFade(<UserPrivateRoute>{node}</UserPrivateRoute>)

  return (
    <Routes>
      {/* User */}
      <Route path="/" element={withFade(<Home />)} />
      <Route path="/aboutus" element={withFade(<Aboutus />)} />
      <Route path="/services" element={withFade(<Service />)} />
      <Route path="/products" element={withFade(<Products />)} />
      <Route path="/contactus" element={withFade(<Contactus />)} />
      <Route path="/profile" element={withFade(<Profile />)} />
      <Route path="/profilevehicles" element={withFade(<Vehicles />)} />
      <Route path="/profilesecurity" element={withFade(<ProfileSecurity />)} />
      <Route path="/productdetail" element={withFade(<Productdetail />)} />
      <Route path="/cart" element={userPage(<Cart />)} />
      <Route path="/ordertracking" element={userPage(<Ordertracking />)} />
      <Route path="/blogs" element={withFade(<Blogs />)} />
      <Route path="/checkout" element={userPage(<Checkout />)} />

      {/* Login and Signup */}
      <Route path="/login" element={withFade(<Login />)} />
      <Route path="/signup" element={withFade(<Signup />)} />
      <Route path="/forgetpassword" element={withFade(<Forgetpassword />)} />

      {/* Admin (requires login + ADMIN role) */}
      <Route path="/admindashboard" element={adminPage(<AdminDashboard />)} />
      <Route path="/adminorders" element={adminPage(<AdminOrders />)} />
      <Route path="/adminproducts" element={adminPage(<AdminProducts />)} />
      <Route path="/adminusers" element={adminPage(<AdminUsers />)} />
      <Route path="/adminsettings" element={adminPage(<AdminSetting />)} />
      <Route path="/adminreviews" element={adminPage(<AdminReviews />)} />
      <Route path="/adminmessages" element={adminPage(<AdminMessage />)} />
      <Route path="/adminappointments" element={adminPage(<AdminAppointments />)} />
      <Route path="/adminservice" element={adminPage(<AdminService />)} />
      <Route path="/adminbills" element={adminPage(<AdminBill />)} />
      <Route path="/adminblogs" element={adminPage(<AdminBlog />)} />
      <Route path="/adminoffers" element={adminPage(<AdminOffer />)} />
      <Route path="/adminservicereviews" element={adminPage(<AdminServiceReviews />)} />
      <Route path="/adminpaymentsinvoices" element={adminPage(<AdminPayments />)} />
      <Route path="/adminuserprofile" element={adminPage(<AdminUserProfile />)} />
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