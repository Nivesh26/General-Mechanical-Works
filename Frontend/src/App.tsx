import React from 'react'
import { BrowserRouter,Route, Routes } from 'react-router-dom'
import Home from './UserPages/Home'
import Aboutus from './UserPages/Aboutus'
import Service from './UserPages/Service'
import Products from './UserPages/Products'
import Contactus from './UserPages/Contactus'
import Adminlogin from './Logins-Signup/Adminlogin'
import Adminsignup from './Logins-Signup/Adminsignup'
import Userlogin from './Logins-Signup/Userlogin'
import Usersignup from './Logins-Signup/Usersignup'
import Profile from './UserPages/Profile'
import Vehicles from './UserPages/ProfileVehicles'
import ProfileSecurity from './UserPages/ProfileSecurity'

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

    {/* User Login and Signup */}
    <Route path="/login" element={<Userlogin />} />
    <Route path="/signup" element={<Usersignup />} />

    {/* Admin Login and Signup */}
    <Route path="/adminlogin" element={<Adminlogin />} />
    <Route path="/adminsignup" element={<Adminsignup />} />
    
    </Routes>
    </BrowserRouter>
  )
}

export default App