import { useForm } from '@kaliber/forms'
import { matchAll } from '@kaliber/elasticsearch/query'
import { optional } from '@kaliber/forms/validation'
import { useLocationMatch } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { apiCall, apiUrls } from '/api'

import { GridCell, GridCellWithPadding, GridRow, GridTable } from '/features/Grid'
import { MultiSelect } from './FormFields'
import { DocumentModal } from '/features/Dialog'
import { FormFieldValue } from '@kaliber/forms/components'

import styles from './DocumentOverview.css'

export function DocumentOverview() {
  const { route, params } = useLocationMatch()
  const { index } = params
  const modalRef = React.useRef(null)
  const [documentId, setDocumentId] = React.useState(null)
  const { form: { fields } } = useForm({
    fields: {
      columnsToShow: optional
    },
    onSubmit: console.log
  })

  const { data } = useQuery({
    queryKey: ['documents', route(params)],
    retry: false,
    retryOnMount: false,
    queryFn: () => getDocuments({ index }),
    initialData: { documents: [], total: 0 }
  })

  const { documents } = data
  const [{ _id, ...document } = {}] = documents
  const keys = Object.keys(document || [])

  return (
    <div>
      <DocumentModal {...{ index, documentId, modalRef }} />
      <MultiSelect field={fields.columnsToShow} options={keys} />
      <FormFieldValue field={fields.columnsToShow} render={(value = keys) => {
        const columns = keys.filter(x => value.includes(x))
        return (
          <GridTable>
            <GridRow>
              <HeaderGridCell layoutClassName={styles.firstGridCellLayout}>_id</HeaderGridCell>
              {columns.map(key => <HeaderGridCell key={key}>{key}</HeaderGridCell>)}
            </GridRow>
            {documents.map(document => (
              <GridRow key={document._id} > 
                <GridCell layoutClassName={styles.firstGridCellLayout}>
                  <button className={styles.buttonLayout} onClick={() => { setDocumentId(document._id); modalRef.current.showModal() }}>{document._id}</button>
                </GridCell>
                {columns.map(key => <DocumentGridCell key={key}>{['string', 'number'].includes(typeof document[key]) ? document[key] : JSON.stringify(document[key])}</DocumentGridCell>)}
              </GridRow>
            )
            )}
          </GridTable>
        )
      }
      } />
    </div>
  )
}

function HeaderGridCell({ children, layoutClassName = styles.cellLayout }) {
  return <GridCellWithPadding className={styles.gridHeader} {...{ layoutClassName }}><p style={{verticalAlign: 'center'}}>{children}</p></GridCellWithPadding>
} 

function DocumentGridCell({children}) {
  return (
    <GridCellWithPadding layoutClassName={styles.cellLayout}>{ children }</GridCellWithPadding>
  )
}

async function getDocuments({ index }) {
  const response = await apiCall(apiUrls.search({ index }), {
    method: 'POST',
    body: {
      from: 0,
      size: 9999,
      query: matchAll()
    }
  })

  const documents = response?.hits?.hits?.map(x => ({ _id: x._id, ...x._source })) || []
  const total = response?.hits?.total?.value || []

  return { documents, total }
}
