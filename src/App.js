import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeMap } from './routeMap'
import { LocationProvider, useRouting } from '@kaliber/routing'
import { useRenderOnMount } from '@kaliber/use-render-on-mount'

import { DocumentOverview } from './pages/DocumentOverview'
import { IndexOverview } from './pages/IndexOverview'
import { Page } from './pages/Page'

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
      [routeMap.home, <Page>Home</Page>],
      [routeMap.index.overview, <IndexOverview />],
      [routeMap.index.documents, <DocumentOverview />],
    )
  )
}
