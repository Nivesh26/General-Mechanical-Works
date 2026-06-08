import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { useAuth } from '../context/AuthContext'
import { postLoginPath } from '../lib/postLoginPath'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_LENGTH = 6
const emptyOtpDigits = () => Array.from({ length: OTP_LENGTH }, () => '')

type LoginStep = 'credentials' | 'otp'

const Userlogin = () => {
  const { login, verifyLogin, resendLoginCode } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<LoginStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtpDigits)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [errors, setErrors] = useState<Partial<Record<'email' | 'password' | 'otp', string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  const otpCode = otpDigits.join('')

  useEffect(() => {
    if (step === 'otp') {
      otpInputRefs.current[0]?.focus()
    }
  }, [step])

  const validateCredentials = () => {
    const next: Partial<Record<'email' | 'password', string>> = {}
    const trimmed = email.trim()
    if (!trimmed) next.email = 'Email is required.'
    else if (!emailRegex.test(trimmed)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateOtp = () => {
    const next: Partial<Record<'otp', string>> = {}
    if (!otpCode.trim()) next.otp = 'Verification code is required.'
    else if (!/^\d{6}$/.test(otpCode.trim())) next.otp = 'Enter the 6-digit code from your email.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCredentials()) return
    setSubmitting(true)
    try {
      const pending = await login(email.trim(), password)
      setVerificationToken(pending.verificationToken)
      setMaskedEmail(pending.email)
      setOtpDigits(emptyOtpDigits())
      setStep('otp')
      toast.success(`Verification code sent to ${pending.email}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateOtp()) return
    setSubmitting(true)
    try {
      const auth = await verifyLogin(verificationToken, otpCode.trim())
      toast.success('Signed in successfully.')
      navigate(postLoginPath(auth.role), { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!verificationToken) return
    setResending(true)
    try {
      await resendLoginCode(verificationToken)
      toast.success('A new verification code has been sent.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend code.')
    } finally {
      setResending(false)
    }
  }

  const handleBackToLogin = () => {
    setStep('credentials')
    setOtpDigits(emptyOtpDigits())
    setVerificationToken('')
    setMaskedEmail('')
    setErrors({})
  }

  const clearOtpError = () => {
    setErrors((prev) => {
      if (!prev.otp) return prev
      const n = { ...prev }
      delete n.otp
      return n
    })
  }

  const updateOtpDigits = (next: string[]) => {
    setOtpDigits(next)
    clearOtpError()
  }

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    updateOtpDigits(next)
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      otpInputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault()
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = emptyOtpDigits()
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i]
    }
    updateOtpDigits(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    otpInputRefs.current[focusIndex]?.focus()
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
            {step === 'credentials' ? (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-black text-center mb-2">
                  Login
                </h1>
                <p className="text-sm text-black text-center mb-8">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-red-600 hover:underline font-medium">
                    Signup
                  </Link>
                </p>

                <form onSubmit={handleCredentialsSubmit} className="space-y-6" noValidate>
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
                    disabled={submitting}
                    className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Signing in…' : 'Login'}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-8">
                  <span className="flex-1 h-px bg-gray-300" />
                  <span className="text-sm text-gray-500 font-medium">OR</span>
                  <span className="flex-1 h-px bg-gray-300" />
                </div>

                <GoogleSignInButton disabled={submitting} />
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-black text-center mb-2">
                  Verify your email
                </h1>
                <p className="text-sm text-gray-600 text-center mb-8">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-black">{maskedEmail}</span>
                </p>

                <form onSubmit={handleOtpSubmit} className="space-y-6" noValidate>
                  <div>
                    <div
                      className="flex justify-center gap-2 sm:gap-3"
                      role="group"
                      aria-label="6-digit verification code"
                    >
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete={index === 0 ? 'one-time-code' : 'off'}
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                          aria-invalid={Boolean(errors.otp)}
                          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold rounded-lg border-2 bg-white text-gray-900 focus:outline-none transition-colors ${
                            errors.otp
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-primary'
                          }`}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <p id="login-otp-error" className="mt-3 text-sm text-red-600 text-center" role="alert">
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Verifying…' : 'Verify & sign in'}
                  </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending || submitting}
                    className="text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    disabled={submitting}
                    className="text-gray-600 hover:underline disabled:opacity-60"
                  >
                    Back to login
                  </button>
                </div>
              </>
            )}

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
