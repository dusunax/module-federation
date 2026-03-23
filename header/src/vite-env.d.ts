/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BOOKS_RECOMMENDATION_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
