import React from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Hero from '../UserComponent/Hero'
import Brandweserve from '../UserComponent/Brandweserve'

const Home = () => {
  return (
    <div>
        <Header />
        <Hero />
        <Brandweserve />                                  
        <Footer />
        <Copyright />
    </div>
  )
}

export default Home 