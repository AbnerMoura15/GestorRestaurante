import { db } from '../db'
import type { Product, ProductInput } from '../../domain/entities/Product'
import { nanoid } from '../../utils/nanoid'

export const productRepository = {
  async getAll(): Promise<Product[]> {
    return db.products.orderBy('nome').toArray()
  },

  async getActive(): Promise<Product[]> {
    return db.products.orderBy('nome').filter(p => p.ativo).toArray()
  },

  async getById(id: string): Promise<Product | undefined> {
    return db.products.get(id)
  },

  async create(input: ProductInput): Promise<Product> {
    const now = Date.now()
    const product: Product = { ...input, id: nanoid(), criadoEm: now, atualizadoEm: now }
    await db.products.add(product)
    return product
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const existing = await db.products.get(id)
    if (!existing) throw new Error(`Product ${id} not found`)
    const updated: Product = { ...existing, ...input, atualizadoEm: Date.now() }
    await db.products.put(updated)
    return updated
  },

  async delete(id: string): Promise<void> {
    await db.products.delete(id)
  },

  async duplicate(id: string): Promise<Product> {
    const existing = await db.products.get(id)
    if (!existing) throw new Error(`Product ${id} not found`)
    const now = Date.now()
    const copy: Product = {
      ...existing,
      id: nanoid(),
      nome: `${existing.nome} (cópia)`,
      criadoEm: now,
      atualizadoEm: now
    }
    await db.products.add(copy)
    return copy
  }
}
