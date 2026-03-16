export const Routes = {
  HOME: '/',
  FEED: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  AUTH_CALLBACK: '/auth/callback',
  BUILD_NEW: '/builds/new',
  PROFILE_SETTINGS: '/profile/settings',
} as const;

/** Returns the path for a specific build's detail page. */
export function buildRoute(id: string) {
  return `/builds/${id}` as const;
}

/** Returns the path for a specific build's edit page. */
export function buildEditRoute(id: string) {
  return `/builds/${id}/edit` as const;
}

/** Returns the path for a specific user's profile page. */
export function profileRoute(id: string) {
  return `/profile/${id}` as const;
}
