import type { PlatformFeePreset, CommissionBase } from '../entities/PlatformFeePreset'

export interface PlatformFeeInput {
  precoVenda: number
  descontoLojaValor?: number
  descontoPlataformaValor?: number
  campanhaAtiva?: boolean
}

export interface PlatformFeeResult {
  receitaBruta: number
  descontoLoja: number
  descontoPlataforma: number
  receitaAposDescontoLoja: number
  receitaAposDescontoTotal: number
  baseComissao: number
  comissao: number
  taxaPagamento: number
  taxaAntecipacao: number
  taxaFixaPorPedido: number
  custoCampanha: number
  custoEntregaGratis: number
  custoTotalTaxas: number
}

function resolveCommissionBase(
  precoVenda: number,
  descontoLoja: number,
  descontoPlataforma: number,
  base: CommissionBase
): number {
  switch (base) {
    case 'PRECO_CHEIO':
      return precoVenda
    case 'APOS_DESCONTO_LOJA':
      return precoVenda - descontoLoja
    case 'APOS_DESCONTO_TOTAL':
      return precoVenda - descontoLoja - descontoPlataforma
  }
}

/** Calculates all platform fees for a given sale */
export function calculatePlatformFees(
  preset: PlatformFeePreset,
  input: PlatformFeeInput
): PlatformFeeResult {
  const { precoVenda } = input
  const descontoLoja = input.descontoLojaValor ?? 0
  const descontoPlataforma = input.descontoPlataformaValor ?? 0
  const campanhaAtiva = input.campanhaAtiva ?? preset.campanhaInteligenteAtiva

  const receitaAposDescontoLoja = precoVenda - descontoLoja
  const receitaAposDescontoTotal = receitaAposDescontoLoja - descontoPlataforma

  const baseComissao = resolveCommissionBase(precoVenda, descontoLoja, descontoPlataforma, preset.baseComissao)

  const comissao = baseComissao * (preset.comissaoPercentual / 100)
  const taxaPagamento = receitaAposDescontoTotal * (preset.taxaPagamentoPercentual / 100)
  const taxaAntecipacao = receitaAposDescontoTotal * (preset.taxaAntecipacaoPercentual / 100)
  const taxaFixaPorPedido = preset.taxaFixaPorPedido
  const custoCampanha = campanhaAtiva ? preset.custoCampanhaPorPedido : 0
  const custoEntregaGratis = preset.entregaGratisAtiva ? preset.custoEntregaGratisParaLoja : 0

  const custoTotalTaxas = comissao + taxaPagamento + taxaAntecipacao + taxaFixaPorPedido + custoCampanha + custoEntregaGratis

  return {
    receitaBruta: precoVenda,
    descontoLoja,
    descontoPlataforma,
    receitaAposDescontoLoja,
    receitaAposDescontoTotal,
    baseComissao,
    comissao,
    taxaPagamento,
    taxaAntecipacao,
    taxaFixaPorPedido,
    custoCampanha,
    custoEntregaGratis,
    custoTotalTaxas
  }
}
