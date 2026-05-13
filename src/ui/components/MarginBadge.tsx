import { getMarginStatus, marginStatusLabel, marginStatusColor, type MarginConfig } from '../../domain/entities/AppConfig'

interface MarginBadgeProps {
  margem: number
  config: MarginConfig
}

export default function MarginBadge({ margem, config }: MarginBadgeProps) {
  const status = getMarginStatus(margem, config)
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${marginStatusColor[status]}`}>
      {marginStatusLabel[status]}
    </span>
  )
}
