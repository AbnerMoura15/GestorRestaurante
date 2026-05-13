import type { Product } from '../../domain/entities/Product'

const now = Date.now()

export const defaultProducts: Product[] = [
  {
    id: 'prod-300-simples',
    nome: 'Copo 300ml Simples',
    tamanhoMl: 300,
    canalPadrao: 'PRESENCIAL',
    precoVendaPresencial: 12.00,
    precoVendaIfood: 14.00,
    precoVenda99food: 14.00,
    margemDesejadaPercentual: 30,
    percentualPerdaProduto: 0,
    ativo: true,
    criadoEm: now,
    atualizadoEm: now,
    ingredientes: [
      { ingredientId: 'ing-acai', quantidadeUsada: 250, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-leite-condensado', quantidadeUsada: 30, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-granola', quantidadeUsada: 30, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-emb-300', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-colher', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-tampa', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
    ]
  },
  {
    id: 'prod-500-simples',
    nome: 'Copo 500ml Simples',
    tamanhoMl: 500,
    canalPadrao: 'PRESENCIAL',
    precoVendaPresencial: 18.00,
    precoVendaIfood: 22.00,
    precoVenda99food: 22.00,
    margemDesejadaPercentual: 30,
    percentualPerdaProduto: 0,
    ativo: true,
    criadoEm: now,
    atualizadoEm: now,
    ingredientes: [
      { ingredientId: 'ing-acai', quantidadeUsada: 350, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-leite-condensado', quantidadeUsada: 50, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-granola', quantidadeUsada: 40, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-banana', quantidadeUsada: 80, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-emb-500', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-colher', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-tampa', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
    ]
  },
  {
    id: 'prod-500-nutella',
    nome: 'Copo 500ml com Nutella',
    tamanhoMl: 500,
    canalPadrao: 'PRESENCIAL',
    precoVendaPresencial: 25.00,
    precoVendaIfood: 30.00,
    precoVenda99food: 30.00,
    margemDesejadaPercentual: 30,
    percentualPerdaProduto: 0,
    ativo: true,
    criadoEm: now,
    atualizadoEm: now,
    ingredientes: [
      { ingredientId: 'ing-acai', quantidadeUsada: 350, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-nutella', quantidadeUsada: 40, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-leite-po', quantidadeUsada: 20, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-banana', quantidadeUsada: 80, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-emb-500', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-colher', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-tampa', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
    ]
  },
  {
    id: 'prod-promo-2x500',
    nome: 'Promoção 2 Copos 500ml',
    tamanhoMl: 1000,
    canalPadrao: 'PRESENCIAL',
    precoVendaPresencial: 32.00,
    precoVendaIfood: 38.00,
    precoVenda99food: 38.00,
    margemDesejadaPercentual: 25,
    percentualPerdaProduto: 0,
    ativo: true,
    criadoEm: now,
    atualizadoEm: now,
    ingredientes: [
      { ingredientId: 'ing-acai', quantidadeUsada: 700, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-leite-condensado', quantidadeUsada: 100, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-granola', quantidadeUsada: 80, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-banana', quantidadeUsada: 160, unidadeUsada: 'g', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-emb-500', quantidadeUsada: 2, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-colher', quantidadeUsada: 2, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-tampa', quantidadeUsada: 2, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
      { ingredientId: 'ing-sacola', quantidadeUsada: 1, unidadeUsada: 'unidade', perdaEspecificaPercentual: 0 },
    ]
  }
]
