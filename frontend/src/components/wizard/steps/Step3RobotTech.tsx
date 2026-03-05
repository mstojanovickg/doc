import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input } from '@/components/common/FormField'
import { TimeInput } from '@/components/common/TimeInput'

function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

export function Step3RobotTech() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  const setInt = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseInt(e.target.value) || 0 } as never)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Robot Technical Parameters</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Schedule, hardware costs, energy, and maintenance</p>
      </div>

      <Section title="Production Schedule" description="Robot shift structure — can differ from manual (e.g. 24/7 operation)">
        <FormField label="Number of shifts" unit="count">
          <Input type="number" min={1} max={3} value={inputs.robot_shifts} onChange={setInt('robot_shifts')} />
        </FormField>

        <FormField label="Shift duration" unit="min">
          <Input type="number" min={1} value={inputs.robot_shift_duration} onChange={set('robot_shift_duration')} />
        </FormField>

        <FormField label="Breaks per shift" unit="count" hint="Usually 0 — robot operates continuously">
          <Input type="number" min={0} value={inputs.robot_breaks} onChange={setInt('robot_breaks')} />
        </FormField>

        <FormField label="Break duration" unit="min">
          <Input type="number" min={0} value={inputs.robot_break_duration} onChange={set('robot_break_duration')} />
        </FormField>

        <FormField label="Working days / month" unit="days">
          <Input type="number" min={1} max={31} value={inputs.robot_workdays_month} onChange={setInt('robot_workdays_month')} />
        </FormField>

        <FormField label="Robot cycle time (C/T)" unit="h:mm:ss" required hint="Usually faster than manual">
          <TimeInput value={inputs.ct_robot} onChange={(v) => updateInputs({ ct_robot: v })} />
        </FormField>
      </Section>

      <Section title="Investment Costs" description="One-time purchase and setup costs">
        <FormField label="Robot purchase price" unit="RSD" required>
          <Input type="number" min={0} value={inputs.robot_price || ''} onChange={set('robot_price')} placeholder="e.g. 5 000 000" />
        </FormField>

        <FormField label="Gripper / end-effector price" unit="RSD">
          <Input type="number" min={0} value={inputs.gripper_price || ''} onChange={set('gripper_price')} placeholder="0" />
        </FormField>

        <FormField label="Gripper replacements / year" unit="count">
          <Input type="number" min={0} value={inputs.gripper_replacements_year || ''} onChange={set('gripper_replacements_year')} placeholder="0" />
        </FormField>

        <FormField label="Additional equipment cost" unit="RSD" hint="Fencing, fixtures, tooling">
          <Input type="number" min={0} value={inputs.additional_equipment_cost || ''} onChange={set('additional_equipment_cost')} placeholder="0" />
        </FormField>
      </Section>

      <Section title="Operations & Maintenance" description="Ongoing operational costs and downtime">
        <FormField label="Monthly maintenance cost" unit="RSD">
          <Input type="number" min={0} value={inputs.maintenance_cost_monthly || ''} onChange={set('maintenance_cost_monthly')} placeholder="0" />
        </FormField>

        <FormField label="Service sessions / month" unit="count">
          <Input type="number" min={0} value={inputs.robot_service_frequency || ''} onChange={set('robot_service_frequency')} placeholder="0" />
        </FormField>

        <FormField label="Service session duration" unit="h:mm">
          <TimeInput value={inputs.robot_service_duration} onChange={(v) => updateInputs({ robot_service_duration: v })} />
        </FormField>

        <FormField label="Robot defective units / month" unit="pcs">
          <Input type="number" min={0} value={inputs.robot_defects_month || ''} onChange={set('robot_defects_month')} placeholder="0" />
        </FormField>
      </Section>

      <Section title="Energy & Material" description="Power consumption and buffer stock">
        <FormField label="Power consumption" unit="kW" required>
          <Input type="number" min={0} step={0.1} value={inputs.power_consumption || ''} onChange={set('power_consumption')} placeholder="e.g. 3.5" />
        </FormField>

        <FormField label="Electricity price" unit="RSD/kWh" required>
          <Input type="number" min={0} step={0.01} value={inputs.electricity_price_kwh || ''} onChange={set('electricity_price_kwh')} placeholder="e.g. 12.5" />
        </FormField>

        <FormField label="Pre-process inventory (robot)" unit="pcs">
          <Input type="number" min={0} value={inputs.pre_process_inventory_robot || ''} onChange={set('pre_process_inventory_robot')} placeholder="0" />
        </FormField>
      </Section>
    </div>
  )
}
