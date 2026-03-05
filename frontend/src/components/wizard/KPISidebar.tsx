import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import { fmtRSD, fmtPct, fmtMonths, fmtNum } from '@/utils/formatting'

// ── Shared atoms ─────────────────────────────────────────────────────────────

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight pr-2">{label}</span>
      <div className="text-right flex-shrink-0">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{value}</span>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

function SectionLabel({ label, color = 'text-gray-500 dark:text-gray-400' }: { label: string; color?: string }) {
  return (
    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 mt-3 first:mt-0 ${color}`}>{label}</p>
  )
}

// ── Tab: Live KPI ─────────────────────────────────────────────────────────────

function LiveKPI() {
  const { result, isCalculating } = useStore()

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Calculating…</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-5 text-center text-gray-400 dark:text-gray-500">
        <p className="text-xs leading-relaxed">KPIs appear here as you fill in the form.</p>
      </div>
    )
  }

  const { manual, robot, financial } = result

  return (
    <div className="p-4 overflow-y-auto h-full scrollbar-thin">
      <SectionLabel label="Financial" color="text-brand-500 dark:text-brand-400" />
      <Row label="Δ Net Profit" value={fmtRSD(financial.delta_net_profit)} />
      <Row label="ROI" value={fmtPct(financial.roi)} />
      <Row label="Payback" value={fmtMonths(financial.payback_period_months)} />
      <Row label="NPV (Realistic)" value={fmtRSD(financial.npv_realistic.npv)} />
      <Row label="IEI" value={financial.npv_realistic.iei.toFixed(2)} />

      <SectionLabel label="Production" color="text-purple-500 dark:text-purple-400" />
      <Row label="Manual DPV" value={fmtNum(manual.dpv, 0) + ' pcs/day'} />
      <Row label="Robot DPV" value={fmtNum(robot.dpv, 0) + ' pcs/day'} />
      <Row label="Saved hours/yr" value={fmtNum(financial.annual_saved_hours, 0) + ' h'} />

      <SectionLabel label="OEE" color="text-brand-500 dark:text-brand-400" />
      <Row label="Manual OEE" value={fmtPct(manual.oee)} />
      <Row label="Robot OEE" value={fmtPct(robot.oee)} />
      <Row label="Manual Avail." value={fmtPct(manual.availability)} />
      <Row label="Robot Avail." value={fmtPct(robot.availability)} />

      <SectionLabel label="Safety & Quality" color="text-red-500 dark:text-red-400" />
      <Row label="Manual defect rate" value={fmtPct(manual.defect_rate)} />
      <Row label="Robot defect rate" value={fmtPct(robot.defect_rate)} />
      <Row label="Sick leave rate" value={fmtPct(manual.sick_leave_rate)} />

      <SectionLabel label="Investment" />
      <Row label="Total investment" value={fmtRSD(robot.total_investment)} />
      <Row label="Equity invested" value={fmtRSD(robot.equity_invested)} />
      <Row label="Annual amortization" value={fmtRSD(robot.annual_amortization)} />
    </div>
  )
}

// ── Tab: Engine Calculation ───────────────────────────────────────────────────

function EngineCalc() {
  const { result, isCalculating } = useStore()

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-5 text-center text-gray-400 dark:text-gray-500">
        <p className="text-xs leading-relaxed">Engine values appear here once inputs are filled.</p>
      </div>
    )
  }

  const { manual, robot } = result
  const min = (v: number) => `${fmtNum(v, 1)} min`
  const h = (v: number) => `${fmtNum(v, 0)} h`

  return (
    <div className="p-4 overflow-y-auto h-full scrollbar-thin">
      <SectionLabel label="Manual — Time" color="text-blue-500 dark:text-blue-400" />
      <Row label="Total daily time (TDW)" value={min(manual.tdw)} />
      <Row label="Net daily time (NDW)" value={min(manual.ndw)} />
      <Row label="Monthly working time" value={min(manual.mwt)} />
      <Row label="Net monthly time" value={min(manual.nmwt)} />
      <Row label="Annual working time" value={h(manual.awt_hours)} />

      <SectionLabel label="Manual — Production" color="text-blue-500 dark:text-blue-400" />
      <Row label="Daily prod. volume" value={fmtNum(manual.dpv, 1) + ' pcs/day'} />
      <Row label="Monthly production" value={fmtNum(manual.monthly_production, 0) + ' pcs'} />
      <Row label="Annual production" value={fmtNum(manual.annual_production, 0) + ' pcs'} />
      <Row label="Defect rate" value={fmtPct(manual.defect_rate)} />
      <Row label="Sick leave rate" value={fmtPct(manual.sick_leave_rate)} />

      <SectionLabel label="Manual — Costs" color="text-blue-500 dark:text-blue-400" />
      <Row label="Labor cost/year" value={fmtRSD(manual.annual_labor_cost)} />
      <Row label="Labor cost/hour" value={fmtRSD(manual.labor_cost_per_hour)} />
      <Row label="Downtime cost/year" value={fmtRSD(manual.annual_downtime_cost)} />
      <Row label="Defect cost/year" value={fmtRSD(manual.annual_defect_cost)} />
      <Row label="Inventory cost/year" value={fmtRSD(manual.annual_inventory_cost)} />
      <Row label="Turnover cost/year" value={fmtRSD(manual.annual_turnover_cost)} />

      <SectionLabel label="Robot — Time" color="text-brand-500 dark:text-brand-400" />
      <Row label="Annual working time" value={h(robot.awt_robot_hours)} />

      <SectionLabel label="Robot — Production" color="text-brand-500 dark:text-brand-400" />
      <Row label="Daily prod. volume" value={fmtNum(robot.dpv, 1) + ' pcs/day'} />
      <Row label="Monthly production" value={fmtNum(robot.monthly_production, 0) + ' pcs'} />
      <Row label="Annual production" value={fmtNum(robot.annual_production, 0) + ' pcs'} />
      <Row label="Defect rate" value={fmtPct(robot.defect_rate)} />

      <SectionLabel label="Robot — Investment" color="text-brand-500 dark:text-brand-400" />
      <Row label="Total investment (CAPEX)" value={fmtRSD(robot.total_investment)} />
      <Row label="Engineering cost" value={fmtRSD(robot.engineering_cost)} />
      <Row label="Training cost" value={fmtRSD(robot.training_cost)} />
      <Row label="Amortization/year" value={fmtRSD(robot.annual_amortization)} />

      <SectionLabel label="Robot — Annual Costs" color="text-brand-500 dark:text-brand-400" />
      <Row label="Labor cost" value={fmtRSD(robot.annual_labor_cost)} />
      <Row label="Electricity cost" value={fmtRSD(robot.annual_electricity_cost)} />
      <Row label="Maintenance cost" value={fmtRSD(robot.annual_maintenance_cost)} />
      <Row label="Gripper cost" value={fmtRSD(robot.annual_gripper_cost)} />
      <Row label="Technician cost" value={fmtRSD(robot.annual_technician_cost)} />
      <Row label="Defect cost" value={fmtRSD(robot.annual_defect_cost)} />
      <Row label="Service downtime cost" value={fmtRSD(robot.annual_service_downtime_cost)} />

      <SectionLabel label="Robot — Unit Costs" color="text-brand-500 dark:text-brand-400" />
      <Row label="Installation cost/h" value={fmtRSD(robot.installation_cost_per_hour)} />
      <Row label="Training cost/unit" value={fmtRSD(robot.training_cost_per_unit)} />
      <Row label="Programming cost/unit" value={fmtRSD(robot.programming_cost_per_unit)} />
      <Row label="Maintenance cost/h" value={fmtRSD(robot.maintenance_cost_per_hour)} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function KPISidebar() {
  const [tab, setTab] = useState<'kpi' | 'engine'>('kpi')

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
        <button
          onClick={() => setTab('kpi')}
          className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors
            ${tab === 'kpi'
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 -mb-px'
              : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
        >
          Live KPI
        </button>
        <button
          onClick={() => setTab('engine')}
          className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors
            ${tab === 'engine'
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 -mb-px'
              : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
        >
          Engine Calc
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'kpi' ? <LiveKPI /> : <EngineCalc />}
      </div>
    </div>
  )
}
