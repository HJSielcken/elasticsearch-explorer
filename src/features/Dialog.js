import { useQuery } from '@tanstack/react-query'
import { apiCall, apiUrls } from '/api'

import styles from './Dialog.css'

export function MappingModal({ index, modalRef }) {
  const { data: mapping } = useQuery({
    queryKey: ['mapping', index],
    queryFn: () => getMapping({ index }),
    initialData: {}
  })

  return (
    <dialog ref={modalRef}>
      <div className={styles.mappingLayout}>
        <div className={cx(styles.indexLayout, styles.index)}>{index}</div>
        <button onClick={() => { modalRef.current.close() }}>Close dialog</button>
        <code>
          <pre>
            {JSON.stringify(mapping, null, 2)}
          </pre>
        </code>
      </div>
    </dialog>
  )

  async function getMapping({ index }) {
    const response = await apiCall(apiUrls.mapping({ index }))
    return response[index].mappings
  }
}

export function DocumentModal({ index, documentId, modalRef }) {
  const contentRef = React.useRef(null)
  const { data: document } = useQuery({
    queryKey: ['document', index, documentId],
    queryFn: () => getDocument({ index, documentId })
  })

  return (
    <dialog ref={modalRef}>
      <div className={styles.documentLayout}>
        <div className={cx(styles.indexLayout, styles.index)}>{index} - {documentId}</div>
        <button onClick={() => { modalRef.current.close() }}>Close dialog</button>
        <button onClick={() => { console.log(JSON.parse(contentRef.current.textContent)) }}>Update document</button>
        <pre className={styles.formattedJSON} contentEditable suppressContentEditableWarning ref={contentRef}>
          {JSON.stringify(document, null, 2)}
        </pre>
      </div>
    </dialog>
  )
}

async function getDocument({ index, documentId }) {
  if (!documentId) return {}
  const { _source } = await apiCall(apiUrls.document({ index, id: documentId }))

  return _source
}
