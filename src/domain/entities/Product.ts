export type SalesChannel = 'PRESENCIAL' | 'IFOOD_BASICO' | 'IFOOD_ENTREGA' | 'FOOD99' | 'WHATSAPP' | 'OUTRO'

export type ProductCategory =
  | 'Copos 300ml'
  | 'Copos 500ml'
  | 'Copos premium'
  | 'Promoções'
  | 'Combos'
  | 'Outros'

export const productCategories: ProductCategory[] = [
  'Copos 300ml', 'Copos 500ml', 'Copos premium', 'Promoções', 'Combos', 'Outros'
]

export interface ProductIngredient {
  ingredientId: string
  quantidadeUsada: number
  unidadeUsada: string
  perdaEspecificaPercentual: number
}

export interface Product {
  id: string
  nome: string
  categoria: ProductCategory
  tamanhoMl: number
  canalPadrao: SalesChannel
  precoVendaPresencial: number
  precoVendaIfood: number
  precoVenda99food: number
  margemDesejadaPercentual: number
  percentualPerdaProduto: number
  ingredientes: ProductIngredient[]
  ativo: boolean
  criadoEm: number
  atualizadoEm: number
}

export type ProductInput = Omit<Product, 'id' | 'criadoEm' | 'atualizadoEm'>
