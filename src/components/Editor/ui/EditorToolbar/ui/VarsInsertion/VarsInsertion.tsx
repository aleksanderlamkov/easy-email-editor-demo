import styles from './VarsInsertion.module.css'
import { useRef, useState } from 'react'
import { insertUsingSnapshot, takeSelectionSnapshot } from './utils'
import type { VarsInsertionProps } from './types'

const VarsInsertion = (props: VarsInsertionProps) => {
  const {
    variables,
  } = props

  const [hasError, setHasError] = useState(false)
  const snapshotRef = useRef<ReturnType<typeof takeSelectionSnapshot> | null>(null)

  return (
    <div className={styles.root}>
      <div>Выбрать переменную для вставки:</div>
      <select
        className={`${styles.select} ${hasError ? styles.isInvalid : ''}`}
        defaultValue=""
        onPointerDown={(event) => {
          event.stopPropagation()
          snapshotRef.current = takeSelectionSnapshot()
        }}
        onChange={(event) => {
          event.stopPropagation()

          const key = event.target.value
          if (!key) {
            return
          }

          const snapshot = snapshotRef.current || takeSelectionSnapshot()

          if (!snapshot) {
            event.currentTarget.value = ''
            setHasError(true)
            setTimeout(() => setHasError(false), 2000)
            return
          }

          insertUsingSnapshot(snapshot, `{{${key}}}`)
          event.currentTarget.value = ''
          snapshotRef.current = null
        }}
      >
        <option value="" disabled>{`{{VAR}}`}</option>

        {variables.map(({ key, name, sample }) => (
          <option
            key={key}
            value={key}
            title={sample ? `Пример: ${sample}` : undefined}
          >
            {name}{sample ? ` (${sample})` : ''}
          </option>
        ))}
      </select>
      <div className={`${styles.error} ${hasError ? styles.isVisible : ''}`}>
        Курсор не находится внутри текстового блока!
      </div>
    </div>
  )
}

export default VarsInsertion
