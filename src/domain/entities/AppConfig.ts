export interface MarginConfig {
  criticoAbaixo: number
  atencaoAbaixo: number
  saudavelAbaixo: number
}

export interface AppConfig {
  margemConfig: MarginConfig
  versao: string
}

export const defaultAppConfig: AppConfig = {
  margemConfig: {
    criticoAbaixo: 10,
    atencaoAbaixo: 20,
    saudavelAbaixo: 30
  },
  versao: '1.0.0'
}

export type MarginStatus = 'PREJUIZO' | 'CRITICO' | 'ATENCAO' | 'SAUDAVEL' | 'OTIMO'

export function getMarginStatus(margem: number, config: MarginConfig): MarginStatus {
  if (margem < 0) return 'PREJUIZO'
  if (margem < config.criticoAbaixo) return 'CRITICO'
  if (margem < config.atencaoAbaixo) return 'ATENCAO'
  if (margem < config.saudavelAbaixo) return 'SAUDAVEL'
  return 'OTIMO'
}

export const marginStatusLabel: Record<MarginStatus, string> = {
  PREJUIZO: 'Prejuízo',
  CRITICO: 'Crítico',
  ATENCAO: 'Atenção',
  SAUDAVEL: 'Saudável',
  OTIMO: 'Ótimo'
}

export const marginStatusColor: Record<MarginStatus, string> = {
  PREJUIZO: 'bg-red-600 text-white',
  CRITICO: 'bg-red-400 text-white',
  ATENCAO: 'bg-yellow-400 text-white',
  SAUDAVEL: 'bg-green-400 text-white',
  OTIMO: 'bg-green-600 text-white'
}
