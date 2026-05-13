import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { calculateProductCost } from '../../domain/services/costCalculator'
import { simulateSale } from '../../domain/services/priceCalculator'
import { formatCurrency, formatPercent } from '../../utils/nanoid'
import { defaultAppConfig, getMarginStatus, marginStatusLabel, marginStatusColor } from '../../domain/entities/AppConfig'
import type { SalesChannel } from '../../domain/entities/Product'
import CurrencyInput from '../components/CurrencyInput'

const channelLabels: Record<SalesChannel, string> = {
  PRESENCIAL: 'Presencial',
  IFOOD_BASICO: 'iFood Básico',
  IFOOD_ENTREGA: 'iFood Entrega',
  FOOD99: '99Food',
  WHATSAPP: 'WhatsApp',
  OUTRO: 'Outro'
}

export default function SimulatorPage() {
  const products = useLiveQuery(() => db.products.orderBy('nome').filter(p => p.ativo).toArray(), [])
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [])
  const platforms = useLiveQuery(() => db.platforms.toArray(), [])

  const [productId, setProductId] = useState('')
  const [canal, setCanal] = useState<SalesChannel>('IFOOD_BASICO')
  const [precoVenda, setPrecoVenda] = useState(0)
  const [quantidade, setQuantidade] = useState(1)
  const [descontoLoja, setDescontoLoja] = useState(0)
  const [campanhaAtiva, setCampanhaAtiva] = useState(false)

  const ingredientsMap = useMemo(
    () => new Map((ingredients ?? []).map(i => [i.id, i])),
    [ingredients]
  )

  const selectedProduct = (products ?? []).find(p => p.id === productId)
  const selectedPlatform = (platforms ?? []).find(p => p.canal === canal)

  const custo = useMemo(() => {
    if (!selectedProduct) return 0
    return calculateProductCost(selectedProduct, ingredientsMap).custoComPerdaProduto
  }, [selectedProduct, ingredientsMap])

  const result = useMemo(() => {
    if (!selectedProduct || !selectedPlatform || precoVenda <= 0) return null
    return simulateSale({ custoProduto: custo, precoVenda, quantidade, descontoLojaValor: descontoLoja, campanhaAtiva }, selectedPlatform)
  }, [selectedProduct, selectedPlatform, custo, precoVenda, quantidade, descontoLoja, campanhaAtiva])

  const handleProductChange = (id: string) => {
    setProductId(id)
    const p = (products ?? []).find(x => x.id === id)
    if (p) {
      if (canal === 'PRESENCIAL') setPrecoVenda(p.precoVendaPresencial)
      else if (canal === 'FOOD99') setPrecoVenda(p.precoVenda99food)
      else setPrecoVenda(p.precoVendaIfood)
    }
  }

  const handleCanalChange = (c: SalesChannel) => {
    setCanal(c)
    if (selectedProduct) {
      if (c === 'PRESENCIAL') setPrecoVenda(selectedProduct.precoVendaPresencial)
      else if (c === 'FOOD99') setPrecoVenda(selectedProduct.precoVenda99food)
      else setPrecoVenda(selectedProduct.precoVendaIfood)
    }
    setCampanhaAtiva(false)
  }

  if (!products || !ingredients || !platforms) {
    return <div className="p-4 text-gray-400 text-center">Carregando...</div>
  }

  const availableChannels = platforms.map(p => p.canal)

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold text-gray-800 text-lg">Simulador de Pedido</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Produto <span className="text-red-500">*</span></label>
          <select
            value={productId}
            onChange={e => handleProductChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Selecione um produto...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Canal de venda</label>
          <div className="flex flex-wrap gap-2">
            {availableChannels.map(c => (
              <button
                key={c}
                onClick={() => handleCanalChange(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  canal === c ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {channelLabels[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput label="Preço de venda" value={precoVenda} onChange={setPrecoVenda} required />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Quantidade</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={quantidade}
              onChange={e => setQuantidade(parseInt(e.target.value) || 1)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <CurrencyInput label="Desconto pago pela loja (R$)" value={descontoLoja} onChange={setDescontoLoja} />

        {selectedPlatform && selectedPlatform.custoCampanhaPorPedido > 0 && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Campanha Inteligente</p>
              <p className="text-xs text-gray-400">Custo: {formatCurrency(selectedPlatform.custoCampanhaPorPedido)}/pedido</p>
            </div>
            <button
              onClick={() => setCampanhaAtiva(!campanhaAtiva)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${campanhaAtiva ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              {campanhaAtiva ? 'Ativa' : 'Inativa'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="font-semibold text-gray-800">Resultado</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Preço de venda</span>
              <span>{formatCurrency(result.fees.receitaBruta)}</span>
            </div>
            {result.fees.descontoLoja > 0 && (
              <div className="flex justify-between text-orange-500">
                <span>— Desconto loja</span>
                <span>−{formatCurrency(result.fees.descontoLoja)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Receita líquida</span>
              <span>{formatCurrency(result.fees.receitaAposDescontoLoja)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2">
              <div className="flex justify-between text-gray-600">
                <span>Custo do produto</span>
                <span className="text-red-500">−{formatCurrency(result.custoProduto)}</span>
              </div>
              {result.fees.comissao > 0 && (
                <div className="flex justify-between text-gray-500 text-xs mt-1">
                  <span>Comissão plataforma</span>
                  <span className="text-red-400">−{formatCurrency(result.fees.comissao)}</span>
                </div>
              )}
              {result.fees.taxaPagamento > 0 && (
                <div className="flex justify-between text-gray-500 text-xs mt-1">
                  <span>Taxa de pagamento</span>
                  <span className="text-red-400">−{formatCurrency(result.fees.taxaPagamento)}</span>
                </div>
              )}
              {result.fees.custoCampanha > 0 && (
                <div className="flex justify-between text-gray-500 text-xs mt-1">
                  <span>Campanha</span>
                  <span className="text-red-400">−{formatCurrency(result.fees.custoCampanha)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Lucro por unidade</span>
              <span className={`text-xl font-bold ${result.lucroLiquido < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(result.lucroLiquido)}
              </span>
            </div>
            {quantidade > 1 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-500">Lucro total ({quantidade} unid.)</span>
                <span className={`text-base font-bold ${result.lucroTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(result.lucroTotal)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Margem: {formatPercent(result.margemLiquidaPercentual)}</span>
              {(() => {
                const status = getMarginStatus(result.margemLiquidaPercentual, defaultAppConfig.margemConfig)
                return (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${marginStatusColor[status]}`}>
                    {marginStatusLabel[status]}
                  </span>
                )
              })()}
            </div>
          </div>

          {result.lucroLiquido < 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm font-medium text-center">
              ⚠️ Atenção: Você está tendo prejuízo nessa venda!
            </div>
          )}
        </div>
      )}

      {!result && productId && (
        <div className="text-center text-gray-400 text-sm py-4">
          Preencha o preço de venda para ver o resultado.
        </div>
      )}
    </div>
  )
}
