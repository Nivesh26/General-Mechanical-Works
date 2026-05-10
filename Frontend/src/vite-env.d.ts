/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Maps Embed API key (Maps Embed API enabled in Google Cloud). Optional: falls back to a basic embed URL. */
  readonly VITE_GOOGLE_MAPS_EMBED_KEY?: string;
  /** Spring Boot API base URL (no trailing slash). Defaults to http://localhost:8080 in code. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
