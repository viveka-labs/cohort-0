export const Routes = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  AUTH_CALLBACK: '/auth/callback',
  BUILD_NEW: '/builds/new',
} as const;

/** Returns the path for a specific build's detail page. */
export function buildRoute(id: string) {
  return `/builds/${id}` as const;
}
