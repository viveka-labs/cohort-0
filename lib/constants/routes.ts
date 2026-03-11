export const Routes = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  AUTH_CALLBACK: '/auth/callback',
  BUILD_NEW: '/builds/new',
  buildDetail: (id: string) => `/builds/${id}` as const,
} as const;
