export function trimCommand(text: string): string {
  try {
    const indexOfSpace = text.indexOf(' ')
    if (indexOfSpace === -1) {
      return ''
    }
    return text.slice(indexOfSpace)
  } catch {
    return ''
  }
}
