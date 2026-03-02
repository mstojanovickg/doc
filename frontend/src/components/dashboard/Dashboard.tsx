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
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-sm font-bold text-gray-800">Robot Implementation Decision Support</h1>
          <p className="text-xs text-gray-500">
            Robot price: {new Intl.NumberFormat().format(inputs.robot_price)} RSD &nbsp;|&nbsp;
            CT: {inputs.ct_manual.toFixed(2)} min &nbsp;|&nbsp;
            Workers: {inputs.workers}
          </p>
        </div>
        <div className="flex gap-2">
          {result.warnings.length > 0 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              ⚠ {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}
            </div>
          )}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Print / Export PDF
          </button>
          <button
            onClick={() => setView('wizard')}
            className="px-3 py-1.5 text-xs font-medium text-brand-700 border border-brand-300 rounded-md hover:bg-brand-50"
          >
            ← Edit Inputs
          </button>
        </div>
      </div>

      {/* Warnings banner */}
      {result.warnings.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 print:hidden">
          {result.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-800">⚠ {w}</p>
          ))}
        </div>
      )}

      {/* Dashboard content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 print:overflow-visible print:p-4">
        {/* A — Hero strip */}
        <section>
          <HeroStrip result={result} />
        </section>

        {/* B — Financial */}
        <section>
          <FinancialSection result={result} />
        </section>

        {/* C — Operational */}
        <section>
          <OperationalSection result={result} />
        </section>

        {/* D — Cost comparison table */}
        <section>
          <CostTable result={result} />
        </section>

        {/* E — Safety & Quality */}
        <section>
          <SafetySection result={result} />
        </section>

        {/* F — Financing */}
        <section>
          <FinancingSection result={result} />
        </section>
      </div>
    </div>
  )
}
