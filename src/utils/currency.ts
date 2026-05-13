/** Formats a number as BRL currency string: R$ 12,90 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/** Formats a number for display inside an input (no symbol): "12,90" */
export function formatInputBRL(value: number): string {
  if (value === 0) return ''
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Parses a BRL-formatted string to a number.
 * Accepts both comma and period as decimal separator.
 * Examples: "12,90" → 12.9 | "1.000,50" → 1000.5 | "12.9" → 12.9
 */
export function parseCurrencyBRL(input: string): number {
  if (!input || input.trim() === '') return 0
  // Remove currency symbol, spaces, R$
  let s = input.replace(/R\$\s?/g, '').trim()
  // If has both period and comma → BRL format: period=thousand, comma=decimal
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (s.includes(',')) {
    // Only comma → decimal separator
    s = s.replace(',', '.')
  }
  const num = parseFloat(s)
  return isNaN(num) ? 0 : num
}

/** Formats percent for display */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}
