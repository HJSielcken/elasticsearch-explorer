import { Link } from '@kaliber/routing'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { routeMap } from '/routeMap'
import { GridCell, GridColumn, GridTableColumns } from '/features/Grid'
import { apiCall, apiUrls } from '/api'
import { ButtonBox, MappingModal, useEvent } from '/features/Dialog'
import { Button } from '/features/Button'
import { Page } from './Page'
import { toHashLink } from '/machinery/normalizeLink'
import { snapshot, useForm, useFormField } from '@kaliber/forms'
import { optional } from '@kaliber/forms/validation'
import { matchAll } from '@kaliber/elasticsearch/query'

import styles from './IndexOverview.css'

export function IndexOverview() {
  const modalRef = React.useRef(null)
  const [index, setIndex] = React.useState(null)

  const [searchValue, setSearchValue] = React.useState('')
  const { data: indices } = useQuery({
    queryKey: ['indices'],
    queryFn: () => getIndices(),
    initialData: []
  })

  const { form, reset } = useForm({
    fields: {
      indices: optional
    },
    onSubmit: () => {}
  })

  const { deleteIndices, emptyIndices } = useIndexActions({ form, reset })
  const filteredIndices = indices.filter(x => x.index.includes(searchValue))

  const maxCount = React.useMemo(() => String(Math.max(...filteredIndices.map(x => x['docs.count']))).length, [filteredIndices])

  return (
    <Page renderInputComponent={() => <InputComponent onSearchChange={handleSearchChange} {...{ searchValue }} />}>
      <MappingModal {...{ index, modalRef }} />

      <GridTableColumns>
        <GridColumn layoutClassName={styles.mappingCheckboxCellLayout}>
          <GridCell className={styles.headerGridCell}>
            <SelectAllButton field={form.fields.indices} indices={filteredIndices.map(x => x.index)} />

          </GridCell>
          {filteredIndices.map(({ index }) => (
            <GridCell key={index}>
              <CheckBox field={form.fields.indices} instanceValue={index} allValues={filteredIndices.map(x => x.index)} />
            </GridCell>
          ))}
        </GridColumn>
        <GridColumn layoutClassName={styles.mappingButtonCellLayout}>
          <GridCell className={styles.headerGridCell}>Mapping</GridCell>
          {filteredIndices.map(({ index }) => (
            <GridCell key={index}>
              <Button onClick={() => handleClick(index)}>
                Show mapping
              </Button>
            </GridCell>
          ))}
        </GridColumn>
        <GridColumn layoutClassName={styles.indexCellLayout}>
          <GridCell className={styles.headerGridCell}>Index name</GridCell>
          {filteredIndices.map(({ index }) => (
            <GridCell key={index} className={styles.gridCell}>
              <Link to={toHashLink(routeMap.app.index.documents({ index }))}>{index}</Link>
            </GridCell>
          ))}
        </GridColumn>
        <GridColumn layoutClassName={styles.docCountCellLayout}>
          <GridCell className={styles.headerGridCell}>Doc count</GridCell>
          {filteredIndices.map(({ index, ['docs.count']: count }) => (
            <GridCell key={index} className={styles.gridCell}>
              {String(count).padStart(maxCount, '0')}
            </GridCell>
          ))}
        </GridColumn>
      </GridTableColumns>
      <ButtonBox>
        <Button onClick={deleteIndices}>Delete</Button>
        <Button onClick={emptyIndices}>Clear</Button>
      </ButtonBox>
    </Page>
  )

  function handleClick(index) {
    setIndex(index)
    modalRef.current.showModal()
  }

  async function getIndices() {
    const indices = await apiCall(apiUrls.indices())
    return indices.toSorted((a, b) => a.index.localeCompare(b.index))
  }

  function handleSearchChange(value) {
    setSearchValue(value)
  }
}

function InputComponent({ searchValue, onSearchChange }) {
  return (
    <div className={styles.componentSearchInput}>
      <input type='text' value={searchValue} onChange={handleChange} />
    </div>
  )

  function handleChange(e) {
    onSearchChange(e.target.value)
  }
}

function CheckBox({ field, instanceValue, allValues }) {
  const shiftIsDownRef = useShiftIsDownEvent()
  const { state, eventHandlers } = useFormField(field)
  const { value = [] } = state
  const checked = value.includes(instanceValue)

  return <input type='checkbox' {...{ checked }} value={instanceValue} onChange={() => handleChange(instanceValue)} />

  function handleChange(instanceValue) {
    if (shiftIsDownRef.current) {
      const [lastValue] = value.slice(-1)
      const [minIndex, maxIndex] = [allValues.indexOf(lastValue) + 1, allValues.indexOf(instanceValue) + 1].sort((a, b) => a - b)
      const newValue = [...value, ...allValues.slice(minIndex, maxIndex)]
      eventHandlers.onChange(newValue)
    } else {
      const newValue = value.includes(instanceValue)
        ? value.filter(x => x !== instanceValue)
        : [...value, instanceValue]

      eventHandlers.onChange(newValue)
    }
  }
  
}

function SelectAllButton({ field, indices }) {
  const { state, eventHandlers } = useFormField(field)
  const { value = [] } = state
  const checked = indices.length > 0 && indices.every(x => value.includes(x))

  return <input type='checkbox' {...{ checked }} onChange={handleChange} />

  function handleChange() {
    const checked = indices.every(x => value.includes(x))
    const newValue = checked ? [] : indices
    eventHandlers.onChange(newValue)
  }
}

function useIndexActions({ form, reset }) {
  const queryClient = useQueryClient()

  const { mutate: deleteIndices } = useMutation({
    mutationFn: async () => {
      const { value } = snapshot.get(form)

      const { indices } = value
      if (!indices) return
      return apiCall(apiUrls.index.delete({ index: indices.join(',') }), { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ['indices'],
      })
      reset()
    }
  })

  const { mutate: emptyIndices } = useMutation({
    mutationFn: async () => {
      const { value } = snapshot.get(form)
      const { indices } = value
      if (!indices) return

      await apiCall(apiUrls.index.deleteByQuery({ index: indices.join(',') }), {
        body: {
          query: matchAll()
        },
        method: 'POST'
      })
    }
  })

  return { deleteIndices, emptyIndices }
}

function useShiftIsDownEvent() {
  const shiftIsDownRef = React.useRef(false)
  const shiftDownEventHandler = useEvent((e) => {
    if (e.shiftKey) shiftIsDownRef.current = true
  })

  const shiftUpEventHandler = useEvent((e) => {
    shiftIsDownRef.current = false
  })

  React.useEffect(
    () => {
      window.addEventListener('keydown', shiftDownEventHandler)
      window.addEventListener('keyup', shiftUpEventHandler)

      return () => {
        window.removeEventListener('keydown', shiftDownEventHandler)
        window.removeEventListener('keyup', shiftUpEventHandler)
      }
    },
    []
  )

  return shiftIsDownRef
}
