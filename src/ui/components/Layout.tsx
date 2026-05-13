import React from 'react'
import { LayoutDashboard, Package, ShoppingBag, Calculator, Settings, Download, TrendingUp } from 'lucide-react'

export type Page = 'dashboard' | 'ingredients' | 'products' | 'simulator' | 'platforms' | 'backup' | 'sales'

interface LayoutProps {
  children: React.ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Início', icon: <LayoutDashboard size={22} /> },
  { page: 'ingredients', label: 'Insumos', icon: <Package size={22} /> },
  { page: 'products', label: 'Produtos', icon: <ShoppingBag size={22} /> },
  { page: 'sales', label: 'Vendas', icon: <TrendingUp size={22} /> },
  { page: 'simulator', label: 'Simular', icon: <Calculator size={22} /> },
  { page: 'platforms', label: 'Taxas', icon: <Settings size={22} /> },
  { page: 'backup', label: 'Backup', icon: <Download size={22} /> },
]

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40">
        <div className="bg-brand-700 text-white px-5 py-4">
          <p className="text-lg font-bold">Lu Açaí</p>
          <p className="text-brand-200 text-xs font-medium">Custos</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left ${
                currentPage === item.page
                  ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-56">
        {/* Mobile header */}
        <header className="md:hidden bg-brand-700 text-white px-4 py-3 flex items-center gap-2 shadow sticky top-0 z-30">
          <span className="text-xl font-bold">Lu Açaí</span>
          <span className="text-brand-200 text-sm font-medium ml-1">Custos</span>
        </header>

        {/* Desktop top bar */}
        <header className="hidden md:flex items-center px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <h1 className="font-semibold text-gray-800 capitalize">
            {navItems.find(n => n.page === currentPage)?.label ?? ''}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav for mobile only */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex-1 flex flex-col items-center py-2 px-0.5 text-xs font-medium transition-colors ${
              currentPage === item.page ? 'text-brand-700' : 'text-gray-400'
            }`}
          >
            <span>{item.icon}</span>
            <span className="mt-0.5 leading-none text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
