import type { SalesChannel } from './Product'

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  unitFees: number
  discount: number
  channel: SalesChannel
  unitNetProfit: number
}

export interface Sale {
  id: string
  date: string              // ISO YYYY-MM-DD
  items: SaleItem[]
  grossRevenue: number
  totalCost: number
  totalFees: number
  netProfit: number
  expectedPaymentDate: string // ISO YYYY-MM-DD
  notes: string
  createdAt: number
  updatedAt: number
}

export type SaleInput = Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>

export interface DailySummary {
  date: string
  grossRevenue: number
  totalCost: number
  totalFees: number
  netProfit: number
  itemCount: number
}

export interface PaymentGroup {
  paymentDate: string
  sales: Sale[]
  grossRevenue: number
  totalFees: number
  netAmount: number
}
