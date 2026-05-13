import { describe, it, expect } from 'vitest'
import { calculateNetProfit, calculateNetMargin, simulateSale, calculateMinimumPriceForTargetMargin } from '../domain/services/priceCalculator'
import type { PlatformFeePreset } from '../domain/entities/PlatformFeePreset'

function makePreset(overrides: Partial<PlatformFeePreset>): PlatformFeePreset {
  return {
    id: 'test',
    nome: 'Test',
    canal: 'PRESENCIAL',
    comissaoPercentual: 0,
    taxaPagamentoPercentual: 0,
    taxaAntecipacaoPercentual: 0,
    taxaFixaPorPedido: 0,
    mensalidade: 0,
    faturamentoMinimoParaMensalidade: 0,
    campanhaInteligenteAtiva: false,
    custoCampanhaPorPedido: 0,
    descontoLojaAtivo: false,
    descontoLojaPercentual: 0,
    descontoLojaValorFixo: 0,
    descontoPlataformaAtivo: false,
    descontoPlataformaPercentual: 0,
    descontoPlataformaValorFixo: 0,
    entregaGratisAtiva: false,
    custoEntregaGratisParaLoja: 0,
    baseComissao: 'APOS_DESCONTO_LOJA',
    observacoes: '',
    editavel: true,
    criadoEm: 0,
    atualizadoEm: 0,
    ...overrides
  }
}

describe('calculateNetProfit', () => {
  it('7.4 — iFood Básico lucro: R$30 - R$12 custo - R$4.65 taxas = R$13.35', () => {
    const lucro = calculateNetProfit(12, 30, 3.60 + 1.05)
    expect(lucro).toBeCloseTo(13.35, 2)
  })

  it('7.5 — iFood Entrega com campanha lucro = R$0.06', () => {
    const lucro = calculateNetProfit(12, 30, 6.90 + 1.05 + 9.99)
    expect(lucro).toBeCloseTo(0.06, 2)
  })

  it('7.6 — 99Food taxa zero lucro = R$18', () => {
    const lucro = calculateNetProfit(12, 30, 0)
    expect(lucro).toBeCloseTo(18, 2)
  })

  it('7.7 — desconto loja R$5: receita líquida R$25, custo R$12, lucro R$13', () => {
    const lucro = calculateNetProfit(12, 25, 0)
    expect(lucro).toBeCloseTo(13, 2)
  })
})

describe('calculateNetMargin', () => {
  it('calcula margem de 50%', () => {
    expect(calculateNetMargin(15, 30)).toBeCloseTo(50, 2)
  })

  it('retorna 0 quando receita é 0', () => {
    expect(calculateNetMargin(0, 0)).toBe(0)
  })
})

describe('simulateSale', () => {
  it('7.4 — simulação iFood Básico completa', () => {
    const preset = makePreset({
      comissaoPercentual: 12,
      taxaPagamentoPercentual: 3.5,
      canal: 'IFOOD_BASICO',
      baseComissao: 'APOS_DESCONTO_LOJA'
    })
    const result = simulateSale({ custoProduto: 12, precoVenda: 30 }, preset)

    expect(result.fees.comissao).toBeCloseTo(3.60, 2)
    expect(result.fees.taxaPagamento).toBeCloseTo(1.05, 2)
    expect(result.lucroLiquido).toBeCloseTo(13.35, 2)
  })

  it('7.5 — simulação iFood Entrega com campanha', () => {
    const preset = makePreset({
      comissaoPercentual: 23,
      taxaPagamentoPercentual: 3.5,
      custoCampanhaPorPedido: 9.99,
      canal: 'IFOOD_ENTREGA',
      baseComissao: 'APOS_DESCONTO_LOJA'
    })
    const result = simulateSale({ custoProduto: 12, precoVenda: 30, campanhaAtiva: true }, preset)

    expect(result.lucroLiquido).toBeCloseTo(0.06, 2)
  })

  it('7.6 — 99Food sem taxas', () => {
    const preset = makePreset({ canal: 'FOOD99' })
    const result = simulateSale({ custoProduto: 12, precoVenda: 30 }, preset)
    expect(result.lucroLiquido).toBeCloseTo(18, 2)
  })

  it('simula múltiplas unidades', () => {
    const preset = makePreset({ canal: 'PRESENCIAL' })
    const result = simulateSale({ custoProduto: 12, precoVenda: 30, quantidade: 2 }, preset)
    expect(result.lucroTotal).toBeCloseTo(36, 2)
  })
})

describe('calculateMinimumPriceForTargetMargin', () => {
  it('preço mínimo para 30% de margem sem taxas', () => {
    const preset = makePreset({ canal: 'PRESENCIAL' })
    const price = calculateMinimumPriceForTargetMargin(12, 0.3, preset)
    expect(price).toBeCloseTo(17.14, 1)
  })

  it('preço mínimo com taxas iFood', () => {
    const preset = makePreset({
      canal: 'IFOOD_BASICO',
      comissaoPercentual: 12,
      taxaPagamentoPercentual: 3.5
    })
    const price = calculateMinimumPriceForTargetMargin(12, 0.3, preset)
    expect(price).toBeGreaterThan(12)
    expect(price).toBeGreaterThan(17.14)
  })
})
