import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input, Select } from '@/components/common/FormField'

export function Step5Financing() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  const isLoan = inputs.financing_type === 'bank_loan'

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-800">Step 5 — Financing & Scenarios</h2>

      {/* ── Financing ───────────────────────────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Financing Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <Input type="number" min={0} value={inputs.loan_amount || ''} onChange={set('loan_amount')} placeholder="e.g. 3000000" />
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
        </div>
      </section>

      {/* ── Scenario modifiers ──────────────────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">Scenario Modifiers (NPV Sensitivity)</h3>
        <p className="text-xs text-gray-500 mb-4">
          Annual adjustments applied to robot inflows / outflows in each scenario.
        </p>

        {(['pessimistic', 'realistic', 'optimistic'] as const).map((s) => {
          const key = `scenario_${s}` as 'scenario_pessimistic' | 'scenario_realistic' | 'scenario_optimistic'
          const mod = inputs[key]
          const colors: Record<string, string> = {
            pessimistic: 'border-l-4 border-red-400',
            realistic: 'border-l-4 border-blue-400',
            optimistic: 'border-l-4 border-green-400',
          }
          return (
            <div key={s} className={`pl-4 py-3 mb-3 bg-gray-50 rounded-r-md ${colors[s]}`}>
              <p className="text-sm font-semibold capitalize text-gray-700 mb-3">{s}</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Inflow change" unit="%">
                  <Input
                    type="number" step={0.5}
                    value={+(mod.inflow_change * 100).toFixed(1)}
                    onChange={(e) =>
                      updateInputs({ [key]: { ...mod, inflow_change: (parseFloat(e.target.value) || 0) / 100 } })
                    }
                  />
                </FormField>
                <FormField label="Outflow change" unit="%">
                  <Input
                    type="number" step={0.5}
                    value={+(mod.outflow_change * 100).toFixed(1)}
                    onChange={(e) =>
                      updateInputs({ [key]: { ...mod, outflow_change: (parseFloat(e.target.value) || 0) / 100 } })
                    }
                  />
                </FormField>
                <FormField label="Discount rate adj." unit="%">
                  <Input
                    type="number" step={0.5}
                    value={+(mod.discount_rate_adj * 100).toFixed(1)}
                    onChange={(e) =>
                      updateInputs({ [key]: { ...mod, discount_rate_adj: (parseFloat(e.target.value) || 0) / 100 } })
                    }
                  />
                </FormField>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
