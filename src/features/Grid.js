import styles from './Grid.css'

export function  GridTable({ children, className = undefined, layoutClassName = undefined }) {
  return (
    <div className={cx(styles.gridTableLayout, layoutClassName, className)}>
      {children}
    </div>
  )
}

export function  GridRow({ children, className = undefined, layoutClassName = undefined }) {
  return (
    <div className={cx(styles.gridRowLayout, className, layoutClassName, )}>
      {children}
    </div>
  )
}

export function  GridCell({ children, className = undefined, layoutClassName = undefined, }) {
  return (
    <div className={cx(styles.gridCellLayout, styles.gridCell, layoutClassName, className)}>
      {children}
    </div>
  )
}

export function  GridCellWithPadding({ children, className = undefined, layoutClassName = undefined, }) {
  return (
    <div className={cx(styles.gridCellLayout, styles.withPadding, styles.gridCell, layoutClassName, className)}>
      {children}
    </div>
  )
}
