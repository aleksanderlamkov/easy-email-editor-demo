import styles from './ExportActions.module.css'
import { JsonToMjml } from 'easy-email-core'
import mjml2html from 'mjml-browser'
import { useEditorContext } from 'easy-email-editor'
import { download } from './utils'
import type { ExportActionsProps } from './types'

const ExportActions = (props: ExportActionsProps) => {
  const {
    samplesMap,
    onSave,
  } = props

  const { formState } = useEditorContext()
  const { values } = formState

  const regExp = /{{\s*([\w.]+)\s*}}/g

  const injectSamples = (html: string) => {
    return html.replace(regExp, (entry, key) => (samplesMap[key] ?? entry))
  }

  const exportJSON = () => {
    download('template.json', JSON.stringify(values, null, 2), 'application/json')
  }

  const exportMJML = () => {
    const mjml = JsonToMjml({
      data: values.content,
      mode: 'production'
    })

    download('template.mjml', mjml, 'application/xml')
  }

  const exportHTML = () => {
    const mjml = JsonToMjml({
      data: values.content,
      mode: 'production'
    })
    const { html, errors } = mjml2html(mjml, { minify: true })

    if (errors?.length) {
      console.warn('MJML errors:', errors)
    }

    download('template.html', injectSamples(html), 'text/html')
  }

  const previewHTML = () => {
    const mjml = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: undefined,
    })
    const { html } = mjml2html(mjml)

    const blankWindow = window.open('', '_blank')
    if (blankWindow) {
      blankWindow.document.open()
      blankWindow.document.write(injectSamples(html))
      blankWindow.document.close()
    }
  }

  return (
    <div className={styles.root}>
      <ul className={styles.list}>
        <li>
          <button type="button" onClick={exportJSON}>Export JSON</button>
        </li>
        <li>
          <button type="button" onClick={exportMJML}>Export MJML</button>
        </li>
        <li>
          <button type="button" onClick={exportHTML}>Export HTML</button>
        </li>
        <li>
          <button type="button" onClick={previewHTML}>Preview</button>
        </li>
        {onSave && (
          <li>
            <button type="button" onClick={() => onSave(values)}>Save</button>
          </li>
        )}
      </ul>
    </div>
  )
}

export default ExportActions
