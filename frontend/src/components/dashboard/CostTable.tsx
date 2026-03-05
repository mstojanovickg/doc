import React from 'react'
import type { CalculationResult } from '@/types'
import { fmtRSD, diffClass } from '@/utils/formatting'

export function CostTable({ result }: { result: CalculationResult }) {
  const { cost_comparison } = result

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
        Cost Comparison
      </h2>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Cost Component</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400">Manual (RSD/yr)</th>
                <th className="text-right px-5 py-3 font-semibold text-brand-600 dark:text-brand-400">Robot (RSD/yr)</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Δ %</th>
              </tr>
            </thead>
            <tbody>
              {cost_comparison.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-t border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    row.label === 'Total Annual Costs' ? 'bg-gray-50 dark:bg-gray-800/70' : ''
                  }`}
                >
                  <td className={`px-5 py-2.5 text-gray-700 dark:text-gray-300 ${row.label === 'Total Annual Costs' ? 'font-semibold' : ''}`}>
                    {row.label}
                  </td>
                  <td className="text-right px-5 py-2.5 text-gray-600 dark:text-gray-400">{fmtRSD(row.manual)}</td>
                  <td className="text-right px-5 py-2.5 text-brand-700 dark:text-brand-400 font-medium">{fmtRSD(row.robot)}</td>
                  <td className={`text-right px-5 py-2.5 font-medium ${diffClass(row.diff_pct, true)}`}>
                    {row.diff_pct === 0 && row.manual === 0 ? '—' : `${row.diff_pct >= 0 ? '+' : ''}${row.diff_pct.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
