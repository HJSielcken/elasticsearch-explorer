import { array, snapshot, useArrayFormField, useForm, useFormField, useObjectFormField } from '@kaliber/forms'
import { matchAll, filter, and, or, not, search, terms } from '@kaliber/elasticsearch/query'
import { optional, required } from '@kaliber/forms/validation'
import { useLocationMatch } from '@kaliber/routing'
import { useQuery } from '@tanstack/react-query'
import { apiCall, apiUrls } from '/api'

import { GridCell, GridCellWithPadding, GridRow, GridTable } from '/features/Grid'
import { MultiSelect } from './FormFields'
import { DocumentModal, useMapping } from '/features/Dialog'
import { FormFieldValue } from '@kaliber/forms/components'


import styles from './DocumentOverview.css'

export function DocumentOverview() {
  const [query, setQuery] = React.useState(matchAll())
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
    queryKey: ['documents', route(params), JSON.stringify(query)],
    retry: false,
    retryOnMount: false,
    queryFn: () => getDocuments({ index, query }),
    initialData: { documents: [], total: 0 }
  })

  const { documents } = data
  const [{ _id, ...document } = {}] = documents
  const keys = Object.keys(document || [])

  return (
    <div>
      <DocumentModal {...{ index, documentId, modalRef }} />
      <FilterForm {...{ index }} onFilterChange={handleFilterChange} />
      <div className={styles.columnSelectWrapperLayout}>
        <MultiSelect field={fields.columnsToShow} options={keys} />
      </div>
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
                  <button
                    className={styles.buttonLayout}
                    onClick={() => handleDocumentClick(document)}
                  >{document._id}</button>
                </GridCell>
                {columns.map(key => <GridCellWithPadding key={key}>{normalizeJson(document[key])}</GridCellWithPadding>)}
              </GridRow>
            )
            )}
          </GridTable>
        )
      }
      } />
    </div>
  )

  function handleDocumentClick(document) {
    setDocumentId(document._id)
    modalRef.current.showModal()
  }

  function handleFilterChange(query) {
    setQuery(query)
  }
}

function FilterForm({ index, onFilterChange }) {
  const fields = useFilterFields({ index })
  const { form, submit } = useForm({
    fields: {
      and: array(filterField()),
      or: array(filterField()),
      not: array(filterField())
    },
    initialValues: {
      and: [],
      or: [],
      not: []
    },
    onSubmit: ({ value }) => {
      const andFilters = value.and.map(toFilter).filter(Boolean)
      const orFilters = value.or.map(toFilter).filter(Boolean)
      const notFilters = value.not.map(toFilter).filter(Boolean)

      const query = and(matchAll(), or(...orFilters), not(...notFilters), and(...andFilters))

      onFilterChange(query)
    }
  })



  return (
    <div className={styles.filterFormLayout}>
      <FilterField field={form.fields.and} title='AND' {...{ fields }} />
      <FilterField field={form.fields.or} title='OR' {...{ fields }} />
      <FilterField field={form.fields.not} title='NOT' {...{ fields }} />
      <div className={styles.searchButtonWrapper}>
        <button className={styles.buttonLayout} onClick={submit}>Submit</button>
      </div>
    </div>
  )
}

function toFilter({ _type, fieldname, ...rest }) {
  if (_type === 'keyword') return terms(fieldname, ensureArray(rest.keyword))
  if (_type === 'text') return search(fieldname, ensureArray(rest.text))
  return null
}

function ensureArray(value) {
  return [].concat(value).filter(Boolean)
}

function FilterField({ field, fields, title }) {
  const { state: { children }, helpers } = useArrayFormField(field)
  const { keyword, text } = fields

  return (
    <div>
      <div className={styles.filterHeaderLayout}>
        <span>{title}</span>
        <button type='button' onClick={() => helpers.add({ _type: 'keyword' })}>+Keyword</button>
        <button type='button' onClick={() => helpers.add({ _type: 'text' })}>+Text</button>
      </div>
      <div className={styles.filterFieldsLayout}>
        {children.map(field => {
          const { _type } = field.value.get()

          return (_type === 'keyword' ? <KeywordFilterField key={field.name} keywordFields={keyword} {...{ field, helpers }} />
            : _type === 'text' ? <TextFilterField key={field.name} textFields={text} {...{ field, helpers }} />
              : null
          )
        })}
      </div>

    </div>
  )
}

function TextFilterField({ field, textFields, helpers }) {
  const { name, fields } = useObjectFormField(field)
  const { text, fieldname } = fields

  return (
    <div className={styles.filterFieldLayout}>
      <select name={`${name}_fieldname`} onChange={handleFieldnameChange} >
        {textFields.map(x => <option key={x} defaultValue={fieldname.state.value}>{x}</option>)}
      </select>
      <input name={`${name}_text`} type='text' defaultValue={text.state.value} onChange={handleTextChange} />
      <button onClick={handleDelete}> - </button>
    </div>
  )

  function handleFieldnameChange(e) {
    const fieldnameValue = e.target.value
    fieldname.eventHandlers.onChange(fieldnameValue)
  }

  function handleTextChange(e) {
    const textValue = e.target.value
    text.eventHandlers.onChange(textValue)
  }

  function handleDelete() {
    helpers.remove(field)
  }
}

function KeywordFilterField({ field, keywordFields, helpers }) {
  const { name, fields } = useObjectFormField(field)
  const { keyword, fieldname } = fields

  return (
    <div className={styles.filterFieldLayout}>
      <select name={`${name}_fieldname`} onChange={handleFieldnameChange} >
        <option>Select field</option>
        {keywordFields.map(x => <option key={x} defaultValue={fieldname.state.value}>{x}</option>)}
      </select>
      <input name={`${name}_keyword`} type='text' defaultValue={keyword.state.value} onChange={handleTextChange} />
      <button onClick={handleDelete}> - </button>
    </div>
  )

  function handleFieldnameChange(e) {
    const fieldnameValue = e.target.value
    fieldname.eventHandlers.onChange(fieldnameValue)
  }

  function handleTextChange(e) {
    const keywordValue = e.target.value
    keyword.eventHandlers.onChange(keywordValue)
  }

  function handleDelete() {
    helpers.remove(field)
  }
}

function filterField() {
  return value => ({
    _type: required,
    fieldname: required,
    ...(value._type === 'keyword' && { keyword: required }),
    ...(value._type === 'text' && { text: required })
  })
}

function useFilterFields({ index }) {
  const { mapping } = useMapping({ index })
  const keyword = React.useMemo(() => extractFieldsWithType(mapping, 'keyword'), [mapping])
  const text = React.useMemo(() => extractFieldsWithType(mapping, 'text'), [mapping])

  return { keyword, text }
}

function extractFieldsWithType(mapping, type, path = []) {
  return Object.entries(mapping).reduce(
    (result, [k, v]) => {
      if (typeof v === 'object')
        return [...extractFieldsWithType(v, type, [...path, k]), ...result]

      if (v === type)
        return [path.filter(x => x !== 'properties').join('.'), ...result]

      return result
    },
    []
  )
}



function HeaderGridCell({ children, layoutClassName = styles.cellLayout }) {
  return <GridCellWithPadding className={styles.gridHeader} {...{ layoutClassName }}>{children}</GridCellWithPadding>
}

async function getDocuments({ index, query }) {
  const response = await apiCall(apiUrls.search({ index }), {
    method: 'POST',
    body: {
      from: 0,
      size: 9999,
      query,
    }
  })

  const documents = response?.hits?.hits?.map(x => ({ _id: x._id, ...x._source })) || []
  const total = response?.hits?.total?.value || []

  return { documents, total }
}

function normalizeJson(o) {
  return ['string', 'number'].includes(typeof o) ? o : JSON.stringify(o)
}
