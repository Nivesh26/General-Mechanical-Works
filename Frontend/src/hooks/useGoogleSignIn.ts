import { useGoogleOAuth } from '@react-oauth/google'
import { useCallback, useEffect, useRef, useState } from 'react'

function getGoogleIdentity() {
  return window.google?.accounts?.id
}

type UseGoogleSignInOptions = {
  /** Receives the Google ID token (JWT in `credential`). */
  onIdToken: (idToken: string) => Promise<void>
  onError?: (message: string) => void
}

/**
 * Google Identity Services credential flow (JWT in `credential`).
 * Renders a real GIS button into `hiddenButtonRef` (use as an invisible click overlay).
 */
export function useGoogleSignIn({ onIdToken, onError }: UseGoogleSignInOptions) {
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth()
  const [loading, setLoading] = useState(false)
  const [buttonHost, setButtonHost] = useState<HTMLDivElement | null>(null)
  const onIdTokenRef = useRef(onIdToken)
  const onErrorRef = useRef(onError)
  onIdTokenRef.current = onIdToken
  onErrorRef.current = onError

  useEffect(() => {
    const gsi = getGoogleIdentity()
    if (!scriptLoadedSuccessfully || !clientId || !gsi) return

    gsi.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: (response) => {
        const idToken = response.credential
        if (!idToken) {
          setLoading(false)
          onErrorRef.current?.('Google did not return an ID token. Try again or use email login.')
          return
        }
        void (async () => {
          try {
            await onIdTokenRef.current(idToken)
          } catch (err) {
            onErrorRef.current?.(err instanceof Error ? err.message : 'Google sign-in failed.')
          } finally {
            setLoading(false)
          }
        })()
      },
    })
  }, [clientId, scriptLoadedSuccessfully])

  useEffect(() => {
    const gsi = getGoogleIdentity()
    if (!buttonHost || !scriptLoadedSuccessfully || !clientId || !gsi) {
      return
    }
    buttonHost.innerHTML = ''
    gsi.renderButton(buttonHost, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: buttonHost.offsetWidth || 320,
    })
  }, [buttonHost, clientId, scriptLoadedSuccessfully])

  const hiddenButtonRef = useCallback((node: HTMLDivElement | null) => {
    setButtonHost(node)
  }, [])

  const onOverlayClick = useCallback(() => {
    setLoading(true)
  }, [])

  return { loading, hiddenButtonRef, onOverlayClick, ready: scriptLoadedSuccessfully }
}
