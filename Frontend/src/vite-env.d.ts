/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Maps Embed API key (Maps Embed API enabled in Google Cloud). Optional: falls back to a basic embed URL. */
  readonly VITE_GOOGLE_MAPS_EMBED_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
