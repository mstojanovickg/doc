import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { CalculationResult } from '@/types'
import { fmtPct, fmtRSD, fmtNum } from '@/utils/formatting'

export function SafetySection({ result }: { result: CalculationResult }) {
  const { manual, robot } = result

  const rateData = [
    { name: 'Defect Rate',    Manual: manual.defect_rate * 100,    Robot: robot.defect_rate * 100 },
    { name: 'Sick Leave Rate', Manual: manual.sick_leave_rate * 100, Robot: 0 },
  ]

  const safetyCards = [
    {
      label: 'Manual Defect Rate',
      value: fmtPct(manual.defect_rate),
      sub: `${fmtRSD(manual.annual_defect_cost)} / year`,
    },
    {
      label: 'Robot Defect Rate',
      value: fmtPct(robot.defect_rate),
      sub: `${fmtRSD(robot.annual_defect_cost)} / year`,
      positive: robot.defect_rate < manual.defect_rate,
    },
    {
      label: 'Sick Leave Rate',
      value: fmtPct(manual.sick_leave_rate),
      sub: 'Not applicable for robot',
    },
    {
      label: 'Annual Turnover Cost Saved',
      value: fmtRSD(robot.annual_employee_turnover_saved),
      sub: 'Via automation',
      positive: robot.annual_employee_turnover_saved > 0,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">Safety & Quality</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {safetyCards.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg border p-3 ${
              c.positive === true
                ? 'bg-green-50 border-green-200'
                : c.positive === false
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-lg font-bold text-gray-800 mt-0.5">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Rate Comparison</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={rateData} layout="vertical" barSize={22}>
            <XAxis type="number" tickFormatter={(v) => `${v.toFixed(2)}%`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v.toFixed(3)}%`} />
            <Legend />
            <Bar dataKey="Manual" fill="#94a3b8" />
            <Bar dataKey="Robot"  fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nonconformities */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-2">Nonconformities</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Safety nonconformities</p>
            <p className="font-semibold">{fmtNum(result.manual['nonconformities_month' as never] as unknown as number ?? 0, 0)} / month (manual)</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Annual injury cost (manual)</p>
            <p className="font-semibold">{fmtRSD(manual.annual_injury_cost)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
