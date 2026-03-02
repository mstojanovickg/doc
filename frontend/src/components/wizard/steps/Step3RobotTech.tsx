import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input } from '@/components/common/FormField'
import { TimeInput } from '@/components/common/TimeInput'

export function Step3RobotTech() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-800">Step 3 — Robot Technical & Energy Parameters</h2>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">3.1 Technical</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Robot purchase price" unit="RSD" required>
            <Input type="number" min={0} value={inputs.robot_price || ''} onChange={set('robot_price')} placeholder="e.g. 5000000" />
          </FormField>

          <FormField label="Power consumption" unit="kW" required>
            <Input type="number" min={0} step={0.1} value={inputs.power_consumption || ''} onChange={set('power_consumption')} placeholder="e.g. 3.5" />
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

          <FormField label="Monthly maintenance cost" unit="RSD">
            <Input type="number" min={0} value={inputs.maintenance_cost_monthly || ''} onChange={set('maintenance_cost_monthly')} placeholder="0" />
          </FormField>

          <FormField label="Robot defective units / month" unit="pcs">
            <Input type="number" min={0} value={inputs.robot_defects_month || ''} onChange={set('robot_defects_month')} placeholder="0" />
          </FormField>

          <FormField label="Service sessions / month" unit="count">
            <Input type="number" min={0} value={inputs.robot_service_frequency || ''} onChange={set('robot_service_frequency')} placeholder="0" />
          </FormField>

          <FormField label="Service session duration" unit="h:mm">
            <TimeInput value={inputs.robot_service_duration} onChange={(v) => updateInputs({ robot_service_duration: v })} />
          </FormField>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">3.2 Energy & Material</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Electricity price" unit="RSD/kWh" required>
            <Input type="number" min={0} step={0.01} value={inputs.electricity_price_kwh || ''} onChange={set('electricity_price_kwh')} placeholder="e.g. 12.5" />
          </FormField>

          <FormField label="Pre-process inventory (robot)" unit="pcs" required>
            <Input type="number" min={0} value={inputs.pre_process_inventory_robot || ''} onChange={set('pre_process_inventory_robot')} placeholder="0" />
          </FormField>
        </div>
      </section>
    </div>
  )
}
