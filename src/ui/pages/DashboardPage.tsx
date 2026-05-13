import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { calculateProductCost } from '../../domain/services/costCalculator'
import { simulateSale } from '../../domain/services/priceCalculator'
import { formatCurrency, formatPercent } from '../../utils/nanoid'
import { defaultAppConfig, getMarginStatus, marginStatusLabel, marginStatusColor } from '../../domain/entities/AppConfig'
import type { SalesChannel } from '../../domain/entities/Product'
import type { PlatformFeePreset } from '../../domain/entities/PlatformFeePreset'

const channelLabels: Record<SalesChannel, string> = {
  PRESENCIAL: 'Presencial',
  IFOOD_BASICO: 'iFood Básico',
  IFOOD_ENTREGA: 'iFood Entrega',
  FOOD99: '99Food',
  WHATSAPP: 'WhatsApp',
  OUTRO: 'Outro'
}

export default function DashboardPage() {
  const products = useLiveQuery(() => db.products.where('ativo').equals(1).sortBy('nome'), [])
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [])
  const platforms = useLiveQuery(() => db.platforms.toArray(), [])

  if (!products || !ingredients || !platforms) {
    return <div className="p-4 text-gray-400 text-center">Carregando...</div>
  }

  const ingredientsMap = new Map(ingredients.map(i => [i.id, i]))
  const platformMap = new Map(platforms.map(p => [p.canal, p]))

  const getPreset = (canal: string): PlatformFeePreset | null => {
    return platformMap.get(canal as SalesChannel) ?? null
  }

  const channelsToShow: SalesChannel[] = ['PRESENCIAL', 'IFOOD_BASICO', 'IFOOD_ENTREGA', 'FOOD99']

  return (
    <div className="p-4 space-y-4">
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-xs text-brand-700">
        <strong>Atenção:</strong> Os preços de insumos e taxas são exemplos. Atualize com seus dados reais em Insumos e Taxas.
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg">Nenhum produto cadastrado.</p>
          <p className="text-sm mt-1">Vá em <strong>Produtos</strong> para adicionar.</p>
        </div>
      )}

      {products.map(product => {
        const costResult = calculateProductCost(product, ingredientsMap)
        const custo = costResult.custoComPerdaProduto

        return (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-brand-700 text-white px-4 py-2">
              <h3 className="font-semibold text-base">{product.nome}</h3>
              <p className="text-brand-200 text-xs">{product.tamanhoMl}ml • Custo: {formatCurrency(custo)}</p>
            </div>

            <div className="divide-y divide-gray-100">
              {channelsToShow.map(canal => {
                const preset = getPreset(canal)
                if (!preset) return null

                const preco = canal === 'PRESENCIAL'
                  ? product.precoVendaPresencial
                  : canal === 'FOOD99'
                    ? product.precoVenda99food
                    : product.precoVendaIfood

                const result = simulateSale({ custoProduto: custo, precoVenda: preco }, preset)
                const status = getMarginStatus(result.margemLiquidaPercentual, defaultAppConfig.margemConfig)

                return (
                  <div key={canal} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{channelLabels[canal]}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(preco)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-bold ${result.lucroLiquido < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(result.lucroLiquido)}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <span className="text-xs text-gray-400">{formatPercent(result.margemLiquidaPercentual)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${marginStatusColor[status]}`}>
                          {marginStatusLabel[status]}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
