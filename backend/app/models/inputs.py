from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


class FinancingType(str, Enum):
    own_funds = "own_funds"
    bank_loan = "bank_loan"


class ScenarioModifiers(BaseModel):
    inflow_change: float = Field(default=0.0)
    outflow_change: float = Field(default=0.0)
    discount_rate_adj: float = Field(default=0.0)


class CalculationInput(BaseModel):
    # ── 3.1 General Information ──────────────────────────────────────────────
    product_price: float = Field(gt=0, description="Selling price per unit (RSD)")
    production_cost_per_unit: float = Field(gt=0, description="Variable production cost per unit (RSD)")
    takt_time: float = Field(gt=0, description="Takt time (minutes)")
    pre_process_inventory: float = Field(default=0.0, ge=0, description="Pre-process inventory (pcs)")
    annual_sales_growth: float = Field(default=0.05, ge=0, description="Expected annual sales growth (fraction, e.g. 0.05)")

    # ── 3.2 Manual Production ────────────────────────────────────────────────
    shifts: int = Field(default=1, ge=1)
    shift_duration: float = Field(default=480.0, gt=0, description="Shift duration (minutes)")
    breaks: int = Field(default=2, ge=0)
    break_duration: float = Field(default=20.0, ge=0, description="Break duration (minutes)")
    workdays_month: int = Field(default=22, ge=1)
    workers: int = Field(default=1, ge=1)
    ct_manual: float = Field(gt=0, description="Manual cycle time (minutes)")
    gross_salary: float = Field(gt=0, description="Monthly gross salary per worker (RSD)")
    defects_month: float = Field(default=0.0, ge=0)
    sick_days_year: float = Field(default=0.0, ge=0)
    injuries_month: float = Field(default=0.0, ge=0)
    breakdowns_month: float = Field(default=0.0, ge=0)
    avg_repair_time: float = Field(default=0.0, ge=0, description="Avg repair time (minutes)")
    nonconformities_month: float = Field(default=0.0, ge=0)
    process_nonconformities_month: float = Field(default=0.0, ge=0)
    job_changes_year: float = Field(default=0.0, ge=0)
    training_hours_manual: float = Field(default=0.0, ge=0, description="Training hours per worker (hours)")

    # ── 3.2.R Robotic Production Schedule ────────────────────────────────────
    robot_shifts: int = Field(default=1, ge=1, description="Number of robot shifts")
    robot_shift_duration: float = Field(default=480.0, gt=0, description="Robot shift duration (minutes)")
    robot_breaks: int = Field(default=0, ge=0, description="Breaks per robot shift (usually 0)")
    robot_break_duration: float = Field(default=0.0, ge=0, description="Break duration during robot shift (minutes)")
    robot_workdays_month: int = Field(default=22, ge=1, description="Robot working days per month")
    ct_robot: float = Field(default=1.0, gt=0, description="Robot cycle time (minutes)")
    robot_operators: int = Field(default=1, ge=1, description="Number of robot operators")
    robot_operator_salary: float = Field(default=0.0, ge=0, description="Robot operator monthly gross salary (RSD)")

    # ── 3.3.1 Robot Technical ────────────────────────────────────────────────
    robot_price: float = Field(gt=0, description="Robot purchase cost (RSD)")
    power_consumption: float = Field(gt=0, description="Power consumption (kW)")
    gripper_price: float = Field(default=0.0, ge=0)
    gripper_replacements_year: float = Field(default=0.0, ge=0)
    additional_equipment_cost: float = Field(default=0.0, ge=0)
    maintenance_cost_monthly: float = Field(default=0.0, ge=0)
    robot_defects_month: float = Field(default=0.0, ge=0)
    robot_service_frequency: float = Field(default=0.0, ge=0, description="Service sessions per month")
    robot_service_duration: float = Field(default=0.0, ge=0, description="Service session duration (minutes)")

    # ── 3.3.2 Energy & Material ──────────────────────────────────────────────
    electricity_price_kwh: float = Field(gt=0, description="Electricity price per kWh (RSD)")
    pre_process_inventory_robot: float = Field(default=0.0, ge=0)

    # ── 3.3.3 Labor & Personnel ──────────────────────────────────────────────
    training_hours_robot: float = Field(default=0.0, ge=0, description="Robot training hours (hours)")
    training_hourly_cost: float = Field(default=0.0, ge=0)
    engineer_hours: float = Field(default=0.0, ge=0, description="Engineering hours (hours)")
    engineer_hourly_rate: float = Field(default=0.0, ge=0)
    technician_hours: float = Field(default=0.0, ge=0, description="Robot technician hours (hours)")
    technician_hourly_rate: float = Field(default=0.0, ge=0)
    injury_reduction_pct: float = Field(default=0.05, ge=0, le=1, description="Injury reduction fraction (e.g. 0.05)")
    defect_share_at_position: float = Field(default=0.01, ge=0, le=1, description="% of defects at robot position (fraction)")
    operator_time_fraction: float = Field(default=1.0, ge=0, le=1, description="Operator supervision fraction OPT% (1.0 = full time)")

    # ── 3.4 Financing ────────────────────────────────────────────────────────
    financing_type: FinancingType = Field(default=FinancingType.own_funds)
    loan_amount: float = Field(default=0.0, ge=0)
    annual_interest_rate: float = Field(default=0.0, ge=0, description="Annual interest rate (fraction, e.g. 0.08)")
    loan_term_months: int = Field(default=60, ge=1)
    amortization_rate: float = Field(default=0.20, gt=0, le=1, description="Annual amortization rate (e.g. 0.20 for 20%)")
    wacc: float = Field(default=0.10, gt=0, description="Discount rate / WACC (fraction)")

    # ── Scenario modifiers ───────────────────────────────────────────────────
    scenario_pessimistic: ScenarioModifiers = Field(
        default=ScenarioModifiers(inflow_change=0.02, outflow_change=0.05, discount_rate_adj=0.02)
    )
    scenario_realistic: ScenarioModifiers = Field(
        default=ScenarioModifiers(inflow_change=0.05, outflow_change=0.03, discount_rate_adj=0.0)
    )
    scenario_optimistic: ScenarioModifiers = Field(
        default=ScenarioModifiers(inflow_change=0.08, outflow_change=-0.02, discount_rate_adj=-0.02)
    )

    @field_validator("ct_manual")
    @classmethod
    def ct_within_takt(cls, v, info):
        takt = info.data.get("takt_time")
        if takt and v > takt:
            pass  # warning only, not error
        return v
