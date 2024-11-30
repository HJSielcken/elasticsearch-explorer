import { useFormField } from '@kaliber/forms'

import styles from './FormFields.css'
import { Button } from '/features/Button'

export function MultiSelect({ field, options = [], initialValue}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { name, state, eventHandlers: { onChange } } = useFormField(field)
  const { value = initialValue } = state

  return (
    <div className={styles.multiSelectLayout}>
      <Button onClick={() => setIsOpen(x => !x)}>Select Columns ↓</Button>
      <ul className={cx(isOpen && styles.multiSelectIsOpen, styles.multiSelectIsOpenLayout)}>
        <li>
          <button className={styles.selectAllButton} onClick={handleSelectAll}>(De)select all</button>
        </li>
        {options.map(x => (
          <li key={x} className={cx(value.includes(x) && styles.checked)}>
            <input type='checkbox' {...{ name }} onChange={() => handleChange(x)} checked={value.includes(x)} id={x} />
            <div className={cx(styles.multiSelectCheckbox,)}>{value.includes(x) && 'x'}</div>
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

  function handleSelectAll() {
    value.length === options.length ? onChange([]) : onChange(options)
  }
}
