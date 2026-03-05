import React from 'react'
import type { CalculationResult } from '@/types'
import { fmtRSD, fmtPct, fmtMonths } from '@/utils/formatting'

interface KPICardProps {
  label: string
  value: string
  sub?: string
  positive?: boolean | null  // null = neutral
}

function KPICard({ label, value, sub, positive }: KPICardProps) {
  const border =
    positive === null ? 'border-blue-300 dark:border-blue-700'
    : positive ? 'border-brand-300 dark:border-brand-700'
    : 'border-red-300 dark:border-red-800'

  const bg =
    positive === null ? 'bg-blue-50 dark:bg-blue-950/30'
    : positive ? 'bg-brand-50 dark:bg-brand-950/20'
    : 'bg-red-50 dark:bg-red-950/20'

  const textColor =
    positive === null ? 'text-blue-800 dark:text-blue-300'
    : positive ? 'text-brand-800 dark:text-brand-300'
    : 'text-red-800 dark:text-red-400'

  const arrow = positive === null ? '' : positive ? ' ↑' : ' ↓'

  return (
    <div className={`rounded-xl border-2 p-5 ${border} ${bg}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-extrabold ${textColor} leading-tight`}>
        {value}
        <span className="text-xl">{arrow}</span>
      </p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{sub}</p>}
    </div>
  )
}

export function HeroStrip({ result }: { result: CalculationResult }) {
  const { financial } = result
  const { delta_net_profit, roi, payback_period_months, npv_realistic } = financial

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Δ Net Profit / year"
        value={fmtRSD(delta_net_profit)}
        positive={delta_net_profit > 0 ? true : delta_net_profit < 0 ? false : null}
      />
      <KPICard
        label="ROI"
        value={fmtPct(roi)}
        sub="Return on investment"
        positive={roi > 0.15 ? true : roi > 0 ? null : false}
      />
      <KPICard
        label="Payback Period"
        value={fmtMonths(payback_period_months)}
        sub="Time to recover investment"
        positive={payback_period_months > 0 && payback_period_months < 36 ? true : payback_period_months < 60 ? null : false}
      />
      <KPICard
        label="NPV — Realistic"
        value={fmtRSD(npv_realistic.npv)}
        sub="5-year net present value"
        positive={npv_realistic.npv > 0 ? true : false}
      />
    </div>
  )
}
