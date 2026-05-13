import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Pencil, Trash2, Power } from 'lucide-react'
import { db } from '../../data/db'
import { ingredientRepository } from '../../data/repositories/ingredientRepository'
import type { Ingredient, IngredientInput, Unit } from '../../domain/entities/Ingredient'
import { ingredientCategories } from '../../domain/entities/Ingredient'
import { formatCurrencyBRL } from '../../utils/currency'
import Modal from '../components/Modal'
import TextInput from '../components/TextInput'
import CurrencyInput from '../components/CurrencyInput'

const unitOptions: Unit[] = ['g', 'kg', 'ml', 'l', 'unidade']

function IngredientForm({ initial, onSave, onCancel }: {
  initial?: Ingredient; onSave: (d: IngredientInput) => void; onCancel: () => void
}) {
  const isNew = !initial
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [categoria, setCategoria] = useState(initial?.categoria ?? 'Outros')
  const [precoCompra, setPrecoCompra] = useState(initial?.precoCompra ?? 0)
  const [quantidadeCompra, setQuantidadeCompra] = useState(initial?.quantidadeCompra ?? 0)
  const [unidadeCompra, setUnidadeCompra] = useState<Unit>(initial?.unidadeCompra ?? 'g')
  const [percentualPerdaPadrao, setPerda] = useState(initial?.percentualPerdaPadrao ?? 0)

  const baseUnit = unidadeCompra === 'kg' ? 'g' : unidadeCompra === 'l' ? 'ml' : unidadeCompra
  const custoPorUnitDisplay = precoCompra > 0 && quantidadeCompra > 0
    ? formatCurrencyBRL(precoCompra / (unidadeCompra === 'kg' ? quantidadeCompra * 1000 : unidadeCompra === 'l' ? quantidadeCompra * 1000 : quantidadeCompra))
    : null

  const isValid = nome.trim() !== '' && quantidadeCompra > 0 && precoCompra >= 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSave({ nome: nome.trim(), categoria, precoCompra, quantidadeCompra, unidadeCompra, percentualPerdaPadrao, ativo: initial?.ativo ?? true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput label="Nome" value={nome} onChange={setNome} required placeholder="Ex: Açaí base" />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Categoria</label>
        <select value={categoria} onChange={e => setCategoria(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500">
          {ingredientCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <CurrencyInput label="Preço de compra" value={precoCompra} onChange={setPrecoCompra} required isNew={isNew} />
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 block mb-1">Quantidade <span className="text-red-500">*</span></label>
          <input type="text" inputMode="decimal" value={quantidadeCompra === 0 && isNew ? '' : quantidadeCompra}
            placeholder="Ex: 500"
            onChange={e => setQuantidadeCompra(parseFloat(e.target.value.replace(',', '.')) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Unidade</label>
          <select value={unidadeCompra} onChange={e => setUnidadeCompra(e.target.value as Unit)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500">
            {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <CurrencyInput label="Perda padrão (%)" value={percentualPerdaPadrao} onChange={setPerda} prefix="%" isNew={isNew} placeholder="Ex: 5" />
      {custoPorUnitDisplay && (
        <div className="bg-brand-50 rounded-lg p-3 text-sm text-brand-800">
          Custo por {baseUnit}: <strong>{custoPorUnitDisplay}</strong>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-600">Cancelar</button>
        <button type="submit" disabled={!isValid} className="flex-1 bg-brand-700 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50">Salvar</button>
      </div>
    </form>
  )
}

export default function IngredientsPage() {
  const ingredients = useLiveQuery(() => db.ingredients.orderBy('nome').toArray(), [])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [filterCat, setFilterCat] = useState<string>('Todos')

  if (!ingredients) return <div className="p-4 text-gray-400 text-center">Carregando...</div>

  const handleSave = async (data: IngredientInput) => {
    if (editing) await ingredientRepository.update(editing.id, data)
    else await ingredientRepository.create(data)
    setShowForm(false); setEditing(null)
  }

  const filtered = filterCat === 'Todos' ? ingredients : ingredients.filter(i => i.categoria === filterCat)

  // Group by category
  const groups = filtered.reduce<Record<string, Ingredient[]>>((acc, ing) => {
    const cat = ing.categoria || 'Outros'
    ;(acc[cat] ??= []).push(ing)
    return acc
  }, {})

  const allCats = ['Todos', ...ingredientCategories.filter(c => ingredients.some(i => (i.categoria || 'Outros') === c))]

  return (
    <div className="p-4 space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-lg">Insumos ({ingredients.length})</h2>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1 bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={16} /> Novo
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {allCats.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${filterCat === c ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center text-gray-400 py-12">Nenhum insumo encontrado.</div>}

      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">{cat}</h3>
          <div className="space-y-2">
            {items.map(ing => (
              <div key={ing.id} className={`bg-white rounded-xl shadow-sm border p-4 ${!ing.ativo ? 'opacity-50 border-gray-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{ing.nome}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrencyBRL(ing.precoCompra)} / {ing.quantidadeCompra}{ing.unidadeCompra}
                      {' · '}custo: <strong>{formatCurrencyBRL(ing.custoPorUnidadeBase)}/{ing.unidadeCompra === 'kg' ? 'g' : ing.unidadeCompra === 'l' ? 'ml' : ing.unidadeCompra}</strong>
                    </p>
                    {ing.percentualPerdaPadrao > 0 && <p className="text-xs text-orange-500">Perda: {ing.percentualPerdaPadrao}%</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => ingredientRepository.toggle(ing.id)} className={`p-2 rounded-lg ${ing.ativo ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}><Power size={16} /></button>
                    <button onClick={() => { setEditing(ing); setShowForm(true) }} className="p-2 rounded-lg text-brand-600 bg-brand-50"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm('Excluir?')) ingredientRepository.delete(ing.id) }} className="p-2 rounded-lg text-red-500 bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <Modal title={editing ? 'Editar Insumo' : 'Novo Insumo'} onClose={() => { setShowForm(false); setEditing(null) }}>
          <IngredientForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />
        </Modal>
      )}
    </div>
  )
}
