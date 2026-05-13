export type SalesChannel = 'PRESENCIAL' | 'IFOOD_BASICO' | 'IFOOD_ENTREGA' | 'FOOD99' | 'WHATSAPP' | 'OUTRO'

export interface ProductIngredient {
  ingredientId: string
  quantidadeUsada: number
  unidadeUsada: string
  perdaEspecificaPercentual: number
}

export interface Product {
  id: string
  nome: string
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
