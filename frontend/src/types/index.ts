// ─── Input types ─────────────────────────────────────────────────────────────

export type FinancingType = 'own_funds' | 'bank_loan'

export interface ScenarioModifiers {
  inflow_change: number
  outflow_change: number
  discount_rate_adj: number
}

export interface CalculationInput {
  // 3.1 General
  product_price: number
  production_cost_per_unit: number
  takt_time: number           // minutes
  pre_process_inventory: number
  annual_sales_growth: number

  // 3.2 Manual Production
  shifts: number
  shift_duration: number      // minutes
  breaks: number
  break_duration: number      // minutes
  workdays_month: number
  workers: number
  ct_manual: number           // minutes
  gross_salary: number
  defects_month: number
  sick_days_year: number
  injuries_month: number
  breakdowns_month: number
  avg_repair_time: number     // minutes
  nonconformities_month: number
  process_nonconformities_month: number
  job_changes_year: number
  training_hours_manual: number  // hours

  // 3.3.1 Robot Technical
  robot_price: number
  power_consumption: number
  gripper_price: number
  gripper_replacements_year: number
  additional_equipment_cost: number
  maintenance_cost_monthly: number
  robot_defects_month: number
  robot_service_frequency: number
  robot_service_duration: number  // minutes

  // 3.3.2 Energy & Material
  electricity_price_kwh: number
  pre_process_inventory_robot: number

  // 3.3.3 Labor & Personnel
  training_hours_robot: number    // hours
  training_hourly_cost: number
  engineer_hours: number          // hours
  engineer_hourly_rate: number
  technician_hours: number        // hours
  technician_hourly_rate: number
  injury_reduction_pct: number    // fraction
  defect_share_at_position: number // fraction
  operator_time_fraction: number  // OPT% fraction

  // 3.4 Financing
  financing_type: FinancingType
  loan_amount: number
  annual_interest_rate: number
  loan_term_months: number
  amortization_rate: number
  wacc: number

  scenario_pessimistic: ScenarioModifiers
  scenario_realistic: ScenarioModifiers
  scenario_optimistic: ScenarioModifiers
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface ManualDerived {
  tdw: number; ndw: number; mwt: number; nmwt: number; awt: number; awt_hours: number
  dpv: number; monthly_production: number; annual_production: number
  defect_rate: number; sick_leave_rate: number
  annual_labor_cost: number; labor_cost_per_hour: number
  annual_downtime_cost: number; annual_inventory_cost: number
  annual_defect_cost: number; annual_injury_cost: number
  annual_training_cost: number; annual_turnover_cost: number
  annual_revenue: number; annual_costs: number; net_profit: number
  fixed_costs: number; variable_cost_per_unit: number; bep_units: number
  availability: number; performance: number; quality: number; oee: number
}

export interface LoanScheduleEntry {
  month: number; payment: number; principal: number; interest: number; balance: number
}

export interface RobotDerived {
  awt_robot: number; awt_robot_hours: number
  dpv: number; monthly_production: number; annual_production: number
  defect_rate: number
  total_investment: number; equity_invested: number
  engineering_cost: number; training_cost: number
  annual_labor_cost: number; annual_electricity_cost: number
  annual_maintenance_cost: number; annual_gripper_cost: number
  annual_service_downtime_cost: number; annual_defect_cost: number
  annual_inventory_cost: number; annual_amortization: number
  annual_loan_interest: number; annual_loan_payment: number
  annual_technician_cost: number
  annual_revenue: number; annual_costs: number; net_profit: number
  fixed_costs: number; variable_cost_per_unit: number; bep_units: number
  availability: number; performance: number; quality: number; oee: number
  installation_cost_per_hour: number; training_cost_per_unit: number
  programming_cost_per_unit: number; maintenance_cost_per_hour: number
  annual_employee_turnover_saved: number
  loan_schedule: LoanScheduleEntry[]
}

export interface ScenarioNPV {
  name: string; npv: number; iei: number; payback_months: number; annual_flows: number[]
}

export interface FinancialKPIs {
  delta_net_profit: number; roi: number; payback_period_months: number
  annual_saved_hours: number
  npv_pessimistic: ScenarioNPV; npv_realistic: ScenarioNPV; npv_optimistic: ScenarioNPV
}

export interface CostComparisonRow {
  label: string; manual: number; robot: number; diff_pct: number
}

export interface CalculationResult {
  manual: ManualDerived
  robot: RobotDerived
  financial: FinancialKPIs
  cost_comparison: CostComparisonRow[]
  warnings: string[]
}

// ─── Session types ────────────────────────────────────────────────────────────

export interface SessionRecord {
  id: string
  name: string
  description: string | null
  inputs_json: string
  results_json: string | null
  created_at: string
  updated_at: string
}
