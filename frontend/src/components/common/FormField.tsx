import React from 'react'
import { clsx } from 'clsx'

interface Props {
  label: string
  unit?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, unit, required, error, hint, children, className }: Props) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
        {unit && <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({unit})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition',
        'text-gray-900 dark:text-gray-100',
        'focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
        error
          ? 'border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30'
          : 'border-gray-300 bg-white hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/20',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={clsx(
        'w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition',
        'border-gray-300 bg-white text-gray-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100',
        'focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
