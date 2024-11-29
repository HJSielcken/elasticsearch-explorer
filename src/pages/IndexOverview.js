import { Link } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { routeMap } from '/routeMap'
import { GridCell, GridCellWithLeftPadding, GridRow, GridTable } from '/features/Grid'
import { apiCall, apiUrls } from '/api'
import { DialogModal } from '/features/Dialog'
import { Button } from '/features/Button'

import styles from './IndexOverview.css'

export function IndexOverview() {
  const modalRef = React.useRef(null)
  const [index, setIndex] = React.useState(null)

  const { data: indices } = useQuery({
    queryKey: ['indices'],
    queryFn: () => getIndices(),
    initialData: []
  })

  return (
    <>
      <DialogModal {...{ index, modalRef }} />
      <GridTable>
        <GridRow className={styles.gridRow}>
          <GridCellWithLeftPadding layoutClassName={styles.indexCellLayout}>Index name</GridCellWithLeftPadding>
          <GridCell layoutClassName={styles.docCountCellLayout}>Doc count</GridCell>
          <GridCell layoutClassName={styles.mappingButtonCellLayout}>Mapping</GridCell>
        </GridRow>
        {
          indices.map(({ index, ['docs.count']: count }) => (
            <GridRow key={index}>
              <GridCellWithLeftPadding layoutClassName={styles.indexCellLayout}>
                <Link to={routeMap.index.documents({ index })}>{index}</Link>
              </GridCellWithLeftPadding>
              <GridCell layoutClassName={styles.docCountCellLayout}>{count}</GridCell>
              <GridCell layoutClassName={styles.mappingButtonCellLayout}>
                <Button onClick={() => handleClick(index)}>
                  Show mapping
                </Button>
              </GridCell>
            </GridRow>
          ))
        }
      </GridTable>
    </>
  )

  function handleClick(index) {
    setIndex(index)
    modalRef.current.showModal()
  }

  async function getIndices() {
    return apiCall(apiUrls.indices())
  }
}
