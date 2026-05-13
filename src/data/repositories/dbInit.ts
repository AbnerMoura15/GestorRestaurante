import { db } from '../db'
import { defaultIngredients } from '../seed/defaultIngredients'
import { defaultProducts } from '../seed/defaultProducts'
import { defaultPlatformPresets } from '../seed/defaultPlatformPresets'
import { defaultAppConfig } from '../../domain/entities/AppConfig'

export async function initializeDB(): Promise<void> {
  const [ingCount, prodCount, platCount, configCount] = await Promise.all([
    db.ingredients.count(),
    db.products.count(),
    db.platforms.count(),
    db.config.count()
  ])

  if (ingCount === 0) {
    await db.ingredients.bulkAdd(defaultIngredients)
  }
  if (prodCount === 0) {
    await db.products.bulkAdd(defaultProducts)
  }
  if (platCount === 0) {
    await db.platforms.bulkAdd(defaultPlatformPresets)
  }
  if (configCount === 0) {
    await db.config.add({ id: 'main', ...defaultAppConfig })
  }
}
