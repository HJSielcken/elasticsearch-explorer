import {  useFormField } from '@kaliber/forms'

import styles from './FormFields.css'

export function MultiSelect({ options, field }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { name, state, eventHandlers: { onChange } } = useFormField(field)
  const { value = options } = state

  return (
    <div>
      <button onClick={() => setIsOpen(x => !x)}>Select columns</button>
      <ul className={cx(isOpen && styles.multiSelectIsOpen, styles.multiSelectLayout)}>
        <li><button onClick={() => value.length === options.length ? onChange([]) : onChange(options)}>(De)select all</button></li>
        {options.map(x => (<li key={x}>
          <input type='checkbox' {...{ name }} onChange={() => handleChange(x)} checked={value.includes(x)} id={x} />
          <label htmlFor={x}>{x}</label>
        </li>)
        )}
      </ul>
    </div>
  )

  function handleChange(optionValue) {
    if (value.includes(optionValue)) onChange(value.filter(x => x !== optionValue))
    else onChange([...value, optionValue])
  }
}
