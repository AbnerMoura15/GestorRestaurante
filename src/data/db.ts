import Dexie, { type Table } from 'dexie'
import type { Ingredient } from '../domain/entities/Ingredient'
import type { Product } from '../domain/entities/Product'
import type { PlatformFeePreset } from '../domain/entities/PlatformFeePreset'
import type { AppConfig } from '../domain/entities/AppConfig'

export class LuAcaiDB extends Dexie {
  ingredients!: Table<Ingredient>
  products!: Table<Product>
  platforms!: Table<PlatformFeePreset>
  config!: Table<AppConfig & { id: string }>

  constructor() {
    super('LuAcaiDB')
    this.version(1).stores({
      ingredients: 'id, nome, categoria, ativo',
      products: 'id, nome, ativo',
      platforms: 'id, canal, nome',
      config: 'id'
    })
  }
}

export const db = new LuAcaiDB()
