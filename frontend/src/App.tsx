import React, { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { WizardLayout } from '@/components/wizard/WizardLayout'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { SessionManager } from '@/components/SessionManager'

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function RobotIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M12 2v4M8 2h8M3 16h2M19 16h2M9 15v2M15 15v2M12 6a2 2 0 0 0-2 2v3h4V8a2 2 0 0 0-2-2z"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

export default function App() {
  const { view, setView, resetInputs, theme, toggleTheme, result } = useStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const viewLabel = view === 'wizard' ? 'Input Wizard' : 'Dashboard'

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0f0f0f] font-sans">

      {/* ── Navigation bar ─────────────────────────────────────────────────── */}
      <header className="h-13 flex items-center justify-between px-5 gap-4
                         bg-white dark:bg-[#111111]
                         border-b border-gray-200 dark:border-white/[0.07]
                         print:hidden" style={{ height: '52px' }}>

        {/* Left: Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white flex-shrink-0">
            <RobotIcon />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium hidden sm:block">Tool</span>
            <span className="text-gray-300 dark:text-white/20 hidden sm:block"><ChevronRight /></span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Robot Decision
            </span>
            {result && (
              <>
                <span className="text-gray-300 dark:text-white/20"><ChevronRight /></span>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400">{viewLabel}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: view switcher (only when result exists) */}
        {result && (
          <nav className="hidden md:flex items-center">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.06]">
              <button
                onClick={() => setView('wizard')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                  view === 'wizard'
                    ? 'bg-white dark:bg-brand-500 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Edit Inputs
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                  view === 'dashboard'
                    ? 'bg-white dark:bg-brand-500 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Dashboard
              </button>
            </div>
          </nav>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <SessionManager />

          <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1.5 hidden sm:block" />

          <button
            onClick={resetInputs}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md
                       text-gray-500 dark:text-gray-400
                       hover:text-gray-800 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-white/[0.06]
                       transition-colors"
          >
            New Analysis
          </button>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-7 h-7 flex items-center justify-center rounded-md
                       text-gray-400 dark:text-gray-500
                       hover:text-gray-700 dark:hover:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-white/[0.06]
                       transition-colors"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
        {view === 'wizard' ? <WizardLayout /> : <Dashboard />}
      </main>
    </div>
  )
}
