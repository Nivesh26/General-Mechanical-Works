import React from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import AboutContent from '../UserComponent/AboutContent'

const Aboutus: React.FC = () => {
  return (
    <div>
      <Header />
      <AboutContent />
      <Footer />
      <Copyright />
    </div>
  )
}

export default Aboutus