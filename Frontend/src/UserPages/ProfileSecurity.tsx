import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Profliephotos from '../UserComponent/Profliephotos'
import Securityform from '../UserComponent/Securityform'
import { initialVehicles } from '../UserComponent/Vehiclesform'
import { useAuth } from '../context/AuthContext'

function splitFullName(fullName: string): { first: string; last: string } {
  const t = fullName.trim()
  if (!t) return { first: 'User', last: '' }
  const i = t.indexOf(' ')
  if (i === -1) return { first: t, last: '' }
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() }
}

const ProfileSecurity = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true, state: { from: '/profilesecurity' } })
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-600">Loading…</div>
        <Footer />
        <Copyright />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const { first, last } = splitFullName(user.name)

  return (
    <div>
      <Header />

      <div className="mx-[80px]">
        <Profliephotos activeTab="security" firstName={first} lastName={last} vehicles={initialVehicles} />
        <Securityform />
      </div>

      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileSecurity
