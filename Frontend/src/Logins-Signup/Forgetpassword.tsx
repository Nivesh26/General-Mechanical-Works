import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import {
  authForgotPassword,
  authResendForgotPasswordCode,
  authResetPassword,
} from '../lib/api'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_LENGTH = 6
const PASSWORD_MAX = 128
const emptyOtpDigits = () => Array.from({ length: OTP_LENGTH }, () => '')

type ResetStep = 'email' | 'otp' | 'password'

const Forgetpassword = () => {
  const navigate = useNavigate()

  const [step, setStep] = useState<ResetStep>('email')
  const [email, setEmail] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(emptyOtpDigits)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [errors, setErrors] = useState<
    Partial<Record<'email' | 'otp' | 'newPassword' | 'confirmPassword', string>>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  const otpCode = otpDigits.join('')

  useEffect(() => {
    if (step === 'otp') {
      otpInputRefs.current[0]?.focus()
    }
  }, [step])

  const inputBorder = (hasError: boolean) =>
    `w-full bg-transparent border-0 border-b px-0 py-2 text-gray-800 placeholder-gray-400 focus:outline-none transition-colors ${
      hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'
    }`

  const validateEmail = () => {
    const next: Partial<Record<'email', string>> = {}
    const trimmed = email.trim()
    if (!trimmed) next.email = 'Email is required.'
    else if (!emailRegex.test(trimmed)) next.email = 'Enter a valid email address.'
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

  const validatePassword = () => {
    const next: Partial<Record<'newPassword' | 'confirmPassword', string>> = {}
    if (!newPassword) next.newPassword = 'Password is required.'
    else if (newPassword.length < 8) next.newPassword = 'Password must be at least 8 characters.'
    else if (newPassword.length > PASSWORD_MAX)
      next.newPassword = `Password must be at most ${PASSWORD_MAX} characters.`
    if (!confirmPassword) next.confirmPassword = 'Confirm your password.'
    else if (newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return
    setSubmitting(true)
    try {
      const pending = await authForgotPassword(email.trim())
      setVerificationToken(pending.verificationToken ?? '')
      setMaskedEmail(pending.email)
      setOtpDigits(emptyOtpDigits())
      setStep('otp')
      toast.success(`If an account exists, a code was sent to ${pending.email}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset code.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateOtp()) return
    if (!verificationToken) {
      toast.error('Invalid reset session. Check your email or try again.')
      return
    }
    setStep('password')
    setErrors({})
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return
    if (!verificationToken) {
      toast.error('Invalid reset session. Please start over.')
      return
    }
    setSubmitting(true)
    try {
      await authResetPassword(verificationToken, otpCode.trim(), newPassword)
      toast.success('Password updated. You can sign in now.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reset password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!verificationToken) {
      toast.error('Please request a new code from the email step.')
      return
    }
    setResending(true)
    try {
      await authResendForgotPasswordCode(verificationToken)
      toast.success('A new verification code has been sent.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend code.')
    } finally {
      setResending(false)
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg shadow-gray-200/80 px-8 py-10 md:px-12">
          {step === 'email' && (
            <>
              <h1 className="text-3xl font-bold text-center text-black mb-2">Can&apos;t Login?</h1>
              <p className="text-sm text-center text-black/70 mb-8">
                Enter your email and we&apos;ll send a 6-digit reset code
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-8" noValidate>
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
                    className={inputBorder(Boolean(errors.email))}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending…' : 'Send reset code'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <h1 className="text-3xl font-bold text-center text-black mb-2">Verify your email</h1>
              <p className="text-sm text-center text-black/70 mb-8">
                Enter the 6-digit code sent to{' '}
                <span className="font-medium text-black">{maskedEmail}</span>
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-8" noValidate>
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
                    <p className="mt-3 text-sm text-red-600 text-center" role="alert">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending || !verificationToken}
                  className="text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending…' : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtpDigits(emptyOtpDigits())
                    setErrors({})
                  }}
                  className="text-gray-600 hover:underline"
                >
                  Use a different email
                </button>
              </div>
            </>
          )}

          {step === 'password' && (
            <>
              <h1 className="text-3xl font-bold text-center text-black mb-2">Set new password</h1>
              <p className="text-sm text-center text-black/70 mb-8">
                Choose a new password for your account
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-6" noValidate>
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      autoComplete="new-password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setErrors((prev) => {
                          if (!prev.newPassword) return prev
                          const n = { ...prev }
                          delete n.newPassword
                          return n
                        })
                      }}
                      aria-invalid={Boolean(errors.newPassword)}
                      className={`${inputBorder(Boolean(errors.newPassword))} pr-9`}
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
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setErrors((prev) => {
                          if (!prev.confirmPassword) return prev
                          const n = { ...prev }
                          delete n.confirmPassword
                          return n
                        })
                      }}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      className={`${inputBorder(Boolean(errors.confirmPassword))} pr-9`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <HiEyeSlash className="w-5 h-5" />
                      ) : (
                        <HiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating…' : 'Reset password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('otp')
                    setErrors({})
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Back to verification code
                </button>
              </div>
            </>
          )}

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
