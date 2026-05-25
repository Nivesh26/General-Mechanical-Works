import type { Role } from './api'

/** After login: admins go to the dashboard; everyone else goes to the homepage. */
export function postLoginPath(role: Role): string {
  return role === 'ADMIN' ? '/admindashboard' : '/'
}
