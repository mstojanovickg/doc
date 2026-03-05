import { create } from 'zustand'
import type { CalculationInput, CalculationResult, SessionRecord } from '@/types'
import { runCalculation, listSessions, createSession, updateSession, deleteSession } from '@/api/client'

// ─── Default inputs ───────────────────────────────────────────────────────────

export const DEFAULT_INPUTS: CalculationInput = {
  // General
  product_price: 1350,
  production_cost_per_unit: 870,
  takt_time: 8 + 26 / 60,       // 8 min 26 sec
  pre_process_inventory: 1000,
  annual_sales_growth: 0.05,

  // Manual
  shifts: 2,
  shift_duration: 480,
  breaks: 2,
  break_duration: 40,
  workdays_month: 22,
  workers: 1,
  ct_manual: 8 + 26 / 60,       // 8 min 26 sec
  gross_salary: 100000,
  defects_month: 30,
  sick_days_year: 10,
  injuries_month: 0,
  breakdowns_month: 3,
  avg_repair_time: 60,
  nonconformities_month: 100,
  process_nonconformities_month: 1,
  job_changes_year: 5,
  training_hours_manual: 2,

  // Robot schedule
  robot_shifts: 2,
  robot_shift_duration: 480,
  robot_breaks: 0,
  robot_break_duration: 0,
  robot_workdays_month: 22,
  ct_robot: 8 + 26 / 60,        // 8 min 26 sec
  robot_operators: 2,
  robot_operator_salary: 100000,

  // Robot technical
  robot_price: 3292800,
  power_consumption: 3,
  gripper_price: 235200,
  gripper_replacements_year: 0,
  additional_equipment_cost: 1176000,
  maintenance_cost_monthly: 6500,
  robot_defects_month: 500,
  robot_service_frequency: 0,
  robot_service_duration: 0,

  // Energy
  electricity_price_kwh: 18,
  pre_process_inventory_robot: 1000,

  // Robot labor
  training_hours_robot: 10,         // 10 h = 600 min
  training_hourly_cost: 630,
  engineer_hours: 1000,             // 1 000 h = 60 000 min
  engineer_hourly_rate: 1250,
  technician_hours: 0,
  technician_hourly_rate: 0,
  injury_reduction_pct: 0.05,       // 5 %
  defect_share_at_position: 0.01,
  operator_time_fraction: 30 / 480, // 30 min supervision per 480 min shift

  // Financing
  financing_type: 'own_funds',
  loan_amount: 0,
  annual_interest_rate: 0.06,       // 6 %
  loan_term_months: 60,
  amortization_rate: 0.14,          // 14 % depreciation rate
  wacc: 0.10,

  scenario_pessimistic: { inflow_change: 0.02, outflow_change: 0.05, discount_rate_adj: 0.02 },
  scenario_realistic:   { inflow_change: 0.05, outflow_change: 0.03, discount_rate_adj: 0.0 },
  scenario_optimistic:  { inflow_change: 0.08, outflow_change: -0.02, discount_rate_adj: -0.02 },
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppState {
  // Wizard
  currentStep: number
  inputs: CalculationInput
  result: CalculationResult | null
  isCalculating: boolean
  calcError: string | null

  // View
  view: 'wizard' | 'dashboard'

  // Theme
  theme: 'light' | 'dark'
  toggleTheme: () => void

  // Sessions
  sessions: SessionRecord[]
  activeSessionId: string | null
  sessionsLoading: boolean

  // Actions
  setStep: (step: number) => void
  updateInputs: (patch: Partial<CalculationInput>) => void
  resetInputs: () => void
  calculate: (navigate?: boolean) => Promise<void>
  setView: (v: 'wizard' | 'dashboard') => void

  // Session actions
  loadSessions: () => Promise<void>
  saveSession: (name: string, description?: string) => Promise<void>
  loadSession: (s: SessionRecord) => void
  removeSession: (id: string) => Promise<void>
}

const storedTheme = (localStorage.getItem('theme') as 'light' | 'dark' | null) ?? 'light'

export const useStore = create<AppState>((set, get) => ({
  currentStep: 1,
  inputs: { ...DEFAULT_INPUTS },
  result: null,
  isCalculating: false,
  calcError: null,
  view: 'wizard',
  theme: storedTheme,
  sessions: [],
  activeSessionId: null,
  sessionsLoading: false,

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    // Apply immediately — don't wait for React's async useEffect
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme: next })
  },

  setStep: (step) => set({ currentStep: step }),

  updateInputs: (patch) =>
    set((s) => ({ inputs: { ...s.inputs, ...patch } })),

  resetInputs: () =>
    set({ inputs: { ...DEFAULT_INPUTS }, result: null, calcError: null, currentStep: 1, view: 'wizard' }),

  calculate: async (navigate = false) => {
    set({ isCalculating: true, calcError: null })
    try {
      const result = await runCalculation(get().inputs)
      set({ result, isCalculating: false, ...(navigate ? { view: 'dashboard' } : {}) })
      // Auto-save if there's an active session
      const { activeSessionId, inputs } = get()
      if (activeSessionId) {
        await updateSession(activeSessionId, {
          name: get().sessions.find((s) => s.id === activeSessionId)?.name ?? 'Session',
          inputs_json: JSON.stringify(inputs),
          results_json: JSON.stringify(result),
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Calculation failed'
      set({ calcError: msg, isCalculating: false })
    }
  },

  setView: (view) => set({ view }),

  loadSessions: async () => {
    set({ sessionsLoading: true })
    try {
      const sessions = await listSessions()
      set({ sessions, sessionsLoading: false })
    } catch {
      set({ sessionsLoading: false })
    }
  },

  saveSession: async (name, description) => {
    const { inputs, result, activeSessionId, sessions } = get()
    const payload = {
      name,
      description,
      inputs_json: JSON.stringify(inputs),
      results_json: result ? JSON.stringify(result) : undefined,
    }
    if (activeSessionId && sessions.find((s) => s.id === activeSessionId)) {
      const updated = await updateSession(activeSessionId, payload)
      set((s) => ({
        sessions: s.sessions.map((x) => (x.id === updated.id ? updated : x)),
      }))
    } else {
      const created = await createSession(payload)
      set((s) => ({ sessions: [created, ...s.sessions], activeSessionId: created.id }))
    }
  },

  loadSession: (s) => {
    const inputs = JSON.parse(s.inputs_json) as CalculationInput
    const result = s.results_json ? (JSON.parse(s.results_json) as CalculationResult) : null
    set({ inputs, result, activeSessionId: s.id, view: result ? 'dashboard' : 'wizard', currentStep: 1 })
  },

  removeSession: async (id) => {
    await deleteSession(id)
    set((s) => ({
      sessions: s.sessions.filter((x) => x.id !== id),
      activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
    }))
  },
}))
