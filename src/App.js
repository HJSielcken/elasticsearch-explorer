import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeMap } from './routeMap'
import { LocationProvider, useLocation, pick } from '@kaliber/routing'
import { useRenderOnMount } from '@kaliber/use-render-on-mount'

import { DocumentOverview } from './pages/DocumentOverview'
import { IndexOverview } from './pages/IndexOverview'
import { normalizeLink } from './machinery/normalizeLink'

const client = new QueryClient()

export default function App() {
  const isMounted = useRenderOnMount()
  const initialLocation = { pathname: '/', hash: '/' }
  if (!isMounted) return <div />

  return (
    <LocationProvider {...{ routeMap, initialLocation }}>
      <QueryClientProvider {...{ client }}>
        <Site />
      </QueryClientProvider>
    </LocationProvider>
  )
}

function Site() {
  const location = useLocation()
  const pathname = normalizeLink(location.hash)

  return pick(pathname,
    [routeMap, <IndexOverview />],
    [routeMap.app.index, <IndexOverview />],
    [routeMap.app.index.documents, <DocumentOverview />]
  )
}
