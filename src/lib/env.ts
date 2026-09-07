// ARCHITECTURE.md §10.3 — the full variable list for this repository.
export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'TriFid',
  isDevelopment: process.env.NEXT_PUBLIC_ENV !== 'production',
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en') as 'en' | 'hi',
};
