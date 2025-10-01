import type { TVariable } from './ui/VarsInsertion'
import type { ExportActionsProps } from './ui/ExportActions/types.ts'

export type EditorToolbarProps = {
  variables?: TVariable[]
  onSave?: ExportActionsProps['onSave'],
}
