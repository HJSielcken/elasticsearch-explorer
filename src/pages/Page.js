import { Link } from '@kaliber/routing'
import { routeMap } from '/routeMap'

import styles from './Page.css'
import { toHashLink } from '/machinery/normalizeLink'

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
      <Link to={toHashLink(routeMap.app.index.overview())}>Overview</Link>
    </div>
  )
}
