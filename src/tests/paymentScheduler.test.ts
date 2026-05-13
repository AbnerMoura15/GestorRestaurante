import { describe, it, expect } from 'vitest'
import { getWeekRangeMondayToSunday, getExpectedPaymentDate, toISODate } from '../domain/services/paymentScheduler'

describe('getWeekRangeMondayToSunday', () => {
  it('Monday is start of its own week', () => {
    const monday = new Date(2026, 4, 11) // Mon 11 May 2026
    const { start, end } = getWeekRangeMondayToSunday(monday)
    expect(toISODate(start)).toBe('2026-05-11')
    expect(toISODate(end)).toBe('2026-05-17')
  })
  it('Sunday belongs to the week that started on Monday', () => {
    const sunday = new Date(2026, 4, 17) // Sun 17 May 2026
    const { start, end } = getWeekRangeMondayToSunday(sunday)
    expect(toISODate(start)).toBe('2026-05-11')
    expect(toISODate(end)).toBe('2026-05-17')
  })
  it('Wednesday mid-week', () => {
    const wed = new Date(2026, 4, 13) // Wed 13 May 2026
    const { start, end } = getWeekRangeMondayToSunday(wed)
    expect(toISODate(start)).toBe('2026-05-11')
    expect(toISODate(end)).toBe('2026-05-17')
  })
})

describe('getExpectedPaymentDate', () => {
  it('sale on Monday 11 May → payment Wednesday 20 May', () => {
    const sale = new Date(2026, 4, 11) // Mon
    const payment = getExpectedPaymentDate(sale)
    expect(toISODate(payment)).toBe('2026-05-20') // next Wed after Sun 17 May
  })
  it('sale on Friday 15 May → payment Wednesday 20 May', () => {
    const sale = new Date(2026, 4, 15) // Fri
    const payment = getExpectedPaymentDate(sale)
    expect(toISODate(payment)).toBe('2026-05-20')
  })
  it('sale on Sunday 17 May → payment Wednesday 20 May', () => {
    const sale = new Date(2026, 4, 17) // Sun
    const payment = getExpectedPaymentDate(sale)
    expect(toISODate(payment)).toBe('2026-05-20')
  })
  it('sale on Monday 18 May → payment Wednesday 27 May (next week)', () => {
    const sale = new Date(2026, 4, 18) // Mon next week
    const payment = getExpectedPaymentDate(sale)
    expect(toISODate(payment)).toBe('2026-05-27')
  })
})
