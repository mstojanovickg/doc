import React from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input } from '@/components/common/FormField'

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

export function Step4RobotLabor() {
  const { inputs, updateInputs } = useStore()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseFloat(e.target.value) || 0 } as never)

  const setInt = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateInputs({ [field]: parseInt(e.target.value) || 0 } as never)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Robot Labor & Personnel</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">People costs associated with robot implementation</p>
      </div>

      <Section title="Robot Operators" description="Staffing for the robotic cell">
        <FormField label="Number of operators" unit="count" hint="Workers supervising the robot">
          <Input type="number" min={1} value={inputs.robot_operators} onChange={setInt('robot_operators')} />
        </FormField>

        <FormField label="Operator gross salary" unit="RSD/month" hint="Leave 0 to use manual worker salary">
          <Input type="number" min={0} value={inputs.robot_operator_salary || ''} onChange={set('robot_operator_salary')} placeholder="same as manual" />
        </FormField>

        <FormField label="Operator supervision (OPT%)" unit="%" hint="Fraction of shift the operator must attend the robot">
          <Input
            type="number" min={0} max={100} step={1}
            value={+(inputs.operator_time_fraction * 100).toFixed(0) || ''}
            onChange={(e) => updateInputs({ operator_time_fraction: Math.min(1, (parseFloat(e.target.value) || 0) / 100) })}
            placeholder="100"
          />
        </FormField>
      </Section>

      <Section title="Training" description="Operator and technician training costs">
        <FormField label="Robot training hours" unit="h" required>
          <Input type="number" min={0} value={inputs.training_hours_robot || ''} onChange={set('training_hours_robot')} placeholder="e.g. 40" />
        </FormField>

        <FormField label="Training hourly cost" unit="RSD/h" required>
          <Input type="number" min={0} value={inputs.training_hourly_cost || ''} onChange={set('training_hourly_cost')} placeholder="e.g. 2 000" />
        </FormField>
      </Section>

      <Section title="Engineering & Integration" description="Setup and commissioning labour">
        <FormField label="Engineering hours" unit="h" required>
          <Input type="number" min={0} value={inputs.engineer_hours || ''} onChange={set('engineer_hours')} placeholder="e.g. 80" />
        </FormField>

        <FormField label="Engineer hourly rate" unit="RSD/h" required>
          <Input type="number" min={0} value={inputs.engineer_hourly_rate || ''} onChange={set('engineer_hourly_rate')} placeholder="e.g. 3 500" />
        </FormField>
      </Section>

      <Section title="Technical Support" description="Ongoing robot technician costs">
        <FormField label="Technician hours / year" unit="h" hint="Annual support hours">
          <Input type="number" min={0} value={inputs.technician_hours || ''} onChange={set('technician_hours')} placeholder="0" />
        </FormField>

        <FormField label="Technician hourly rate" unit="RSD/h">
          <Input type="number" min={0} value={inputs.technician_hourly_rate || ''} onChange={set('technician_hourly_rate')} placeholder="0" />
        </FormField>
      </Section>

      <Section title="Operational Factors" description="Quality and safety adjustments">
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
      </Section>
    </div>
  )
}
