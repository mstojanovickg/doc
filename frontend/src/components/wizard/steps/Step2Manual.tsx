import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input } from '@/components/common/FormField'
import { TimeInput } from '@/components/common/TimeInput'

export function Step2Manual() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  const setInt = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseInt(e.target.value) || 0 } as never)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Step 2 — Manual Production Parameters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Shift schedule */}
        <FormField label="Number of shifts" unit="count">
          <Input type="number" min={1} max={3} value={inputs.shifts} onChange={setInt('shifts')} />
        </FormField>

        <FormField label="Shift duration" unit="minutes">
          <Input type="number" min={1} value={inputs.shift_duration} onChange={set('shift_duration')} />
        </FormField>

        <FormField label="Breaks per shift" unit="count">
          <Input type="number" min={0} value={inputs.breaks} onChange={setInt('breaks')} />
        </FormField>

        <FormField label="Break duration" unit="minutes">
          <Input type="number" min={0} value={inputs.break_duration} onChange={set('break_duration')} />
        </FormField>

        <FormField label="Working days / month" unit="count">
          <Input type="number" min={1} max={31} value={inputs.workdays_month} onChange={setInt('workdays_month')} />
        </FormField>

        <FormField label="Workers at station" unit="count">
          <Input type="number" min={1} value={inputs.workers} onChange={setInt('workers')} />
        </FormField>

        {/* Cycle time */}
        <FormField label="Cycle time (C/T)" unit="h:mm:ss" required>
          <TimeInput value={inputs.ct_manual} onChange={(v) => updateInputs({ ct_manual: v })} />
        </FormField>

        <FormField label="Gross salary per worker" unit="RSD/month" required>
          <Input type="number" min={0} value={inputs.gross_salary || ''} onChange={set('gross_salary')} placeholder="e.g. 80000" />
        </FormField>

        {/* Quality & safety */}
        <FormField label="Defective units / month" unit="pcs">
          <Input type="number" min={0} value={inputs.defects_month || ''} onChange={set('defects_month')} placeholder="0" />
        </FormField>

        <FormField label="Sick days / year (per worker)" unit="days">
          <Input type="number" min={0} value={inputs.sick_days_year || ''} onChange={set('sick_days_year')} placeholder="0" />
        </FormField>

        <FormField label="Workplace injuries / month" unit="count">
          <Input type="number" min={0} value={inputs.injuries_month || ''} onChange={set('injuries_month')} placeholder="0" />
        </FormField>

        <FormField label="Machine breakdowns / month" unit="count">
          <Input type="number" min={0} value={inputs.breakdowns_month || ''} onChange={set('breakdowns_month')} placeholder="0" />
        </FormField>

        <FormField label="Avg. repair time" unit="h:mm">
          <TimeInput value={inputs.avg_repair_time} onChange={(v) => updateInputs({ avg_repair_time: v })} />
        </FormField>

        <FormField label="Safety nonconformities / month" unit="count">
          <Input type="number" min={0} value={inputs.nonconformities_month || ''} onChange={set('nonconformities_month')} placeholder="0" />
        </FormField>

        <FormField label="Process nonconformities / month" unit="count">
          <Input type="number" min={0} value={inputs.process_nonconformities_month || ''} onChange={set('process_nonconformities_month')} placeholder="0" />
        </FormField>

        <FormField label="Job changes / year" unit="count" hint="Workers who changed position">
          <Input type="number" min={0} value={inputs.job_changes_year || ''} onChange={set('job_changes_year')} placeholder="0" />
        </FormField>

        <FormField label="Initial training hours" unit="h" hint="Per worker">
          <Input type="number" min={0} value={inputs.training_hours_manual || ''} onChange={set('training_hours_manual')} placeholder="0" />
        </FormField>
      </div>
    </div>
  )
}
