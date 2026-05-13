import { db } from '../db'
import type { Ingredient, IngredientInput } from '../../domain/entities/Ingredient'
import { calculateIngredientUnitCost } from '../../domain/services/costCalculator'
import { nanoid } from '../../utils/nanoid'

export const ingredientRepository = {
  async getAll(): Promise<Ingredient[]> {
    return db.ingredients.orderBy('nome').toArray()
  },

  async getActive(): Promise<Ingredient[]> {
    return db.ingredients.where('ativo').equals(1).sortBy('nome')
  },

  async getById(id: string): Promise<Ingredient | undefined> {
    return db.ingredients.get(id)
  },

  async create(input: IngredientInput): Promise<Ingredient> {
    const custoPorUnidadeBase = calculateIngredientUnitCost(
      input.precoCompra, input.quantidadeCompra, input.unidadeCompra
    )
    const now = Date.now()
    const ingredient: Ingredient = {
      ...input, id: nanoid(), custoPorUnidadeBase, criadoEm: now, atualizadoEm: now
    }
    await db.ingredients.add(ingredient)
    return ingredient
  },

  async update(id: string, input: Partial<IngredientInput>): Promise<Ingredient> {
    const existing = await db.ingredients.get(id)
    if (!existing) throw new Error(`Ingredient ${id} not found`)
    const precoCompra = input.precoCompra ?? existing.precoCompra
    const quantidadeCompra = input.quantidadeCompra ?? existing.quantidadeCompra
    const unidadeCompra = input.unidadeCompra ?? existing.unidadeCompra
    const custoPorUnidadeBase = calculateIngredientUnitCost(precoCompra, quantidadeCompra, unidadeCompra)
    const updated: Ingredient = {
      ...existing, ...input, custoPorUnidadeBase, atualizadoEm: Date.now()
    }
    await db.ingredients.put(updated)
    return updated
  },

  async delete(id: string): Promise<void> {
    await db.ingredients.delete(id)
  },

  async toggle(id: string): Promise<void> {
    const existing = await db.ingredients.get(id)
    if (!existing) return
    await db.ingredients.update(id, { ativo: !existing.ativo, atualizadoEm: Date.now() })
  }
}
