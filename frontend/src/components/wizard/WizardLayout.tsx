import React, { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Step1General } from './steps/Step1General'
import { Step2Manual } from './steps/Step2Manual'
import { Step3RobotTech } from './steps/Step3RobotTech'
import { Step4RobotLabor } from './steps/Step4RobotLabor'
import { Step5Financing } from './steps/Step5Financing'
import { KPISidebar } from './KPISidebar'

const STEPS = [
  { id: 1, label: 'General' },
  { id: 2, label: 'Manual' },
  { id: 3, label: 'Robot Tech' },
  { id: 4, label: 'Robot Labor' },
  { id: 5, label: 'Financing' },
]

const STEP_COMPONENTS = [Step1General, Step2Manual, Step3RobotTech, Step4RobotLabor, Step5Financing]

export function WizardLayout() {
  const { currentStep, setStep, inputs, calculate, isCalculating, calcError, result, setView } = useStore()

  // Recalculate whenever inputs change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputs.product_price > 0 && inputs.ct_manual > 0 && inputs.robot_price > 0) {
        calculate()
      }
    }, 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs])

  const StepComponent = STEP_COMPONENTS[currentStep - 1]

  return (
    <div className="flex h-full">
      {/* ── Main wizard area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Progress bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    s.id === currentStep
                      ? 'text-brand-700'
                      : s.id < currentStep
                      ? 'text-brand-500 hover:text-brand-700'
                      : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      s.id === currentStep
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : s.id < currentStep
                        ? 'bg-brand-100 border-brand-400 text-brand-700'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }`}
                  >
                    {s.id < currentStep ? '✓' : s.id}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${idx < currentStep - 1 ? 'bg-brand-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6">
          <StepComponent />

          {calcError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {calcError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <button
              disabled={currentStep === 1}
              onClick={() => setStep(currentStep - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            <div className="flex gap-3">
              {currentStep < 5 ? (
                <button
                  onClick={() => setStep(currentStep + 1)}
                  className="px-5 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => calculate()}
                  disabled={isCalculating}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {isCalculating ? 'Calculating…' : 'Calculate & View Dashboard →'}
                </button>
              )}

              {result && (
                <button
                  onClick={() => setView('dashboard')}
                  className="px-4 py-2 text-sm font-medium text-brand-700 border border-brand-300 rounded-md hover:bg-brand-50"
                >
                  View Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI sidebar ────────────────────────────────────────────────────── */}
      <div className="w-64 border-l border-gray-200 bg-gray-50 flex-shrink-0 hidden lg:flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <p className="text-xs font-semibold text-gray-600">LIVE KPI PREVIEW</p>
        </div>
        <KPISidebar />
      </div>
    </div>
  )
}
