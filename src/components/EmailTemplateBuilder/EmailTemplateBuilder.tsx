import styles from './EmailTemplateBuilder.module.css'
import 'easy-email-editor/lib/style.css'
import 'easy-email-extensions/lib/style.css'
import '@arco-themes/react-easy-email-theme/css/arco.css'

import { BlockManager, BasicType } from 'easy-email-core'
import {
  EmailEditor,
  EmailEditorProvider,
} from 'easy-email-editor'
import { StandardLayout } from 'easy-email-extensions'
import type { EmailTemplateBuilderProps } from './types'
import EditorToolbar from './ui/EditorToolbar'

const initialValues = {
  subject: 'Welcome to Easy-email',
  subTitle: 'Nice to meet you!',
  content: BlockManager.getBlockByType(BasicType.PAGE)!.create({}),
}

const EmailTemplateBuilder = (props: EmailTemplateBuilderProps) => {
  const {
    data = initialValues,
    variables,
    height = '100vh',
    onSave,
  } = props

  return (
    <div className={styles.root}>
      <EmailEditorProvider
        data={data}
        height={height}
        autoComplete
        dashed={false}
      >
        {() => (
          // @ts-expect-error categories optional at runtime, defaults are used
          <StandardLayout showSourceCode>
            <EditorToolbar variables={variables} onSave={onSave} />
            <EmailEditor />
          </StandardLayout>
        )}
      </EmailEditorProvider>
    </div>
  )
}

export default EmailTemplateBuilder
