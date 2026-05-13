import React from 'react'
import { LayoutDashboard, Package, ShoppingBag, Calculator, Settings, Download } from 'lucide-react'

type Page = 'dashboard' | 'ingredients' | 'products' | 'simulator' | 'platforms' | 'backup'

interface LayoutProps {
  children: React.ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Início', icon: <LayoutDashboard size={22} /> },
  { page: 'ingredients', label: 'Insumos', icon: <Package size={22} /> },
  { page: 'products', label: 'Produtos', icon: <ShoppingBag size={22} /> },
  { page: 'simulator', label: 'Simular', icon: <Calculator size={22} /> },
  { page: 'platforms', label: 'Taxas', icon: <Settings size={22} /> },
  { page: 'backup', label: 'Backup', icon: <Download size={22} /> },
]

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <header className="bg-brand-700 text-white px-4 py-3 flex items-center gap-2 shadow">
        <span className="text-xl font-bold">Lu Açaí</span>
        <span className="text-brand-200 text-sm font-medium ml-1">Custos</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex-1 flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors ${
              currentPage === item.page
                ? 'text-brand-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={currentPage === item.page ? 'text-brand-700' : 'text-gray-400'}>
              {item.icon}
            </span>
            <span className="mt-0.5 leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
