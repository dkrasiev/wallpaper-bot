export function numToHex(num: number): string {
  return `#${num.toString(16).padStart(8, '0')}`
}
