import type { TVariable } from './ui/EditorToolbar'
import type {
  ExportActionsProps
} from './ui/EditorToolbar/ui/ExportActions'
import type { IEmailTemplate } from 'easy-email-editor/lib/typings'

export type EditorProps = {
  data?: IEmailTemplate
  variables?: TVariable[]
  height?: string
  onSave?: ExportActionsProps['onSave'],
}
