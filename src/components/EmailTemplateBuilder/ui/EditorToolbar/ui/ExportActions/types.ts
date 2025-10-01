import type { IEmailTemplate } from 'easy-email-editor'

export type ExportActionsProps = {
  samplesMap: Record<string, string>
  onSave?: (values: IEmailTemplate) => void
}
