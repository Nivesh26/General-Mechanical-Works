import { useCallback } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn'
import { isGoogleSignInConfigured } from '../lib/googleClientId'
import { postLoginPath } from '../lib/postLoginPath'

const defaultButtonClass =
  'w-full py-3 rounded-lg border border-gray-300 bg-white text-black font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

type GoogleSignInButtonProps = {
  className?: string
  disabled?: boolean
}

function GoogleSignInButtonConfigured({ className = defaultButtonClass, disabled = false }: GoogleSignInButtonProps) {
  const { loginWithGoogle, logout } = useAuth()
  const navigate = useNavigate()

  const handleIdToken = useCallback(
    async (idToken: string) => {
      const auth = await loginWithGoogle(idToken)
      toast.success('Signed in successfully.')
      navigate(postLoginPath(auth.role), { replace: true })
    },
    [loginWithGoogle, navigate],
  )

  const { loading, hiddenButtonRef, onOverlayClick, ready } = useGoogleSignIn({
    onIdToken: handleIdToken,
    onError: (message) => toast.error(message),
  })

  const handleOverlayClick = () => {
    logout()
    onOverlayClick()
  }

  const inactive = disabled || loading || !ready

  return (
    <div className="relative w-full min-h-[48px]">
      {/* Real Google button (invisible) — receives clicks and returns credential JWT */}
      <div
        ref={hiddenButtonRef}
        className={`absolute inset-0 z-10 overflow-hidden opacity-0 ${inactive ? 'pointer-events-none' : 'cursor-pointer'}`}
        onClick={handleOverlayClick}
        aria-hidden
      />
      <div
        className={`${className} pointer-events-none relative z-0`}
        aria-busy={loading}
      >
        <FcGoogle className="w-5 h-5 shrink-0" aria-hidden />
        {loading ? 'Signing in with Google…' : 'Continue with Google'}
      </div>
    </div>
  )
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  if (!isGoogleSignInConfigured()) {
    return (
      <button
        type="button"
        disabled={props.disabled}
        className={props.className ?? defaultButtonClass}
        onClick={() =>
          toast.error('Google sign-in is not configured. Restart npm run dev after setting VITE_GOOGLE_CLIENT_ID.')
        }
      >
        <FcGoogle className="w-5 h-5 shrink-0" aria-hidden />
        Continue with Google
      </button>
    )
  }
  return <GoogleSignInButtonConfigured {...props} />
}
