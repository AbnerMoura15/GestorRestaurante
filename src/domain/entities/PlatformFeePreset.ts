import type { SalesChannel } from './Product'

export type CommissionBase = 'PRECO_CHEIO' | 'APOS_DESCONTO_LOJA' | 'APOS_DESCONTO_TOTAL'

export interface PlatformFeePreset {
  id: string
  nome: string
  canal: SalesChannel
  comissaoPercentual: number
  taxaPagamentoPercentual: number
  taxaAntecipacaoPercentual: number
  taxaFixaPorPedido: number
  mensalidade: number
  faturamentoMinimoParaMensalidade: number
  campanhaInteligenteAtiva: boolean
  custoCampanhaPorPedido: number
  descontoLojaAtivo: boolean
  descontoLojaPercentual: number
  descontoLojaValorFixo: number
  descontoPlataformaAtivo: boolean
  descontoPlataformaPercentual: number
  descontoPlataformaValorFixo: number
  entregaGratisAtiva: boolean
  custoEntregaGratisParaLoja: number
  baseComissao: CommissionBase
  observacoes: string
  editavel: boolean
  criadoEm: number
  atualizadoEm: number
}

export type PlatformFeePresetInput = Omit<PlatformFeePreset, 'id' | 'criadoEm' | 'atualizadoEm'>
