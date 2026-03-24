import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import googleIcon from '../assets/google.png'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SignupField = 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword'

const Usersignup = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<SignupField, string>>>({})

  const validate = () => {
    const next: Partial<Record<SignupField, string>> = {}
    const nameTrim = fullName.trim()
    if (!nameTrim) next.fullName = 'Full name is required.'
    else if (nameTrim.length < 2) next.fullName = 'Enter at least 2 characters.'

    const emailTrim = email.trim()
    if (!emailTrim) next.email = 'Email is required.'
    else if (!emailRegex.test(emailTrim)) next.email = 'Enter a valid email address.'

    const digits = phone.replace(/\D/g, '')
    if (!phone.trim()) next.phone = 'Phone number is required.'
    else if (digits.length < 10) next.phone = 'Enter at least 10 digits.'

    if (!password) next.password = 'Password is required.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'

    if (!confirmPassword) next.confirmPassword = 'Confirm your password.'
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // TODO: wire to signup API
  }

  const inputBorder = (hasError: boolean) =>
    `w-full bg-transparent border-0 border-b px-0 py-2 text-gray-800 placeholder-gray-400 focus:outline-none transition-colors ${
      hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'
    }`

  const clearError = (key: SignupField) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const n = { ...prev }
      delete n[key]
      return n
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg shadow-gray-200/80 p-8 md:p-10">
            <h1 className="text-2xl md:text-3xl font-bold text-black text-center mb-2">
              Create an Account
            </h1>
            <p className="text-sm text-black text-center mb-8">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    clearError('fullName')
                  }}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'signup-name-error' : undefined}
                  className={inputBorder(Boolean(errors.fullName))}
                />
                {errors.fullName && (
                  <p id="signup-name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError('email')
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                  className={inputBorder(Boolean(errors.email))}
                />
                {errors.email && (
                  <p id="signup-email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    clearError('phone')
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'signup-phone-error' : undefined}
                  className={inputBorder(Boolean(errors.phone))}
                />
                {errors.phone && (
                  <p id="signup-phone-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      const v = e.target.value
                      setPassword(v)
                      clearError('password')
                      if (v === confirmPassword) clearError('confirmPassword')
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'signup-password-error' : undefined}
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
                  <p id="signup-password-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      clearError('confirmPassword')
                    }}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
                    className={`${inputBorder(Boolean(errors.confirmPassword))} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="signup-confirm-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity mt-2"
              >
                Register
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
              <Link to="" className="text-primary hover:underline">
                Terms
              </Link>
              {' '}and{' '}
              <Link to="" className="text-primary hover:underline">
                Privacy Policy.
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <Copyright />
    </div>
  )
}

export default Usersignup
