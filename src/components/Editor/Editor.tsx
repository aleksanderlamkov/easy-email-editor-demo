import 'easy-email-editor/lib/style.css'
import 'easy-email-extensions/lib/style.css'
import '@arco-themes/react-easy-email-theme/css/arco.css'

import { BlockManager, BasicType } from 'easy-email-core'
import {
  EmailEditor,
  EmailEditorProvider,
} from 'easy-email-editor'
import { StandardLayout } from 'easy-email-extensions'
import type { EditorProps } from './types.ts'
import EditorToolbar from './ui/EditorToolbar'

const initialValues = {
  subject: 'Welcome to Easy-email',
  subTitle: 'Nice to meet you!',
  content: BlockManager.getBlockByType(BasicType.PAGE)!.create({}),
}

const Editor = (props: EditorProps) => {
  const {
    data = initialValues,
    variables,
    height = '100vh',
  } = props

  return (
    <EmailEditorProvider
      data={data}
      height={height}
      autoComplete
      dashed={false}
    >
      {() => (
        // @ts-expect-error categories optional at runtime, defaults are used
        <StandardLayout showSourceCode>
          <EditorToolbar variables={variables} />
          <EmailEditor />
        </StandardLayout>
      )}
    </EmailEditorProvider>
  )
}

export default Editor
