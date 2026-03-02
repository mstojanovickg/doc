import React from 'react'
import type { CalculationResult } from '@/types'
import { fmtRSD, diffClass } from '@/utils/formatting'

export function CostTable({ result }: { result: CalculationResult }) {
  const { cost_comparison } = result

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">Cost Comparison Table</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Cost Component</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-500">Manual (RSD/yr)</th>
              <th className="text-right px-4 py-2 font-semibold text-blue-600">Robot (RSD/yr)</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600">Δ %</th>
            </tr>
          </thead>
          <tbody>
            {cost_comparison.map((row) => (
              <tr key={row.label} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className={`px-4 py-2 ${row.label === 'Total Annual Costs' ? 'font-semibold' : ''}`}>
                  {row.label}
                </td>
                <td className="text-right px-4 py-2 text-gray-600">{fmtRSD(row.manual)}</td>
                <td className="text-right px-4 py-2 text-blue-700">{fmtRSD(row.robot)}</td>
                <td className={`text-right px-4 py-2 ${diffClass(row.diff_pct, true)}`}>
                  {row.diff_pct === 0 && row.manual === 0 ? '—' : `${row.diff_pct >= 0 ? '+' : ''}${row.diff_pct.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
