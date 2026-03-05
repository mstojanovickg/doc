import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine,
} from 'recharts'
import type { CalculationResult } from '@/types'
import { fmtRSD, fmtNum } from '@/utils/formatting'

const M = 1_000_000
const fmt = (v: number) => `${(v / M).toFixed(1)}M`

// Shared chart colors (work in both light and dark)
const CHART = {
  manual: '#94a3b8',
  robot:  '#10b981',
  pessimistic: '#ef4444',
  realistic:   '#10b981',
  optimistic:  '#3b82f6',
  waterfall:   '#6366f1',
  revenue:     '#f59e0b',
  grid:        'rgba(156,163,175,0.2)',
  axis:        '#9ca3af',
}

export function FinancialSection({ result }: { result: CalculationResult }) {
  const { manual, robot, financial } = result

  const revCostData = [
    { name: 'Annual Revenue', Manual: manual.annual_revenue, Robot: robot.annual_revenue },
    { name: 'Annual Costs',   Manual: manual.annual_costs,   Robot: robot.annual_costs   },
    { name: 'Net Profit',     Manual: manual.net_profit,     Robot: robot.net_profit     },
  ]

  const npvData = financial.npv_realistic.annual_flows.map((v, i) => ({
    year: `Y${i}`,
    Pessimistic: financial.npv_pessimistic.annual_flows[i] ?? 0,
    Realistic:   v,
    Optimistic:  financial.npv_optimistic.annual_flows[i] ?? 0,
  }))

  const maxVol = Math.max(manual.bep_units, robot.bep_units, manual.annual_production) * 1.3
  const step = Math.max(1, Math.round(maxVol / 20))
  const price = robot.annual_revenue > 0 ? robot.annual_revenue / robot.annual_production : 0
  const bepChartData = Array.from({ length: 21 }, (_, i) => {
    const q = i * step
    return {
      units: q,
      'Revenue':     q * price,
      'Manual Cost': manual.fixed_costs + q * manual.variable_cost_per_unit,
      'Robot Cost':  robot.fixed_costs  + q * robot.variable_cost_per_unit,
    }
  })

  const waterfall = [
    { name: 'Labor',       value: robot.annual_labor_cost },
    { name: 'Electricity', value: robot.annual_electricity_cost },
    { name: 'Maintenance', value: robot.annual_maintenance_cost },
    { name: 'Amortiz.',    value: robot.annual_amortization },
    { name: 'Loan Int.',   value: robot.annual_loan_interest },
    { name: 'Defects',     value: robot.annual_defect_cost },
    { name: 'Inventory',   value: robot.annual_inventory_cost },
    { name: 'Material',    value: robot.annual_production * manual.variable_cost_per_unit },
  ].filter((d) => d.value > 0)

  const tooltipStyle = {
    backgroundColor: 'var(--tooltip-bg, #1f2937)',
    border: '1px solid rgba(75,85,99,0.5)',
    borderRadius: '8px',
    color: '#f9fafb',
    fontSize: '12px',
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="w-1 h-6 bg-brand-500 rounded-full inline-block" />
        Financial Analysis
      </h2>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Annual Revenue, Costs & Net Profit</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revCostData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="Manual" fill={CHART.manual} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Robot"  fill={CHART.robot}  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Robot Cost Breakdown (Annual)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={waterfall}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill={CHART.waterfall} radius={[4, 4, 0, 0]} name="Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">NPV Sensitivity (5-Year, 3 Scenarios)</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={npvData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} contentStyle={tooltipStyle} />
            <Legend />
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
            <Line dataKey="Pessimistic" stroke={CHART.pessimistic} strokeWidth={2} dot={false} />
            <Line dataKey="Realistic"   stroke={CHART.realistic}   strokeWidth={2.5} dot={false} />
            <Line dataKey="Optimistic"  stroke={CHART.optimistic}  strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[financial.npv_pessimistic, financial.npv_realistic, financial.npv_optimistic].map((s) => (
            <div key={s.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.name}</p>
              <p className={`text-sm font-bold mt-0.5 ${s.npv >= 0 ? 'text-brand-700 dark:text-brand-400' : 'text-red-700 dark:text-red-400'}`}>
                {fmtRSD(s.npv)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">IEI {s.iei.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Break-Even Analysis</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Manual BEP: {fmtNum(manual.bep_units, 0)} units &nbsp;·&nbsp;
          Robot BEP: {fmtNum(robot.bep_units, 0)} units
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={bepChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
            <XAxis dataKey="units" tick={{ fontSize: 11, fill: CHART.axis }} tickFormatter={(v) => fmtNum(v, 0)} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} contentStyle={tooltipStyle} />
            <Legend />
            <Line dataKey="Revenue"     stroke={CHART.revenue}  strokeWidth={2} dot={false} />
            <Line dataKey="Manual Cost" stroke={CHART.manual}   strokeWidth={2} dot={false} />
            <Line dataKey="Robot Cost"  stroke={CHART.robot}    strokeWidth={2} dot={false} />
            <ReferenceLine x={manual.bep_units} stroke={CHART.manual} strokeDasharray="4 4" label={{ value: 'BEP-M', position: 'top', fontSize: 10, fill: CHART.axis }} />
            <ReferenceLine x={robot.bep_units}  stroke={CHART.robot}  strokeDasharray="4 4" label={{ value: 'BEP-R', position: 'top', fontSize: 10, fill: CHART.axis }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
