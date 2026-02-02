import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Profliephotos from '../UserComponent/Profliephotos'

const ProfileSecurity = () => {
  return (
    <div>
      <Header />
      <div className="mx-[80px]">
        <Profliephotos activeTab="security" />
        {/* Security content can go here */}
      </div>
      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileSecurity