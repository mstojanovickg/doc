import React, { useState } from 'react'
import type { CalculationResult } from '@/types'
import { fmtRSD, fmtNum } from '@/utils/formatting'

export function FinancingSection({ result }: { result: CalculationResult }) {
  const { robot } = result
  const [showFull, setShowFull] = useState(false)

  const schedule = robot.loan_schedule
  const hasLoan = schedule.length > 0

  const investmentRows = [
    { label: 'Robot price', value: result.robot.total_investment - result.robot.engineering_cost - result.robot.training_cost },
    { label: 'Engineering / integration', value: result.robot.engineering_cost },
    { label: 'Training', value: result.robot.training_cost },
  ]

  const residual = robot.total_investment * (1 - 0.20 * 5)  // 5-year straight-line residual

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">Financing & Investment Summary</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment breakdown */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Total Investment Breakdown</p>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {investmentRows.map((r) => (
                  <tr key={r.label} className="border-b border-gray-100">
                    <td className="px-4 py-2.5 text-gray-600">{r.label}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{fmtRSD(r.value)}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">Total Investment</td>
                  <td className="px-4 py-2.5 text-right font-bold text-blue-800">{fmtRSD(robot.total_investment)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-gray-500">Financed by loan</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmtRSD(robot.total_investment - robot.equity_invested)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-gray-500">Equity invested</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmtRSD(robot.equity_invested)}</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2.5 text-gray-500">Residual value (yr 5)</td>
                  <td className="px-4 py-2.5 text-right text-green-700">{fmtRSD(Math.max(0, residual))}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-gray-500">Annual amortization</td>
                  <td className="px-4 py-2.5 text-right">{fmtRSD(robot.annual_amortization)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Loan schedule */}
        {hasLoan ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Loan Repayment Schedule</p>
              <button
                onClick={() => setShowFull(!showFull)}
                className="text-xs text-brand-600 hover:underline"
              >
                {showFull ? 'Show summary' : 'Show full schedule'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl overflow-hidden max-h-72 overflow-y-auto text-xs">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500">Month</th>
                    <th className="px-3 py-2 text-right text-gray-500">Payment</th>
                    <th className="px-3 py-2 text-right text-gray-500">Principal</th>
                    <th className="px-3 py-2 text-right text-gray-500">Interest</th>
                    <th className="px-3 py-2 text-right text-gray-500">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {(showFull ? schedule : schedule.slice(0, 12)).map((row) => (
                    <tr key={row.month} className="border-t border-gray-100">
                      <td className="px-3 py-1.5">{row.month}</td>
                      <td className="px-3 py-1.5 text-right">{fmtNum(row.payment, 0)}</td>
                      <td className="px-3 py-1.5 text-right">{fmtNum(row.principal, 0)}</td>
                      <td className="px-3 py-1.5 text-right text-red-600">{fmtNum(row.interest, 0)}</td>
                      <td className="px-3 py-1.5 text-right">{fmtNum(row.balance, 0)}</td>
                    </tr>
                  ))}
                  {!showFull && schedule.length > 12 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-center text-gray-400">
                        {schedule.length - 12} more months…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8 text-gray-400">
            <p className="text-sm">Own-funds financing — no loan schedule.</p>
          </div>
        )}
      </div>
    </div>
  )
}
