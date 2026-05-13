import type { PlatformFeePreset } from '../entities/PlatformFeePreset'
import { calculatePlatformFees, type PlatformFeeInput, type PlatformFeeResult } from './platformFeeCalculator'

export interface SaleSimulationInput {
  custoProduto: number
  precoVenda: number
  quantidade?: number
  descontoLojaValor?: number
  descontoPlataformaValor?: number
  campanhaAtiva?: boolean
}

export interface SaleSimulationResult {
  custoProduto: number
  custoTotalProdutos: number
  fees: PlatformFeeResult
  lucroLiquido: number
  lucroTotal: number
  margemLiquidaPercentual: number
  markup: number
  quantidade: number
}

/** Calculates net profit for a single order */
export function calculateNetProfit(
  custoProduto: number,
  receitaAposDescontoLoja: number,
  custoTotalTaxas: number
): number {
  return receitaAposDescontoLoja - custoProduto - custoTotalTaxas
}

/** Calculates net margin as percentage */
export function calculateNetMargin(lucroLiquido: number, receitaAposDescontoLoja: number): number {
  if (receitaAposDescontoLoja === 0) return 0
  return (lucroLiquido / receitaAposDescontoLoja) * 100
}

/** Calculates minimum sale price to achieve a target margin, accounting for variable fees */
export function calculateMinimumPriceForTargetMargin(
  custoProduto: number,
  targetMarginDecimal: number,
  preset: PlatformFeePreset,
  custosFixosPorPedido = 0
): number {
  const percentualTaxasVariaveis =
    preset.comissaoPercentual / 100 +
    preset.taxaPagamentoPercentual / 100 +
    preset.taxaAntecipacaoPercentual / 100

  const denominator = 1 - targetMarginDecimal - percentualTaxasVariaveis
  if (denominator <= 0) return Infinity

  return (custoProduto + custosFixosPorPedido) / denominator
}

/** Full sale simulation combining product cost and platform fees */
export function simulateSale(
  input: SaleSimulationInput,
  preset: PlatformFeePreset
): SaleSimulationResult {
  const quantidade = input.quantidade ?? 1
  const feeInput: PlatformFeeInput = {
    precoVenda: input.precoVenda,
    descontoLojaValor: input.descontoLojaValor,
    descontoPlataformaValor: input.descontoPlataformaValor,
    campanhaAtiva: input.campanhaAtiva
  }

  const fees = calculatePlatformFees(preset, feeInput)
  const lucroLiquido = calculateNetProfit(input.custoProduto, fees.receitaAposDescontoLoja, fees.custoTotalTaxas)
  const margemLiquidaPercentual = calculateNetMargin(lucroLiquido, fees.receitaAposDescontoLoja)
  const markup = input.custoProduto > 0 ? input.precoVenda / input.custoProduto : 0

  return {
    custoProduto: input.custoProduto,
    custoTotalProdutos: input.custoProduto * quantidade,
    fees,
    lucroLiquido,
    lucroTotal: lucroLiquido * quantidade,
    margemLiquidaPercentual,
    markup,
    quantidade
  }
}
