import React, { useEffect, useRef } from 'react'
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

  // Recalculate whenever inputs change (debounced), but skip the initial mount
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    const timer = setTimeout(() => {
      if (inputs.product_price > 0 && inputs.ct_manual > 0 && inputs.robot_price > 0) {
        calculate()   // silent — does not navigate
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
        {/* Step navigator */}
        <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/[0.07]">
          <div className="flex">
            {STEPS.map((s, idx) => {
              const isActive = s.id === currentStep
              const isDone = s.id < currentStep
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors flex-1 justify-center
                    border-b-2 hover:bg-gray-50 dark:hover:bg-white/[0.03]
                    ${isActive
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/[0.07]'
                      : isDone
                      ? 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                    }`}
                >
                  {/* Step indicator */}
                  <span className={`w-4.5 h-4.5 flex items-center justify-center rounded-full text-[9px] font-bold flex-shrink-0
                    ${isActive
                      ? 'bg-brand-500 text-white'
                      : isDone
                      ? 'bg-brand-500/15 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'bg-gray-100 text-gray-400 dark:bg-white/[0.06] dark:text-gray-600'
                    }`}
                    style={{ width: '18px', height: '18px' }}
                  >
                    {isDone
                      ? <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
                      : s.id
                    }
                  </span>
                  <span className="hidden sm:inline tracking-wide">{s.label}</span>
                  {/* Separator dot between steps */}
                  {idx < STEPS.length - 1 && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-200 dark:text-white/10 text-xs select-none pointer-events-none hidden sm:block">|</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0f0f0f] scrollbar-thin">
          <div className="max-w-2xl mx-auto">
            <StepComponent />

            {calcError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
                {calcError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-white/[0.06]">
              <button
                disabled={currentStep === 1}
                onClick={() => setStep(currentStep - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md
                           text-gray-500 dark:text-gray-400
                           border border-gray-200 dark:border-white/10
                           hover:text-gray-800 dark:hover:text-gray-200
                           hover:bg-gray-50 dark:hover:bg-white/[0.05]
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>

              <div className="flex gap-2">
                {result && (
                  <button
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md
                               text-brand-600 dark:text-brand-400
                               border border-brand-200 dark:border-brand-500/30
                               hover:bg-brand-50 dark:hover:bg-brand-500/10
                               transition-colors"
                  >
                    View Dashboard
                  </button>
                )}

                {currentStep < 5 ? (
                  <button
                    onClick={() => setStep(currentStep + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md
                               text-white bg-brand-500 hover:bg-brand-600
                               transition-colors"
                  >
                    Next
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                ) : (
                  <button
                    onClick={() => calculate(true)}
                    disabled={isCalculating}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-md
                               text-white bg-brand-500 hover:bg-brand-600
                               disabled:opacity-50 transition-colors"
                  >
                    {isCalculating
                      ? <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Calculating…</>
                      : <>Calculate &amp; View Dashboard <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI sidebar ────────────────────────────────────────────────────── */}
      <div className="w-64 border-l border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d0d] flex-shrink-0 hidden lg:flex flex-col">
        <KPISidebar />
      </div>
    </div>
  )
}
