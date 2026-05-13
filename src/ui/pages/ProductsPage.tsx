import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Pencil, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { db } from '../../data/db'
import { productRepository } from '../../data/repositories/productRepository'
import { calculateProductCost } from '../../domain/services/costCalculator'
import type { Product, ProductInput, ProductIngredient, ProductCategory } from '../../domain/entities/Product'
import { productCategories } from '../../domain/entities/Product'
import { formatCurrencyBRL } from '../../utils/currency'
import Modal from '../components/Modal'
import TextInput from '../components/TextInput'
import CurrencyInput from '../components/CurrencyInput'

function ProductForm({ initial, ingredientsList, onSave, onCancel }: {
  initial?: Product
  ingredientsList: { id: string; nome: string }[]
  onSave: (d: ProductInput) => void
  onCancel: () => void
}) {
  const isNew = !initial
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [categoria, setCategoria] = useState<ProductCategory>(initial?.categoria ?? 'Outros')
  const [tamanhoMl, setTamanhoMl] = useState(initial?.tamanhoMl ?? 0)
  const [precoPresencial, setPrecoPresencial] = useState(initial?.precoVendaPresencial ?? 0)
  const [precoIfood, setPrecoIfood] = useState(initial?.precoVendaIfood ?? 0)
  const [preco99food, setPreco99food] = useState(initial?.precoVenda99food ?? 0)
  const [margem, setMargem] = useState(initial?.margemDesejadaPercentual ?? 0)
  const [ingredientes, setIngredientes] = useState<ProductIngredient[]>(initial?.ingredientes ?? [])

  const addIngredient = () => {
    if (!ingredientsList.length) return
    setIngredientes([...ingredientes, { ingredientId: ingredientsList[0].id, quantidadeUsada: 0, unidadeUsada: 'g', perdaEspecificaPercentual: 0 }])
  }

  const updateIngredient = (idx: number, field: keyof ProductIngredient, value: string | number) => {
    const updated = [...ingredientes]
    updated[idx] = { ...updated[idx], [field]: value }
    setIngredientes(updated)
  }

  const isValid = nome.trim() !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSave({
      nome: nome.trim(), categoria, tamanhoMl, canalPadrao: 'PRESENCIAL',
      precoVendaPresencial: precoPresencial, precoVendaIfood: precoIfood, precoVenda99food: preco99food,
      margemDesejadaPercentual: margem, percentualPerdaProduto: 0,
      ingredientes, ativo: initial?.ativo ?? true
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput label="Nome do produto" value={nome} onChange={setNome} required placeholder="Ex: Copo 500ml com Nutella" />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Categoria</label>
        <select value={categoria} onChange={e => setCategoria(e.target.value as ProductCategory)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500">
          {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <CurrencyInput label="Tamanho (ml)" value={tamanhoMl} onChange={setTamanhoMl} prefix="ml" isNew={isNew} placeholder="Ex: 500" />
      <div className="grid grid-cols-2 gap-2">
        <CurrencyInput label="Preço Presencial" value={precoPresencial} onChange={setPrecoPresencial} isNew={isNew} />
        <CurrencyInput label="Preço iFood" value={precoIfood} onChange={setPrecoIfood} isNew={isNew} />
        <CurrencyInput label="Preço 99Food" value={preco99food} onChange={setPreco99food} isNew={isNew} />
        <CurrencyInput label="Margem desejada %" value={margem} onChange={setMargem} prefix="%" isNew={isNew} placeholder="Ex: 30" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Ingredientes</p>
          <button type="button" onClick={addIngredient} className="text-xs text-brand-700 font-semibold flex items-center gap-1">
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {ingredientes.map((pi, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <select value={pi.ingredientId} onChange={e => updateIngredient(idx, 'ingredientId', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500">
                  {ingredientsList.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
                <button type="button" onClick={() => setIngredientes(ingredientes.filter((_, i) => i !== idx))} className="text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <input type="text" inputMode="decimal" value={pi.quantidadeUsada || ''} placeholder="Qtd"
                  onChange={e => updateIngredient(idx, 'quantidadeUsada', parseFloat(e.target.value.replace(',', '.')) || 0)}
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300" />
                <select value={pi.unidadeUsada} onChange={e => updateIngredient(idx, 'unidadeUsada', e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500">
                  {['g', 'kg', 'ml', 'l', 'unidade'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input type="text" inputMode="decimal" value={pi.perdaEspecificaPercentual || ''} placeholder="Perda %"
                  onChange={e => updateIngredient(idx, 'perdaEspecificaPercentual', parseFloat(e.target.value.replace(',', '.')) || 0)}
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-600">Cancelar</button>
        <button type="submit" disabled={!isValid} className="flex-1 bg-brand-700 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50">Salvar</button>
      </div>
    </form>
  )
}

export default function ProductsPage() {
  const products = useLiveQuery(() => db.products.orderBy('nome').toArray(), [])
  const ingredients = useLiveQuery(() => db.ingredients.toArray(), [])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<string>('Todos')

  if (!products || !ingredients) return <div className="p-4 text-gray-400 text-center">Carregando...</div>

  const ingredientsMap = new Map(ingredients.map(i => [i.id, i]))
  const ingredientsList = ingredients.filter(i => i.ativo).map(i => ({ id: i.id, nome: i.nome }))

  const handleSave = async (data: ProductInput) => {
    if (editing) await productRepository.update(editing.id, data)
    else await productRepository.create(data)
    setShowForm(false); setEditing(null)
  }

  const filtered = filterCat === 'Todos' ? products : products.filter(p => (p.categoria || 'Outros') === filterCat)
  const groups = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.categoria || 'Outros'
    ;(acc[cat] ??= []).push(p)
    return acc
  }, {})

  const allCats = ['Todos', ...productCategories.filter(c => products.some(p => (p.categoria || 'Outros') === c))]

  return (
    <div className="p-4 space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-lg">Produtos ({products.length})</h2>
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

      {filtered.length === 0 && <div className="text-center text-gray-400 py-12">Nenhum produto. Clique em <strong>Novo</strong>.</div>}

      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">{cat}</h3>
          <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            {items.map(product => {
              const costResult = calculateProductCost(product, ingredientsMap)
              const custo = costResult.custoComPerdaProduto
              const isExpanded = expanded === product.id
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">{product.nome}</p>
                        <p className="text-xs text-gray-400">{product.tamanhoMl}ml</p>
                        <p className="text-sm text-gray-600 mt-1">Custo: <strong>{formatCurrencyBRL(custo)}</strong></p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(product); setShowForm(true) }} className="p-2 rounded-lg text-brand-600 bg-brand-50"><Pencil size={16} /></button>
                        <button onClick={() => productRepository.duplicate(product.id)} className="p-2 rounded-lg text-gray-500 bg-gray-50"><Copy size={16} /></button>
                        <button onClick={() => { if (confirm('Excluir?')) productRepository.delete(product.id) }} className="p-2 rounded-lg text-red-400 bg-red-50"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      {[['Presencial', product.precoVendaPresencial], ['iFood', product.precoVendaIfood], ['99Food', product.precoVenda99food]].map(([label, price]) => (
                        <div key={label as string} className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-400">{label as string}</p>
                          <p className="font-semibold text-sm">{formatCurrencyBRL(price as number)}</p>
                        </div>
                      ))}
                    </div>
                    {product.ingredientes.length > 0 && (
                      <button onClick={() => setExpanded(isExpanded ? null : product.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Ocultar' : 'Ver'} composição ({product.ingredientes.length} insumos)
                      </button>
                    )}
                    {isExpanded && (
                      <div className="mt-2 space-y-1">
                        {product.ingredientes.map((pi, idx) => {
                          const ing = ingredientsMap.get(pi.ingredientId)
                          if (!ing) return null
                          return (
                            <div key={idx} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50">
                              <span>{ing.nome}: {pi.quantidadeUsada}{pi.unidadeUsada}</span>
                              <span>{formatCurrencyBRL(pi.quantidadeUsada * ing.custoPorUnidadeBase)}</span>
                            </div>
                          )
                        })}
                        <div className="flex justify-between text-xs font-semibold text-gray-800 pt-1">
                          <span>Total</span><span>{formatCurrencyBRL(custo)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {showForm && (
        <Modal title={editing ? 'Editar Produto' : 'Novo Produto'} onClose={() => { setShowForm(false); setEditing(null) }}>
          <ProductForm initial={editing ?? undefined} ingredientsList={ingredientsList} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />
        </Modal>
      )}
    </div>
  )
}
