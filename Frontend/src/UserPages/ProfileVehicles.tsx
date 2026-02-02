import Copyright from '../UserComponent/Copyright'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Profliephotos from '../UserComponent/Profliephotos'
import Vehiclesform from '../UserComponent/Vehiclesform'

const ProfileVehicles = () => {
  return (
    <div>
      <Header />

      <div className="mx-[80px]">
        <Profliephotos activeTab="vehicles" />
        <Vehiclesform />
      </div>
      
      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileVehicles