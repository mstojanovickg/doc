import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input } from '@/components/common/FormField'

export function Step4RobotLabor() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Step 4 — Robot Labor & Personnel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Robot training hours" unit="h" required>
          <Input type="number" min={0} value={inputs.training_hours_robot || ''} onChange={set('training_hours_robot')} placeholder="e.g. 40" />
        </FormField>

        <FormField label="Training hourly cost" unit="RSD/h" required>
          <Input type="number" min={0} value={inputs.training_hourly_cost || ''} onChange={set('training_hourly_cost')} placeholder="e.g. 2000" />
        </FormField>

        <FormField label="Engineering / integration hours" unit="h" required>
          <Input type="number" min={0} value={inputs.engineer_hours || ''} onChange={set('engineer_hours')} placeholder="e.g. 80" />
        </FormField>

        <FormField label="Engineer hourly rate" unit="RSD/h" required>
          <Input type="number" min={0} value={inputs.engineer_hourly_rate || ''} onChange={set('engineer_hourly_rate')} placeholder="e.g. 3500" />
        </FormField>

        <FormField label="Robot technician hours" unit="h" hint="Annual support hours">
          <Input type="number" min={0} value={inputs.technician_hours || ''} onChange={set('technician_hours')} placeholder="0" />
        </FormField>

        <FormField label="Technician hourly rate" unit="RSD/h">
          <Input type="number" min={0} value={inputs.technician_hourly_rate || ''} onChange={set('technician_hourly_rate')} placeholder="0" />
        </FormField>

        <FormField
          label="Operator supervision fraction (OPT%)"
          unit="%"
          hint="Fraction of cycle time the operator must attend the robot (100% = full time)"
        >
          <Input
            type="number" min={0} max={100} step={1}
            value={+(inputs.operator_time_fraction * 100).toFixed(0) || ''}
            onChange={(e) => updateInputs({ operator_time_fraction: Math.min(1, (parseFloat(e.target.value) || 0) / 100) })}
            placeholder="100"
          />
        </FormField>

        <FormField label="Expected injury reduction" unit="%" hint="Post-automation injury decrease">
          <Input
            type="number" min={0} max={100} step={1}
            value={+(inputs.injury_reduction_pct * 100).toFixed(0) || ''}
            onChange={(e) => updateInputs({ injury_reduction_pct: (parseFloat(e.target.value) || 0) / 100 })}
            placeholder="5"
          />
        </FormField>

        <FormField label="Defect share at this position" unit="%" hint="% of total defects originating here">
          <Input
            type="number" min={0} max={100} step={0.1}
            value={+(inputs.defect_share_at_position * 100).toFixed(1) || ''}
            onChange={(e) => updateInputs({ defect_share_at_position: (parseFloat(e.target.value) || 0) / 100 })}
            placeholder="1"
          />
        </FormField>
      </div>
    </div>
  )
}
