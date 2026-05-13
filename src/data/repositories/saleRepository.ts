import { db } from '../db'
import type { Sale, SaleInput } from '../../domain/entities/Sale'
import { nanoid } from '../../utils/nanoid'

export const saleRepository = {
  async getAll(): Promise<Sale[]> {
    return db.sales.orderBy('date').reverse().toArray()
  },

  async getByDate(date: string): Promise<Sale[]> {
    return db.sales.where('date').equals(date).toArray()
  },

  async getByDateRange(from: string, to: string): Promise<Sale[]> {
    return db.sales.where('date').between(from, to, true, true).toArray()
  },

  async create(input: SaleInput): Promise<Sale> {
    const now = Date.now()
    const sale: Sale = { ...input, id: nanoid(), createdAt: now, updatedAt: now }
    await db.sales.add(sale)
    return sale
  },

  async update(id: string, input: Partial<SaleInput>): Promise<Sale> {
    const existing = await db.sales.get(id)
    if (!existing) throw new Error(`Sale ${id} not found`)
    const updated: Sale = { ...existing, ...input, updatedAt: Date.now() }
    await db.sales.put(updated)
    return updated
  },

  async delete(id: string): Promise<void> {
    await db.sales.delete(id)
  }
}
