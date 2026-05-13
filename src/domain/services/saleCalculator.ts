import type { Sale, DailySummary, PaymentGroup } from '../entities/Sale'

export function sumSales(sales: Sale[]): { grossRevenue: number; totalCost: number; totalFees: number; netProfit: number; itemCount: number } {
  return sales.reduce((acc, s) => ({
    grossRevenue: acc.grossRevenue + s.grossRevenue,
    totalCost: acc.totalCost + s.totalCost,
    totalFees: acc.totalFees + s.totalFees,
    netProfit: acc.netProfit + s.netProfit,
    itemCount: acc.itemCount + s.items.reduce((n, i) => n + i.quantity, 0)
  }), { grossRevenue: 0, totalCost: 0, totalFees: 0, netProfit: 0, itemCount: 0 })
}

/** Groups sales by date and returns daily summaries */
export function buildDailySummaries(sales: Sale[]): DailySummary[] {
  const map = new Map<string, Sale[]>()
  for (const s of sales) {
    const arr = map.get(s.date) ?? []
    arr.push(s)
    map.set(s.date, arr)
  }
  return Array.from(map.entries())
    .map(([date, daySales]) => ({ date, ...sumSales(daySales) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** Groups sales by expectedPaymentDate */
export function buildPaymentGroups(sales: Sale[]): PaymentGroup[] {
  const map = new Map<string, Sale[]>()
  for (const s of sales) {
    const arr = map.get(s.expectedPaymentDate) ?? []
    arr.push(s)
    map.set(s.expectedPaymentDate, arr)
  }
  return Array.from(map.entries())
    .map(([paymentDate, gs]) => {
      const totals = sumSales(gs)
      return {
        paymentDate,
        sales: gs,
        grossRevenue: totals.grossRevenue,
        totalFees: totals.totalFees,
        netAmount: totals.netProfit + totals.totalCost // revenue - fees - cost = profit; net receivable = revenue - fees
      }
    })
    .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate))
}

/** Returns sales within a date range (ISO strings, inclusive) */
export function filterByDateRange(sales: Sale[], from: string, to: string): Sale[] {
  return sales.filter(s => s.date >= from && s.date <= to)
}

/** Ticket médio = grossRevenue / number of sales */
export function averageTicket(sales: Sale[]): number {
  if (sales.length === 0) return 0
  const total = sales.reduce((a, s) => a + s.grossRevenue, 0)
  return total / sales.length
}

/** Most sold product (by quantity) */
export function topProduct(sales: Sale[]): string | null {
  const counts = new Map<string, number>()
  for (const s of sales) {
    for (const item of s.items) {
      counts.set(item.productName, (counts.get(item.productName) ?? 0) + item.quantity)
    }
  }
  if (counts.size === 0) return null
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0]
}
