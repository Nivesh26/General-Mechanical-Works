import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import googleIcon from '../assets/google.png'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Userlogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({})

  const validate = () => {
    const next: Partial<Record<'email' | 'password', string>> = {}
    const trimmed = email.trim()
    if (!trimmed) next.email = 'Email is required.'
    else if (!emailRegex.test(trimmed)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // TODO: wire to auth API
  }

  const inputBorder = (hasError: boolean) =>
    `w-full bg-transparent border-0 border-b px-0 py-2 text-gray-800 placeholder-gray-400 focus:outline-none transition-colors ${
      hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'
    }`

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg shadow-gray-200/80 p-8 md:p-10">
            <h1 className="text-2xl md:text-3xl font-bold text-black text-center mb-2">
              Login
            </h1>
            <p className="text-sm text-black text-center mb-8">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-red-600 hover:underline font-medium">
                Signup
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((prev) => {
                      if (!prev.email) return prev
                      const n = { ...prev }
                      delete n.email
                      return n
                    })
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  className={inputBorder(Boolean(errors.email))}
                />
                {errors.email && (
                  <p id="login-email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((prev) => {
                        if (!prev.password) return prev
                        const n = { ...prev }
                        delete n.password
                        return n
                      })
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                    className={`${inputBorder(Boolean(errors.password))} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="login-password-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.password}
                  </p>
                )}
                <div className="flex justify-end mt-1">
                  <Link
                    to="/forgetpassword"
                    className="text-sm text-primary hover:underline"
                  >
                    Forget Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity mt-2"
              >
                Login
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <span className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500 font-medium">OR</span>
              <span className="flex-1 h-px bg-gray-300" />
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-lg border border-gray-300 bg-white text-black font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <img src={googleIcon} alt="" className="w-5 h-5" />
              Continue with Google
            </button>

            <p className="text-xs text-black mt-8 text-center">
              By joining, you agree to the{' '}
              <Link to="" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to="" className="text-primary hover:underline">Privacy Policy.</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Userlogin
