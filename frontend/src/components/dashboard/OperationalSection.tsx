import React from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import type { CalculationResult } from '@/types'
import { fmtPct, fmtNum, fmtRSD } from '@/utils/formatting'

export function OperationalSection({ result }: { result: CalculationResult }) {
  const { manual, robot, financial } = result

  const oeeData = [
    { subject: 'Availability', Manual: manual.availability * 100, Robot: robot.availability * 100 },
    { subject: 'Performance',  Manual: manual.performance * 100,  Robot: robot.performance * 100 },
    { subject: 'Quality',      Manual: manual.quality * 100,      Robot: robot.quality * 100 },
    { subject: 'OEE',          Manual: manual.oee * 100,          Robot: robot.oee * 100 },
  ]

  const prodData = [
    { name: 'Daily Prod. Volume', Manual: manual.dpv, Robot: robot.dpv },
    { name: 'Monthly Production', Manual: manual.monthly_production, Robot: robot.monthly_production },
  ]

  return (
    <div className="space-y-8">
      <h2 className="text-base font-bold text-gray-800 border-b pb-2">Operational Analysis</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* OEE Radar */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">OEE — Manual vs Robot</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={oeeData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar name="Manual" dataKey="Manual" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
              <Radar name="Robot"  dataKey="Robot"  stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2 text-center">
            {(['availability', 'performance', 'quality', 'oee'] as const).map((k) => (
              <div key={k} className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500 capitalize">{k}</p>
                <p className="text-sm font-semibold text-gray-700">
                  {fmtPct(manual[k])} → {fmtPct(robot[k])}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Production volume */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Production Volume Comparison</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={prodData} layout="vertical" barSize={24}>
              <XAxis type="number" tickFormatter={(v) => fmtNum(v, 0)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => fmtNum(v, 0) + ' pcs'} />
              <Legend />
              <Bar dataKey="Manual" fill="#94a3b8" />
              <Bar dataKey="Robot" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>

          {/* Saved hours card */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Annual Saved Working Hours</p>
            <p className="text-3xl font-bold text-blue-800">
              {fmtNum(financial.annual_saved_hours, 0)} h
            </p>
            <p className="text-xs text-blue-500 mt-1">
              ≈ {fmtNum(financial.annual_saved_hours / 8, 0)} working days freed
            </p>
          </div>

          {/* Dashboard indicators */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Robot Cost Indicators</p>
            {[
              { label: 'Install. cost / robot hour', value: fmtRSD(robot.installation_cost_per_hour) + '/h' },
              { label: 'Training cost / unit produced', value: fmtRSD(robot.training_cost_per_unit, 2) + '/unit' },
              { label: 'Programming cost / unit', value: fmtRSD(robot.programming_cost_per_unit, 2) + '/unit' },
              { label: 'Maintenance cost / robot hour', value: fmtRSD(robot.maintenance_cost_per_hour) + '/h' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
