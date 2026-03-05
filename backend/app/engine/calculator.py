"""
Robot Implementation Decision Support Tool — Calculation Engine
All monetary values in RSD; all time values in minutes unless explicitly noted.
"""
from __future__ import annotations

import math
from typing import List

from app.models.inputs import CalculationInput, FinancingType, ScenarioModifiers
from app.models.outputs import (
    CalculationResult,
    CostComparisonRow,
    FinancialKPIs,
    LoanScheduleEntry,
    ManualDerived,
    RobotDerived,
    ScenarioNPV,
)

_SAFE_DIV_ZERO = 0.0


def _safe_div(num: float, den: float) -> float:
    return num / den if den != 0 else _SAFE_DIV_ZERO


def _pct_diff(robot: float, manual: float) -> float:
    """Returns (robot - manual) / |manual| * 100, or 0 if manual == 0."""
    if manual == 0:
        return 0.0
    return (robot - manual) / abs(manual) * 100.0


# ─────────────────────────────────────────────────────────────────────────────
# Manual production
# ─────────────────────────────────────────────────────────────────────────────

def _calc_manual(inp: CalculationInput) -> tuple[ManualDerived, list[str]]:
    warnings: list[str] = []

    # ── Time ──────────────────────────────────────────────────────────────────
    tdw = inp.shifts * inp.shift_duration                                # min/day
    ndw = tdw - inp.shifts * inp.breaks * inp.break_duration             # min/day (net)
    mwt = tdw * inp.workdays_month                                       # min/month
    nmwt = ndw * inp.workdays_month                                      # min/month (net)
    awt = mwt * 12                                                       # min/year
    awt_hours = awt / 60

    if inp.ct_manual > inp.takt_time:
        warnings.append(
            f"Manual cycle time ({inp.ct_manual:.2f} min) exceeds takt time ({inp.takt_time:.2f} min). "
            "Production cannot keep up with demand."
        )

    # ── Production ────────────────────────────────────────────────────────────
    dpv = _safe_div(ndw, inp.ct_manual)                                  # units/day
    monthly_production = dpv * inp.workdays_month
    annual_production = monthly_production * 12

    # ── Rates ─────────────────────────────────────────────────────────────────
    defect_rate = _safe_div(inp.defects_month, monthly_production)       # fraction
    sick_leave_rate = _safe_div(inp.sick_days_year, inp.workdays_month * 12)

    # ── Labor costs ───────────────────────────────────────────────────────────
    # Spec: Salary × 13 × Workers (incl. contributions)
    annual_labor_cost = inp.gross_salary * 13 * inp.workers
    labor_cost_per_hour = _safe_div(annual_labor_cost, awt_hours)

    # ── Training cost ─────────────────────────────────────────────────────────
    # One-time amortized annually: training_hours × salary_per_hour × workers
    salary_per_hour = _safe_div(inp.gross_salary, inp.shift_duration / 60 * inp.workdays_month)
    annual_training_cost = inp.training_hours_manual * salary_per_hour * inp.workers

    # ── Downtime cost ─────────────────────────────────────────────────────────
    # DTC_M = breakdowns × repair_time_hours × LCPH × 12
    annual_downtime_cost = (
        inp.breakdowns_month * (inp.avg_repair_time / 60) * labor_cost_per_hour * 12
    )

    # ── Inventory cost ────────────────────────────────────────────────────────
    # IC_M = Pre_inventory × Product_cost × 0.05 (annual holding cost at 5%)
    annual_inventory_cost = inp.pre_process_inventory * inp.production_cost_per_unit * 0.05

    # ── Defect cost ───────────────────────────────────────────────────────────
    annual_defect_cost = inp.defects_month * 12 * inp.production_cost_per_unit

    # ── Injury cost (estimated at 1 month salary per injury) ─────────────────
    annual_injury_cost = inp.injuries_month * 12 * inp.gross_salary * inp.workers

    # ── Employee turnover cost (6 months salary per job change) ──────────────
    annual_turnover_cost = inp.job_changes_year * inp.gross_salary * 6

    # ── Financial ─────────────────────────────────────────────────────────────
    annual_revenue = annual_production * inp.product_price
    annual_costs = (
        annual_labor_cost
        + annual_downtime_cost
        + annual_inventory_cost
        + annual_defect_cost
        + annual_injury_cost
        + annual_training_cost
        + annual_production * inp.production_cost_per_unit  # material costs
    )
    net_profit = annual_revenue - annual_costs

    # ── BEP ───────────────────────────────────────────────────────────────────
    # Fixed = labor + downtime + inventory (independent of volume)
    # Variable = material cost per unit
    fixed_costs = annual_labor_cost + annual_inventory_cost + annual_training_cost
    variable_cost_per_unit = inp.production_cost_per_unit
    margin_per_unit = inp.product_price - variable_cost_per_unit
    bep_units = _safe_div(fixed_costs, margin_per_unit)

    # ── OEE ───────────────────────────────────────────────────────────────────
    daily_breakdown_downtime = _safe_div(
        inp.breakdowns_month * inp.avg_repair_time, inp.workdays_month
    )
    availability = _safe_div(ndw - daily_breakdown_downtime, ndw)
    availability = max(0.0, min(1.0, availability))
    performance = 1.0  # workers operate at standard cycle time
    quality = max(0.0, 1.0 - defect_rate)
    oee = availability * performance * quality

    return (
        ManualDerived(
            tdw=tdw, ndw=ndw, mwt=mwt, nmwt=nmwt, awt=awt, awt_hours=awt_hours,
            dpv=dpv, monthly_production=monthly_production, annual_production=annual_production,
            defect_rate=defect_rate, sick_leave_rate=sick_leave_rate,
            annual_labor_cost=annual_labor_cost, labor_cost_per_hour=labor_cost_per_hour,
            annual_downtime_cost=annual_downtime_cost, annual_inventory_cost=annual_inventory_cost,
            annual_defect_cost=annual_defect_cost, annual_injury_cost=annual_injury_cost,
            annual_training_cost=annual_training_cost, annual_turnover_cost=annual_turnover_cost,
            annual_revenue=annual_revenue, annual_costs=annual_costs, net_profit=net_profit,
            fixed_costs=fixed_costs, variable_cost_per_unit=variable_cost_per_unit, bep_units=bep_units,
            availability=availability, performance=performance, quality=quality, oee=oee,
        ),
        warnings,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Loan schedule
# ─────────────────────────────────────────────────────────────────────────────

def _build_loan_schedule(
    principal: float, annual_rate: float, term_months: int
) -> tuple[list[LoanScheduleEntry], float, float]:
    """Returns (schedule, annual_payment, annual_interest_year1)."""
    if principal <= 0 or annual_rate <= 0:
        return [], 0.0, 0.0

    monthly_rate = annual_rate / 12
    monthly_payment = (
        principal * monthly_rate * (1 + monthly_rate) ** term_months
        / ((1 + monthly_rate) ** term_months - 1)
    )

    schedule: list[LoanScheduleEntry] = []
    balance = principal
    for m in range(1, term_months + 1):
        interest = balance * monthly_rate
        principal_payment = monthly_payment - interest
        balance = max(0.0, balance - principal_payment)
        schedule.append(
            LoanScheduleEntry(
                month=m,
                payment=round(monthly_payment, 2),
                principal=round(principal_payment, 2),
                interest=round(interest, 2),
                balance=round(balance, 2),
            )
        )

    annual_payment = monthly_payment * 12
    # Interest in year 1
    annual_interest_yr1 = sum(e.interest for e in schedule[:12])
    return schedule, annual_payment, annual_interest_yr1


# ─────────────────────────────────────────────────────────────────────────────
# Robot production
# ─────────────────────────────────────────────────────────────────────────────

def _calc_robot(inp: CalculationInput, manual: ManualDerived) -> tuple[RobotDerived, list[str]]:
    warnings: list[str] = []

    # ── Time (robot uses its own schedule) ────────────────────────────────────
    # Robot net daily working time accounts for optional break periods
    robot_tdw = inp.robot_shifts * inp.robot_shift_duration                         # min/day (gross)
    robot_ndw = robot_tdw - inp.robot_shifts * inp.robot_breaks * inp.robot_break_duration  # min/day (net)
    awt_robot = robot_ndw * inp.robot_workdays_month * 12                           # min/year
    awt_robot_hours = awt_robot / 60

    # ── Production ────────────────────────────────────────────────────────────
    dpv = _safe_div(robot_ndw, inp.ct_robot)                             # units/day
    monthly_production = dpv * inp.robot_workdays_month
    annual_production = monthly_production * 12

    # ── Defect rate ───────────────────────────────────────────────────────────
    # Robot defect rate = manual defect rate × (1 - defect_share_at_position × reduction)
    robot_defect_rate_direct = _safe_div(inp.robot_defects_month, monthly_production)
    defect_rate = max(0.0, manual.defect_rate * (1 - inp.defect_share_at_position * inp.injury_reduction_pct))
    if inp.robot_defects_month > 0:
        defect_rate = robot_defect_rate_direct

    # ── Investment ────────────────────────────────────────────────────────────
    engineering_cost = inp.engineer_hours * inp.engineer_hourly_rate
    training_cost = inp.training_hours_robot * inp.training_hourly_cost
    total_investment = (
        inp.robot_price
        + inp.gripper_price
        + inp.additional_equipment_cost
        + engineering_cost
        + training_cost
    )
    equity_invested = total_investment - inp.loan_amount

    # ── Loan ──────────────────────────────────────────────────────────────────
    loan_schedule, annual_loan_payment, annual_loan_interest = _build_loan_schedule(
        inp.loan_amount, inp.annual_interest_rate, inp.loan_term_months
    )
    if inp.financing_type == FinancingType.own_funds:
        annual_loan_payment = 0.0
        annual_loan_interest = 0.0
        loan_schedule = []

    # ── Amortization ─────────────────────────────────────────────────────────
    annual_amortization = total_investment * inp.amortization_rate

    # ── Labor (robot operators with their own salary) ─────────────────────────
    salary = inp.robot_operator_salary if inp.robot_operator_salary > 0 else inp.gross_salary
    annual_labor_cost = salary * 13 * inp.robot_operators * inp.operator_time_fraction

    # Technician cost (annual)
    annual_technician_cost = inp.technician_hours * inp.technician_hourly_rate

    # ── Electricity ───────────────────────────────────────────────────────────
    annual_electricity_cost = inp.power_consumption * awt_robot_hours * inp.electricity_price_kwh

    # ── Maintenance ───────────────────────────────────────────────────────────
    annual_maintenance_cost = inp.maintenance_cost_monthly * 12

    # ── Gripper replacements ──────────────────────────────────────────────────
    annual_gripper_cost = inp.gripper_replacements_year * inp.gripper_price

    # ── Service downtime cost ─────────────────────────────────────────────────
    monthly_service_downtime_min = inp.robot_service_frequency * inp.robot_service_duration
    annual_service_downtime_hours = monthly_service_downtime_min * 12 / 60
    lc_per_hour_robot = _safe_div(annual_labor_cost, awt_robot_hours)
    annual_service_downtime_cost = annual_service_downtime_hours * lc_per_hour_robot

    # ── Defect cost ───────────────────────────────────────────────────────────
    annual_defect_cost = inp.robot_defects_month * 12 * inp.production_cost_per_unit

    # ── Inventory cost ────────────────────────────────────────────────────────
    annual_inventory_cost = (
        inp.pre_process_inventory_robot * inp.production_cost_per_unit * 0.05
    )

    # ── Financial ─────────────────────────────────────────────────────────────
    annual_revenue = annual_production * inp.product_price
    annual_costs = (
        annual_labor_cost
        + annual_electricity_cost
        + annual_maintenance_cost
        + annual_gripper_cost
        + annual_service_downtime_cost
        + annual_defect_cost
        + annual_inventory_cost
        + annual_amortization
        + annual_loan_interest
        + annual_technician_cost
        + annual_production * inp.production_cost_per_unit
    )
    net_profit = annual_revenue - annual_costs

    # ── BEP ───────────────────────────────────────────────────────────────────
    fixed_costs = (
        annual_labor_cost
        + annual_maintenance_cost
        + annual_amortization
        + annual_loan_interest
        + annual_inventory_cost
        + annual_technician_cost
    )
    elec_per_unit = _safe_div(annual_electricity_cost, annual_production)
    variable_cost_per_unit = inp.production_cost_per_unit + elec_per_unit
    margin_per_unit = inp.product_price - variable_cost_per_unit
    bep_units = _safe_div(fixed_costs, margin_per_unit)

    # ── OEE ───────────────────────────────────────────────────────────────────
    daily_service_downtime = _safe_div(
        inp.robot_service_frequency * inp.robot_service_duration, inp.robot_workdays_month
    )
    availability = _safe_div(robot_ndw - daily_service_downtime, robot_tdw)
    availability = max(0.0, min(1.0, availability))
    performance = min(1.0, _safe_div(inp.takt_time, inp.ct_robot))
    quality = max(0.0, 1.0 - defect_rate)
    oee = availability * performance * quality

    # ── Dashboard indicators ──────────────────────────────────────────────────
    installation_cost_per_hour = _safe_div(
        inp.robot_price + inp.additional_equipment_cost, awt_robot_hours
    )
    training_cost_per_unit = _safe_div(training_cost, annual_production)
    programming_cost_per_unit = _safe_div(engineering_cost, annual_production)
    maintenance_cost_per_hour = _safe_div(annual_maintenance_cost, awt_robot_hours)
    annual_employee_turnover_saved = manual.annual_turnover_cost

    return (
        RobotDerived(
            awt_robot=awt_robot, awt_robot_hours=awt_robot_hours,
            dpv=dpv, monthly_production=monthly_production, annual_production=annual_production,
            defect_rate=defect_rate,
            total_investment=total_investment, equity_invested=equity_invested,
            engineering_cost=engineering_cost, training_cost=training_cost,
            annual_labor_cost=annual_labor_cost, annual_electricity_cost=annual_electricity_cost,
            annual_maintenance_cost=annual_maintenance_cost, annual_gripper_cost=annual_gripper_cost,
            annual_service_downtime_cost=annual_service_downtime_cost,
            annual_defect_cost=annual_defect_cost, annual_inventory_cost=annual_inventory_cost,
            annual_amortization=annual_amortization,
            annual_loan_interest=annual_loan_interest, annual_loan_payment=annual_loan_payment,
            annual_technician_cost=annual_technician_cost,
            annual_revenue=annual_revenue, annual_costs=annual_costs, net_profit=net_profit,
            fixed_costs=fixed_costs, variable_cost_per_unit=variable_cost_per_unit, bep_units=bep_units,
            availability=availability, performance=performance, quality=quality, oee=oee,
            installation_cost_per_hour=installation_cost_per_hour,
            training_cost_per_unit=training_cost_per_unit,
            programming_cost_per_unit=programming_cost_per_unit,
            maintenance_cost_per_hour=maintenance_cost_per_hour,
            annual_employee_turnover_saved=annual_employee_turnover_saved,
            loan_schedule=loan_schedule,
        ),
        warnings,
    )


# ─────────────────────────────────────────────────────────────────────────────
# NPV / scenario engine
# ─────────────────────────────────────────────────────────────────────────────

def _calc_scenario_npv(
    inp: CalculationInput,
    manual: ManualDerived,
    robot: RobotDerived,
    mods: ScenarioModifiers,
    scenario_name: str,
    years: int = 5,
) -> ScenarioNPV:
    equity = robot.equity_invested
    base_revenue_r = robot.annual_revenue
    base_costs_r = robot.annual_costs - robot.annual_amortization   # cash costs (add amort back later)
    base_revenue_m = manual.annual_revenue
    base_costs_m = manual.annual_costs

    effective_wacc = inp.wacc + mods.discount_rate_adj
    if effective_wacc <= 0:
        effective_wacc = 0.001

    npv = -equity
    cumulative_flows: list[float] = [round(-equity, 2)]

    for t in range(1, years + 1):
        # Revenue grows at (annual_sales_growth + inflow_adj) per year
        rev_growth = (1 + inp.annual_sales_growth + mods.inflow_change) ** t
        cost_growth = (1 + mods.outflow_change) ** t

        adjusted_rev_r = base_revenue_r * rev_growth
        adjusted_costs_r = base_costs_r * cost_growth + robot.annual_amortization  # add back fixed amort
        adjusted_rev_m = base_revenue_m * rev_growth
        adjusted_costs_m = base_costs_m * cost_growth

        ncf_t = (adjusted_rev_r - adjusted_costs_r) - (adjusted_rev_m - adjusted_costs_m)
        # Add back amortization (non-cash) for cash flow basis; subtract loan principal
        ncf_t_cash = ncf_t + robot.annual_amortization - (robot.annual_loan_payment - robot.annual_loan_interest)

        discounted = ncf_t_cash / (1 + effective_wacc) ** t
        npv += discounted
        cumulative_flows.append(round(npv, 2))

    iei = _safe_div(npv, robot.total_investment)

    # Payback in months: equity / monthly_ncf_cash (first year)
    rev_growth_1 = (1 + inp.annual_sales_growth + mods.inflow_change)
    cost_growth_1 = (1 + mods.outflow_change)
    ncf_yr1_cash = (
        (base_revenue_r * rev_growth_1 - (base_costs_r * cost_growth_1 + robot.annual_amortization))
        - (base_revenue_m * rev_growth_1 - base_costs_m * cost_growth_1)
        + robot.annual_amortization
        - (robot.annual_loan_payment - robot.annual_loan_interest)
    )
    payback_months = _safe_div(equity, ncf_yr1_cash / 12)
    payback_months = max(0.0, payback_months)

    return ScenarioNPV(
        name=scenario_name,
        npv=round(npv, 2),
        iei=round(iei, 4),
        payback_months=round(payback_months, 1),
        annual_flows=cumulative_flows,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────────────────────

def calculate(inp: CalculationInput) -> CalculationResult:
    all_warnings: list[str] = []

    manual, w1 = _calc_manual(inp)
    all_warnings.extend(w1)

    robot, w2 = _calc_robot(inp, manual)
    all_warnings.extend(w2)

    # ── Financial KPIs ────────────────────────────────────────────────────────
    delta_np = robot.net_profit - manual.net_profit
    roi = _safe_div(delta_np, robot.total_investment)
    payback_months = _safe_div(robot.total_investment, delta_np / 12) if delta_np > 0 else 0.0

    # Saved working hours: manual human AWT vs robot operator AWT (reduced by OPT%)
    robot_human_awt_hours = (inp.robot_operators * inp.robot_shifts * inp.robot_workdays_month * 12
                              * inp.robot_shift_duration / 60) * inp.operator_time_fraction
    annual_saved_hours = max(0.0, manual.awt_hours - robot_human_awt_hours)

    npv_pess = _calc_scenario_npv(inp, manual, robot, inp.scenario_pessimistic, "Pessimistic")
    npv_real = _calc_scenario_npv(inp, manual, robot, inp.scenario_realistic, "Realistic")
    npv_opt = _calc_scenario_npv(inp, manual, robot, inp.scenario_optimistic, "Optimistic")

    financial = FinancialKPIs(
        delta_net_profit=round(delta_np, 2),
        roi=round(roi, 4),
        payback_period_months=round(payback_months, 1),
        annual_saved_hours=round(annual_saved_hours, 1),
        npv_pessimistic=npv_pess,
        npv_realistic=npv_real,
        npv_optimistic=npv_opt,
    )

    # ── Cost comparison table ─────────────────────────────────────────────────
    cost_rows: list[CostComparisonRow] = [
        CostComparisonRow(
            label="Annual Labor Cost",
            manual=manual.annual_labor_cost,
            robot=robot.annual_labor_cost,
            diff_pct=_pct_diff(robot.annual_labor_cost, manual.annual_labor_cost),
        ),
        CostComparisonRow(
            label="Electricity Cost",
            manual=0.0,
            robot=robot.annual_electricity_cost,
            diff_pct=_pct_diff(robot.annual_electricity_cost, 0.0),
        ),
        CostComparisonRow(
            label="Maintenance Cost",
            manual=0.0,
            robot=robot.annual_maintenance_cost,
            diff_pct=_pct_diff(robot.annual_maintenance_cost, 0.0),
        ),
        CostComparisonRow(
            label="Amortization",
            manual=0.0,
            robot=robot.annual_amortization,
            diff_pct=_pct_diff(robot.annual_amortization, 0.0),
        ),
        CostComparisonRow(
            label="Loan Interest",
            manual=0.0,
            robot=robot.annual_loan_interest,
            diff_pct=_pct_diff(robot.annual_loan_interest, 0.0),
        ),
        CostComparisonRow(
            label="Downtime Cost",
            manual=manual.annual_downtime_cost,
            robot=robot.annual_service_downtime_cost,
            diff_pct=_pct_diff(robot.annual_service_downtime_cost, manual.annual_downtime_cost),
        ),
        CostComparisonRow(
            label="Defect Cost",
            manual=manual.annual_defect_cost,
            robot=robot.annual_defect_cost,
            diff_pct=_pct_diff(robot.annual_defect_cost, manual.annual_defect_cost),
        ),
        CostComparisonRow(
            label="Inventory Cost",
            manual=manual.annual_inventory_cost,
            robot=robot.annual_inventory_cost,
            diff_pct=_pct_diff(robot.annual_inventory_cost, manual.annual_inventory_cost),
        ),
        CostComparisonRow(
            label="Material Cost",
            manual=manual.annual_production * inp.production_cost_per_unit,
            robot=robot.annual_production * inp.production_cost_per_unit,
            diff_pct=_pct_diff(
                robot.annual_production * inp.production_cost_per_unit,
                manual.annual_production * inp.production_cost_per_unit,
            ),
        ),
        CostComparisonRow(
            label="Total Annual Costs",
            manual=manual.annual_costs,
            robot=robot.annual_costs,
            diff_pct=_pct_diff(robot.annual_costs, manual.annual_costs),
        ),
    ]

    return CalculationResult(
        manual=manual,
        robot=robot,
        financial=financial,
        cost_comparison=cost_rows,
        warnings=all_warnings,
    )
