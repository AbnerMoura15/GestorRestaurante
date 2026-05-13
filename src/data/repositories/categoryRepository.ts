import { db } from '../db'
import type { IngredientCategoryEntity, ProductCategoryEntity } from '../../domain/entities/CategoryEntity'
import { DEFAULT_INGREDIENT_CATEGORIES, DEFAULT_PRODUCT_CATEGORIES } from '../../domain/entities/CategoryEntity'
import { nanoid } from '../../utils/nanoid'

function now() { return new Date().toISOString() }

export const ingredientCategoryRepository = {
  async getAll(): Promise<IngredientCategoryEntity[]> {
    return db.ingredientCategories.orderBy('sortOrder').toArray()
  },

  async getActive(): Promise<IngredientCategoryEntity[]> {
    const all = await db.ingredientCategories.orderBy('sortOrder').toArray()
    return all.filter(c => c.active)
  },

  async create(name: string): Promise<IngredientCategoryEntity> {
    const all = await db.ingredientCategories.toArray()
    const maxOrder = all.reduce((m, c) => Math.max(m, c.sortOrder), -1)
    const cat: IngredientCategoryEntity = {
      id: `ic-${nanoid()}`,
      name: name.trim(),
      sortOrder: maxOrder + 1,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.ingredientCategories.add(cat)
    return cat
  },

  async update(id: string, changes: Partial<Pick<IngredientCategoryEntity, 'name' | 'color' | 'sortOrder' | 'active'>>): Promise<void> {
    await db.ingredientCategories.update(id, { ...changes, updatedAt: now() })
  },

  async toggleActive(id: string): Promise<void> {
    const cat = await db.ingredientCategories.get(id)
    if (!cat) return
    await db.ingredientCategories.update(id, { active: !cat.active, updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    // Reassign ingredients using this category to ic-outros
    await db.ingredients.where('categoria').equals(id).modify({ categoria: 'ic-outros' })
    await db.ingredientCategories.delete(id)
  },

  /** Ensure default categories exist (idempotent) */
  async seed(): Promise<void> {
    const n = now()
    for (const cat of DEFAULT_INGREDIENT_CATEGORIES) {
      const existing = await db.ingredientCategories.get(cat.id)
      if (!existing) {
        await db.ingredientCategories.add({ ...cat, createdAt: n, updatedAt: n })
      }
    }
  },
}

export const productCategoryRepository = {
  async getAll(): Promise<ProductCategoryEntity[]> {
    return db.productCategories.orderBy('sortOrder').toArray()
  },

  async getActive(): Promise<ProductCategoryEntity[]> {
    const all = await db.productCategories.orderBy('sortOrder').toArray()
    return all.filter(c => c.active)
  },

  async create(name: string): Promise<ProductCategoryEntity> {
    const all = await db.productCategories.toArray()
    const maxOrder = all.reduce((m, c) => Math.max(m, c.sortOrder), -1)
    const cat: ProductCategoryEntity = {
      id: `pc-${nanoid()}`,
      name: name.trim(),
      sortOrder: maxOrder + 1,
      active: true,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.productCategories.add(cat)
    return cat
  },

  async update(id: string, changes: Partial<Pick<ProductCategoryEntity, 'name' | 'color' | 'sortOrder' | 'active'>>): Promise<void> {
    await db.productCategories.update(id, { ...changes, updatedAt: now() })
  },

  async toggleActive(id: string): Promise<void> {
    const cat = await db.productCategories.get(id)
    if (!cat) return
    await db.productCategories.update(id, { active: !cat.active, updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    // Reassign products using this category to pc-outros
    await db.products.where('categoria').equals(id).modify({ categoria: 'pc-outros' })
    await db.productCategories.delete(id)
  },

  /** Ensure default categories exist (idempotent) */
  async seed(): Promise<void> {
    const n = now()
    for (const cat of DEFAULT_PRODUCT_CATEGORIES) {
      const existing = await db.productCategories.get(cat.id)
      if (!existing) {
        await db.productCategories.add({ ...cat, createdAt: n, updatedAt: n })
      }
    }
  },
}
