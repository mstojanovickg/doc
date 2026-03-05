import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input, Select } from '@/components/common/FormField'

function Section({ title, description, children, cols = 2 }: {
  title: string
  description?: string
  children: React.ReactNode
  cols?: 2 | 3
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className={`grid grid-cols-1 ${cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {children}
      </div>
    </div>
  )
}

const scenarioColors: Record<string, string> = {
  pessimistic: 'border-l-2 border-red-500',
  realistic:   'border-l-2 border-brand-500',
  optimistic:  'border-l-2 border-emerald-500',
}

const scenarioDot: Record<string, string> = {
  pessimistic: 'bg-red-500',
  realistic:   'bg-brand-500',
  optimistic:  'bg-emerald-500',
}

const scenarioLabels: Record<string, string> = {
  pessimistic: 'Pessimistic',
  realistic:   'Realistic',
  optimistic:  'Optimistic',
}

export function Step5Financing() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  const isLoan = inputs.financing_type === 'bank_loan'

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Financing & Scenarios</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Investment financing and NPV sensitivity modifiers</p>
      </div>

      {/* Financing */}
      <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Financing Method</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Financing type">
            <Select
              value={inputs.financing_type}
              onChange={(e) => updateInputs({ financing_type: e.target.value as 'own_funds' | 'bank_loan' })}
              options={[
                { value: 'own_funds', label: 'Own funds' },
                { value: 'bank_loan', label: 'Bank loan' },
              ]}
            />
          </FormField>

          {isLoan && (
            <>
              <FormField label="Loan amount" unit="RSD">
                <Input type="number" min={0} value={inputs.loan_amount || ''} onChange={set('loan_amount')} placeholder="e.g. 3 000 000" />
              </FormField>
              <FormField label="Annual interest rate" unit="%">
                <Input
                  type="number" min={0} max={50} step={0.1}
                  value={+(inputs.annual_interest_rate * 100).toFixed(2) || ''}
                  onChange={(e) => updateInputs({ annual_interest_rate: (parseFloat(e.target.value) || 0) / 100 })}
                  placeholder="8"
                />
              </FormField>
              <FormField label="Loan term" unit="months">
                <Input
                  type="number" min={1} max={240}
                  value={inputs.loan_term_months}
                  onChange={(e) => updateInputs({ loan_term_months: parseInt(e.target.value) || 60 })}
                />
              </FormField>
            </>
          )}
        </div>
      </div>

      {/* Depreciation & Discount */}
      <Section title="Depreciation & Discount Rate">
        <FormField label="Amortization rate" unit="%" hint="Annual straight-line depreciation">
          <Input
            type="number" min={1} max={100} step={1}
            value={+(inputs.amortization_rate * 100).toFixed(0) || ''}
            onChange={(e) => updateInputs({ amortization_rate: (parseFloat(e.target.value) || 0) / 100 })}
            placeholder="20"
          />
        </FormField>

        <FormField label="Discount rate (WACC)" unit="%" hint="Used for NPV calculation">
          <Input
            type="number" min={0} max={50} step={0.1}
            value={+(inputs.wacc * 100).toFixed(1) || ''}
            onChange={(e) => updateInputs({ wacc: (parseFloat(e.target.value) || 0) / 100 })}
            placeholder="10"
          />
        </FormField>
      </Section>

      {/* Scenario Modifiers */}
      <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">NPV Scenario Modifiers</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Annual adjustments applied to robot cash flows in each scenario</p>
        </div>

        <div className="space-y-3">
          {(['pessimistic', 'realistic', 'optimistic'] as const).map((s) => {
            const key = `scenario_${s}` as 'scenario_pessimistic' | 'scenario_realistic' | 'scenario_optimistic'
            const mod = inputs[key]
            return (
              <div key={s} className={`pl-4 py-3 rounded-r-lg bg-gray-50 dark:bg-white/[0.03] ${scenarioColors[s]}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${scenarioDot[s]}`} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">{scenarioLabels[s]}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Inflow change" unit="%">
                    <Input
                      type="number" step={0.5}
                      value={+(mod.inflow_change * 100).toFixed(1)}
                      onChange={(e) => updateInputs({ [key]: { ...mod, inflow_change: (parseFloat(e.target.value) || 0) / 100 } })}
                    />
                  </FormField>
                  <FormField label="Outflow change" unit="%">
                    <Input
                      type="number" step={0.5}
                      value={+(mod.outflow_change * 100).toFixed(1)}
                      onChange={(e) => updateInputs({ [key]: { ...mod, outflow_change: (parseFloat(e.target.value) || 0) / 100 } })}
                    />
                  </FormField>
                  <FormField label="Discount adj." unit="%">
                    <Input
                      type="number" step={0.5}
                      value={+(mod.discount_rate_adj * 100).toFixed(1)}
                      onChange={(e) => updateInputs({ [key]: { ...mod, discount_rate_adj: (parseFloat(e.target.value) || 0) / 100 } })}
                    />
                  </FormField>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
