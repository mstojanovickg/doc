import axios from 'axios'
import type { CalculationInput, CalculationResult, SessionRecord } from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export async function runCalculation(input: CalculationInput): Promise<CalculationResult> {
  const { data } = await api.post<CalculationResult>('/calculate', input)
  return data
}

export async function listSessions(): Promise<SessionRecord[]> {
  const { data } = await api.get<SessionRecord[]>('/sessions')
  return data
}

export async function createSession(payload: {
  name: string
  description?: string
  inputs_json: string
  results_json?: string
}): Promise<SessionRecord> {
  const { data } = await api.post<SessionRecord>('/sessions', payload)
  return data
}

export async function updateSession(
  id: string,
  payload: { name: string; description?: string; inputs_json: string; results_json?: string }
): Promise<SessionRecord> {
  const { data } = await api.put<SessionRecord>(`/sessions/${id}`, payload)
  return data
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/sessions/${id}`)
}
