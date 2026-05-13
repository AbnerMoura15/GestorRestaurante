import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Pencil, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { db } from '../../data/db'
import { productRepository } from '../../data/repositories/productRepository'
import { calculateProductCost } from '../../domain/services/costCalculator'
import type { Product, ProductInput, ProductIngredient } from '../../domain/entities/Product'
import { formatCurrency } from '../../utils/nanoid'
import Modal from '../components/Modal'
import TextInput from '../components/TextInput'
import CurrencyInput from '../components/CurrencyInput'

function ProductForm({
  initial,
  ingredientsList,
  onSave,
  onCancel
}: {
  initial?: Product
  ingredientsList: { id: string; nome: string }[]
  onSave: (data: ProductInput) => void
  onCancel: () => void
}) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [tamanhoMl, setTamanhoMl] = useState(initial?.tamanhoMl ?? 300)
  const [precoPresencial, setPrecoPresencial] = useState(initial?.precoVendaPresencial ?? 0)
  const [precoIfood, setPrecoIfood] = useState(initial?.precoVendaIfood ?? 0)
  const [preco99food, setPreco99food] = useState(initial?.precoVenda99food ?? 0)
  const [margem, setMargem] = useState(initial?.margemDesejadaPercentual ?? 30)
  const [ingredientes, setIngredientes] = useState<ProductIngredient[]>(initial?.ingredientes ?? [])

  const addIngredient = () => {
    if (ingredientsList.length === 0) return
    setIngredientes([...ingredientes, { ingredientId: ingredientsList[0].id, quantidadeUsada: 0, unidadeUsada: 'g', perdaEspecificaPercentual: 0 }])
  }

  const updateIngredient = (idx: number, field: keyof ProductIngredient, value: string | number) => {
    const updated = [...ingredientes]
    updated[idx] = { ...updated[idx], [field]: value }
    setIngredientes(updated)
  }

  const removeIngredient = (idx: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== idx))
  }

  const isValid = nome.trim() !== '' && tamanhoMl > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSave({
      nome: nome.trim(), tamanhoMl, canalPadrao: 'PRESENCIAL',
      precoVendaPresencial: precoPresencial, precoVendaIfood: precoIfood, precoVenda99food: preco99food,
      margemDesejadaPercentual: margem, percentualPerdaProduto: 0,
      ingredientes, ativo: initial?.ativo ?? true
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput label="Nome do produto" value={nome} onChange={setNome} required placeholder="Ex: Copo 500ml com Nutella" />
      <CurrencyInput label="Tamanho (ml)" value={tamanhoMl} onChange={setTamanhoMl} prefix="ml" step={50} />
      <div className="grid grid-cols-2 gap-2">
        <CurrencyInput label="Preço Presencial" value={precoPresencial} onChange={setPrecoPresencial} />
        <CurrencyInput label="Preço iFood" value={precoIfood} onChange={setPrecoIfood} />
        <CurrencyInput label="Preço 99Food" value={preco99food} onChange={setPreco99food} />
        <CurrencyInput label="Margem desejada %" value={margem} onChange={setMargem} prefix="%" step={1} />
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
                <select
                  value={pi.ingredientId}
                  onChange={e => updateIngredient(idx, 'ingredientId', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {ingredientsList.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
                <button type="button" onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={pi.quantidadeUsada}
                  onChange={e => updateIngredient(idx, 'quantidadeUsada', parseFloat(e.target.value) || 0)}
                  placeholder="Qtd"
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
                <select
                  value={pi.unidadeUsada}
                  onChange={e => updateIngredient(idx, 'unidadeUsada', e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {['g', 'kg', 'ml', 'l', 'unidade'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="flex-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step="0.1"
                    value={pi.perdaEspecificaPercentual}
                    onChange={e => updateIngredient(idx, 'perdaEspecificaPercentual', parseFloat(e.target.value) || 0)}
                    placeholder="Perda %"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-600">
          Cancelar
        </button>
        <button type="submit" disabled={!isValid} className="flex-1 bg-brand-700 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50">
          Salvar
        </button>
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

  if (!products || !ingredients) return <div className="p-4 text-gray-400 text-center">Carregando...</div>

  const ingredientsMap = new Map(ingredients.map(i => [i.id, i]))
  const ingredientsList = ingredients.filter(i => i.ativo).map(i => ({ id: i.id, nome: i.nome }))

  const handleSave = async (data: ProductInput) => {
    if (editing) {
      await productRepository.update(editing.id, data)
    } else {
      await productRepository.create(data)
    }
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-lg">Produtos ({products.length})</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1 bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus size={16} /> Novo
        </button>
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-400 py-12">Nenhum produto. Clique em <strong>Novo</strong>.</div>
      )}

      {products.map(product => {
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
                  <p className="text-sm text-gray-600 mt-1">Custo: <strong>{formatCurrency(custo)}</strong></p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(product); setShowForm(true) }} className="p-2 rounded-lg text-brand-600 bg-brand-50">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => productRepository.duplicate(product.id)} className="p-2 rounded-lg text-gray-500 bg-gray-50">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => { if (confirm('Excluir?')) productRepository.delete(product.id) }} className="p-2 rounded-lg text-red-400 bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">Presencial</p>
                  <p className="font-semibold text-sm">{formatCurrency(product.precoVendaPresencial)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">iFood</p>
                  <p className="font-semibold text-sm">{formatCurrency(product.precoVendaIfood)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">99Food</p>
                  <p className="font-semibold text-sm">{formatCurrency(product.precoVenda99food)}</p>
                </div>
              </div>

              {product.ingredientes.length > 0 && (
                <button
                  onClick={() => setExpanded(isExpanded ? null : product.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? 'Ocultar' : 'Ver'} composição ({product.ingredientes.length} insumos)
                </button>
              )}

              {isExpanded && (
                <div className="mt-2 space-y-1">
                  {product.ingredientes.map((pi, idx) => {
                    const ing = ingredientsMap.get(pi.ingredientId)
                    if (!ing) return null
                    const custo = pi.quantidadeUsada * ing.custoPorUnidadeBase
                    return (
                      <div key={idx} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50">
                        <span>{ing.nome}: {pi.quantidadeUsada}{pi.unidadeUsada}</span>
                        <span>{formatCurrency(custo)}</span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between text-xs font-semibold text-gray-800 pt-1">
                    <span>Total</span>
                    <span>{formatCurrency(custo)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {showForm && (
        <Modal title={editing ? 'Editar Produto' : 'Novo Produto'} onClose={() => { setShowForm(false); setEditing(null) }}>
          <ProductForm
            initial={editing ?? undefined}
            ingredientsList={ingredientsList}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </Modal>
      )}
    </div>
  )
}
