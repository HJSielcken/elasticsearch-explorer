import { Link } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { routeMap } from '/routeMap'
import { GridCell, GridCellWithLeftPadding, GridRow, GridTable } from '/features/Grid'
import { apiCall, apiUrls } from '/api'
import { DialogModal } from '/features/Dialog'
import { Button } from '/features/Button'
import { Page } from './Page'

import styles from './IndexOverview.css'

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
      <GridTable>
        <GridRow className={styles.gridRow}>
          <GridCellWithLeftPadding layoutClassName={styles.indexCellLayout}>Index name</GridCellWithLeftPadding>
          <GridCellWithLeftPadding layoutClassName={styles.docCountCellLayout}>Doc count</GridCellWithLeftPadding>
          <GridCellWithLeftPadding layoutClassName={styles.mappingButtonCellLayout}>Mapping</GridCellWithLeftPadding>
        </GridRow>
        {
          indices.map(({ index, ['docs.count']: count }) => (
            <GridRow key={index}>
              <GridCellWithLeftPadding className={styles.gridCell} layoutClassName={styles.indexCellLayout}>
                <Link to={routeMap.index.documents({ index })}>{index}</Link>
              </GridCellWithLeftPadding>
              <GridCellWithLeftPadding className={styles.gridCell} layoutClassName={styles.docCountCellLayout}>{String(count).padStart(maxCount, '0')}</GridCellWithLeftPadding>
              <GridCell className={styles.gridCell} layoutClassName={styles.mappingButtonCellLayout}>
                <Button onClick={() => handleClick(index)}>
                  Show mapping
                </Button>
              </GridCell>
            </GridRow>
          ))
        }
      </GridTable>
    </Page>
  )
  { "0".pa }

  function handleClick(index) {
    setIndex(index)
    modalRef.current.showModal()
  }

  async function getIndices() {
    return apiCall(apiUrls.indices())
  }
}
