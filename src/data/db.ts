import Dexie, { type Table } from 'dexie'
import type { Ingredient } from '../domain/entities/Ingredient'
import type { Product } from '../domain/entities/Product'
import type { PlatformFeePreset } from '../domain/entities/PlatformFeePreset'
import type { AppConfig } from '../domain/entities/AppConfig'
import type { Sale } from '../domain/entities/Sale'
import type { IngredientCategoryEntity, ProductCategoryEntity } from '../domain/entities/CategoryEntity'
import {
  DEFAULT_INGREDIENT_CATEGORIES,
  DEFAULT_PRODUCT_CATEGORIES,
  INGREDIENT_CATEGORY_NAME_TO_ID,
  PRODUCT_CATEGORY_NAME_TO_ID,
} from '../domain/entities/CategoryEntity'

export class LuAcaiDB extends Dexie {
  ingredients!: Table<Ingredient>
  products!: Table<Product>
  platforms!: Table<PlatformFeePreset>
  config!: Table<AppConfig & { id: string }>
  sales!: Table<Sale>
  ingredientCategories!: Table<IngredientCategoryEntity>
  productCategories!: Table<ProductCategoryEntity>

  constructor() {
    super('LuAcaiDB')
    this.version(1).stores({
      ingredients: 'id, nome, categoria, ativo',
      products: 'id, nome, ativo',
      platforms: 'id, canal, nome',
      config: 'id'
    })
    // v2: add sales table + categoria index on products
    this.version(2).stores({
      ingredients: 'id, nome, categoria, ativo',
      products: 'id, nome, categoria, ativo',
      platforms: 'id, canal, nome',
      config: 'id',
      sales: 'id, date, expectedPaymentDate'
    }).upgrade(tx => {
      tx.table('products').toCollection().modify(product => {
        if (!product.categoria) product.categoria = 'Outros'
      })
      tx.table('platforms').where('id').equals('platform-99food').modify(p => {
        p.nome = '99Food — Configuração Manual'
        p.observacoes = 'As taxas da 99Food variam por região, contrato, campanha e modalidade. Configure manualmente os percentuais e custos conforme aparecem no portal da sua loja.'
      })
    })
    // v3: add category tables, migrate string categories → entity IDs
    this.version(3).stores({
      ingredients: 'id, nome, categoria, ativo',
      products: 'id, nome, categoria, ativo',
      platforms: 'id, canal, nome',
      config: 'id',
      sales: 'id, date, expectedPaymentDate',
      ingredientCategories: 'id, name, sortOrder',
      productCategories: 'id, name, sortOrder',
    }).upgrade(async tx => {
      const now = new Date().toISOString()

      // Seed ingredient categories (skip if already exist)
      for (const cat of DEFAULT_INGREDIENT_CATEGORIES) {
        const existing = await tx.table('ingredientCategories').get(cat.id)
        if (!existing) {
          await tx.table('ingredientCategories').add({ ...cat, createdAt: now, updatedAt: now })
        }
      }

      // Seed product categories (skip if already exist)
      for (const cat of DEFAULT_PRODUCT_CATEGORIES) {
        const existing = await tx.table('productCategories').get(cat.id)
        if (!existing) {
          await tx.table('productCategories').add({ ...cat, createdAt: now, updatedAt: now })
        }
      }

      // Migrate ingredient.categoria: string name → entity ID
      await tx.table('ingredients').toCollection().modify(ing => {
        if (ing.categoria) {
          const mapped = INGREDIENT_CATEGORY_NAME_TO_ID[ing.categoria]
          if (mapped) {
            ing.categoria = mapped
          } else if (!ing.categoria.startsWith('ic-') && !ing.categoria.startsWith('pc-')) {
            // Unknown string category → Outros
            ing.categoria = 'ic-outros'
          }
        } else {
          ing.categoria = 'ic-outros'
        }
      })

      // Migrate product.categoria: string name → entity ID
      await tx.table('products').toCollection().modify(prod => {
        if (prod.categoria) {
          const mapped = PRODUCT_CATEGORY_NAME_TO_ID[prod.categoria]
          if (mapped) {
            prod.categoria = mapped
          } else if (!prod.categoria.startsWith('pc-') && !prod.categoria.startsWith('ic-')) {
            prod.categoria = 'pc-outros'
          }
        } else {
          prod.categoria = 'pc-outros'
        }
      })
    })
  }
}

export const db = new LuAcaiDB()
