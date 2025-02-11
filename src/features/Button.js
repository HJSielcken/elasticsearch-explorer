import styles from './Button.css'

export function Button({ onClick, children, layoutClassName = undefined, className = undefined }) {
  return <button className={cx(styles.componentLayout, styles.component, className, layoutClassName)} {...{ onClick }}>
    {children}
  </button>
}
