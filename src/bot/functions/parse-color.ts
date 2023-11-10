import { Color } from 'colorinterpreter'

export function parseColor(text: string): number {
  const color = new Color(text)
  return parseInt(color.toHEXA().slice(1), 16)
}
