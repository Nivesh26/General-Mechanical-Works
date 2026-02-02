import React from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Contacthero from '../UserComponent/Contacthero'
import Contactform from '../UserComponent/Contactform'
import Contactusmap from '../UserComponent/Contactusmap'

const Contactus = () => {
  return (
    <div>
      <Header />
      <Contacthero />
      <Contactform />
      <Contactusmap />
      <Footer />
      <Copyright /> 
    </div>
  )
}

export default Contactus