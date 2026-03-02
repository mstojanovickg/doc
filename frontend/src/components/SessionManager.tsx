import React, { useState } from 'react'
import { useStore } from '@/store/useStore'

export function SessionManager() {
  const { sessions, loadSessions, saveSession, loadSession, removeSession, activeSessionId } = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleOpen = async () => {
    await loadSessions()
    setOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await saveSession(name.trim())
      setName('')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
      >
        Sessions
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-gray-800 mb-4">Sessions</h3>

        {/* Save */}
        <div className="flex gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Session name…"
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {/* List */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {sessions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No saved sessions.</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                s.id === activeSessionId ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(s.updated_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => { loadSession(s); setOpen(false) }}
                className="text-xs text-brand-600 hover:underline"
              >
                Load
              </button>
              <button
                onClick={() => removeSession(s.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(false)}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  )
}
