interface TextInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}

export default function TextInput({ label, value, onChange, placeholder, required }: TextInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
      />
    </div>
  )
}
