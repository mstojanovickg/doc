import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { CalculationResult } from '@/types'
import { fmtPct, fmtRSD, fmtNum } from '@/utils/formatting'

const CHART = { manual: '#94a3b8', robot: '#10b981', grid: 'rgba(156,163,175,0.2)', axis: '#9ca3af' }

const tooltipStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid rgba(75,85,99,0.5)',
  borderRadius: '8px',
  color: '#f9fafb',
  fontSize: '12px',
}

export function SafetySection({ result }: { result: CalculationResult }) {
  const { manual, robot } = result

  const rateData = [
    { name: 'Defect Rate',     Manual: manual.defect_rate * 100,    Robot: robot.defect_rate * 100 },
    { name: 'Sick Leave Rate', Manual: manual.sick_leave_rate * 100, Robot: 0 },
  ]

  const safetyCards = [
    {
      label: 'Manual Defect Rate',
      value: fmtPct(manual.defect_rate),
      sub: `${fmtRSD(manual.annual_defect_cost)} / year`,
      positive: null as boolean | null,
    },
    {
      label: 'Robot Defect Rate',
      value: fmtPct(robot.defect_rate),
      sub: `${fmtRSD(robot.annual_defect_cost)} / year`,
      positive: robot.defect_rate < manual.defect_rate as boolean | null,
    },
    {
      label: 'Sick Leave Rate',
      value: fmtPct(manual.sick_leave_rate),
      sub: 'Not applicable for robot',
      positive: null as boolean | null,
    },
    {
      label: 'Turnover Cost Saved',
      value: fmtRSD(robot.annual_employee_turnover_saved),
      sub: 'Via automation',
      positive: robot.annual_employee_turnover_saved > 0 as boolean | null,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="w-1 h-6 bg-red-500 rounded-full inline-block" />
        Safety & Quality
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {safetyCards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-4 ${
              c.positive === true
                ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800'
                : c.positive === false
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${
              c.positive === true ? 'text-brand-700 dark:text-brand-400'
              : c.positive === false ? 'text-red-700 dark:text-red-400'
              : 'text-gray-800 dark:text-gray-200'
            }`}>{c.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rate Comparison</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={rateData} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${v.toFixed(2)}%`} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => `${v.toFixed(3)}%`} contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="Manual" fill={CHART.manual} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Robot"  fill={CHART.robot}  radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-3">Nonconformities</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Safety nonconformities</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {fmtNum(result.manual['nonconformities_month' as never] as unknown as number ?? 0, 0)} / month (manual)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Annual injury cost (manual)</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{fmtRSD(manual.annual_injury_cost)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
