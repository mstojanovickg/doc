import React from 'react'
import { useStore } from '@/store/useStore'
import { WizardLayout } from '@/components/wizard/WizardLayout'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { SessionManager } from '@/components/SessionManager'

export default function App() {
  const { view, resetInputs } = useStore()

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* ── Global header ───────────────────────────────────────────────────── */}
      <header className="bg-brand-800 text-white px-6 py-3 flex items-center justify-between shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-lg">⚙</div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Robot Implementation Decision Support Tool</h1>
            <p className="text-xs text-brand-200">PhD Research Instrument — v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SessionManager />
          <button
            onClick={resetInputs}
            className="px-3 py-1.5 text-xs font-medium border border-brand-500 text-brand-200 rounded-md hover:bg-brand-700 transition-colors"
          >
            New Analysis
          </button>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden bg-white">
        {view === 'wizard' ? <WizardLayout /> : <Dashboard />}
      </main>
    </div>
  )
}
