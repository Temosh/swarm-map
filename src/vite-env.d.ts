/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOURSQUARE_CLIENT_ID: string;
  readonly VITE_FOURSQUARE_CLIENT_SECRET: string;
  readonly VITE_FOURSQUARE_REDIRECT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
