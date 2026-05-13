import { describe, it, expect } from 'vitest'
import { sumSales, buildDailySummaries, buildPaymentGroups, averageTicket, topProduct, filterByDateRange } from '../domain/services/saleCalculator'
import type { Sale } from '../domain/entities/Sale'

function makeSale(id: string, date: string, payDate: string, grossRevenue: number, totalCost: number, totalFees: number, productName = 'Copo'): Sale {
  return {
    id, date, expectedPaymentDate: payDate, grossRevenue, totalCost, totalFees,
    netProfit: grossRevenue - totalCost - totalFees,
    items: [{ productId: 'p1', productName, quantity: 1, unitPrice: grossRevenue, unitCost: totalCost, unitFees: totalFees, discount: 0, channel: 'PRESENCIAL', unitNetProfit: grossRevenue - totalCost - totalFees }],
    notes: '', createdAt: 0, updatedAt: 0
  }
}

const s1 = makeSale('s1', '2026-05-13', '2026-05-20', 30, 10, 5)
const s2 = makeSale('s2', '2026-05-13', '2026-05-20', 20, 8, 3, 'Nutella')
const s3 = makeSale('s3', '2026-05-14', '2026-05-20', 50, 15, 10)

describe('sumSales', () => {
  it('sums all fields correctly', () => {
    const result = sumSales([s1, s2])
    expect(result.grossRevenue).toBeCloseTo(50)
    expect(result.totalCost).toBeCloseTo(18)
    expect(result.totalFees).toBeCloseTo(8)
    expect(result.netProfit).toBeCloseTo(24)
    expect(result.itemCount).toBe(2)
  })
  it('returns zeros for empty array', () => {
    const result = sumSales([])
    expect(result.grossRevenue).toBe(0)
    expect(result.netProfit).toBe(0)
  })
})

describe('buildDailySummaries', () => {
  it('groups by date and sorts descending', () => {
    const summaries = buildDailySummaries([s1, s2, s3])
    expect(summaries).toHaveLength(2)
    expect(summaries[0].date).toBe('2026-05-14')
    expect(summaries[1].date).toBe('2026-05-13')
    expect(summaries[1].grossRevenue).toBeCloseTo(50)
  })
})

describe('buildPaymentGroups', () => {
  it('groups by expectedPaymentDate', () => {
    const s4 = makeSale('s4', '2026-05-18', '2026-05-27', 40, 12, 6)
    const groups = buildPaymentGroups([s1, s2, s3, s4])
    expect(groups).toHaveLength(2)
    const may20 = groups.find(g => g.paymentDate === '2026-05-20')!
    expect(may20.sales).toHaveLength(3)
    expect(may20.grossRevenue).toBeCloseTo(100)
  })
})

describe('averageTicket', () => {
  it('calculates average of grossRevenue', () => {
    expect(averageTicket([s1, s2])).toBeCloseTo(25)
  })
  it('returns 0 for empty', () => {
    expect(averageTicket([])).toBe(0)
  })
})

describe('topProduct', () => {
  it('returns most sold product name', () => {
    const s5 = makeSale('s5', '2026-05-13', '2026-05-20', 20, 8, 3, 'Nutella')
    expect(topProduct([s1, s2, s5])).toBe('Nutella')
  })
  it('returns null for empty', () => {
    expect(topProduct([])).toBeNull()
  })
})

describe('filterByDateRange', () => {
  it('filters inclusive', () => {
    expect(filterByDateRange([s1, s2, s3], '2026-05-13', '2026-05-13')).toHaveLength(2)
    expect(filterByDateRange([s1, s2, s3], '2026-05-13', '2026-05-14')).toHaveLength(3)
  })
})
