import { NavLink } from 'react-router-dom'
import { FaGoogle } from 'react-icons/fa'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'

const Userlogin = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#EFEFEF]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-14 px-4">
        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm p-10">
          {/* Header */}
          <h1 className="text-[22px] font-bold text-center text-gray-900 tracking-tight">
            Login
          </h1>
          <p className="text-center text-gray-500 text-sm mt-2 mb-8">
            Don't have an account?{' '}
            <NavLink
              to="/signup"
              className="text-red-500 hover:text-red-600 no-underline"
            >
              Register
            </NavLink>
          </p>

          {/* Form */}
          <form className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-transparent border-0 border-b border-gray-200 px-0 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="flex items-end gap-3">
              <input
                type="password"
                placeholder="Password"
                className="flex-1 min-w-0 bg-transparent border-0 border-b border-gray-200 px-0 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 transition-colors"
              />
              <NavLink
                to="#"
                className="text-red-500 hover:text-red-600 text-sm whitespace-nowrap pb-2.5 no-underline"
              >
                Forgot Password?
              </NavLink>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-red-500 text-white text-[15px] font-semibold hover:bg-red-600 transition-colors mt-1"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">OR</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full py-3 rounded-lg bg-white border border-gray-200 text-gray-700 text-[15px] font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2.5"
          >
            <FaGoogle className="w-5 h-5" style={{ color: '#4285F4' }} />
            Login with Google
          </button>

          {/* Footer */}
          <p className="text-center text-gray-400 text-[13px] mt-8 leading-relaxed">
            By joining, you agree to the{' '}
            <NavLink to="#" className="text-red-500 hover:text-red-600 no-underline">
              Terms
            </NavLink>{' '}
            and{' '}
            <NavLink to="#" className="text-red-500 hover:text-red-600 no-underline">
              Privacy Policy
            </NavLink>
            .
          </p>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Userlogin
