import type { TVariable } from './ui/EditorToolbar'

export type EasyEmailNode = {
  type: string
  data?: { value?: Record<string, unknown> }
  attributes?: Record<string, unknown>
  children?: EasyEmailNode[]
}

export type EasyEmailValues = {
  subject?: string
  subTitle?: string
  content: EasyEmailNode
}

export type EditorProps = {
  data?: EasyEmailValues
  variables?: TVariable[]
  height?: string
}
