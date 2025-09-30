import { useMemo } from 'react'
import VarsInsertion from './ui/VarsInsertion'
import ExportActions from './ui/ExportActions'
import type { EditorToolbarProps } from './types'

const EditorToolbar = (props: EditorToolbarProps) => {
  const { variables = [] } = props

  const samplesMap = useMemo(
    () => Object.fromEntries(variables.map(({ key, sample }) => [key, sample])),
    [],
  )

  return (
    <>
      <ExportActions  samplesMap={samplesMap} />
      {variables.length > 0 && <VarsInsertion variables={variables} />}
    </>
  )
}

export default EditorToolbar
