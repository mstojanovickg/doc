import React from 'react'
import { useStore } from '@/store/useStore'
import { HeroStrip } from './HeroStrip'
import { FinancialSection } from './FinancialSection'
import { OperationalSection } from './OperationalSection'
import { CostTable } from './CostTable'
import { SafetySection } from './SafetySection'
import { FinancingSection } from './FinancingSection'

export function Dashboard() {
  const { result, setView, inputs } = useStore()

  if (!result) return null

  const handlePrint = () => window.print()

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100">Analysis Results</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Robot: {new Intl.NumberFormat().format(inputs.robot_price)} RSD &nbsp;·&nbsp;
            CT: {inputs.ct_manual.toFixed(2)} min &nbsp;·&nbsp;
            Workers: {inputs.workers}
          </p>
        </div>
        <div className="flex gap-2">
          {result.warnings.length > 0 && (
            <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
              ⚠ {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}
            </div>
          )}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Print / Export PDF
          </button>
          <button
            onClick={() => setView('wizard')}
            className="px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          >
            ← Edit Inputs
          </button>
        </div>
      </div>

      {/* Warnings banner */}
      {result.warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-6 py-2 print:hidden">
          {result.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-800 dark:text-amber-400">⚠ {w}</p>
          ))}
        </div>
      )}

      {/* Dashboard content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 print:overflow-visible print:p-4 scrollbar-thin">
        <section><HeroStrip result={result} /></section>
        <section><FinancialSection result={result} /></section>
        <section><OperationalSection result={result} /></section>
        <section><CostTable result={result} /></section>
        <section><SafetySection result={result} /></section>
        <section><FinancingSection result={result} /></section>
      </div>
    </div>
  )
}
