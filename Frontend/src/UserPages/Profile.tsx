import React from 'react'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Header from '../UserComponent/Header'
import Profileform from '../UserComponent/Profileform'
import Profliephotos from '../UserComponent/Profliephotos'


const Profile = () => {
  return (
    <div>
      <Header />
      <div className="mx-[80px]">
        <Profliephotos />
        <Profileform />
      </div>
      <Footer />
      <Copyright /> 
    </div>
  )
}

export default Profile