import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeMap } from './routeMap'
import { LocationProvider, useRouting } from '@kaliber/routing'
import { useRenderOnMount } from '@kaliber/use-render-on-mount'
import { Page } from './pages/Page'

import { IndexOverview } from './pages/IndexOverview'
import { DocumentOverview } from './pages/DocumentOverview'

const client = new QueryClient()

export default function App() {
  const isMounted = useRenderOnMount()

  const initialLocation = { pathname: '/' }

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
  const { matchRoutes } = useRouting()

  return (
    matchRoutes(
      [routeMap.home, <b>Home</b>],
      [routeMap.index.overview, <IndexOverview />],
      [routeMap.index.documents, <DocumentOverview />],
    )
  )
}
