import type { Ingredient } from '../../domain/entities/Ingredient'
import { calculateIngredientUnitCost } from '../../domain/services/costCalculator'

function makeIngredient(
  id: string,
  nome: string,
  categoria: string,
  precoCompra: number,
  quantidadeCompra: number,
  unidadeCompra: Ingredient['unidadeCompra'],
  percentualPerdaPadrao: number
): Ingredient {
  const custoPorUnidadeBase = calculateIngredientUnitCost(precoCompra, quantidadeCompra, unidadeCompra)
  const now = Date.now()
  return {
    id, nome, categoria, precoCompra, quantidadeCompra, unidadeCompra,
    custoPorUnidadeBase, percentualPerdaPadrao, ativo: true,
    criadoEm: now, atualizadoEm: now
  }
}

export const defaultIngredients: Ingredient[] = [
  makeIngredient('ing-acai', 'Açaí base', 'Base', 40.00, 1000, 'g', 5),
  makeIngredient('ing-nutella', 'Nutella', 'Cobertura', 42.00, 650, 'g', 3),
  makeIngredient('ing-leite-condensado', 'Leite condensado', 'Base', 5.50, 395, 'g', 2),
  makeIngredient('ing-leite-po', 'Leite em pó', 'Base', 14.00, 400, 'g', 2),
  makeIngredient('ing-granola', 'Granola', 'Acompanhamento', 12.00, 500, 'g', 3),
  makeIngredient('ing-banana', 'Banana', 'Fruta', 4.00, 1000, 'g', 10),
  makeIngredient('ing-morango', 'Morango', 'Fruta', 8.00, 500, 'g', 15),
  makeIngredient('ing-emb-300', 'Embalagem 300ml', 'Embalagem', 0.45, 1, 'unidade', 0),
  makeIngredient('ing-emb-500', 'Embalagem 500ml', 'Embalagem', 0.65, 1, 'unidade', 0),
  makeIngredient('ing-colher', 'Colher', 'Embalagem', 0.05, 1, 'unidade', 0),
  makeIngredient('ing-tampa', 'Tampa', 'Embalagem', 0.08, 1, 'unidade', 0),
  makeIngredient('ing-sacola', 'Sacola', 'Embalagem', 0.12, 1, 'unidade', 0),
]
