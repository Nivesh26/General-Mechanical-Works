import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'

const Forgetpassword = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to forgot-password API
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg shadow-gray-200/80 px-8 py-10 md:px-12">
          <h1 className="text-3xl font-bold text-center text-black mb-2">Can&apos;t Login ?</h1>
          <p className="text-sm text-center text-black/70 mb-8">We&apos;ll send a recovery link to</p>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="generalmechanicalworks46@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary"
            />

            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Send Recovery Link
            </button>
          </form>

          <div className="text-center mt-8">
            <Link to="/login" className="text-primary text-sm font-semibold hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Forgetpassword