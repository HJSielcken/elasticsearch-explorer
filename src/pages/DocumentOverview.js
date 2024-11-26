import { useForm } from '@kaliber/forms'
import { matchAll } from '@kaliber/elasticsearch/query'
import { optional } from '@kaliber/forms/validation'
import { useLocationMatch } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { apiCall, apiUrls } from '/api'

import { GridCell, GridRow, GridTable } from '/features/Grid'
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
              <HeaderGridCell layoutClassName={styles.documentsGridCellLayout}>_id</HeaderGridCell>
              {columns.map(key => <HeaderGridCell key={key}>{key}</HeaderGridCell>)}
            </GridRow>
            {documents.map(document => (
              <GridRow key={document._id} >
                <GridCell layoutClassName={styles.documentsGridCellLayout}><button onClick={() => { setDocumentId(document._id); modalRef.current.showModal() }}>{document._id}</button></GridCell>
                {columns.map(key => <GridCell key={key}>{['string', 'number'].includes(typeof document[key]) ? document[key] : JSON.stringify(document[key])}</GridCell>)}
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

function HeaderGridCell({ children, layoutClassName = undefined }) {
  return <GridCell className={styles.gridHeader} {...{ layoutClassName }}>{children}</GridCell>
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
