import { useFormField } from '@kaliber/forms'
import { useEvent } from '/features/Dialog'
import { Button } from '/features/Button'

import styles from './FormFields.css'

export function MultiSelect({ field, options = [] }) {
  const elementRef = React.useRef(null)
  const [isOpen, setIsOpen] = React.useState(false)

  useClickOutsideElement(elementRef, () => { setIsOpen(false) })

  const { name, state, eventHandlers: { onChange } } = useFormField(field)
  const { value } = state

  return (
    <div className={styles.multiSelectLayout} ref={elementRef}>
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


/**
 * @param {import('react').RefObject<HTMLHtmlElement>} elementRef 
 * @param {(...args) => void} onClick 
 */
export function useClickOutsideElement(elementRef, onClick) {
  const handleClick = useEvent(e => {
    const isInsideElement = elementRef.current.contains(e.target)
    if (isInsideElement) return
    onClick()
  })

  React.useEffect(
    () => {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    },
    [])
}
