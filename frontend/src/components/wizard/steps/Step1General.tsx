import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input } from '@/components/common/FormField'
import { TimeInput } from '@/components/common/TimeInput'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] p-5 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

export function Step1General() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">General Information</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Product economics and production timing</p>
      </div>

      <Section title="Product Economics">
        <FormField label="Product price" unit="RSD" required>
          <Input type="number" min={0} value={inputs.product_price || ''} onChange={set('product_price')} placeholder="e.g. 1200" />
        </FormField>

        <FormField label="Production cost per unit" unit="RSD" required>
          <Input type="number" min={0} value={inputs.production_cost_per_unit || ''} onChange={set('production_cost_per_unit')} placeholder="e.g. 650" />
        </FormField>

        <FormField label="Expected annual sales growth" unit="%" hint="Year-on-year volume increase">
          <Input
            type="number" min={0} max={100} step={0.1}
            value={+(inputs.annual_sales_growth * 100).toFixed(2) || ''}
            onChange={(e) => updateInputs({ annual_sales_growth: (parseFloat(e.target.value) || 0) / 100 })}
            placeholder="5"
          />
        </FormField>
      </Section>

      <Section title="Timing & Inventory">
        <FormField label="Takt time" unit="h:mm:ss" required hint="Available time ÷ required daily volume">
          <TimeInput value={inputs.takt_time} onChange={(v) => updateInputs({ takt_time: v })} />
        </FormField>

        <FormField label="Pre-process inventory" unit="pcs" hint="Units buffered before this station">
          <Input type="number" min={0} value={inputs.pre_process_inventory || ''} onChange={set('pre_process_inventory')} placeholder="0" />
        </FormField>
      </Section>
    </div>
  )
}
