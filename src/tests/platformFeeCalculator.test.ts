import { describe, it, expect } from 'vitest'
import { calculatePlatformFees } from '../domain/services/platformFeeCalculator'
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

describe('calculatePlatformFees', () => {
  it('7.4 — iFood Básico: preço R$30, comissão 12%, pagamento 3.5%, sem campanha', () => {
    const preset = makePreset({
      nome: 'iFood Básico',
      canal: 'IFOOD_BASICO',
      comissaoPercentual: 12,
      taxaPagamentoPercentual: 3.5,
      baseComissao: 'APOS_DESCONTO_LOJA'
    })
    const result = calculatePlatformFees(preset, { precoVenda: 30 })

    expect(result.comissao).toBeCloseTo(3.60, 2)
    expect(result.taxaPagamento).toBeCloseTo(1.05, 2)
    expect(result.custoCampanha).toBe(0)
  })

  it('7.5 — iFood Entrega com Campanha: preço R$30, comissão 23%, pagamento 3.5%, campanha R$9.99', () => {
    const preset = makePreset({
      nome: 'iFood Entrega',
      canal: 'IFOOD_ENTREGA',
      comissaoPercentual: 23,
      taxaPagamentoPercentual: 3.5,
      campanhaInteligenteAtiva: false,
      custoCampanhaPorPedido: 9.99,
      baseComissao: 'APOS_DESCONTO_LOJA'
    })
    const result = calculatePlatformFees(preset, { precoVenda: 30, campanhaAtiva: true })

    expect(result.comissao).toBeCloseTo(6.90, 2)
    expect(result.taxaPagamento).toBeCloseTo(1.05, 2)
    expect(result.custoCampanha).toBeCloseTo(9.99, 2)
  })

  it('7.6 — 99Food taxa zero: preço R$30, comissão 0%, pagamento 0%', () => {
    const preset = makePreset({
      nome: '99Food',
      canal: 'FOOD99',
      comissaoPercentual: 0,
      taxaPagamentoPercentual: 0
    })
    const result = calculatePlatformFees(preset, { precoVenda: 30 })

    expect(result.comissao).toBe(0)
    expect(result.taxaPagamento).toBe(0)
    expect(result.custoTotalTaxas).toBe(0)
  })

  it('7.7 — desconto pago pela loja: preço R$30, desconto R$5, comissão 0%', () => {
    const preset = makePreset({
      nome: 'Test',
      comissaoPercentual: 0,
      taxaPagamentoPercentual: 0,
      baseComissao: 'APOS_DESCONTO_LOJA'
    })
    const result = calculatePlatformFees(preset, { precoVenda: 30, descontoLojaValor: 5 })

    expect(result.receitaAposDescontoLoja).toBeCloseTo(25, 2)
  })
})
