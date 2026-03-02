from pydantic import BaseModel
from typing import Optional, List


class ManualDerived(BaseModel):
    # Time (minutes unless noted)
    tdw: float
    ndw: float
    mwt: float
    nmwt: float
    awt: float
    awt_hours: float

    # Production
    dpv: float
    monthly_production: float
    annual_production: float

    # Rates
    defect_rate: float
    sick_leave_rate: float

    # Costs (annual, RSD)
    annual_labor_cost: float
    labor_cost_per_hour: float
    annual_downtime_cost: float
    annual_inventory_cost: float
    annual_defect_cost: float
    annual_injury_cost: float
    annual_training_cost: float
    annual_turnover_cost: float

    # Financial
    annual_revenue: float
    annual_costs: float
    net_profit: float

    # BEP
    fixed_costs: float
    variable_cost_per_unit: float
    bep_units: float

    # OEE
    availability: float
    performance: float
    quality: float
    oee: float


class LoanScheduleEntry(BaseModel):
    month: int
    payment: float
    principal: float
    interest: float
    balance: float


class RobotDerived(BaseModel):
    # Time
    awt_robot: float
    awt_robot_hours: float

    # Production
    dpv: float
    monthly_production: float
    annual_production: float

    # Rates
    defect_rate: float

    # Investment
    total_investment: float
    equity_invested: float
    engineering_cost: float
    training_cost: float

    # Costs (annual, RSD)
    annual_labor_cost: float
    annual_electricity_cost: float
    annual_maintenance_cost: float
    annual_gripper_cost: float
    annual_service_downtime_cost: float
    annual_defect_cost: float
    annual_inventory_cost: float
    annual_amortization: float
    annual_loan_interest: float
    annual_loan_payment: float
    annual_technician_cost: float

    # Financial
    annual_revenue: float
    annual_costs: float
    net_profit: float

    # BEP
    fixed_costs: float
    variable_cost_per_unit: float
    bep_units: float

    # OEE
    availability: float
    performance: float
    quality: float
    oee: float

    # Dashboard indicators
    installation_cost_per_hour: float
    training_cost_per_unit: float
    programming_cost_per_unit: float
    maintenance_cost_per_hour: float
    annual_employee_turnover_saved: float

    # Loan schedule
    loan_schedule: List[LoanScheduleEntry]


class ScenarioNPV(BaseModel):
    name: str
    npv: float
    iei: float
    payback_months: float
    annual_flows: List[float]  # cumulative NPV by year (0–5)


class FinancialKPIs(BaseModel):
    delta_net_profit: float
    roi: float
    payback_period_months: float
    annual_saved_hours: float
    npv_pessimistic: ScenarioNPV
    npv_realistic: ScenarioNPV
    npv_optimistic: ScenarioNPV


class CostComparisonRow(BaseModel):
    label: str
    manual: float
    robot: float
    diff_pct: float


class CalculationResult(BaseModel):
    manual: ManualDerived
    robot: RobotDerived
    financial: FinancialKPIs
    cost_comparison: List[CostComparisonRow]
    warnings: List[str]
