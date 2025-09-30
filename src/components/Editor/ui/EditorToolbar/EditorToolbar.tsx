import { useEditorContext } from 'easy-email-editor'
import { useMemo } from 'react'
import { JsonToMjml } from 'easy-email-core'
import mjml2html from 'mjml-browser'
import type { EditorToolbarProps } from './types.ts'

type DeepSelectionSnapshot = {
  editable: HTMLElement
  root: Document | ShadowRoot
  range: Range
}

const getDeepActiveElement = (): HTMLElement | null => {
  let el: any = document.activeElement
  while (el && el.shadowRoot && el.shadowRoot.activeElement) {
    el = el.shadowRoot.activeElement
  }
  return (el as HTMLElement) ?? null
}

const takeSelectionSnapshot = (): DeepSelectionSnapshot | null => {
  const active = getDeepActiveElement()
  if (!active) return null

  const editable =
    (active.isContentEditable ? active : active.closest('[contenteditable]')) as HTMLElement | null
  if (!editable) return null

  const root = (editable.getRootNode?.() as Document | ShadowRoot) || document

  // NB: у ShadowRoot есть getSelection в нормальных браузерах, но делаем фоллбэк
  const sel =
    (root as any).getSelection?.() ??
    (root as Document).getSelection?.() ??
    window.getSelection()
  if (!sel) return null

  let range: Range
  if (sel.rangeCount > 0 && editable.contains(sel.getRangeAt(0).startContainer)) {
    range = sel.getRangeAt(0).cloneRange()
  } else {
    // если почему-то нет выделения — ставим каретку в конец editable
    range = document.createRange()
    range.selectNodeContents(editable)
    range.collapse(false)
  }

  return { editable, root, range }
}

const insertUsingSnapshot = (snapShot: DeepSelectionSnapshot, text: string) => {
  const {
    editable,
    root,
    range,
  } = snapShot

  // Кадр 1: возвращаем фокус и range туда, где был курсор
  requestAnimationFrame(() => {
    const selection =
      (root as any).getSelection?.() ??
      (root as Document).getSelection?.() ??
      window.getSelection()

    if (!selection) {
      return
    }

    editable.focus()
    selection.removeAllRanges()
    selection.addRange(range)

    // Пытаемся нативно
    let afterRange: Range | null = null
    const ok = (document as any).execCommand?.('insertText', false, text)

    if (ok) {
      if (selection.rangeCount > 0) {
        afterRange = selection.getRangeAt(0).cloneRange()
      }
    } else {
      const rangeFormatted = selection.rangeCount > 0 ? selection.getRangeAt(0) : range
      rangeFormatted.deleteContents()

      const nextNode = document.createTextNode(text)

      rangeFormatted.insertNode(nextNode)
      rangeFormatted.setStartAfter(nextNode)
      rangeFormatted.collapse(true)
      selection.removeAllRanges()
      selection.addRange(rangeFormatted)
      afterRange = rangeFormatted.cloneRange()
    }

    // Кадр 2: «закрепляем» каретку (если их внутр. хендлеры что-то переиграют)
    requestAnimationFrame(() => {
      const sel2 =
        (root as any).getSelection?.() ??
        (root as Document).getSelection?.() ??
        window.getSelection()
      if (!sel2 || !afterRange) return
      editable.focus()
      sel2.removeAllRanges()
      sel2.addRange(afterRange)
    })
  })
}

const EditorToolbar = (props: EditorToolbarProps) => {
  const { variables = [] } = props

  const { formState } = useEditorContext()
  const { values } = formState

  const rx = /{{\s*([\w.]+)\s*}}/g
  const samplesMap = useMemo(
    () => Object.fromEntries(variables.map(({ key, sample }) => [key, sample])),
    [],
  )

  const injectSamples = (html: string) =>
    html.replace(rx, (m, key) => (samplesMap[key] ?? m))

  const download = (name: string, content: string, type = 'text/plain') => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type }))
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const exportJSON = () => {
    download('template.json', JSON.stringify(values, null, 2), 'application/json')
  }

  const exportMJML = () => {
    const mjml = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: undefined,
    })

    download('template.mjml', mjml, 'application/xml')
  }

  const exportHTML = () => {
    const mjml = JsonToMjml({
      data: values.content,
      mode: 'production',
      context: undefined,
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
    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(injectSamples(html))
      w.document.close()
    }
  }

  return (
    <div style={{
      padding: 8,
      borderBottom: '1px solid #eee',
      display: 'grid',
      gap: 8,
    }}>
      <div style={{
        padding: 8,
        borderBottom: '1px solid #eee',
        display: 'flex',
        gap: 8,
      }}>
        <button onClick={exportJSON}>Export JSON</button>
        <button onClick={exportMJML}>Export MJML</button>
        <button onClick={exportHTML}>Export HTML</button>
        <button onClick={previewHTML}>Preview</button>
      </div>

      <div>
        <p>Вставка переменной:</p>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {variables.map(({ key, sample, name }) => (
            <button
              key={key}
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default EditorToolbar
