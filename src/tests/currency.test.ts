import { describe, it, expect } from 'vitest'
import { formatCurrencyBRL, parseCurrencyBRL, formatInputBRL } from '../utils/currency'

describe('formatCurrencyBRL', () => {
  it('formats integer', () => {
    expect(formatCurrencyBRL(12)).toMatch(/12,00/)
  })
  it('formats decimal', () => {
    expect(formatCurrencyBRL(12.9)).toMatch(/12,90/)
  })
  it('formats zero', () => {
    expect(formatCurrencyBRL(0)).toMatch(/0,00/)
  })
  it('formats larger number with thousand separator', () => {
    expect(formatCurrencyBRL(1500)).toMatch(/1\.500,00/)
  })
})

describe('formatInputBRL', () => {
  it('returns empty string for zero', () => {
    expect(formatInputBRL(0)).toBe('')
  })
  it('formats 12.9 as 12,90', () => {
    expect(formatInputBRL(12.9)).toBe('12,90')
  })
  it('formats 0.04 as 0,04', () => {
    expect(formatInputBRL(0.04)).toBe('0,04')
  })
})

describe('parseCurrencyBRL', () => {
  it('parses comma decimal: "12,90" → 12.9', () => {
    expect(parseCurrencyBRL('12,90')).toBeCloseTo(12.9)
  })
  it('parses period decimal: "12.90" → 12.9', () => {
    expect(parseCurrencyBRL('12.90')).toBeCloseTo(12.9)
  })
  it('parses BRL with thousand separator: "1.000,50" → 1000.5', () => {
    expect(parseCurrencyBRL('1.000,50')).toBeCloseTo(1000.5)
  })
  it('parses with R$ prefix', () => {
    expect(parseCurrencyBRL('R$ 22,00')).toBeCloseTo(22)
  })
  it('returns 0 for empty string', () => {
    expect(parseCurrencyBRL('')).toBe(0)
  })
  it('returns 0 for non-numeric string', () => {
    expect(parseCurrencyBRL('abc')).toBe(0)
  })
})
