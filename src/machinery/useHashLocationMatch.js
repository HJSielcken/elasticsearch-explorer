import { pickRoute, useLocation } from '@kaliber/routing'
import { routeMap } from '/routeMap'
import { normalizeLink } from './normalizeLink'

export function useHashLocationMatch() {
  const { hash } = useLocation()

  const { route, params } = pickRoute(normalizeLink(hash), routeMap)
  return { route, params }
}
