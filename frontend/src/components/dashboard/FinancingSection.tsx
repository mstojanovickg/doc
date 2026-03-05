import React, { useState } from 'react'
import type { CalculationResult } from '@/types'
import { fmtRSD, fmtNum } from '@/utils/formatting'

export function FinancingSection({ result }: { result: CalculationResult }) {
  const { robot } = result
  const [showFull, setShowFull] = useState(false)

  const schedule = robot.loan_schedule
  const hasLoan = schedule.length > 0

  const investmentRows = [
    { label: 'Robot price',               value: robot.total_investment - robot.engineering_cost - robot.training_cost },
    { label: 'Engineering / integration', value: robot.engineering_cost },
    { label: 'Training',                  value: robot.training_cost },
  ]

  const residual = robot.total_investment * (1 - 0.20 * 5)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="w-1 h-6 bg-indigo-500 rounded-full inline-block" />
        Financing & Investment
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Investment Breakdown</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {investmentRows.map((r) => (
                <tr key={r.label} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-5 py-2.5 text-gray-600 dark:text-gray-400">{r.label}</td>
                  <td className="px-5 py-2.5 text-right font-medium text-gray-800 dark:text-gray-200">{fmtRSD(r.value)}</td>
                </tr>
              ))}
              <tr className="bg-brand-50 dark:bg-brand-900/20 border-b border-gray-100 dark:border-gray-800">
                <td className="px-5 py-2.5 font-semibold text-gray-900 dark:text-gray-100">Total Investment</td>
                <td className="px-5 py-2.5 text-right font-bold text-brand-700 dark:text-brand-400">{fmtRSD(robot.total_investment)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-5 py-2.5 text-gray-500 dark:text-gray-400">Financed by loan</td>
                <td className="px-5 py-2.5 text-right text-gray-600 dark:text-gray-400">{fmtRSD(robot.total_investment - robot.equity_invested)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-5 py-2.5 text-gray-500 dark:text-gray-400">Equity invested</td>
                <td className="px-5 py-2.5 text-right text-gray-600 dark:text-gray-400">{fmtRSD(robot.equity_invested)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-5 py-2.5 text-gray-500 dark:text-gray-400">Residual value (yr 5)</td>
                <td className="px-5 py-2.5 text-right text-brand-600 dark:text-brand-400 font-medium">{fmtRSD(Math.max(0, residual))}</td>
              </tr>
              <tr>
                <td className="px-5 py-2.5 text-gray-500 dark:text-gray-400">Annual amortization</td>
                <td className="px-5 py-2.5 text-right text-gray-700 dark:text-gray-300">{fmtRSD(robot.annual_amortization)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Loan schedule */}
        {hasLoan ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Loan Repayment Schedule</p>
              <button
                onClick={() => setShowFull(!showFull)}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                {showFull ? 'Show summary' : 'Show full schedule'}
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto text-xs scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 font-semibold">Month</th>
                    <th className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 font-semibold">Payment</th>
                    <th className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 font-semibold">Principal</th>
                    <th className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 font-semibold">Interest</th>
                    <th className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {(showFull ? schedule : schedule.slice(0, 12)).map((row) => (
                    <tr key={row.month} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-1.5 text-gray-700 dark:text-gray-300">{row.month}</td>
                      <td className="px-4 py-1.5 text-right text-gray-600 dark:text-gray-400">{fmtNum(row.payment, 0)}</td>
                      <td className="px-4 py-1.5 text-right text-gray-600 dark:text-gray-400">{fmtNum(row.principal, 0)}</td>
                      <td className="px-4 py-1.5 text-right text-red-600 dark:text-red-400">{fmtNum(row.interest, 0)}</td>
                      <td className="px-4 py-1.5 text-right text-gray-600 dark:text-gray-400">{fmtNum(row.balance, 0)}</td>
                    </tr>
                  ))}
                  {!showFull && schedule.length > 12 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-center text-gray-400 dark:text-gray-500">
                        {schedule.length - 12} more months…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Own-funds financing — no loan schedule.</p>
          </div>
        )}
      </div>
    </div>
  )
}
