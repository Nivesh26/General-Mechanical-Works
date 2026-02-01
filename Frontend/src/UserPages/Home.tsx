import React from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Hero from '../UserComponent/Hero'
import Brandweserve from '../UserComponent/Brandweserve'
import Offer from '../UserComponent/Offer'

const Home = () => {
  return (
    <div>
        <Header />
        <Hero />
        <Brandweserve />                                  
        <Offer />
        <Footer />
        <Copyright />
    </div>
  )
}

export default Home 