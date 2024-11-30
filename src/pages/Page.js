import { Link } from '@kaliber/routing'
import { routeMap } from '/routeMap'

import styles from './Page.css'

export function Page({ children, layoutClassName = undefined }) {
  return (
    <div className={cx(styles.componentLayout, styles.component, layoutClassName)}>
      <SiteHeader />
      {children}
    </div>
  )
}


function SiteHeader() {
  return (
    <div className={cx(styles.componentHeaderLayout, styles.componentHeader)}>
      <Link to={routeMap.home()}>Home</Link>
      <Link to={routeMap.index.overview()}>Overview</Link>
    </div>
  )
}
