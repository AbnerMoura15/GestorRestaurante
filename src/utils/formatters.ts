import type { Unit } from '../domain/entities/Ingredient'

/**
 * Format a measurement value according to its unit.
 * kg and l use 2 decimal places; g, ml, unidade are shown as integers.
 */
export function formatMeasurement(value: number, unit: Unit): string {
  switch (unit) {
    case 'kg':
      return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
    case 'l':
      return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`
    case 'g':
      return `${Math.round(value)} g`
    case 'ml':
      return `${Math.round(value)} ml`
    case 'unidade':
      return `${Math.round(value)} unidade${Math.round(value) !== 1 ? 's' : ''}`
    default:
      return `${value}`
  }
}

/** Format a quantity as integer (no decimal). */
export function formatQuantity(value: number): string {
  return `${Math.round(value)}`
}

/**
 * Parse a measurement input string to a number.
 * Accepts both comma and period as decimal separator.
 */
export function parseMeasurementInput(input: string, unit: Unit): number {
  if (!input || input.trim() === '') return 0
  const s = input.trim().replace(',', '.')
  const num = parseFloat(s)
  if (isNaN(num)) return 0
  if (unit === 'g' || unit === 'ml' || unit === 'unidade') return Math.round(num)
  return num
}
