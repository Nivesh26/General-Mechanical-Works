import { useState } from 'react'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Header from '../UserComponent/Header'
import Profileform from '../UserComponent/Profileform'
import Profliephotos from '../UserComponent/Profliephotos'
import { initialVehicles } from '../UserComponent/Vehiclesform'

const Profile = () => {
  const [firstName, setFirstName] = useState("Nivesh");
  const [lastName, setLastName] = useState("Shrestha");

  const handleNameChange = (newFirstName: string, newLastName: string) => {
    setFirstName(newFirstName);
    setLastName(newLastName);
  };

  return (
    <div>
      <Header />

      <div className="mx-4 sm:mx-8 lg:mx-[80px]">
        <Profliephotos firstName={firstName} lastName={lastName} vehicles={initialVehicles} />
        <Profileform firstName={firstName} lastName={lastName} onNameChange={handleNameChange} />
      </div>

      <Footer />
      <Copyright /> 
    </div>
  )
}

export default Profile