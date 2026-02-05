import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Profliephotos from '../UserComponent/Profliephotos'
import Securityform from '../UserComponent/Securityform'
import { initialVehicles } from '../UserComponent/Vehiclesform'

const ProfileSecurity = () => {
  return (
    <div>
      <Header />

      <div className="mx-[80px]">
        <Profliephotos activeTab="security" vehicles={initialVehicles} />
        <Securityform />
      </div>

      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileSecurity