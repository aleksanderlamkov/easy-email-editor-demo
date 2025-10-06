import { useMemo } from 'react'
import VarsInsertion from './ui/VarsInsertion'
import ExportActions from './ui/ExportActions'
import type { EditorToolbarProps } from './types'

const EditorToolbar = (props: EditorToolbarProps) => {
  const {
    variables = [],
    onSave,
  } = props

  const samplesMap = useMemo(() => {
    return Object.fromEntries(variables.map(({ key, sample }) => [key, sample]))
  }, [variables])

  return (
    <>
      <ExportActions samplesMap={samplesMap} onSave={onSave} />
      {variables.length > 0 && <VarsInsertion variables={variables} />}
    </>
  )
}

export default EditorToolbar
