import styles from './VarsInsertion.module.css'
import { insertUsingSnapshot, takeSelectionSnapshot } from './utils'
import type { VarsInsertionProps } from './types'

const VarsInsertion = (props: VarsInsertionProps) => {
  const {
    variables,
  } = props

  return (
    <div className={styles.root}>
      <div>Вставка переменной:</div>
      <ul className={styles.list}>
        {variables.map(({ key, sample, name }) => (
          <li key={key}>
            <button
              type="button"
              title={`Копировать {{${key}}} (${sample})`}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()

                const snapShot = takeSelectionSnapshot()
                if (!snapShot) {
                  alert('Курсор не находится внутри текстового блока')
                  return
                }

                insertUsingSnapshot(snapShot, `{{${key}}}`)
              }}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default VarsInsertion
