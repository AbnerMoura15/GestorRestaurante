import type { Ingredient, Unit } from '../entities/Ingredient'
import type { Product, ProductIngredient } from '../entities/Product'

/** Normalizes a quantity from its unit to the base unit (kg->g, l->ml, unidade->unidade) */
export function normalizeToBaseUnit(quantity: number, unit: Unit): number {
  switch (unit) {
    case 'kg': return quantity * 1000
    case 'l': return quantity * 1000
    default: return quantity
  }
}

/** Calculates the cost per base unit of an ingredient */
export function calculateIngredientUnitCost(
  precoCompra: number,
  quantidadeCompra: number,
  unidadeCompra: Unit
): number {
  const baseQty = normalizeToBaseUnit(quantidadeCompra, unidadeCompra)
  if (baseQty === 0) return 0
  return precoCompra / baseQty
}

/** Calculates the raw cost of using a given quantity of an ingredient */
export function calculateIngredientUsageCost(
  quantidadeUsada: number,
  unidadeUsada: Unit,
  custoPorUnidadeBase: number
): number {
  const baseQty = normalizeToBaseUnit(quantidadeUsada, unidadeUsada)
  return baseQty * custoPorUnidadeBase
}

/** Applies a loss percentage to a base cost */
export function applyLoss(baseCost: number, lossPercent: number): number {
  return baseCost * (1 + lossPercent / 100)
}

export interface IngredientCostResult {
  ingredientId: string
  custoBase: number
  custoComPerda: number
  perdaPercentual: number
}

/** Calculates the cost contribution of a single product ingredient */
export function calculateProductIngredientCost(
  pi: ProductIngredient,
  ingredient: Ingredient
): IngredientCostResult {
  const custoBase = calculateIngredientUsageCost(
    pi.quantidadeUsada,
    pi.unidadeUsada as Unit,
    ingredient.custoPorUnidadeBase
  )
  const perdaPercentual = pi.perdaEspecificaPercentual > 0
    ? pi.perdaEspecificaPercentual
    : ingredient.percentualPerdaPadrao
  const custoComPerda = applyLoss(custoBase, perdaPercentual)
  return { ingredientId: pi.ingredientId, custoBase, custoComPerda, perdaPercentual }
}

export interface ProductCostResult {
  custoTotal: number
  custoComPerdaProduto: number
  detalhes: IngredientCostResult[]
}

/** Calculates total cost of a product from its ingredients */
export function calculateProductCost(
  product: Product,
  ingredientsMap: Map<string, Ingredient>
): ProductCostResult {
  const detalhes: IngredientCostResult[] = []
  let custoTotal = 0

  for (const pi of product.ingredientes) {
    const ingredient = ingredientsMap.get(pi.ingredientId)
    if (!ingredient || !ingredient.ativo) continue
    const result = calculateProductIngredientCost(pi, ingredient)
    detalhes.push(result)
    custoTotal += result.custoComPerda
  }

  const custoComPerdaProduto = applyLoss(custoTotal, product.percentualPerdaProduto)

  return { custoTotal, custoComPerdaProduto, detalhes }
}
