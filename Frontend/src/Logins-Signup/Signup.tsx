import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { authSignup } from '../lib/api'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\d{10}$/
/** Matches backend SignupRequest / User constraints */
const NAME_MAX = 255
const PASSWORD_MAX = 128

type SignupField = 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword'

type SignupValues = {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

function computeSignupErrors(v: SignupValues): Partial<Record<SignupField, string>> {
  const next: Partial<Record<SignupField, string>> = {}
  const nameTrim = v.fullName.trim()
  if (!nameTrim) next.fullName = 'Full name is required.'
  else if (nameTrim.length < 2) next.fullName = 'Enter at least 2 characters.'
  else if (nameTrim.length > NAME_MAX) next.fullName = `Name must be at most ${NAME_MAX} characters.`

  const emailTrim = v.email.trim()
  if (!emailTrim) next.email = 'Email is required.'
  else if (!emailRegex.test(emailTrim)) next.email = 'Enter a valid email address.'

  const phoneDigits = v.phone.replace(/\D/g, '')
  if (!phoneDigits) next.phone = 'Phone number is required.'
  else if (!PHONE_REGEX.test(phoneDigits)) next.phone = 'Please enter exactly 10 digits.'

  if (!v.password) next.password = 'Password is required.'
  else if (v.password.length < 8) next.password = 'Password must be at least 8 characters.'
  else if (v.password.length > PASSWORD_MAX)
    next.password = `Password must be at most ${PASSWORD_MAX} characters.`

  if (!v.confirmPassword) next.confirmPassword = 'Confirm your password.'
  else if (v.password !== v.confirmPassword) next.confirmPassword = 'Passwords do not match.'

  return next
}

const Usersignup = () => {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<SignupField, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const values = (): SignupValues => ({
    fullName,
    email,
    phone,
    password,
    confirmPassword,
  })

  const validate = () => {
    const next = computeSignupErrors(values())
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const syncErrorsForFields = (fields: SignupField[]) => {
    const computed = computeSignupErrors(values())
    setErrors((prev) => {
      const n = { ...prev }
      for (const field of fields) {
        const msg = computed[field]
        if (msg) n[field] = msg
        else delete n[field]
      }
      return n
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const trimmedEmail = email.trim()
      const phoneDigits = phone.replace(/\D/g, '')
      await authSignup({
        name: fullName.trim(),
        email: trimmedEmail,
        password,
        phone: phoneDigits,
      })
      toast.success('Account created. Please sign in.')
      navigate('/login', {
        replace: true,
        state: { registered: true },
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
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
                  maxLength={NAME_MAX}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    clearError('fullName')
                  }}
                  onBlur={() => syncErrorsForFields(['fullName'])}
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
                  onBlur={() => syncErrorsForFields(['email'])}
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
                  inputMode="numeric"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    clearError('phone')
                  }}
                  onBlur={() => syncErrorsForFields(['phone'])}
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
                    maxLength={PASSWORD_MAX}
                    onChange={(e) => {
                      const v = e.target.value
                      setPassword(v)
                      clearError('password')
                      if (v === confirmPassword) clearError('confirmPassword')
                    }}
                    onBlur={() =>
                      syncErrorsForFields(
                        confirmPassword !== '' ? ['password', 'confirmPassword'] : ['password'],
                      )
                    }
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
                    maxLength={PASSWORD_MAX}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      clearError('confirmPassword')
                    }}
                    onBlur={() => syncErrorsForFields(['confirmPassword'])}
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
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating account…' : 'Register'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <span className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500 font-medium">OR</span>
              <span className="flex-1 h-px bg-gray-300" />
            </div>

            <GoogleSignInButton disabled={submitting} />

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
