import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Upload, FileText } from 'lucide-react'
import { db } from '../../data/db'
import { calculateProductCost } from '../../domain/services/costCalculator'
import { simulateSale } from '../../domain/services/priceCalculator'
import { formatCurrency, formatPercent } from '../../utils/nanoid'
import type { SalesChannel } from '../../domain/entities/Product'

export default function BackupPage() {
  const products = useLiveQuery(() => db.products.toArray(), [])
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [])
  const platforms = useLiveQuery(() => db.platforms.toArray(), [])
  const config = useLiveQuery(() => db.config.get('main'), [])

  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleExportJSON = async () => {
    const data = { ingredients, products, platforms, config, exportedAt: new Date().toISOString(), version: '1.0.0' }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lu-acai-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await db.transaction('rw', db.ingredients, db.products, db.platforms, db.config, async () => {
        if (data.ingredients) { await db.ingredients.clear(); await db.ingredients.bulkAdd(data.ingredients) }
        if (data.products) { await db.products.clear(); await db.products.bulkAdd(data.products) }
        if (data.platforms) { await db.platforms.clear(); await db.platforms.bulkAdd(data.platforms) }
        if (data.config) { await db.config.clear(); await db.config.add(data.config) }
      })
      setImportStatus('Dados importados com sucesso!')
    } catch {
      setImportStatus('Erro ao importar. Verifique se o arquivo é válido.')
    }
    e.target.value = ''
  }

  const handleExportCSV = () => {
    if (!products || !ingredients || !platforms) return
    const ingredientsMap = new Map(ingredients.map(i => [i.id, i]))
    const platformMap = new Map(platforms.map(p => [p.canal, p]))

    const channelLabels: Record<SalesChannel, string> = {
      PRESENCIAL: 'Presencial', IFOOD_BASICO: 'iFood Básico', IFOOD_ENTREGA: 'iFood Entrega',
      FOOD99: '99Food', WHATSAPP: 'WhatsApp', OUTRO: 'Outro'
    }

    const rows: string[][] = [['Produto', 'Canal', 'Preço', 'Custo', 'Taxas', 'Lucro', 'Margem']]

    for (const product of products) {
      const custo = calculateProductCost(product, ingredientsMap).custoComPerdaProduto
      const channelsToShow: [SalesChannel, number][] = [
        ['PRESENCIAL', product.precoVendaPresencial],
        ['IFOOD_BASICO', product.precoVendaIfood],
        ['IFOOD_ENTREGA', product.precoVendaIfood],
        ['FOOD99', product.precoVenda99food],
      ]
      for (const [canal, preco] of channelsToShow) {
        const preset = platformMap.get(canal)
        if (!preset) continue
        const result = simulateSale({ custoProduto: custo, precoVenda: preco }, preset)
        rows.push([
          product.nome, channelLabels[canal],
          formatCurrency(preco), formatCurrency(custo),
          formatCurrency(result.fees.custoTotalTaxas),
          formatCurrency(result.lucroLiquido),
          formatPercent(result.margemLiquidaPercentual)
        ])
      }
    }

    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lu-acai-margens-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold text-gray-800 text-lg">Backup e Exportação</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Exportar</h3>

        <button
          onClick={handleExportJSON}
          className="w-full flex items-center gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-800 font-medium text-sm hover:bg-brand-100"
        >
          <Download size={20} className="text-brand-700" />
          <div className="text-left">
            <p className="font-semibold">Exportar JSON (backup completo)</p>
            <p className="text-xs text-brand-600 font-normal">Todos os insumos, produtos e plataformas</p>
          </div>
        </button>

        <button
          onClick={handleExportCSV}
          className="w-full flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium text-sm hover:bg-green-100"
        >
          <FileText size={20} className="text-green-700" />
          <div className="text-left">
            <p className="font-semibold">Exportar CSV (margens)</p>
            <p className="text-xs text-green-600 font-normal">Resumo de produtos, custos e margens por canal</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Importar</h3>

        <label className="w-full flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 font-medium text-sm cursor-pointer hover:bg-orange-100">
          <Upload size={20} className="text-orange-700" />
          <div className="text-left">
            <p className="font-semibold">Importar JSON</p>
            <p className="text-xs text-orange-600 font-normal">Substituirá todos os dados atuais</p>
          </div>
          <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
        </label>

        {importStatus && (
          <div className={`text-sm text-center p-3 rounded-lg ${importStatus.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {importStatus}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400 text-center">
        Dados salvos localmente neste dispositivo.
      </div>
    </div>
  )
}
