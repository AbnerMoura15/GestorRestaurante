import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../data/db'
import { platformRepository } from '../../data/repositories/platformRepository'
import type { PlatformFeePreset } from '../../domain/entities/PlatformFeePreset'
import { formatCurrency } from '../../utils/nanoid'
import Modal from '../components/Modal'
import CurrencyInput from '../components/CurrencyInput'

function PlatformForm({
  preset,
  onSave,
  onCancel
}: {
  preset: PlatformFeePreset
  onSave: (data: Partial<PlatformFeePreset>) => void
  onCancel: () => void
}) {
  const [comissao, setComissao] = useState(preset.comissaoPercentual)
  const [taxaPagamento, setTaxaPagamento] = useState(preset.taxaPagamentoPercentual)
  const [taxaAntecipacao, setTaxaAntecipacao] = useState(preset.taxaAntecipacaoPercentual)
  const [taxaFixa, setTaxaFixa] = useState(preset.taxaFixaPorPedido)
  const [mensalidade, setMensalidade] = useState(preset.mensalidade)
  const [faturamentoMin, setFaturamentoMin] = useState(preset.faturamentoMinimoParaMensalidade)
  const [custoCampanha, setCustoCampanha] = useState(preset.custoCampanhaPorPedido)
  const [campanhaAtiva, setCampanhaAtiva] = useState(preset.campanhaInteligenteAtiva)
  const [baseComissao, setBaseComissao] = useState(preset.baseComissao)
  const [entregaGratisAtiva, setEntregaGratisAtiva] = useState(preset.entregaGratisAtiva)
  const [custoEntregaGratis, setCustoEntregaGratis] = useState(preset.custoEntregaGratisParaLoja)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      comissaoPercentual: comissao, taxaPagamentoPercentual: taxaPagamento,
      taxaAntecipacaoPercentual: taxaAntecipacao, taxaFixaPorPedido: taxaFixa,
      mensalidade, faturamentoMinimoParaMensalidade: faturamentoMin,
      custoCampanhaPorPedido: custoCampanha, campanhaInteligenteAtiva: campanhaAtiva,
      baseComissao, entregaGratisAtiva, custoEntregaGratisParaLoja: custoEntregaGratis
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {preset.observacoes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          {preset.observacoes}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <CurrencyInput label="Comissão %" value={comissao} onChange={setComissao} prefix="%" step={0.1} />
        <CurrencyInput label="Taxa Pagamento %" value={taxaPagamento} onChange={setTaxaPagamento} prefix="%" step={0.1} />
        <CurrencyInput label="Taxa Antecipação %" value={taxaAntecipacao} onChange={setTaxaAntecipacao} prefix="%" step={0.1} />
        <CurrencyInput label="Taxa Fixa/pedido" value={taxaFixa} onChange={setTaxaFixa} />
        <CurrencyInput label="Mensalidade" value={mensalidade} onChange={setMensalidade} />
        <CurrencyInput label="Fat. mín. mensalidade" value={faturamentoMin} onChange={setFaturamentoMin} />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Base da comissão</label>
        <select
          value={baseComissao}
          onChange={e => setBaseComissao(e.target.value as typeof baseComissao)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="PRECO_CHEIO">Preço cheio</option>
          <option value="APOS_DESCONTO_LOJA">Após desconto da loja</option>
          <option value="APOS_DESCONTO_TOTAL">Após desconto total</option>
        </select>
      </div>

      <div className="border border-gray-200 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Campanha Inteligente</p>
            <p className="text-xs text-gray-400">Custo por pedido ativado</p>
          </div>
          <button
            type="button"
            onClick={() => setCampanhaAtiva(!campanhaAtiva)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${campanhaAtiva ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            {campanhaAtiva ? 'Ativa' : 'Inativa'}
          </button>
        </div>
        <CurrencyInput label="Custo campanha/pedido" value={custoCampanha} onChange={setCustoCampanha} />
      </div>

      <div className="border border-gray-200 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Entrega grátis pela loja</p>
          <button
            type="button"
            onClick={() => setEntregaGratisAtiva(!entregaGratisAtiva)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${entregaGratisAtiva ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
          >
            {entregaGratisAtiva ? 'Ativa' : 'Inativa'}
          </button>
        </div>
        {entregaGratisAtiva && (
          <CurrencyInput label="Custo entrega grátis" value={custoEntregaGratis} onChange={setCustoEntregaGratis} />
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-600">
          Cancelar
        </button>
        <button type="submit" className="flex-1 bg-brand-700 text-white rounded-xl py-3 text-sm font-medium">
          Salvar
        </button>
      </div>
    </form>
  )
}

export default function PlatformsPage() {
  const platforms = useLiveQuery(() => db.platforms.toArray(), [])
  const [editing, setEditing] = useState<PlatformFeePreset | null>(null)

  if (!platforms) return <div className="p-4 text-gray-400 text-center">Carregando...</div>

  const handleSave = async (data: Partial<PlatformFeePreset>) => {
    if (!editing) return
    await platformRepository.update(editing.id, data)
    setEditing(null)
  }

  const channelLabels: Record<string, string> = {
    PRESENCIAL: 'Presencial', IFOOD_BASICO: 'iFood Básico', IFOOD_ENTREGA: 'iFood Entrega', FOOD99: '99Food'
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="font-semibold text-gray-800 text-lg">Plataformas e Taxas</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
        Confirme os valores reais no portal/contrato da plataforma. Os presets são editáveis.
      </div>

      {platforms.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-800">{p.nome}</p>
              <p className="text-xs text-gray-400">{channelLabels[p.canal] ?? p.canal}</p>
            </div>
            <button
              onClick={() => setEditing(p)}
              className="text-xs text-brand-700 font-semibold px-3 py-1.5 bg-brand-50 rounded-lg"
            >
              Editar
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-400">Comissão</p>
              <p className="font-semibold">{p.comissaoPercentual}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-400">Taxa Pagamento</p>
              <p className="font-semibold">{p.taxaPagamentoPercentual}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-400">Mensalidade</p>
              <p className="font-semibold">{formatCurrency(p.mensalidade)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-400">Campanha</p>
              <p className={`font-semibold ${p.campanhaInteligenteAtiva ? 'text-yellow-600' : 'text-gray-400'}`}>
                {p.campanhaInteligenteAtiva ? `${formatCurrency(p.custoCampanhaPorPedido)}/pedido` : 'Inativa'}
              </p>
            </div>
          </div>
        </div>
      ))}

      {editing && (
        <Modal title={`Editar: ${editing.nome}`} onClose={() => setEditing(null)}>
          <PlatformForm
            preset={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
