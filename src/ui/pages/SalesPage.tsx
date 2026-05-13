import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar, TrendingUp, Wallet } from 'lucide-react'
import { db } from '../../data/db'
import { saleRepository } from '../../data/repositories/saleRepository'
import { calculateProductCost } from '../../domain/services/costCalculator'
import { calculatePlatformFees } from '../../domain/services/platformFeeCalculator'
import { calculateNetProfit } from '../../domain/services/priceCalculator'
import {
  todayISO, fromISODate, formatDateBR, formatDateLongBR,
  getExpectedPaymentDate, toISODate, getWeekRangeMondayToSunday
} from '../../domain/services/paymentScheduler'
import { buildDailySummaries, buildPaymentGroups, sumSales, filterByDateRange, averageTicket, topProduct } from '../../domain/services/saleCalculator'
import { formatCurrencyBRL, parseCurrencyBRL } from '../../utils/currency'
import type { Sale, SaleItem, SaleInput } from '../../domain/entities/Sale'
import type { SalesChannel } from '../../domain/entities/Product'
import Modal from '../components/Modal'

const CHANNEL_LABELS: Record<SalesChannel, string> = {
  PRESENCIAL: 'Presencial', IFOOD_BASICO: 'iFood Básico', IFOOD_ENTREGA: 'iFood Entrega',
  FOOD99: '99Food', WHATSAPP: 'WhatsApp', OUTRO: 'Outro'
}
const CHANNELS: SalesChannel[] = ['PRESENCIAL', 'IFOOD_BASICO', 'IFOOD_ENTREGA', 'FOOD99', 'WHATSAPP', 'OUTRO']

// ---------- SaleItemRow ----------
function SaleItemRow({ item, onRemove }: { item: SaleItem; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-gray-800 truncate">{item.productName}</p>
        <p className="text-xs text-gray-400">
          {item.quantity}x {formatCurrencyBRL(item.unitPrice)} · {CHANNEL_LABELS[item.channel]}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-2 flex-shrink-0">
        <div className="text-right">
          <p className={`font-semibold ${item.unitNetProfit * item.quantity < 0 ? 'text-red-500' : 'text-green-600'}`}>
            {formatCurrencyBRL(item.unitNetProfit * item.quantity)}
          </p>
          <p className="text-xs text-gray-400">lucro</p>
        </div>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
      </div>
    </div>
  )
}

// ---------- New Sale Modal ----------
function NewSaleModal({ onClose }: { onClose: () => void }) {
  const products = useLiveQuery(() => db.products.orderBy('nome').filter(p => p.ativo).toArray(), [])
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [])
  const platforms = useLiveQuery(() => db.platforms.toArray(), [])

  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  const [saving, setSaving] = useState(false)

  // Item builder state
  const [productId, setProductId] = useState('')
  const [channel, setChannel] = useState<SalesChannel>('PRESENCIAL')
  const [priceRaw, setPriceRaw] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [discountRaw, setDiscountRaw] = useState('')

  const ingredientsMap = useMemo(() => new Map((ingredients ?? []).map(i => [i.id, i])), [ingredients])
  const platformMap = useMemo(() => new Map((platforms ?? []).map(p => [p.canal, p])), [platforms])

  const selectedProduct = (products ?? []).find(p => p.id === productId)

  const handleAddItem = () => {
    if (!selectedProduct || !platformMap.get(channel)) return
    const unitPrice = parseCurrencyBRL(priceRaw)
    const discount = parseCurrencyBRL(discountRaw)
    if (unitPrice <= 0 || quantity <= 0) return

    const preset = platformMap.get(channel)!
    const unitCost = calculateProductCost(selectedProduct, ingredientsMap).custoComPerdaProduto
    const fees = calculatePlatformFees(preset, { precoVenda: unitPrice, descontoLojaValor: discount })
    const unitFees = fees.custoTotalTaxas
    const unitNetProfit = calculateNetProfit(unitCost, fees.receitaAposDescontoLoja, unitFees)

    setItems(prev => [...prev, {
      productId: selectedProduct.id,
      productName: selectedProduct.nome,
      quantity, unitPrice, unitCost, unitFees, discount, channel, unitNetProfit
    }])
    setProductId(''); setPriceRaw(''); setDiscountRaw(''); setQuantity(1)
  }

  const handleSave = async () => {
    if (items.length === 0) return
    setSaving(true)
    const grossRevenue = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0)
    const totalCost = items.reduce((a, i) => a + i.unitCost * i.quantity, 0)
    const totalFees = items.reduce((a, i) => a + i.unitFees * i.quantity, 0)
    const netProfit = items.reduce((a, i) => a + i.unitNetProfit * i.quantity, 0)
    const saleDate = fromISODate(date)
    const paymentDate = toISODate(getExpectedPaymentDate(saleDate))

    const input: SaleInput = { date, items, grossRevenue, totalCost, totalFees, netProfit, expectedPaymentDate: paymentDate, notes }
    await saleRepository.create(input)
    setSaving(false)
    onClose()
  }

  const totalLucro = items.reduce((a, i) => a + i.unitNetProfit * i.quantity, 0)
  const totalFaturamento = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0)
  const paymentDateDisplay = date ? formatDateLongBR(getExpectedPaymentDate(fromISODate(date))) : ''

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Data da venda <span className="text-red-500">*</span></label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Observação</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>

      {date && (
        <div className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2 flex items-center gap-2">
          <Wallet size={14} />
          Previsão de recebimento: <strong>{paymentDateDisplay}</strong>
        </div>
      )}

      {/* Add item form */}
      <div className="border border-gray-200 rounded-xl p-3 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Adicionar item</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Produto</label>
            <select value={productId} onChange={e => {
              setProductId(e.target.value)
              const p = (products ?? []).find(x => x.id === e.target.value)
              if (p) {
                if (channel === 'PRESENCIAL') setPriceRaw(p.precoVendaPresencial.toString())
                else if (channel === 'FOOD99') setPriceRaw(p.precoVenda99food.toString())
                else setPriceRaw(p.precoVendaIfood.toString())
              }
            }} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Selecione...</option>
              {(products ?? []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Canal</label>
            <select value={channel} onChange={e => setChannel(e.target.value as SalesChannel)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500">
              {CHANNELS.map(c => <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Quantidade</label>
            <input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Preço unitário</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
              <span className="px-2 py-1.5 bg-gray-100 text-gray-500 text-sm border-r border-gray-300">R$</span>
              <input type="text" inputMode="decimal" value={priceRaw} onChange={e => setPriceRaw(e.target.value)} placeholder="Ex: 22,00"
                className="flex-1 px-2 py-1.5 text-sm outline-none bg-white placeholder:text-gray-300" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Desconto loja</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
              <span className="px-2 py-1.5 bg-gray-100 text-gray-500 text-sm border-r border-gray-300">R$</span>
              <input type="text" inputMode="decimal" value={discountRaw} onChange={e => setDiscountRaw(e.target.value)} placeholder="0,00"
                className="flex-1 px-2 py-1.5 text-sm outline-none bg-white placeholder:text-gray-300" />
            </div>
          </div>
        </div>
        <button onClick={handleAddItem} disabled={!productId || !priceRaw}
          className="w-full bg-brand-100 text-brand-800 rounded-lg py-2 text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-1">
          <Plus size={15} /> Adicionar item
        </button>
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Itens da venda</p>
          {items.map((item, idx) => (
            <SaleItemRow key={idx} item={item} onRemove={() => setItems(items.filter((_, i) => i !== idx))} />
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Faturamento: <span className="font-semibold text-gray-800">{formatCurrencyBRL(totalFaturamento)}</span></div>
            <div className="text-gray-500 text-right">Lucro: <span className={`font-semibold ${totalLucro < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrencyBRL(totalLucro)}</span></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-600">Cancelar</button>
        <button onClick={handleSave} disabled={items.length === 0 || saving}
          className="flex-1 bg-brand-700 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar venda'}
        </button>
      </div>
    </div>
  )
}

// ---------- Summary Cards ----------
function SummaryCard({ title, value, sub, color = 'gray' }: { title: string; value: string; sub?: string; color?: 'gray' | 'green' | 'red' | 'brand' }) {
  const colors = { gray: 'text-gray-800', green: 'text-green-600', red: 'text-red-600', brand: 'text-brand-700' }
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ---------- Main Page ----------
type Tab = 'lancamentos' | 'resumo' | 'recebiveis'

export default function SalesPage() {
  const allSales = useLiveQuery(() => saleRepository.getAll(), [])
  const [tab, setTab] = useState<Tab>('lancamentos')
  const [showNewSale, setShowNewSale] = useState(false)
  const [expandedSale, setExpandedSale] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(todayISO())

  const today = todayISO()
  const { start: weekStart, end: weekEnd } = getWeekRangeMondayToSunday(new Date())
  const monthStart = today.slice(0, 7) + '-01'
  const monthEnd = today.slice(0, 7) + '-31'

  const todaySales = useMemo(() => filterByDateRange(allSales ?? [], today, today), [allSales, today])
  const weekSales = useMemo(() => filterByDateRange(allSales ?? [], toISODate(weekStart), toISODate(weekEnd)), [allSales, weekStart, weekEnd])
  const monthSales = useMemo(() => filterByDateRange(allSales ?? [], monthStart, monthEnd), [allSales, monthStart, monthEnd])

  const todayTotals = useMemo(() => sumSales(todaySales), [todaySales])
  const weekTotals = useMemo(() => sumSales(weekSales), [weekSales])
  const monthTotals = useMemo(() => sumSales(monthSales), [monthSales])
  const ticket = useMemo(() => averageTicket(monthSales), [monthSales])
  const topProd = useMemo(() => topProduct(monthSales), [monthSales])

  const dailySummaries = useMemo(() => buildDailySummaries(allSales ?? []), [allSales])
  const paymentGroups = useMemo(() => buildPaymentGroups((allSales ?? []).filter(s => s.expectedPaymentDate >= today)), [allSales, today])

  const salesOnDate = useMemo(() => filterByDateRange(allSales ?? [], selectedDate, selectedDate), [allSales, selectedDate])

  if (!allSales) return <div className="p-4 text-gray-400 text-center">Carregando...</div>

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-lg">Vendas</h2>
        <button onClick={() => setShowNewSale(true)}
          className="flex items-center gap-1 bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={16} /> Nova venda
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([['lancamentos', 'Lançamentos'], ['resumo', 'Resumos'], ['recebiveis', 'Recebíveis']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ---- TAB: LANÇAMENTOS ---- */}
      {tab === 'lancamentos' && (
        <div className="space-y-3">
          {/* Date picker */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500" />
            <span className="text-xs text-gray-400">{formatDateBR(selectedDate)}</span>
          </div>

          {salesOnDate.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">Nenhuma venda em {formatDateBR(selectedDate)}.</div>
          ) : (
            salesOnDate.map(sale => (
              <div key={sale.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}</p>
                      {sale.notes && <p className="text-xs text-gray-400">{sale.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{formatCurrencyBRL(sale.netProfit)}</p>
                      <p className="text-xs text-gray-400">Lucro</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400">Faturamento</p>
                      <p className="font-semibold">{formatCurrencyBRL(sale.grossRevenue)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400">Taxas + Custo</p>
                      <p className="font-semibold text-red-500">-{formatCurrencyBRL(sale.totalCost + sale.totalFees)}</p>
                    </div>
                  </div>
                  <div className="text-xs text-brand-600 mt-2">
                    Recebimento previsto: {formatDateLongBR(fromISODate(sale.expectedPaymentDate))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                      className="text-xs text-gray-400 flex items-center gap-1">
                      {expandedSale === sale.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Detalhes
                    </button>
                    <button onClick={() => { if (confirm('Excluir esta venda?')) saleRepository.delete(sale.id) }}
                      className="text-xs text-red-400 flex items-center gap-1"><Trash2 size={13} /> Excluir</button>
                  </div>
                  {expandedSale === sale.id && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600 py-1">
                          <span>{item.quantity}x {item.productName} ({CHANNEL_LABELS[item.channel]})</span>
                          <span className={item.unitNetProfit * item.quantity < 0 ? 'text-red-500' : 'text-green-600'}>
                            {formatCurrencyBRL(item.unitNetProfit * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Daily history */}
          {dailySummaries.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Histórico</p>
              <div className="space-y-2">
                {dailySummaries.slice(0, 10).map(d => (
                  <button key={d.date} onClick={() => setSelectedDate(d.date)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left ${selectedDate === d.date ? 'border-brand-300 bg-brand-50' : 'border-gray-100 bg-white'}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{formatDateBR(d.date)}</p>
                      <p className="text-xs text-gray-400">{d.itemCount} {d.itemCount === 1 ? 'item' : 'itens'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{formatCurrencyBRL(d.netProfit)}</p>
                      <p className="text-xs text-gray-400">{formatCurrencyBRL(d.grossRevenue)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- TAB: RESUMO ---- */}
      {tab === 'resumo' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><TrendingUp size={12} /> Hoje</p>
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard title="Faturamento" value={formatCurrencyBRL(todayTotals.grossRevenue)} />
              <SummaryCard title="Lucro" value={formatCurrencyBRL(todayTotals.netProfit)} color={todayTotals.netProfit >= 0 ? 'green' : 'red'} sub={`${todayTotals.itemCount} itens`} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Esta semana (Seg–Dom)</p>
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard title="Faturamento" value={formatCurrencyBRL(weekTotals.grossRevenue)} />
              <SummaryCard title="Lucro" value={formatCurrencyBRL(weekTotals.netProfit)} color={weekTotals.netProfit >= 0 ? 'green' : 'red'} sub={`${weekTotals.itemCount} itens`} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Este mês</p>
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard title="Faturamento" value={formatCurrencyBRL(monthTotals.grossRevenue)} />
              <SummaryCard title="Lucro" value={formatCurrencyBRL(monthTotals.netProfit)} color={monthTotals.netProfit >= 0 ? 'green' : 'red'} sub={`${monthTotals.itemCount} itens`} />
              <SummaryCard title="Ticket médio" value={formatCurrencyBRL(ticket)} />
              <SummaryCard title="Mais vendido" value={topProd ?? '—'} color="brand" />
            </div>
          </div>
        </div>
      )}

      {/* ---- TAB: RECEBÍVEIS ---- */}
      {tab === 'recebiveis' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Previsão: semana fecha no domingo, pagamento na quarta-feira seguinte.</p>
          {paymentGroups.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">Nenhum recebível previsto.</div>
          ) : (
            paymentGroups.map(g => (
              <div key={g.paymentDate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Recebimento previsto</p>
                    <p className="font-semibold text-gray-800 text-sm">{formatDateLongBR(fromISODate(g.paymentDate))}</p>
                    <p className="text-xs text-gray-400 mt-1">{g.sales.length} {g.sales.length === 1 ? 'venda' : 'vendas'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{formatCurrencyBRL(g.netAmount)}</p>
                    <p className="text-xs text-gray-400">Lucro estimado</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Bruto</p>
                    <p className="font-semibold">{formatCurrencyBRL(g.grossRevenue)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Taxas+Custo</p>
                    <p className="font-semibold text-red-500">-{formatCurrencyBRL(g.grossRevenue - g.netAmount)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showNewSale && (
        <Modal title="Nova Venda" onClose={() => setShowNewSale(false)}>
          <NewSaleModal onClose={() => setShowNewSale(false)} />
        </Modal>
      )}
    </div>
  )
}
