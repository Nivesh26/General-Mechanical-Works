import React from 'react'
import { BrowserRouter,Route, Routes } from 'react-router-dom'
import Home from './UserPages/Home'
import Aboutus from './UserPages/Aboutus'
import Service from './UserPages/Service'
import Products from './UserPages/Products'
import Contactus from './UserPages/Contactus'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      {/* User */}
    <Route path="/" element={<Home />} />
    <Route path="/about-us" element={<Aboutus />} />
    <Route path="/services" element={<Service />} />
    <Route path="/products" element={<Products />} />
    <Route path="/contactus" element={<Contactus />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App