import { Link } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { routeMap } from '/routeMap'
import { GridCell, GridCellWithLeftPadding, GridColumn, GridRow, GridTable, GridTableColumns } from '/features/Grid'
import { apiCall, apiUrls } from '/api'
import { DialogModal } from '/features/Dialog'
import { Button } from '/features/Button'
import { Page } from './Page'

import styles from './IndexOverview.css'
import { toHashLink } from '/machinery/normalizeLink'

export function IndexOverview() {
  const modalRef = React.useRef(null)
  const [index, setIndex] = React.useState(null)

  const { data: indices } = useQuery({
    queryKey: ['indices'],
    queryFn: () => getIndices(),
    initialData: []
  })

  const maxCount = React.useMemo(() => String(Math.max(...indices.map(x => x['docs.count']))).length, [indices])

  return (
    <Page>
      <DialogModal {...{ index, modalRef }} />
      <GridTableColumns>
        <GridColumn layoutClassName={styles.mappingButtonCellLayout}>
          <GridCell className={styles.headerGridCell}>Mapping</GridCell>
          {indices.map(({ index }) => (
            <GridCell key={index}>
              <Button onClick={() => handleClick(index)}>
                Show mapping
              </Button>
            </GridCell>
          ))}
        </GridColumn>
        <GridColumn layoutClassName={styles.indexCellLayout}>
          <GridCell className={styles.headerGridCell}>Index name</GridCell>
          {indices.map(({ index }) => (
            <GridCell key={index} className={styles.gridCell}>
              <Link to={toHashLink(routeMap.app.index.documents({ index }))}>{index}</Link>
            </GridCell>
          ))}
        </GridColumn>
        <GridColumn layoutClassName={styles.docCountCellLayout}>
          <GridCell className={styles.headerGridCell}>Doc count</GridCell>
          {indices.map(({ index, ['docs.count']: count }) => (
            <GridCell key={index} className={styles.gridCell}>
              {String(count).padStart(maxCount, '0')}
            </GridCell>
          ))}
        </GridColumn>
      </GridTableColumns>
    </Page>
  )

  function handleClick(index) {
    setIndex(index)
    modalRef.current.showModal()
  }

  async function getIndices() {
    return apiCall(apiUrls.indices())
  }
}
