import { Link } from '@kaliber/routing'
import { routeMap } from '/routeMap'
import { toHashLink } from '/machinery/normalizeLink'

import styles from './Page.css'

export function Page({ children, renderInputComponent = undefined}) {
  return (
    <div className={cx(styles.componentLayout, styles.component)}>
      <SiteHeader {...{ renderInputComponent }} />
      {children}
    </div>
  )
}

function SiteHeader({ renderInputComponent }) {
  return (
    <div className={cx(styles.componentHeaderLayout, styles.componentHeader)}>
      <Link to={toHashLink(routeMap.app.index.overview())}>Overview</Link>
      {renderInputComponent && renderInputComponent()}
    </div>
  )
}
