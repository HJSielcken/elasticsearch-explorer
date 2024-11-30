import { array, useArrayFormField, useForm, useFormField, useObjectFormField } from '@kaliber/forms'
import { matchAll, and, or, not, search, terms } from '@kaliber/elasticsearch/query'
import { optional, required } from '@kaliber/forms/validation'
import { useLocationMatch } from '@kaliber/routing'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiCall, apiUrls } from '/api'

import { GridCell, GridCellWithLeftPadding, GridRow, GridTable } from '/features/Grid'
import { MultiSelect } from './FormFields'
import { DocumentModal, useMapping } from '/features/Dialog'
import { FormFieldValue } from '@kaliber/forms/components'
import { Page } from './Page'
import { Button } from '/features/Button'

import styles from './DocumentOverview.css'

export function DocumentOverview() {

  const [query, setQuery] = React.useState(matchAll())
  const { params } = useLocationMatch()
  const { index } = params
  const fields = useFilterFields(index)
  const modalRef = React.useRef(null)
  const [documentId, setDocumentId] = React.useState(null)

  const { form } = useForm({
    fields: {
      columnsToShow: optional
    },
    onSubmit: () => { }
  })

  const { data } = useQuery({
    queryKey: [index, 'documents', JSON.stringify(query)],
    queryFn: () => getDocuments({ index, query }),
    initialData: { documents: [], total: 0 }
  })

  const { documents } = data
  const [{ _id, ...document } = {}] = documents
  const keys = Object.keys(document || [])

  return (
    <Page>
      <DocumentModal {...{ index, documentId, modalRef }} />
      <FilterForm {...{ index }} onFilterChange={handleFilterChange} columnToShowField={form.fields.columnsToShow} columns={keys} {...{ fields }} />
      <FormFieldValue field={form.fields.columnsToShow} render={(value = keys) => {
        const columns = keys.filter(x => value.includes(x))
        return <DocumentTable {...{ documents, columns }} />
      }
      } />
    </Page>
  )

  function DocumentTable({ documents, columns }) {
    return (
      <GridTable>
        <GridRow className={styles.gridRow}>
          <GridCellWithLeftPadding className={styles.headerGridCell} layoutClassName={styles.idCellLayout}>_id</GridCellWithLeftPadding>
          {columns.map(key => <GridCellWithLeftPadding key={key} className={styles.headerGridCell} layoutClassName={styles.documentFieldsCellLayout}>{key}</GridCellWithLeftPadding>)}
        </GridRow>
        {documents.map(document => (
          <GridRow key={document._id} >
            <GridCell layoutClassName={styles.idCellLayout}>
              <Button onClick={() => handleDocumentClick(document)} >{document._id} </Button>
            </GridCell>
            {columns.map(key => <GridCellWithLeftPadding key={key} className={styles.gridCell} layoutClassName={styles.documentFieldsCellLayout}>{normalizeJson(document[key])}</GridCellWithLeftPadding>)}
          </GridRow>
        )
        )}
      </GridTable>
    )
  }

  function handleDocumentClick(document) {
    setDocumentId(document._id)
    modalRef.current.showModal()
  }

  function handleFilterChange(query) {
    setQuery(query)
  }
}

function FilterForm({ columnToShowField, index, columns, onFilterChange, fields }) {
  const queryClient = useQueryClient()
  const { form, submit, reset } = useForm({
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
    <div className={styles.componentFilterFormLayout}>
      <FilterField field={form.fields.and} title='AND' {...{ fields }} />
      <FilterField field={form.fields.or} title='OR' {...{ fields }} />
      <FilterField field={form.fields.not} title='NOT' {...{ fields }} />
      {/* <div className={styles.buttonRowLayout}> */}
      {/* <div className={styles.buttonsLayout}> */}
      {/* <button className={styles.buttonLayout} onClick={submit}>Search</button> */}
      {/* <button className={styles.buttonLayout} onClick={handleReset}>Reset</button> */}
      {/* <button className={styles.buttonLayout} onClick={handleRefresh}>Refresh</button> */}
      {/* </div> */}
      {/* <MultiSelect field={columnToShowField} options={columns} initialValue={columns} /> */}
      {/* </div> */}
    </div>
  )

  function handleReset() {
    reset()
    submit()
  }

  function handleRefresh() {
    queryClient.invalidateQueries({
      queryKey: [index],
      type: 'all',
      refetchType: 'active'
    })
  }
}

function toFilter({ _type, fieldname, ...rest }) {
  const keyword = ensureArray(rest.keyword)
  const text = ensureText(rest.text)
  if (_type === 'keyword') return keyword.length && terms(fieldname, keyword)
  if (_type === 'text') return text && search([fieldname], ensureText(text))
  return null
}

function ensureArray(value) {
  return [].concat(value).filter(Boolean)
}

function ensureText(value) {
  return String(value)
}

function FilterField({ field, fields, title }) {
  const { state: { children }, helpers } = useArrayFormField(field)
  const { keyword, text, optionsPerKeyword } = fields

  return (
    <div className={styles.componentfilterFieldLayout}>
      <div className={styles.filterFieldHeaderLayout}>
        <div className={styles.filterFieldTitle}>{title}</div>
        <Button onClick={() => helpers.add({ _type: 'keyword' })} layoutClassName={styles.filterFieldButton}>+Keyword</Button>
        <Button onClick={() => helpers.add({ _type: 'text' })} layoutClassName={styles.filterFieldButton}>+Text</Button>
      </div>
      <div className={styles.filterFieldsLayout}>
        {children.map(field => {
          const { _type } = field.value.get()
          if (_type === 'keyword') return <KeywordFilterField key={field.name} keywordFields={keyword} {...{ field, helpers, optionsPerKeyword }} />
          if (_type === 'text') return <TextFilterField key={field.name} textFields={text} {...{ field, helpers }} />
        })}

      </div>

    </div>
  )
}

function TextFilterField({ field, textFields, helpers }) {
  const { name, fields } = useObjectFormField(field)
  const { text, fieldname } = fields

  return (
    <div className={styles.componentTextFilterFieldLayout}>
      <Button onClick={handleDelete} layoutClassName={styles.deleteButtonLayout}> - </Button>
      <select className={styles.selectFieldLayout} name={`${name}_fieldname`} onChange={handleFieldnameChange} >
        <option>Select Field</option>
        {textFields.map(x => <option key={x} defaultValue={fieldname.state.value}>{x}</option>)}
      </select>
      <input name={`${name}_text`} type='text' defaultValue={text.state.value} onChange={handleTextChange} />
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

function KeywordFilterField({ field, keywordFields, helpers, optionsPerKeyword }) {
  const keyword = useFormField(field.fields.keyword)
  const fieldname = useFormField(field.fields.fieldname)

  return (
    <div className={styles.componentKeywordFilterFieldLayout}>
      <Button onClick={handleDelete} layoutClassName={styles.deleteButtonLayout}> - </Button>
      <select className={styles.selectFieldLayout} name={`${fieldname.name}_fieldname`} onChange={handleFieldnameChange} >
        <option>Select Field</option>
        {keywordFields.map(x => <option key={x} defaultValue={fieldname.state.value}>{x}</option>)}
      </select>
      {/* <div>
        <select className={styles.selectFieldLayout} name={`${fieldname.name}_keyword`} onChange={handleTextChange} >
          <option>Select value</option>
          {optionsPerKeyword[fieldname.state.value]?.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </div> */}
      <MultiSelect options={optionsPerKeyword[fieldname.state.value]} field={field.fields.keyword} initialValue={[]} />
    </div>
  )

  function handleFieldnameChange(e) {
    const fieldnameValue = e.target.value
    fieldname.eventHandlers.onChange(fieldnameValue)
    keyword.eventHandlers.onChange('')
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

function useFilterFields(index) {
  const { mapping } = useMapping({ index })
  const keyword = React.useMemo(() => extractFieldsWithType(mapping, 'keyword'), [mapping])
  const text = React.useMemo(() => extractFieldsWithType(mapping, 'text'), [mapping])

  const { data: optionsPerKeyword } = useQuery({
    queryKey: [index, 'aggregations', keyword],
    queryFn: () => getAggregations({ keyword, index })
  })

  console.log(optionsPerKeyword)

  return { keyword, text, optionsPerKeyword }
}


async function getAggregations({ keyword, index }) {
  const aggs = Object.fromEntries(keyword.map(x => [x, terms(x)]))
  const body = { aggs, size: 0 }

  const response = await apiCall(apiUrls.search({ index }), { method: 'POST', body })
  return Object.fromEntries(
    Object.entries(response.aggregations).map(([k, v]) => [k, v.buckets.map(x => x.key)])
  )

  function terms(x) {
    return { terms: { field: x } }
  }
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
