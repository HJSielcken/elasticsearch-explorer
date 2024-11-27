import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { routeMap } from './routeMap'
import { LocationProvider, useLocationMatch, useRouting } from '@kaliber/routing'
import { useRenderOnMount } from '@kaliber/use-render-on-mount'
import { Link } from '@kaliber/routing'

import { IndexOverview } from './pages/IndexOverview'
import { DocumentOverview } from './pages/DocumentOverview'

import styles from './App.css'

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

  return (<div>
    <SiteHeader />
    {matchRoutes(
      [routeMap.home, <b>Home</b>],
      [routeMap.index.overview, <IndexOverview />],
      [routeMap.index.documents, <DocumentOverview />],
    )}
  </div>)
}

function SiteHeader() {
  return (
    <div className={styles.headerLayout}>
      <Link to={routeMap.home()}>Home</Link>
      <Link to={routeMap.index.overview()}>Overview</Link>
    </div>
  )
}
