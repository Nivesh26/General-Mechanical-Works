import React from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Hero from '../UserComponent/Hero'

function Home() {
  return (
    <div>
        <Header />
        <Hero />
        <Footer />
        <Copyright />
    </div>
  )
}

export default Home