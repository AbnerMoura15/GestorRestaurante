import { useState, useEffect } from 'react'
import { parseCurrencyBRL, formatInputBRL } from '../../utils/currency'

interface CurrencyInputProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
  prefix?: string
  required?: boolean
  hint?: string
  placeholder?: string
  isNew?: boolean // when true, starts empty instead of showing 0
}

export default function CurrencyInput({
  label, value, onChange, min = 0,
  prefix = 'R$', required, hint,
  placeholder, isNew = false
}: CurrencyInputProps) {
  const [raw, setRaw] = useState<string>(() =>
    isNew && value === 0 ? '' : formatInputBRL(value)
  )
  const [focused, setFocused] = useState(false)

  // Sync when value changes externally (e.g., edit modal opens)
  useEffect(() => {
    if (!focused) {
      setRaw(value === 0 ? '' : formatInputBRL(value))
    }
  }, [value, focused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    // Allow digits, comma, period, minus
    if (/^[0-9.,\-]*$/.test(v) || v === '') {
      setRaw(v)
      onChange(parseCurrencyBRL(v))
    }
  }

  const handleBlur = () => {
    setFocused(false)
    const num = parseCurrencyBRL(raw)
    if (num === 0) {
      setRaw('')
    } else {
      setRaw(formatInputBRL(num))
    }
  }

  const resolvedPlaceholder = placeholder ?? (prefix === '%' ? 'Ex: 3,5' : prefix === 'ml' ? 'Ex: 500' : 'Ex: 12,90')

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
        {prefix && (
          <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm border-r border-gray-300 whitespace-nowrap">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          min={min}
          value={raw}
          placeholder={resolvedPlaceholder}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          className="flex-1 px-3 py-2 text-sm outline-none bg-white placeholder:text-gray-300"
        />
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
