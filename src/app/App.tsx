import { useState, useEffect } from 'react'
import Layout, { type Page } from '../ui/components/Layout'
import DashboardPage from '../ui/pages/DashboardPage'
import IngredientsPage from '../ui/pages/IngredientsPage'
import ProductsPage from '../ui/pages/ProductsPage'
import SimulatorPage from '../ui/pages/SimulatorPage'
import PlatformsPage from '../ui/pages/PlatformsPage'
import BackupPage from '../ui/pages/BackupPage'
import SalesPage from '../ui/pages/SalesPage'
import { initializeDB } from '../data/repositories/dbInit'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initializeDB().then(() => setReady(true)).catch(console.error)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-700">
        <div className="text-white text-center">
          <div className="text-4xl mb-3">🍇</div>
          <p className="font-semibold text-lg">Lu Açaí Custos</p>
          <p className="text-brand-200 text-sm mt-1">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'ingredients' && <IngredientsPage />}
      {currentPage === 'products' && <ProductsPage />}
      {currentPage === 'sales' && <SalesPage />}
      {currentPage === 'simulator' && <SimulatorPage />}
      {currentPage === 'platforms' && <PlatformsPage />}
      {currentPage === 'backup' && <BackupPage />}
    </Layout>
  )
}
