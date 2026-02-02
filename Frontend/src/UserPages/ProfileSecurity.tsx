import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Profliephotos from '../UserComponent/Profliephotos'
import Securityform from '../UserComponent/Securityform'

const ProfileSecurity = () => {
  return (
    <div>
      <Header />

      <div className="mx-4 sm:mx-8 lg:mx-[80px]">
        <Profliephotos activeTab="security" />
        <Securityform />
      </div>

      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileSecurity