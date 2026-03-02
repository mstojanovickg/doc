import React from 'react'
import { useStore } from '@/store/useStore'
import { fmtRSD, fmtPct, fmtMonths, fmtNum } from '@/utils/formatting'

function KPIRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 leading-tight">{label}</span>
      <div className="text-right">
        <span className="text-xs font-semibold text-gray-800">{value}</span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export function KPISidebar() {
  const { result, isCalculating } = useStore()

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center text-gray-400">
          <div className="animate-spin text-2xl mb-2">⚙</div>
          <p className="text-sm">Calculating…</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p className="text-sm">KPIs will appear here as you fill in the form.</p>
      </div>
    )
  }

  const { manual, robot, financial } = result

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full text-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Live KPIs</p>

      <div>
        <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Financial</p>
        <KPIRow label="Δ Net Profit" value={fmtRSD(financial.delta_net_profit)} />
        <KPIRow label="ROI" value={fmtPct(financial.roi)} />
        <KPIRow label="Payback" value={fmtMonths(financial.payback_period_months)} />
        <KPIRow label="NPV (Realistic)" value={fmtRSD(financial.npv_realistic.npv)} />
        <KPIRow label="IEI (Realistic)" value={financial.npv_realistic.iei.toFixed(2)} />
      </div>

      <div>
        <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Production</p>
        <KPIRow label="Manual DPV" value={fmtNum(manual.dpv, 0) + ' pcs/day'} />
        <KPIRow label="Robot DPV" value={fmtNum(robot.dpv, 0) + ' pcs/day'} />
        <KPIRow label="Saved hours/yr" value={fmtNum(financial.annual_saved_hours, 0) + ' h'} />
      </div>

      <div>
        <p className="text-xs font-semibold text-green-700 uppercase mb-1">OEE</p>
        <KPIRow label="Manual OEE" value={fmtPct(manual.oee)} />
        <KPIRow label="Robot OEE" value={fmtPct(robot.oee)} />
        <KPIRow label="Manual Avail." value={fmtPct(manual.availability)} />
        <KPIRow label="Robot Avail." value={fmtPct(robot.availability)} />
      </div>

      <div>
        <p className="text-xs font-semibold text-red-700 uppercase mb-1">Safety & Quality</p>
        <KPIRow label="Manual defect rate" value={fmtPct(manual.defect_rate)} />
        <KPIRow label="Robot defect rate" value={fmtPct(robot.defect_rate)} />
        <KPIRow label="Sick leave rate" value={fmtPct(manual.sick_leave_rate)} />
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Investment</p>
        <KPIRow label="Total investment" value={fmtRSD(robot.total_investment)} />
        <KPIRow label="Equity invested" value={fmtRSD(robot.equity_invested)} />
        <KPIRow label="Annual amortization" value={fmtRSD(robot.annual_amortization)} />
      </div>
    </div>
  )
}
