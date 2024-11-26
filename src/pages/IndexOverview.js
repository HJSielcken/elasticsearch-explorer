import { Link, useLocationMatch } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { routeMap } from '/routeMap'
import { GridCell, GridRow, GridTable } from '/features/Grid'
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
              <GridCell layoutClassName={styles.indexGridCellLayout}>
                <Link to={routeMap.index.documents({ index })}>{index}</Link>
              </GridCell>
              <GridCell>{count}</GridCell>
              <GridCell>
                <button onClick={() => {
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
  return <GridCell className={styles.gridHeader} {...{ layoutClassName }}>{children}</GridCell>
} 
