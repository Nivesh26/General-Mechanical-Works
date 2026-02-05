import { useState } from 'react'
import Copyright from '../UserComponent/Copyright'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Profliephotos from '../UserComponent/Profliephotos'
import Vehiclesform, { initialVehicles } from '../UserComponent/Vehiclesform'

const ProfileVehicles = () => {
  const [vehicles, setVehicles] = useState(initialVehicles)

  return (
    <div>
      <Header />

      <div className="mx-[80px]">
        <Profliephotos activeTab="vehicles" vehicles={vehicles} />
        <Vehiclesform vehicles={vehicles} setVehicles={setVehicles} />
      </div>

      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileVehicles