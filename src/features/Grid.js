import styles from './Grid.css'

export function  GridTable({ children, className = undefined, layoutClassName = undefined }) {
  return (
    <div className={cx(styles.gridTableLayout, layoutClassName, className)}>
      {children}
    </div>
  )
}

export function  GridTableColumns({ children, className = undefined, layoutClassName = undefined }) {
  return (
    <div className={cx(styles.gridTableLayout, styles.gridTableColumnLayout, layoutClassName, className)}>
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

export function  GridColumn({ children, className = undefined, layoutClassName = undefined }) {
  return (
    <div className={cx(styles.gridColumnLayout, className, layoutClassName, )}>
      {children}
    </div>
  )
}

export function  GridCell({ children = undefined, className = undefined, layoutClassName = undefined, }) {
  return (
    <div className={cx(styles.gridCellLayout, styles.gridCell, layoutClassName, className)}>
      {children}
    </div>
  )
}

export function  GridCellWithLeftPadding({ children, className = undefined, layoutClassName = undefined, }) {
  return (
    <div className={cx(styles.gridCellLayout, styles.withLeftPadding, styles.gridCell, layoutClassName, className)}>
      {children}
    </div>
  )
}
