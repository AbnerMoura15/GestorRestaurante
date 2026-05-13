export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'unidade'

export type IngredientCategory =
  | 'Açaí/Base'
  | 'Embalagens'
  | 'Adicionais comuns'
  | 'Adicionais premium'
  | 'Frutas'
  | 'Cremes'
  | 'Coberturas'
  | 'Descartáveis'
  | 'Outros'

export const ingredientCategories: IngredientCategory[] = [
  'Açaí/Base', 'Embalagens', 'Adicionais comuns', 'Adicionais premium',
  'Frutas', 'Cremes', 'Coberturas', 'Descartáveis', 'Outros'
]

export interface Ingredient {
  id: string
  nome: string
  categoria: string
  precoCompra: number
  quantidadeCompra: number
  unidadeCompra: Unit
  custoPorUnidadeBase: number
  percentualPerdaPadrao: number
  ativo: boolean
  criadoEm: number
  atualizadoEm: number
}

export type IngredientInput = Omit<Ingredient, 'id' | 'custoPorUnidadeBase' | 'criadoEm' | 'atualizadoEm'>
