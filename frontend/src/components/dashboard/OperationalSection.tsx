import React from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import type { CalculationResult } from '@/types'
import { fmtPct, fmtNum, fmtRSD } from '@/utils/formatting'

const CHART = { manual: '#94a3b8', robot: '#10b981', grid: 'rgba(156,163,175,0.2)', axis: '#9ca3af' }

const tooltipStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid rgba(75,85,99,0.5)',
  borderRadius: '8px',
  color: '#f9fafb',
  fontSize: '12px',
}

export function OperationalSection({ result }: { result: CalculationResult }) {
  const { manual, robot, financial } = result

  const oeeData = [
    { subject: 'Availability', Manual: manual.availability * 100, Robot: robot.availability * 100 },
    { subject: 'Performance',  Manual: manual.performance * 100,  Robot: robot.performance * 100  },
    { subject: 'Quality',      Manual: manual.quality * 100,      Robot: robot.quality * 100      },
    { subject: 'OEE',          Manual: manual.oee * 100,          Robot: robot.oee * 100          },
  ]

  const prodData = [
    { name: 'Daily Prod.',   Manual: manual.dpv,                Robot: robot.dpv                },
    { name: 'Monthly Prod.', Manual: manual.monthly_production, Robot: robot.monthly_production },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
        Operational Analysis
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OEE Radar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">OEE — Manual vs Robot</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={oeeData}>
              <PolarGrid stroke={CHART.grid} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: CHART.axis }} />
              <Radar name="Manual" dataKey="Manual" stroke={CHART.manual} fill={CHART.manual} fillOpacity={0.25} />
              <Radar name="Robot"  dataKey="Robot"  stroke={CHART.robot}  fill={CHART.robot}  fillOpacity={0.25} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {(['availability', 'performance', 'quality', 'oee'] as const).map((k) => (
              <div key={k} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{k}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {fmtPct(manual[k])} → <span className="text-brand-600 dark:text-brand-400">{fmtPct(robot[k])}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Production volume */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Production Volume</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={prodData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => fmtNum(v, 0)} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => fmtNum(v, 0) + ' pcs'} contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="Manual" fill={CHART.manual} radius={[0, 4, 4, 0]} />
                <Bar dataKey="Robot"  fill={CHART.robot}  radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Saved hours card */}
          <div className="bg-brand-600 dark:bg-brand-800 rounded-xl p-5 text-center">
            <p className="text-xs text-brand-100 font-semibold uppercase tracking-wider mb-1">Annual Saved Working Hours</p>
            <p className="text-4xl font-extrabold text-white leading-tight">
              {fmtNum(financial.annual_saved_hours, 0)} h
            </p>
            <p className="text-xs text-brand-200 mt-1">
              ≈ {fmtNum(financial.annual_saved_hours / 8, 0)} working days freed
            </p>
          </div>

          {/* Cost indicators */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Robot Cost Indicators</p>
            {[
              { label: 'Install. cost / robot hour',      value: fmtRSD(robot.installation_cost_per_hour) + '/h' },
              { label: 'Training cost / unit produced',   value: fmtRSD(robot.training_cost_per_unit, 2)  + '/unit' },
              { label: 'Programming cost / unit',         value: fmtRSD(robot.programming_cost_per_unit, 2) + '/unit' },
              { label: 'Maintenance cost / robot hour',   value: fmtRSD(robot.maintenance_cost_per_hour) + '/h' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
