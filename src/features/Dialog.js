import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiCall, apiUrls } from '/api'

import styles from './Dialog.css'

export function MappingModal({ index, modalRef }) {
  const { mapping } = useMapping({ index })

  return (
    <dialog ref={modalRef}>
      <div className={styles.mappingLayout}>
        <div className={cx(styles.indexLayout, styles.index)}>{index}</div>
        <ButtonBox>
          <button onClick={() => { modalRef.current.close() }}>Close dialog</button>
        </ButtonBox>
        <code>
          <pre>
            {JSON.stringify(mapping, null, 2)}
          </pre>
        </code>
      </div>
    </dialog>
  )
}

export function DocumentModal({ index, documentId, modalRef }) {
  const contentRef = React.useRef(null)
  const queryClient = useQueryClient()
  const { data: document } = useQuery({
    queryKey: [index, 'document', documentId],
    queryFn: () => getDocument({ index, documentId })
  })

  useRefetchOnClose({ modalRef, index, documentId })

  const { isPending, mutate: updateDoc } = useMutation({
    mutationFn: (textContent) => updateDocument({ textContent, index, documentId }),
  })

  const { mutate: deleteDoc } = useMutation({
    mutationFn: () => deleteDocument({ index, documentId }),
    onSuccess: (queryKey) => {
      queryClient.removeQueries({
        queryKey
      })
      modalRef.current.close()
    }
  })

  const { mutate: copyDoc } = useMutation({
    mutationFn: () => copyDocument({ index, document }),
  })

  return (
    <dialog ref={modalRef}>
      <div className={styles.documentLayout}>
        <div className={cx(styles.indexLayout, styles.index)}>
          {index} - {documentId}
        </div>
        <ButtonBox>
          <button onClick={() => { modalRef.current.close() }}>Close dialog</button>
          <button onClick={() => updateDoc(contentRef.current.textContent)}>Update document</button>
          <button onClick={() => deleteDoc(contentRef.current.textContent)}>Delete document</button>
          <button onClick={() => copyDoc(contentRef.current.textContent)}>Copy document</button>
        </ButtonBox>
        {isPending
          ? <>Loading...</>
          :
          <pre className={styles.formattedJSON} contentEditable suppressContentEditableWarning ref={contentRef}>
            {JSON.stringify(document, null, 2)}
          </pre>
        }
      </div>
    </dialog>
  )
}

async function updateDocument({ index, documentId, textContent }) {
  const body = { doc: JSON.parse(textContent) }
  await apiCall(apiUrls.update({ index, id: documentId }), { method: 'POST', body })
}

async function deleteDocument({ index, documentId }) {
  await apiCall(apiUrls.delete({ index, id: documentId }), { method: 'DELETE' })
  return [index, 'document', documentId]
}

async function copyDocument({ index, document }) {
  const documentId = Math.floor(Math.random() * 100000000)
  await apiCall(apiUrls.delete({ index, id: documentId }), { method: 'PUT', body: document })
}

function ButtonBox({ children }) {
  return (
    <div className={styles.buttonBoxLayout}>
      {children}
    </div>
  )
}

async function getDocument({ index, documentId }) {
  if (!documentId) return {}
  const { _source = {} } = await apiCall(apiUrls.document({ index, id: documentId }))

  return _source
}

export function useMapping({ index }) {
  const { data: mapping } = useQuery({
    queryKey: [index, 'mapping'],
    queryFn: () => getMapping({ index }),
    initialData: {}
  })

  return { mapping }
}


async function getMapping({ index }) {
  if (!index) return {}
  const response = await apiCall(apiUrls.mapping({ index }))
  return response[index].mappings
}

function useEvent(fn) {
  const fnRef = React.useRef(null)
  fnRef.current = fn

  return React.useCallback((...args) => fnRef.current(...args), [])
}

function useRefetchOnClose({ modalRef, index, documentId }) {
  const queryClient = useQueryClient()

  const onClose = useEvent((index) => {
    queryClient.invalidateQueries({
      queryKey: [index],
      type: 'all',
      refetchType: 'active'
    })
  })

  React.useEffect(() => {
    modalRef.current.addEventListener('close', () => onClose(index))

    return modalRef.current.removeEventListener('close', onClose)
  }, [index, modalRef.current, documentId]
  )
}
