import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine,
} from 'recharts'
import type { CalculationResult } from '@/types'
import { fmtRSD, fmtNum } from '@/utils/formatting'

const M = 1_000_000
const fmt = (v: number) => `${(v / M).toFixed(1)}M`

export function FinancialSection({ result }: { result: CalculationResult }) {
  const { manual, robot, financial, cost_comparison } = result

  // ── Revenue vs Costs bar chart ──────────────────────────────────────────
  const revCostData = [
    {
      name: 'Annual Revenue',
      Manual: manual.annual_revenue,
      Robot: robot.annual_revenue,
    },
    {
      name: 'Annual Costs',
      Manual: manual.annual_costs,
      Robot: robot.annual_costs,
    },
    {
      name: 'Net Profit',
      Manual: manual.net_profit,
      Robot: robot.net_profit,
    },
  ]

  // ── NPV fan chart (cumulative by year, 3 scenarios) ─────────────────────
  const npvData = financial.npv_realistic.annual_flows.map((v, i) => ({
    year: `Y${i}`,
    Pessimistic: financial.npv_pessimistic.annual_flows[i] ?? 0,
    Realistic: v,
    Optimistic: financial.npv_optimistic.annual_flows[i] ?? 0,
  }))

  // ── BEP lines ────────────────────────────────────────────────────────────
  // Build BEP chart data: volume 0 → max_vol at 500-unit steps
  const maxVol = Math.max(manual.bep_units, robot.bep_units, manual.annual_production) * 1.3
  const step = Math.max(1, Math.round(maxVol / 20))
  const bepData = Array.from({ length: 21 }, (_, i) => {
    const q = i * step
    return {
      units: q,
      'Manual Revenue': q * manual.variable_cost_per_unit + manual.variable_cost_per_unit * q, // Placeholder — real revenue
      'Manual Total Cost': manual.fixed_costs + q * manual.variable_cost_per_unit,
      'Robot Revenue': q * result.manual.variable_cost_per_unit, // same price
      'Robot Total Cost': robot.fixed_costs + q * robot.variable_cost_per_unit,
    }
  }).map((d, i) => {
    const q = i * step
    return {
      ...d,
      'Manual Revenue': q * result.manual.variable_cost_per_unit + (result.manual.annual_revenue / result.manual.annual_production) * q - q * result.manual.variable_cost_per_unit,
      // Revenue = price × quantity
      units: q,
    }
  })

  // Simpler: revenue = product_price × q; costs = fixed + var_cost × q
  const price = robot.annual_revenue > 0 ? robot.annual_revenue / robot.annual_production : 0
  const bepChartData = Array.from({ length: 21 }, (_, i) => {
    const q = i * step
    return {
      units: q,
      'Revenue': q * price,
      'Manual Cost': manual.fixed_costs + q * manual.variable_cost_per_unit,
      'Robot Cost': robot.fixed_costs + q * robot.variable_cost_per_unit,
    }
  })

  // ── Waterfall: robot cost breakdown ────────────────────────────────────
  const waterfall = [
    { name: 'Labor',       value: robot.annual_labor_cost },
    { name: 'Electricity', value: robot.annual_electricity_cost },
    { name: 'Maintenance', value: robot.annual_maintenance_cost },
    { name: 'Amortiz.',    value: robot.annual_amortization },
    { name: 'Loan Int.',   value: robot.annual_loan_interest },
    { name: 'Defects',     value: robot.annual_defect_cost },
    { name: 'Inventory',   value: robot.annual_inventory_cost },
    { name: 'Material',    value: robot.annual_production * (manual.variable_cost_per_unit) },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-8">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">Financial Analysis</h2>

      {/* Revenue vs Costs */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Annual Revenue, Costs & Net Profit</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revCostData} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} />
            <Legend />
            <Bar dataKey="Manual" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Robot" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Robot cost waterfall */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Robot Cost Breakdown (Annual)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={waterfall}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* NPV fan chart */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">NPV Sensitivity (5-Year, 3 Scenarios)</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={npvData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} />
            <Legend />
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" />
            <Line dataKey="Pessimistic" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line dataKey="Realistic" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
            <Line dataKey="Optimistic" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        {/* Scenario summary */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[financial.npv_pessimistic, financial.npv_realistic, financial.npv_optimistic].map((s) => (
            <div key={s.name} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 font-medium">{s.name}</p>
              <p className={`text-sm font-bold mt-0.5 ${s.npv >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fmtRSD(s.npv)}
              </p>
              <p className="text-xs text-gray-400">IEI {s.iei.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BEP chart */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Break-Even Analysis</p>
        <p className="text-xs text-gray-500 mb-3">
          Manual BEP: {fmtNum(manual.bep_units, 0)} units &nbsp;|&nbsp;
          Robot BEP: {fmtNum(robot.bep_units, 0)} units
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={bepChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="units" tick={{ fontSize: 11 }} tickFormatter={(v) => fmtNum(v, 0)} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmtRSD(v)} />
            <Legend />
            <Line dataKey="Revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line dataKey="Manual Cost" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line dataKey="Robot Cost" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <ReferenceLine x={manual.bep_units} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'BEP-M', position: 'top', fontSize: 10 }} />
            <ReferenceLine x={robot.bep_units} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'BEP-R', position: 'top', fontSize: 10 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
