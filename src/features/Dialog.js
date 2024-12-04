import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiCall, apiUrls } from '/api'
import { matchAll } from '@kaliber/elasticsearch/query'
import { Button } from './Button'

import styles from './Dialog.css'

export function MappingModal({ index, modalRef }) {
  const { mapping } = useMapping({ index })

  const actions = useIndexActions({ index, modalRef })
  useRefetchOnClose({modalRef, queryKey: ['indices']})

  const buttons = [
    <Button key='Clear' onClick={() => actions.emptyIndex()}>Clear index</Button>,
    <Button key='Delete' onClick={() => actions.deleteIndex()}>Delete index</Button>,
  ]

  return (
    <DialogBase title={index} {...{ modalRef, buttons }}>
      <FormattedJson data={mapping} />
    </DialogBase>
  )
}

export function DocumentModal({ index, documentId, modalRef }) {
  const contentRef = React.useRef(null)
  const title = `${index} - ${documentId}`

  const { document, actions } = useDocumentActions({ index, documentId, modalRef })
  useRefetchOnClose({modalRef, queryKey: [index]})


  const buttons = [
    <Button key='update' onClick={() => actions.update.mutate(contentRef.current.textContent)}>Update document</Button>,
    <Button key='delete' onClick={() => actions.delete.mutate(contentRef.current.textContent)}>Delete document</Button>,
    <Button key='copy' onClick={() => actions.copy.mutate(contentRef.current.textContent)}>Copy document</Button>,
  ]

  return (
    <DialogBase {...{ title, buttons, modalRef }}>
      {actions.update.isPending ? 'Loading' : <FormattedJsonEdittable data={document} {...{ contentRef }} />}
    </DialogBase>
  )
}

function DialogBase({ title, modalRef, buttons = undefined, children = undefined }) {
  return (
    <dialog className={styles.componentLayout} ref={modalRef}>
      <div className={styles.containerLayout}>
        <DialogHeading>{title}</DialogHeading>
        <ButtonBox>
          <Button onClick={handleClick}>Close Dialog</Button>
          {buttons}
        </ButtonBox>
        {children}
      </div>
    </dialog>
  )

  function handleClick() {
    modalRef.current.close()
  }
}

function DialogHeading({ children }) {
  return <div className={cx(styles.componentDialogHeadingLayout, styles.componentDialogHeading)}>{children}</div>
}

function FormattedJson({ data }) {
  return (
    <pre className={styles.componentFormattedJSONLayout}>
      {JSON.stringify(data, null, 2)}
    </pre>)
}

function FormattedJsonEdittable({ data, contentRef }) {
  return (
    <pre className={styles.componentFormattedJSONLayout} ref={contentRef} contentEditable suppressContentEditableWarning>
      {JSON.stringify(data, null, 2)}
    </pre>)
}

async function updateDocument({ index, documentId, textContent }) {
  const body = { doc: JSON.parse(textContent) }
  await apiCall(apiUrls.document.update({ index, id: documentId }), { method: 'POST', body })
}

async function deleteDocument({ index, documentId }) {
  await apiCall(apiUrls.document.delete({ index, id: documentId }), { method: 'DELETE' })
  return [index, 'document', documentId]
}

async function copyDocument({ index, document }) {
  const documentId = Math.floor(Math.random() * 100000000)
  await apiCall(apiUrls.document.delete({ index, id: documentId }), { method: 'PUT', body: document })
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
  const { _source = {} } = await apiCall(apiUrls.document.get({ index, id: documentId }))

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
  const response = await apiCall(apiUrls.index.mapping({ index }))
  return response[index].mappings
}

export function useEvent(fn) {
  const fnRef = React.useRef(null)
  fnRef.current = fn

  return React.useCallback((...args) => fnRef.current(...args), [])
}

function useRefetchOnClose({ modalRef, queryKey }) {
  const queryClient = useQueryClient()

  const onClose = useEvent((queryKey) => {
    queryClient.refetchQueries({
      queryKey,
    })
  })

  React.useEffect(() => {
    modalRef.current.addEventListener('close', () => onClose(queryKey))

    return modalRef.current.removeEventListener('close', onClose)
  }, [queryKey, modalRef.current, queryKey]
  )
}

function useIndexActions({ index, modalRef }) {
  const queryClient = useQueryClient()

  const { mutate: deleteIndex } = useMutation({
    mutationFn: async () => {
      await apiCall(apiUrls.index.delete({ index }), { method: 'DELETE' })
    },
    onSuccess: () => {
      modalRef.current.close()
    }
  })

  const { mutate: emptyIndex } = useMutation({
    mutationFn: async () => {
      await apiCall(apiUrls.index.deleteByQuery({ index }), {
        body: {
          query: matchAll()
        },
        method: 'POST'
      })
    }
  })

  return { emptyIndex, deleteIndex }
}

function useDocumentActions({ index, documentId, modalRef }) {
  const { data: document } = useQuery({
    queryKey: [index, 'document', documentId],
    queryFn: () => getDocument({ index, documentId })
  })


  const { isPending, mutate: updateDoc } = useMutation({
    mutationFn: (textContent) => updateDocument({ textContent, index, documentId }),
  })

  const { mutate: deleteDoc } = useMutation({
    mutationFn: () => deleteDocument({ index, documentId }),
    onSuccess: () => {
      modalRef.current.close()
    }
  })

  const { mutate: copyDoc } = useMutation({
    mutationFn: () => copyDocument({ index, document }),
  })

  return {
    document,
    actions: {
      update: {
        isPending,
        mutate: updateDoc,
      },
      delete: {
        mutate: deleteDoc
      },
      copy: {
        mutate: copyDoc
      }
    }
  }
}
