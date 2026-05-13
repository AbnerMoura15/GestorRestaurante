import React from 'react'

interface CurrencyInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
  prefix?: string
  required?: boolean
  hint?: string
}

export default function CurrencyInput({ label, value, onChange, min = 0, step = 0.01, prefix = 'R$', required, hint }: CurrencyInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
        {prefix && <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm border-r border-gray-300">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 px-3 py-2 text-sm outline-none bg-white"
        />
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
