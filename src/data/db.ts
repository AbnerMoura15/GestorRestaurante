import Dexie, { type Table } from 'dexie'
import type { Ingredient } from '../domain/entities/Ingredient'
import type { Product } from '../domain/entities/Product'
import type { PlatformFeePreset } from '../domain/entities/PlatformFeePreset'
import type { AppConfig } from '../domain/entities/AppConfig'
import type { Sale } from '../domain/entities/Sale'

export class LuAcaiDB extends Dexie {
  ingredients!: Table<Ingredient>
  products!: Table<Product>
  platforms!: Table<PlatformFeePreset>
  config!: Table<AppConfig & { id: string }>
  sales!: Table<Sale>

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
      // Migrate existing products without categoria → 'Outros'
      tx.table('products').toCollection().modify(product => {
        if (!product.categoria) product.categoria = 'Outros'
      })
      // Fix 99Food preset name/notes for existing installs
      tx.table('platforms').where('id').equals('platform-99food').modify(p => {
        p.nome = '99Food — Configuração Manual'
        p.observacoes = 'As taxas da 99Food variam por região, contrato, campanha e modalidade. Configure manualmente os percentuais e custos conforme aparecem no portal da sua loja.'
      })
    })
  }
}

export const db = new LuAcaiDB()
