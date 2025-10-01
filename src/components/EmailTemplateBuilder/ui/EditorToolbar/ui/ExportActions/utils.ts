export const download = (name: string, content: string, type = 'text/plain') => {
  const anchorElement = document.createElement('a')

  anchorElement.href = URL.createObjectURL(new Blob([content], { type }))
  anchorElement.download = name
  anchorElement.click()

  URL.revokeObjectURL(anchorElement.href)
}
