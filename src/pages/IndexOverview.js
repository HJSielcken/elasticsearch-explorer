import { Link, useLocationMatch } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { routeMap } from '/routeMap'
import { GridCell, GridCellWithPadding, GridRow, GridTable } from '/features/Grid'
import { apiCall, apiUrls } from '/api'
import { MappingModal } from '/features/Dialog'

import styles from './IndexOverview.css'

export function IndexOverview() {
  const { route, params } = useLocationMatch()
  const modalRef = React.useRef(null)
  const [index, setIndex] = React.useState(null)

  const { data: indices } = useQuery({
    queryKey: ['indices', route(params)],
    retry: false,
    retryOnMount: false,
    queryFn: () => getIndices(),
    initialData: []
  })

  return (
    <div>
      <MappingModal {...{ index, modalRef }} />
      <GridTable>
        <GridRow>
          <HeaderGridCell layoutClassName={styles.indexGridCellLayout}>Index name</HeaderGridCell>
          <HeaderGridCell>Doc count</HeaderGridCell>
          <HeaderGridCell>Mapping</HeaderGridCell>
        </GridRow>
        {
          indices.map(({ index, ['docs.count']: count }) => (
            <GridRow key={index}>
              <GridCellWithPadding layoutClassName={styles.indexGridCellLayout}>
                <Link to={routeMap.index.documents({ index })}>{index}</Link>
              </GridCellWithPadding>
              <GridCellWithPadding>{count}</GridCellWithPadding>
              <GridCell>
                <button className={styles.buttonLayout} onClick={() => {
                  setIndex(index)
                  modalRef.current.showModal()
                }}>
                  Show mapping
                </button>
              </GridCell>
            </GridRow>
          ))
        }
      </GridTable>
    </div>
  )

  async function getIndices() {
    return apiCall(apiUrls.indices())
  }
}

function HeaderGridCell({ children, layoutClassName = undefined }) {
  return <GridCellWithPadding className={styles.gridHeader} {...{ layoutClassName }}>{children}</GridCellWithPadding>
} 
