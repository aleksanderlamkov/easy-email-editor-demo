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

export const takeSelectionSnapshot = (): DeepSelectionSnapshot | null => {
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

export const insertUsingSnapshot = (snapShot: DeepSelectionSnapshot, text: string) => {
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
