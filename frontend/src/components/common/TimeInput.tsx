import React, { useState, useEffect } from 'react'
import { parseTimeToMinutes, minutesToHMS } from '@/utils/formatting'
import { Input } from './FormField'

interface Props {
  value: number            // internal value in minutes
  onChange: (minutes: number) => void
  placeholder?: string
  disabled?: boolean
}

/**
 * Accepts h:mm, h:mm:ss, or plain decimal minutes.
 * Displays as h:mm:ss while not focused.
 */
export function TimeInput({ value, onChange, placeholder = '0:00:00', disabled }: Props) {
  const [raw, setRaw] = useState(() => minutesToHMS(value))
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!focused) setRaw(minutesToHMS(value))
  }, [value, focused])

  const handleBlur = () => {
    setFocused(false)
    const parsed = parseTimeToMinutes(raw)
    if (isNaN(parsed) || parsed < 0) {
      setError(true)
      setRaw(minutesToHMS(value))
    } else {
      setError(false)
      onChange(parsed)
      setRaw(minutesToHMS(parsed))
    }
  }

  return (
    <Input
      value={raw}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => { setRaw(e.target.value); setError(false) }}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    />
  )
}
