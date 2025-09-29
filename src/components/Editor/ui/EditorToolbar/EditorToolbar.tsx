import { useEditorContext } from 'easy-email-editor'
import { useMemo } from 'react'
import { JsonToMjml } from 'easy-email-core'
import mjml2html from 'mjml-browser'
import type { EditorToolbarProps } from './types.ts'

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

  const copyVar = async (key: string) => {
    await navigator.clipboard.writeText(`{{${key}}}`)
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

  // 🔥 НОВОЕ: глубокий поиск активного элемента (учитывает Shadow DOM)
  const getDeepActiveElement = (): Element | null => {
    let el: any = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
      el = el.shadowRoot.activeElement;
    }
    return el ?? null;
  };

// 🔥 НОВОЕ: вставка в курсор текущего contenteditable внутри его шадоу-рута
  const insertAtCursor = (text: string) => {
    const active = getDeepActiveElement() as HTMLElement | null;
    if (!active || !active.isContentEditable) {
      alert('Курсор не находится внутри текстового блока');
      return;
    }

    // selection нужно брать из корневого узла этого элемента (ShadowRoot или Document)
    const root = (active.getRootNode && active.getRootNode()) || document;
    const sel =
      (root as ShadowRoot).getSelection?.() ??
      (root as Document).getSelection?.() ??
      window.getSelection();

    if (!sel) {
      alert('Курсор не находится внутри текстового блока');
      return;
    }

    // если вдруг нет диапазона — поставим каретку в конец active
    if (sel.rangeCount === 0) {
      const r = document.createRange();
      r.selectNodeContents(active);
      r.collapse(false);
      sel.addRange(r);
    }

    // пробуем нативно
    const ok = document.execCommand && document.execCommand('insertText', false, text);
    if (ok) return;

    // фоллбэк через Range
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };


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
        <p>Скопировать переменную в буфер обмена:</p>
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
              onMouseDown={(e) => { e.preventDefault(); insertAtCursor(`{{${key}}}`); }}
              onClick={(e) => e.preventDefault()}
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
