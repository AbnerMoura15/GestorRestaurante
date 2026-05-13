import type { PlatformFeePreset } from '../../domain/entities/PlatformFeePreset'

const now = Date.now()

function makePreset(overrides: Partial<PlatformFeePreset> & Pick<PlatformFeePreset, 'id' | 'nome' | 'canal'>): PlatformFeePreset {
  return {
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
    criadoEm: now,
    atualizadoEm: now,
    ...overrides
  }
}

export const defaultPlatformPresets: PlatformFeePreset[] = [
  makePreset({
    id: 'platform-presencial',
    nome: 'Presencial',
    canal: 'PRESENCIAL',
    baseComissao: 'PRECO_CHEIO',
    observacoes: 'Venda direta sem plataforma. Sem taxas.'
  }),
  makePreset({
    id: 'platform-ifood-basico',
    nome: 'iFood Básico / Entrega Própria',
    canal: 'IFOOD_BASICO',
    comissaoPercentual: 12,
    taxaPagamentoPercentual: 3.5,
    mensalidade: 110,
    faturamentoMinimoParaMensalidade: 1800,
    custoCampanhaPorPedido: 5,
    baseComissao: 'APOS_DESCONTO_LOJA',
    observacoes: 'Confirmar valores reais no portal/contrato do iFood. A mensalidade só é cobrada se o faturamento mensal ultrapassar R$1.800.'
  }),
  makePreset({
    id: 'platform-ifood-entrega',
    nome: 'iFood Entrega',
    canal: 'IFOOD_ENTREGA',
    comissaoPercentual: 23,
    taxaPagamentoPercentual: 3.5,
    mensalidade: 150,
    faturamentoMinimoParaMensalidade: 1800,
    custoCampanhaPorPedido: 9.99,
    baseComissao: 'APOS_DESCONTO_LOJA',
    observacoes: 'Confirmar valores reais no portal/contrato do iFood. Entrega feita por parceiro iFood.'
  }),
  makePreset({
    id: 'platform-99food',
    nome: '99Food — Configuração Manual',
    canal: 'FOOD99',
    comissaoPercentual: 0,
    taxaPagamentoPercentual: 0,
    baseComissao: 'APOS_DESCONTO_LOJA',
    observacoes: 'As taxas da 99Food variam por região, contrato, campanha e modalidade. Configure manualmente os percentuais e custos conforme aparecem no portal da sua loja.'
  })
]
