export interface IngredientCategoryEntity {
  id: string
  name: string
  color?: string
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductCategoryEntity {
  id: string
  name: string
  color?: string
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export const DEFAULT_INGREDIENT_CATEGORIES: Omit<IngredientCategoryEntity, 'createdAt' | 'updatedAt'>[] = [
  { id: 'ic-acai-base', name: 'Açaí/Base', sortOrder: 0, active: true },
  { id: 'ic-embalagens', name: 'Embalagens', sortOrder: 1, active: true },
  { id: 'ic-adicionais-comuns', name: 'Adicionais comuns', sortOrder: 2, active: true },
  { id: 'ic-adicionais-premium', name: 'Adicionais premium', sortOrder: 3, active: true },
  { id: 'ic-frutas', name: 'Frutas', sortOrder: 4, active: true },
  { id: 'ic-cremes', name: 'Cremes', sortOrder: 5, active: true },
  { id: 'ic-coberturas', name: 'Coberturas', sortOrder: 6, active: true },
  { id: 'ic-descartaveis', name: 'Descartáveis', sortOrder: 7, active: true },
  { id: 'ic-outros', name: 'Outros', sortOrder: 8, active: true },
]

export const DEFAULT_PRODUCT_CATEGORIES: Omit<ProductCategoryEntity, 'createdAt' | 'updatedAt'>[] = [
  { id: 'pc-copos-300ml', name: 'Copos 300ml', sortOrder: 0, active: true },
  { id: 'pc-copos-500ml', name: 'Copos 500ml', sortOrder: 1, active: true },
  { id: 'pc-copos-premium', name: 'Copos premium', sortOrder: 2, active: true },
  { id: 'pc-promocoes', name: 'Promoções', sortOrder: 3, active: true },
  { id: 'pc-combos', name: 'Combos', sortOrder: 4, active: true },
  { id: 'pc-milk-shake', name: 'Milk Shake', sortOrder: 5, active: true },
  { id: 'pc-outros', name: 'Outros', sortOrder: 6, active: true },
]

/** Map from legacy string category name → ingredient category ID */
export const INGREDIENT_CATEGORY_NAME_TO_ID: Record<string, string> = {
  'Açaí/Base': 'ic-acai-base',
  'Embalagens': 'ic-embalagens',
  'Adicionais comuns': 'ic-adicionais-comuns',
  'Adicionais premium': 'ic-adicionais-premium',
  'Frutas': 'ic-frutas',
  'Cremes': 'ic-cremes',
  'Coberturas': 'ic-coberturas',
  'Descartáveis': 'ic-descartaveis',
  'Outros': 'ic-outros',
}

/** Map from legacy string category name → product category ID */
export const PRODUCT_CATEGORY_NAME_TO_ID: Record<string, string> = {
  'Copos 300ml': 'pc-copos-300ml',
  'Copos 500ml': 'pc-copos-500ml',
  'Copos premium': 'pc-copos-premium',
  'Promoções': 'pc-promocoes',
  'Combos': 'pc-combos',
  'Milk Shake': 'pc-milk-shake',
  'Outros': 'pc-outros',
}
