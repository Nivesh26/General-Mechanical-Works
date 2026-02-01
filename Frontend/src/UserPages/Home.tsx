import React from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Hero from '../UserComponent/Hero'
import Brandweserve from '../UserComponent/Brandweserve'
import Offer from '../UserComponent/Offer'
import Service from '../UserComponent/Service'
import Review from '../UserComponent/Review'
import Chooseus from '../UserComponent/Chooseus'

const Home = () => {
  return (
    <div>
        <Header />
        <Hero />
        <Brandweserve />                                  
        <Offer />
        <Service />
        <Review />
        <Chooseus />
        <Footer />
        <Copyright />
    </div>
  )
}

export default Home 