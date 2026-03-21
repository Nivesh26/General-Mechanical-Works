import React from 'react'
import { BrowserRouter,Route, Routes } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
    <Routes>
      {/* User */}
    <Route path="/" element={<Home />} />
    <Route path="/aboutus" element={<Aboutus />} />
    <Route path="/services" element={<Service />} />
    <Route path="/products" element={<Products />} />
    <Route path="/contactus" element={<Contactus />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/vehicles" element={<Vehicles />} />
    <Route path="/profile/security" element={<ProfileSecurity />} />
    <Route path="/productdetail" element={<Productdetail />} />
    <Route path="/cart" element={<Cart />} />

    {/* Login and Signup */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgetpassword" element={<Forgetpassword />} />

    {/* Admin */}

    </Routes>
    </BrowserRouter>
  )
}

export default App