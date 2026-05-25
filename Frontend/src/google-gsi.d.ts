export {}

declare global {
  interface GoogleCredentialResponse {
    credential?: string
  }

  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            config: {
              type?: string
              theme?: string
              size?: string
              text?: string
              width?: number | string
            },
          ) => void
        }
      }
    }
  }
}
