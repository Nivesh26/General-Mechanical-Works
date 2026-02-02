import Copyright from '../UserComponent/Copyright'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Profliephotos from '../UserComponent/Profliephotos'

const ProfileVehicles = () => {
  return (
    <div>
      <Header />
      <div className="mx-[80px]">
        <Profliephotos activeTab="vehicles" />
        {/* Vehicles content can go here */}
      </div>
      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileVehicles